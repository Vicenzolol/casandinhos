import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../lib/api';
import { Modal } from './Modal';

interface LoginModalProps {
  onClose: () => void;
  onSuccess?: (user: User) => void;
  motivo?: string;
}

export function LoginModal({ onClose, onSuccess, motivo }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setErro('');
    const result = await login(email, senha);
    setEnviando(false);
    if (result.success && result.user) {
      onSuccess?.(result.user);
      onClose();
    } else {
      setErro(result.error || 'Não foi possível entrar');
    }
  };

  return (
    <Modal titulo="Entrar" onClose={onClose}>
      <form className="pub-form" onSubmit={handleSubmit}>
        <p className="pub-form-ajuda">
          {motivo || 'Use o email e a senha que os noivos te enviaram.'}
        </p>

        {erro && <div className="pub-form-erro" role="alert">{erro}</div>}

        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <label htmlFor="login-senha">Senha</label>
        <input
          id="login-senha"
          type="password"
          autoComplete="current-password"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
        />

        <button type="submit" className="pub-btn pub-btn-primario pub-btn-bloco" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar'}
        </button>
        <p className="pub-form-rodape">Não recebeu seu acesso? Fale com os noivos 💕</p>
      </form>
    </Modal>
  );
}
