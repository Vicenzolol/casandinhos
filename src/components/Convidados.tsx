import { useCallback, useEffect, useMemo, useState } from 'react';
import { convidadosApi } from '../lib/apiComplete';
import { useAviso } from '../hooks/useAviso';
import type { Convidado } from '../types';
import { Modal } from './Modal';

interface Credenciais {
  nome: string;
  email: string;
  telefone?: string | null;
  senha: string;
}

function mensagemDeAcesso({ nome, email, senha }: Credenciais) {
  const primeiroNome = nome.split(' ')[0];
  return [
    `Oi, ${primeiroNome}! 💕`,
    `Esta é a nossa lista de presentes de casamento: ${window.location.origin}`,
    '',
    'Você pode olhar à vontade. Quando quiser confirmar um presente, entre com:',
    `Email: ${email}`,
    `Senha: ${senha}`,
    '',
    'Com carinho, Flaviana & Vicenzo'
  ].join('\n');
}

function linkWhatsApp(telefone: string, texto: string) {
  let numero = telefone.replace(/\D/g, '');
  if (numero.length === 10 || numero.length === 11) numero = `55${numero}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function Convidados() {
  const { avisar } = useAviso();
  const [convidados, setConvidados] = useState<Convidado[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [salvando, setSalvando] = useState(false);
  const [credenciais, setCredenciais] = useState<Credenciais | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [aberto, setAberto] = useState<number | null>(null);
  const [removendo, setRemovendo] = useState<Convidado | null>(null);

  const carregar = useCallback(async () => {
    const response = await convidadosApi.listar();
    if (response.success && response.convidados) setConvidados(response.convidados);
    else avisar(response.error || 'Erro ao carregar convidados', 'erro');
    setCarregando(false);
  }, [avisar]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const response = await convidadosApi.criar({
      nome: form.nome,
      email: form.email,
      telefone: form.telefone || undefined
    });
    setSalvando(false);
    if (response.success && response.convidado && response.senha) {
      const novo = response.convidado;
      setConvidados(atual => [...atual, novo].sort((a, b) => a.nome.localeCompare(b.nome)));
      mostrarAcesso({ ...novo, senha: response.senha });
      setForm({ nome: '', email: '', telefone: '' });
    } else {
      avisar(response.error || 'Erro ao criar convidado', 'erro');
    }
  };

  const mostrarAcesso = (dados: Credenciais) => {
    setCredenciais(dados);
    setMensagem(mensagemDeAcesso(dados));
  };

  const gerarNovaSenha = async (convidado: Convidado) => {
    if (!window.confirm(`Gerar uma nova senha para ${convidado.nome}? A senha antiga deixa de funcionar.`)) return;
    const response = await convidadosApi.novaSenha(convidado.id);
    if (response.success && response.senha) {
      mostrarAcesso({ ...convidado, senha: response.senha });
    } else {
      avisar(response.error || 'Erro ao gerar senha', 'erro');
    }
  };

  const remover = async () => {
    if (!removendo) return;
    const response = await convidadosApi.remover(removendo.id);
    if (response.success) {
      setConvidados(atual => atual.filter(c => c.id !== removendo.id));
      avisar(`${removendo.nome} foi removido`, 'info');
    } else {
      avisar(response.error || 'Erro ao remover', 'erro');
    }
    setRemovendo(null);
  };

  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      avisar('Mensagem copiada!', 'sucesso');
    } catch {
      avisar('Não foi possível copiar. Selecione o texto e copie manualmente.', 'erro');
    }
  };

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return termo
      ? convidados.filter(c => c.nome.toLowerCase().includes(termo) || c.email.toLowerCase().includes(termo))
      : convidados;
  }, [convidados, busca]);

  const totalPresentes = convidados.reduce((soma, c) => soma + c.reservas.length, 0);

  return (
    <div className="conv">
      <div className="conv-header">
        <h2>👥 Convidados</h2>
        <p>{convidados.length} convidados · {totalPresentes} presentes confirmados</p>
      </div>

      <form className="conv-form" onSubmit={criar}>
        <h3>Criar acesso</h3>
        <div className="conv-form-campos">
          <label>
            Nome
            <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required maxLength={120} />
          </label>
          <label>
            Email
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </label>
          <label>
            WhatsApp (opcional)
            <input type="tel" value={form.telefone} placeholder="(11) 99999-9999" onChange={e => setForm({ ...form, telefone: e.target.value })} />
          </label>
        </div>
        <button type="submit" className="pub-btn pub-btn-primario" disabled={salvando}>
          {salvando ? 'Criando...' : 'Criar e gerar senha'}
        </button>
      </form>

      <input
        type="search"
        className="pub-busca"
        placeholder="Buscar convidado..."
        aria-label="Buscar convidado"
        value={busca}
        onChange={e => setBusca(e.target.value)}
      />

      {carregando && <p className="pub-vazio">Carregando...</p>}
      {!carregando && filtrados.length === 0 && <p className="pub-vazio">Nenhum convidado.</p>}

      <ul className="conv-lista">
        {filtrados.map(c => (
          <li key={c.id} className="conv-item">
            <div className="conv-item-topo">
              <div>
                <strong>{c.nome}</strong>
                <small>{c.email}{c.telefone ? ` · ${c.telefone}` : ''}</small>
              </div>
              <button
                type="button"
                className="conv-presentes"
                aria-expanded={aberto === c.id}
                onClick={() => setAberto(aberto === c.id ? null : c.id)}
              >
                🎁 {c.reservas.length}
              </button>
            </div>

            {aberto === c.id && (
              <ul className="conv-reservas">
                {c.reservas.length === 0 && <li>Nenhum presente confirmado ainda.</li>}
                {c.reservas.map(r => (
                  <li key={r.id}>
                    {r.item.nome}
                    <small> · {new Date(r.dataReserva).toLocaleDateString('pt-BR')}</small>
                  </li>
                ))}
              </ul>
            )}

            <div className="conv-acoes">
              <button type="button" className="pub-btn pub-btn-secundario" onClick={() => gerarNovaSenha(c)}>🔑 Nova senha</button>
              <button type="button" className="pub-btn pub-btn-perigo-leve" onClick={() => setRemovendo(c)}>Remover</button>
            </div>
          </li>
        ))}
      </ul>

      {credenciais && (
        <Modal titulo="Acesso pronto" onClose={() => setCredenciais(null)} largura="media">
          <div className="pub-form">
            <p className="pub-form-ajuda">
              Envie esta mensagem para <strong>{credenciais.nome}</strong> (pode editar antes). A senha só
              aparece agora; se perder, é só gerar outra.
            </p>
            <textarea
              className="conv-mensagem"
              rows={9}
              aria-label="Mensagem de acesso"
              value={mensagem}
              onChange={e => setMensagem(e.target.value)}
            />
            <div className="conv-modal-acoes">
              <button type="button" className="pub-btn pub-btn-primario" onClick={() => copiar(mensagem)}>
                📋 Copiar mensagem
              </button>
              {credenciais.telefone && (
                <a
                  className="pub-btn pub-btn-whats"
                  href={linkWhatsApp(credenciais.telefone, mensagem)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enviar no WhatsApp
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}

      {removendo && (
        <Modal titulo="Remover convidado?" onClose={() => setRemovendo(null)}>
          <div className="pub-form">
            <p className="pub-form-ajuda">
              <strong>{removendo.nome}</strong> perde o acesso
              {removendo.reservas.length > 0 && ` e os ${removendo.reservas.length} presente(s) confirmados voltam para a lista`}.
              Isso não pode ser desfeito.
            </p>
            <div className="conv-modal-acoes">
              <button type="button" className="pub-btn pub-btn-secundario" onClick={() => setRemovendo(null)}>Cancelar</button>
              <button type="button" className="pub-btn pub-btn-perigo" onClick={remover}>Remover</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
