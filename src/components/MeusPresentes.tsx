import { useCallback, useEffect, useState } from 'react';
import { presentesApi } from '../lib/apiComplete';
import { usePresentes } from '../hooks/usePresentes';
import { useAviso } from '../hooks/useAviso';
import { infoCategoria } from '../data/categorias';
import type { MinhaReserva } from '../types';

interface MeusPresentesProps {
  onVoltar: () => void;
}

export function MeusPresentes({ onVoltar }: MeusPresentesProps) {
  const { recarregar } = usePresentes();
  const { avisar } = useAviso();
  const [reservas, setReservas] = useState<MinhaReserva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string>();
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const response = await presentesApi.minhasReservas();
    if (response.success && response.reservas) {
      setReservas(response.reservas);
      setErro(undefined);
    } else {
      setErro(response.error || 'Não foi possível carregar seus presentes');
    }
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const cancelar = async (reserva: MinhaReserva) => {
    setCancelandoId(reserva.id);
    const response = await presentesApi.cancelarReserva(reserva.id);
    setCancelandoId(null);
    setConfirmandoId(null);
    if (response.success) {
      setReservas(atual => atual.filter(r => r.id !== reserva.id));
      avisar(`"${reserva.item.nome}" foi cancelado e voltou para a lista.`, 'info');
      recarregar();
    } else {
      avisar(response.error || 'Não foi possível cancelar', 'erro');
    }
  };

  const formatarData = (data: string) =>
    new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(new Date(data));

  return (
    <div className="pub-meus">
      <div className="pub-meus-header">
        <h1>💝 Meus presentes</h1>
        <p>Estes são os presentes que você confirmou. Se mudar de ideia, pode cancelar.</p>
      </div>

      {carregando && <p className="pub-vazio">Carregando...</p>}
      {erro && (
        <div className="pub-vazio">
          <p>{erro}</p>
          <button type="button" className="pub-btn pub-btn-secundario" onClick={carregar}>Tentar de novo</button>
        </div>
      )}

      {!carregando && !erro && reservas.length === 0 && (
        <div className="pub-vazio">
          <p>Você ainda não confirmou nenhum presente.</p>
          <button type="button" className="pub-btn pub-btn-primario" onClick={onVoltar}>Ver a lista de presentes</button>
        </div>
      )}

      <ul className="pub-meus-lista">
        {reservas.map(reserva => {
          const info = infoCategoria(reserva.item.categoria);
          return (
            <li key={reserva.id} className="pub-meus-item">
              <div className="pub-meus-info">
                <span className="pub-meus-icone" aria-hidden="true">{info.icon}</span>
                <div>
                  <strong>{reserva.item.nome}</strong>
                  {reserva.item.descricao && <p>{reserva.item.descricao}</p>}
                  <small>Confirmado em {formatarData(reserva.dataReserva)}</small>
                  {reserva.item.adquirido && <small className="pub-meus-recebido">🎉 Os noivos já marcaram como recebido</small>}
                </div>
              </div>

              {!reserva.item.adquirido && (
                confirmandoId === reserva.id ? (
                  <div className="pub-meus-confirmar">
                    <span>Cancelar este presente?</span>
                    <button
                      type="button"
                      className="pub-btn pub-btn-perigo"
                      disabled={cancelandoId === reserva.id}
                      onClick={() => cancelar(reserva)}
                    >
                      {cancelandoId === reserva.id ? 'Cancelando...' : 'Sim, cancelar'}
                    </button>
                    <button type="button" className="pub-btn pub-btn-secundario" onClick={() => setConfirmandoId(null)}>Não</button>
                  </div>
                ) : (
                  <button type="button" className="pub-btn pub-btn-secundario" onClick={() => setConfirmandoId(reserva.id)}>
                    Cancelar
                  </button>
                )
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
