import { useCallback, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Gift, Minus, Plus } from 'lucide-react';
import { CampoNome, Carregando, LayoutConvidado } from '../components/LayoutConvidado';
import { Modal } from '../components/Modal';
import { useConvidado } from '../lib/convidado';
import { cotasApi, type Cota } from '../lib/interativosApi';
import { formatarReais, gerarPix } from '../lib/pix';
import { useAviso } from '../hooks/useAviso';

function novoTxid() {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return 'COTA' + Array.from(bytes, b => letras[b % letras.length]).join('');
}

export function Cotas() {
  const { avisar } = useAviso();
  const [cotas, setCotas] = useState<Cota[] | null>(null);
  const [escolhida, setEscolhida] = useState<Cota | null>(null);

  const carregar = useCallback(async () => {
    const r = await cotasApi.listar();
    if (r.success && r.cotas) setCotas(r.cotas);
    else avisar(r.error || 'Erro ao carregar as cotas', 'erro');
  }, [avisar]);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <LayoutConvidado
      titulo="Cotas"
      subtitulo="Prefere presentear em dinheiro? Escolha uma cota e quantas partes quiser. O pagamento é por Pix, direto para nós."
    >
      {!cotas ? <Carregando /> : cotas.length === 0 ? (
        <p className="pub-vazio">As cotas ainda vão ser cadastradas. Volte em breve!</p>
      ) : (
        <div className="int-cotas">
          {cotas.map(cota => <CartaoCota key={cota.id} cota={cota} onEscolher={() => setEscolhida(cota)} />)}
        </div>
      )}

      {escolhida && (
        <PagamentoCota
          cota={escolhida}
          onClose={() => setEscolhida(null)}
          onConcluido={() => { setEscolhida(null); carregar(); }}
        />
      )}
    </LayoutConvidado>
  );
}

function CartaoCota({ cota, onEscolher }: { cota: Cota; onEscolher: () => void }) {
  const restantes = Math.max(cota.totalPartes - cota.partesUsadas, 0);
  const pct = Math.min(100, Math.round((cota.partesUsadas / cota.totalPartes) * 100));

  return (
    <article className="pub-card int-cota">
      <div className="pub-card-topo">
        <h3>{cota.titulo}</h3>
        <span className="int-cota-valor">{formatarReais(cota.valorParte)} <small>/ parte</small></span>
      </div>
      {cota.descricao && <p className="pub-card-desc">{cota.descricao}</p>}

      <div className="int-progresso" role="progressbar" aria-valuemin={0} aria-valuemax={cota.totalPartes} aria-valuenow={cota.partesUsadas} aria-label={`Progresso de ${cota.titulo}`}>
        <span style={{ width: `${pct}%` }} />
      </div>
      <p className="int-progresso-texto">
        {restantes === 0
          ? 'Completa! Muito obrigado 💙'
          : `${cota.partesUsadas} de ${cota.totalPartes} partes · faltam ${restantes}`}
      </p>

      <div className="pub-card-acao">
        <button type="button" className="pub-btn pub-btn-primario pub-btn-bloco" onClick={onEscolher} disabled={restantes === 0}>
          <Gift size={16} aria-hidden="true" /> {restantes === 0 ? 'Cota completa' : 'Presentear'}
        </button>
      </div>
    </article>
  );
}

function PagamentoCota({ cota, onClose, onConcluido }: { cota: Cota; onClose: () => void; onConcluido: () => void }) {
  const { avisar } = useAviso();
  const { nome, autorId, salvarNome } = useConvidado();
  const restantes = Math.max(cota.totalPartes - cota.partesUsadas, 0);
  const [partes, setPartes] = useState(1);
  const [mensagem, setMensagem] = useState('');
  const [txid] = useState(novoTxid);
  const [qr, setQr] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const valor = partes * cota.valorParte;
  const codigo = useMemo(() => gerarPix({ valorCentavos: valor, txid }), [valor, txid]);

  useEffect(() => {
    let ativo = true;
    QRCode.toDataURL(codigo, { width: 560, margin: 1, color: { dark: '#2F4254', light: '#FFFFFF' } })
      .then(url => { if (ativo) setQr(url); })
      .catch(() => setQr(''));
    return () => { ativo = false; };
  }, [codigo]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2500);
    } catch {
      avisar('Não deu para copiar automaticamente. Selecione o código e copie.', 'erro');
    }
  };

  const confirmar = async () => {
    if (!nome) return;
    setEnviando(true);
    const r = await cotasApi.contribuir(cota.id, { nome, autorId, partes, txid, mensagem: mensagem.trim() || undefined });
    setEnviando(false);
    if (!r.success) {
      avisar(r.error || 'Não foi possível registrar', 'erro');
      return;
    }
    avisar('Obrigado! Assim que virmos o Pix, confirmamos por aqui 💙', 'sucesso');
    onConcluido();
  };

  return (
    <Modal titulo={cota.titulo} onClose={onClose} largura="media">
      <div className="pub-form int-pagamento">
        <label>Quantas partes?</label>
        <div className="int-partes">
          <button type="button" className="pub-btn pub-btn-secundario" onClick={() => setPartes(p => Math.max(1, p - 1))} disabled={partes <= 1} aria-label="Menos uma parte">
            <Minus size={16} aria-hidden="true" />
          </button>
          <output aria-live="polite">{partes}</output>
          <button type="button" className="pub-btn pub-btn-secundario" onClick={() => setPartes(p => Math.min(restantes, p + 1))} disabled={partes >= restantes} aria-label="Mais uma parte">
            <Plus size={16} aria-hidden="true" />
          </button>
          <span className="int-partes-total">{formatarReais(valor)}</span>
        </div>

        {qr && <img className="int-qr" src={qr} alt="QR Code do Pix" width={280} height={280} />}

        <label htmlFor="pix-codigo">Pix copia e cola</label>
        <textarea id="pix-codigo" className="conv-mensagem int-pix-codigo" readOnly value={codigo} rows={3} onFocus={e => e.currentTarget.select()} />
        <button type="button" className="pub-btn pub-btn-secundario" onClick={copiar}>
          {copiado ? <><Check size={16} aria-hidden="true" /> Copiado!</> : <><Copy size={16} aria-hidden="true" /> Copiar código</>}
        </button>

        <p className="pub-form-ajuda">
          Abra o app do seu banco, escolha <strong>Pix → Ler QR Code</strong> ou <strong>Pix copia e cola</strong> e confira o valor.
          Depois volte aqui e toque em <strong>Já fiz o Pix</strong>.
        </p>

        <CampoNome nome={nome} onSalvar={salvarNome} />

        <label htmlFor="pix-mensagem">Quer deixar um recado? (opcional)</label>
        <textarea id="pix-mensagem" className="conv-mensagem" rows={2} maxLength={500} value={mensagem} onChange={e => setMensagem(e.target.value)} />

        <button type="button" className="pub-btn pub-btn-primario" onClick={confirmar} disabled={!nome || enviando}>
          {enviando ? 'Registrando…' : 'Já fiz o Pix'}
        </button>
      </div>
    </Modal>
  );
}
