import type { Categoria, CategoriaInfo } from '../types';
import { BedDouble, CookingPot, Package, ShowerHead, Sofa } from 'lucide-react';

export const categoriasInfo: Record<Categoria, CategoriaInfo> = {
  'cozinha': {
    id: 'cozinha',
    nome: 'Itens para a Cozinha',
    icon: CookingPot,
    cor: '#ff6b6b',
    descricao: 'Eletrodomésticos, utensílios básicos, louças e talheres'
  },
  'sala-copa': {
    id: 'sala-copa',
    nome: 'Itens para a Sala e Copa',
    icon: Sofa,
    cor: '#4ecdc4',
    descricao: 'Móveis principais, eletrônicos e outros'
  },
  'banheiro-quintal': {
    id: 'banheiro-quintal',
    nome: 'Itens para Banheiro e Quintal',
    icon: ShowerHead,
    cor: '#45b7d1',
    descricao: 'Itens básicos, organização e armazenamento, outros itens úteis'
  },
  'quarto': {
    id: 'quarto',
    nome: 'Itens para Quarto',
    icon: BedDouble,
    cor: '#96ceb4',
    descricao: 'Móveis principais, roupa de cama, decoração e conforto'
  }
};

// Nunca quebra a tela se surgir uma categoria desconhecida
export function infoCategoria(categoria: string): CategoriaInfo {
  return categoriasInfo[categoria as Categoria] ?? {
    id: categoria as Categoria,
    nome: categoria,
    icon: Package,
    cor: '#a0aec0',
    descricao: ''
  };
}

export function nomeDoSite(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
