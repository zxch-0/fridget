export const CHAINS = [
  { id: 'lidl', name: 'Lidl', short: 'Lidl', letter: 'Li', color: '#0050AA', re: /\blidl\b/i },
  { id: 'aldi', name: 'Aldi', short: 'Aldi', letter: 'Al', color: '#002B7F', re: /\baldi\b/i },
  { id: 'leclerc', name: 'E.Leclerc', short: 'Leclerc', letter: 'Le', color: '#1B4EA0', re: /leclerc/i },
  { id: 'intermarche', name: 'Intermarché', short: 'Intermarché', letter: 'In', color: '#E30613', re: /intermarch/i },
  { id: 'superu', name: 'Système U', short: 'Super U', letter: 'U', color: '#D71920', re: /\b(super u|hyper u|u express|u tile|syst[eè]me u)\b/i },
  { id: 'carrefour', name: 'Carrefour', short: 'Carrefour', letter: 'Ca', color: '#004E9F', re: /carrefour/i },
  { id: 'auchan', name: 'Auchan', short: 'Auchan', letter: 'Au', color: '#E4002B', re: /\bauchan\b/i },
  { id: 'casino', name: 'Casino', short: 'Casino', letter: 'Cs', color: '#009640', re: /\bcasino\b/i },
  { id: 'monoprix', name: 'Monoprix', short: 'Monoprix', letter: 'Mo', color: '#222222', re: /monoprix|\bmonop['’]?\b/i },
  { id: 'franprix', name: 'Franprix', short: 'Franprix', letter: 'Fr', color: '#E31C79', re: /franprix/i },
  { id: 'netto', name: 'Netto', short: 'Netto', letter: 'Ne', color: '#F5C400', re: /\bnetto\b/i },
  { id: 'leaderprice', name: 'Leader Price', short: 'Leader Price', letter: 'LP', color: '#C8102E', re: /leader\s*price/i },
  { id: 'cora', name: 'Cora', short: 'Cora', letter: 'Co', color: '#E30613', re: /\bcora\b/i },
  { id: 'grandfrais', name: 'Grand Frais', short: 'Grand Frais', letter: 'GF', color: '#5B7A2A', re: /grand\s*frais/i },
  { id: 'picard', name: 'Picard', short: 'Picard', letter: 'Pi', color: '#0090C0', re: /\bpicard\b/i },
  { id: 'biocoop', name: 'Biocoop', short: 'Biocoop', letter: 'Bi', color: '#6BA539', re: /biocoop/i },
];

export function matchChain(location = {}) {
  const hay = `${location.osm_brand || ''} ${location.osm_name || ''} ${location.osm_display_name || ''}`;
  const found = CHAINS.find((c) => c.re.test(hay));
  if (found) return found;
  const raw = (location.osm_brand || location.osm_name || 'Autre').trim();
  return {
    id: `other-${raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24)}`,
    name: raw,
    short: raw,
    letter: raw.slice(0, 2),
    color: '#245C44',
    other: true,
  };
}

export const STAPLE_BASKETS = {
  'petit-dej': {
    name: 'Petit-déjeuner',
    blurb: 'Lait, pain, beurre, confiture, café, jus, œufs.',
    queries: ['lait demi-écrémé UHT 1l', 'pain de mie', 'beurre doux 250', 'confiture fraise', 'café moulu', "jus d'orange 1l", 'oeufs plein air'],
  },
  etudiant: {
    name: 'Semaine étudiant',
    blurb: 'Pâtes, riz, sauce, thon, œufs, lait, yaourts.',
    queries: ['spaghetti 500', 'riz 1kg', 'coulis tomate', 'thon naturel', 'oeufs', 'lait demi-écrémé', 'yaourt nature'],
  },
  famille: {
    name: 'Courses famille',
    blurb: 'Un chariot type, prix relevés réellement.',
    queries: [
      'lait demi-écrémé',
      'pain de mie',
      'oeufs plein air',
      'beurre doux',
      'bananes',
      'steak haché',
      'spaghetti',
      'Nutella 400',
      'Coca-Cola 1.5',
      'papier toilette',
    ],
  },
  apero: {
    name: 'Apéro',
    blurb: 'Chips, olives, saucisson, fromage, bière.',
    queries: ['chips nature', 'olives vertes', 'saucisson sec', 'camembert', 'bière blonde'],
  },
};

export function detectBasket(query) {
  const n = String(query || '').toLowerCase();
  if (/petit[-\s]?d[eé]j|breakfast/.test(n)) return 'petit-dej';
  if (/etudiant|étudiant|crous/.test(n)) return 'etudiant';
  if (/apero|apéro|apéritif/.test(n)) return 'apero';
  if (/famille|chariot|courses de la semaine/.test(n)) return 'famille';
  return null;
}
