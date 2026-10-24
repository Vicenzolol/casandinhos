import { useContext } from 'react';
import { EnxovalContext } from '../context/contextos';

export function useEnxoval() {
  const context = useContext(EnxovalContext);
  if (context === undefined) {
    throw new Error('useEnxoval deve ser usado dentro de um EnxovalProvider');
  }
  return context;
}