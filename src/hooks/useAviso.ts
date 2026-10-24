import { useContext } from 'react';
import { AvisoContext } from '../context/contextos';

export function useAviso() {
  const context = useContext(AvisoContext);
  if (context === undefined) {
    throw new Error('useAviso deve ser usado dentro de um AvisoProvider');
  }
  return context;
}
