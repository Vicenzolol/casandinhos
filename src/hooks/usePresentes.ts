import { useContext } from 'react';
import { PresentesContext } from '../context/contextos';

export function usePresentes() {
  const context = useContext(PresentesContext);
  if (context === undefined) {
    throw new Error('usePresentes deve ser usado dentro de um PresentesProvider');
  }
  return context;
}
