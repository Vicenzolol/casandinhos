// Informações do casamento exibidas no site principal.
// Campos vazios ('') aparecem como "Em breve" na página.

export const casamento = {
  noivos: 'Vicenzo & Flaviana',

  // Horário de Brasília (UTC-3). O fim é estimado, só para o convite de calendário.
  inicio: '2027-04-24T15:00:00-03:00',
  fim: '2027-04-24T23:00:00-03:00',

  historia: '',

  // Cores preferidas para a casa, mostradas num aviso no topo da lista de presentes.
  // Cada item também pode ter a sua própria cor (campo "Cor preferida" no admin).
  coresPreferidas: [
    { nome: 'off-white', hex: '#F4EFE3' },
  ],

  local: {
    nome: 'Sítio Casarão',
    cidade: 'Itapemirim - ES',
    // Se o endereço ficar vazio, o mapa busca por nome + cidade.
    endereco: 'Gomes, Itapemirim - ES, 29330-000',
    links: 'https://linktr.ee/sitiocasarao',
    // Perfil, e não um story: stories expiram em 24 horas.
    instagram: 'https://www.instagram.com/sitiocasarao.itapemirim/',
  },
};

export function buscaDoLocal() {
  const { nome, cidade, endereco } = casamento.local;
  return endereco ? `${nome} - ${endereco}` : `${nome}, ${cidade}`;
}
