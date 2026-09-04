export const pokiapi = 'https://pokeapi.co/api/v2/pokemon?limit=2000';

export const GENERATIONS = [
  { id: 1, name: 'Gen 1', region: 'Kanto', start: 1, end: 151, icon: '⚡' },
  { id: 2, name: 'Gen 2', region: 'Johto', start: 152, end: 251, icon: '🌿' },
  { id: 3, name: 'Gen 3', region: 'Hoenn', start: 252, end: 386, icon: '🌊' },
  { id: 4, name: 'Gen 4', region: 'Sinnoh', start: 387, end: 493, icon: '❄️' },
  { id: 5, name: 'Gen 5', region: 'Unova', start: 494, end: 649, icon: '🐉' },
  { id: 6, name: 'Gen 6', region: 'Kalos', start: 650, end: 721, icon: '✨' },
  { id: 7, name: 'Gen 7', region: 'Alola', start: 722, end: 809, icon: '🌺' },
  { id: 8, name: 'Gen 8', region: 'Galar', start: 810, end: 905, icon: '⚔️' },
  { id: 9, name: 'Gen 9', region: 'Paldea', start: 906, end: 1025, icon: '💎' }
];

export const BATTLEGROUNDS = [
  {
    id: 'volcano',
    name: 'Cinnabar Volcano',
    region: 'Kanto (Gen 1)',
    element: 'fire',
    boostDesc: 'Fire moves deal +25% damage',
    bgGradient: 'radial-gradient(circle at 50% 80%, #7f1d1d 0%, #450a0a 50%, #180505 100%)',
    arenaColor: '#ef4444',
    icon: '🌋'
  },
  {
    id: 'kalos',
    name: 'Kalos League Citadel',
    region: 'Kalos (Gen 6)',
    element: 'fairy',
    boostDesc: 'Fairy & Dragon moves deal +25% damage',
    bgGradient: 'radial-gradient(circle at 50% 40%, #581c87 0%, #3b0764 50%, #0f172a 100%)',
    arenaColor: '#ec4899',
    icon: '🏰'
  },
  {
    id: 'ocean',
    name: 'Cerulean Water Arena',
    region: 'Kanto (Gen 1)',
    element: 'water',
    boostDesc: 'Water moves deal +25% damage',
    bgGradient: 'radial-gradient(circle at 50% 60%, #0284c7 0%, #0369a1 50%, #082f49 100%)',
    arenaColor: '#38bdf8',
    icon: '🌊'
  },
  {
    id: 'forest',
    name: 'Santalune Forest',
    region: 'Kalos (Gen 6)',
    element: 'grass',
    boostDesc: 'Grass & Bug moves deal +25% damage',
    bgGradient: 'radial-gradient(circle at 50% 50%, #14532d 0%, #052e16 60%, #02140a 100%)',
    arenaColor: '#22c55e',
    icon: '🌲'
  },
  {
    id: 'powerplant',
    name: 'Vermilion Power Plant',
    region: 'Kanto (Gen 1)',
    element: 'electric',
    boostDesc: 'Electric moves deal +25% damage',
    bgGradient: 'radial-gradient(circle at 50% 50%, #854d0e 0%, #422006 60%, #0f172a 100%)',
    arenaColor: '#eab308',
    icon: '⚡'
  }
];
