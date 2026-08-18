/** Catalogue courses FR + grilles de prix par enseigne. */

export const STORES = [
  { id: 'lidl', name: 'Lidl', short: 'Lidl', letter: 'Li', color: '#0050AA', accent: '#F5E000', multiplier: 0.88, type: 'discount', note: 'Hard-discount, prix nationaux' },
  { id: 'aldi', name: 'Aldi', short: 'Aldi', letter: 'Al', color: '#002B7F', accent: '#F47321', multiplier: 0.89, type: 'discount', note: 'Hard-discount, prix nationaux' },
  { id: 'leclerc', name: 'E.Leclerc', short: 'Leclerc', letter: 'Le', color: '#1B4EA0', accent: '#E30613', multiplier: 0.94, type: 'hyper', note: 'Souvent le moins cher hors discount' },
  { id: 'intermarche', name: 'Intermarché', short: 'Intermarché', letter: 'In', color: '#E30613', accent: '#FFFFFF', multiplier: 0.97, type: 'super', note: 'Indépendants, bon rapport qualité-prix' },
  { id: 'superu', name: 'Super U', short: 'Super U', letter: 'U', color: '#D71920', accent: '#1A1A1A', multiplier: 0.99, type: 'super', note: 'Proximité, offre large' },
  { id: 'carrefour', name: 'Carrefour', short: 'Carrefour', letter: 'Ca', color: '#004E9F', accent: '#E31E24', multiplier: 1.02, type: 'hyper', note: 'Large choix, promos fréquentes' },
  { id: 'auchan', name: 'Auchan', short: 'Auchan', letter: 'Au', color: '#E4002B', accent: '#FFFFFF', multiplier: 1.04, type: 'hyper', note: 'Hypermarché, formats familiaux' },
  { id: 'casino', name: 'Casino', short: 'Casino', letter: 'Cs', color: '#009640', accent: '#FFFFFF', multiplier: 1.1, type: 'super', note: 'Plus cher, maillage urbain' },
  { id: 'monoprix', name: 'Monoprix', short: 'Monoprix', letter: 'Mo', color: '#222222', accent: '#E30613', multiplier: 1.22, type: 'urbain', note: 'Centre-ville, ticket plus élevé' },
  { id: 'franprix', name: 'Franprix', short: 'Franprix', letter: 'Fr', color: '#E31C79', accent: '#FFFFFF', multiplier: 1.26, type: 'urbain', note: 'Dépannage urbain' },
];

export const CATEGORIES = [
  { id: 'cremerie', name: 'Crèmerie', emoji: '🥛' },
  { id: 'fruits-legumes', name: 'Fruits & légumes', emoji: '🥬' },
  { id: 'boucherie', name: 'Boucherie', emoji: '🥩' },
  { id: 'poissonnerie', name: 'Poissonnerie', emoji: '🐟' },
  { id: 'epicerie', name: 'Épicerie', emoji: '🍝' },
  { id: 'boissons', name: 'Boissons', emoji: '🥤' },
  { id: 'surgeles', name: 'Surgelés', emoji: '🧊' },
  { id: 'boulangerie', name: 'Boulangerie', emoji: '🥖' },
  { id: 'hygiene', name: 'Hygiène', emoji: '🧴' },
  { id: 'entretien', name: 'Entretien', emoji: '🧹' },
];

/**
 * [id, name, brand, size, category, basePrice, emoji, family, tags, bio, flags]
 * flags: 'city' = absent des hard-discounts, 'discountOnly' unused
 */
const RAW = [
  ['lait-dde-1l', 'Lait demi-écrémé UHT', 'Marque distributeur', '1 L', 'cremerie', 1.07, '🥛', 'lait-dde-1l', 'lait demi ecreme dde uht 1l brique', 0],
  ['lait-dde-lactel', 'Lait demi-écrémé', 'Lactel', '1 L', 'cremerie', 1.29, '🥛', 'lait-dde-1l', 'lait lactel demi ecreme 1l', 0],
  ['lait-entier-1l', 'Lait entier UHT', 'Marque distributeur', '1 L', 'cremerie', 1.12, '🥛', 'lait-entier-1l', 'lait entier uht 1l', 0],
  ['lait-bio-1l', 'Lait demi-écrémé bio', 'Marque distributeur', '1 L', 'cremerie', 1.49, '🥛', 'lait-bio-1l', 'lait bio demi ecreme', 1],
  ['beurre-doux-250', 'Beurre doux', 'Marque distributeur', '250 g', 'cremerie', 2.4, '🧈', 'beurre-doux-250', 'beurre doux 250g plaque', 0],
  ['beurre-president-250', 'Beurre doux', 'Président', '250 g', 'cremerie', 2.89, '🧈', 'beurre-doux-250', 'beurre president doux 250', 0],
  ['beurre-demi-sel-250', 'Beurre demi-sel', 'Paysan Breton', '250 g', 'cremerie', 2.79, '🧈', 'beurre-demi-sel-250', 'beurre demi sel paysan breton', 0, 'city'],
  ['yaourt-nature-x8', 'Yaourt nature', 'Marque distributeur', '8 × 125 g', 'cremerie', 2.25, 'yogurt', 'yaourt-nature-x8', 'yaourt yogourt nature x8 pots', 0],
  ['yaourt-danone-x8', 'Yaourt nature', 'Danone', '8 × 125 g', 'cremerie', 2.69, 'yogurt', 'yaourt-nature-x8', 'yaourt danone nature x8', 0],
  ['yaourt-fruits-x8', 'Yaourt aux fruits', 'Marque distributeur', '8 × 125 g', 'cremerie', 2.49, '🍓', 'yaourt-fruits-x8', 'yaourt fruits aromatise x8', 0],
  ['activia-x8', 'Yaourt bifidus', 'Activia', '8 × 125 g', 'cremerie', 3.15, 'yogurt', 'activia-x8', 'activia bifidus yaourt', 0, 'city'],
  ['fromage-blanc-500', 'Fromage blanc 0%', 'Marque distributeur', '500 g', 'cremerie', 1.59, '🥣', 'fromage-blanc-500', 'fromage blanc 0% faisselle', 0],
  ['creme-fraiche-20', 'Crème fraîche épaisse', 'Marque distributeur', '20 cl', 'cremerie', 0.95, '🥛', 'creme-fraiche-20', 'creme fraiche epaisse 20cl', 0],
  ['emmental-rape-200', 'Emmental râpé', 'Marque distributeur', '200 g', 'cremerie', 1.79, '🧀', 'emmental-rape-200', 'emmental rape fromage 200g emm', 0],
  ['camembert-250', 'Camembert', 'Président', '250 g', 'cremerie', 2.15, '🧀', 'camembert-250', 'camembert president 250', 0],
  ['comte-200', 'Comté AOP 6 mois', 'Marque distributeur', '200 g', 'cremerie', 3.89, '🧀', 'comte-200', 'comte aop fromage', 0],
  ['mozzarella-125', 'Mozzarella', 'Galbani', '125 g', 'cremerie', 1.29, '🧀', 'mozzarella-125', 'mozzarella galbani boule', 0, 'city'],
  ['oeufs-x6', 'Œufs plein air', 'Marque distributeur', 'x6', 'cremerie', 2.15, '🥚', 'oeufs-x6', 'oeufs plein air x6 boite six', 0],
  ['oeufs-x12', 'Œufs plein air', 'Marque distributeur', 'x12', 'cremerie', 3.89, '🥚', 'oeufs-x12', 'oeufs plein air x12 douze', 0],
  ['oeufs-bio-x6', 'Œufs bio', 'Marque distributeur', 'x6', 'cremerie', 2.79, '🥚', 'oeufs-bio-x6', 'oeufs bio x6', 1],
  ['lait-amande-1l', 'Boisson amande', 'Bjorg', '1 L', 'cremerie', 2.45, '🌰', 'lait-amande-1l', 'lait amande vegetal bjorg', 1, 'city'],

  ['baguette-tradition', 'Baguette tradition', 'Boulangerie', '250 g', 'boulangerie', 1.1, '🥖', 'baguette', 'baguette tradition pain', 0],
  ['pain-mie-complet', 'Pain de mie complet', "Harry's", '500 g', 'boulangerie', 1.75, '🍞', 'pain-mie-complet', 'pain mie complet harrys sandwich', 0],
  ['pain-mie-nature', 'Pain de mie nature', "Harry's", '500 g', 'boulangerie', 1.59, '🍞', 'pain-mie-nature', 'pain mie nature blanc harrys', 0],
  ['pain-mie-md', 'Pain de mie complet', 'Marque distributeur', '500 g', 'boulangerie', 1.19, '🍞', 'pain-mie-complet', 'pain mie complet md', 0],
  ['croissants-x4', 'Croissants au beurre', 'Marque distributeur', 'x4', 'boulangerie', 2.15, '🥐', 'croissants-x4', 'croissants beurre x4', 0],
  ['pains-burger-x4', 'Pains hamburger', "Harry's", 'x4', 'boulangerie', 1.69, '🍔', 'pains-burger-x4', 'pains hamburger buns', 0],

  ['bananes-kg', 'Bananes', 'Vrac', '1 kg', 'fruits-legumes', 1.69, '🍌', 'bananes', 'bananes kg cavendish', 0],
  ['pommes-golden-kg', 'Pommes Golden', 'France', '1 kg', 'fruits-legumes', 2.19, '🍎', 'pommes-golden', 'pommes golden kg', 0],
  ['pommes-pink-kg', 'Pommes Pink Lady', 'Pink Lady', '1 kg', 'fruits-legumes', 2.89, '🍎', 'pommes-pink', 'pommes pink lady', 0],
  ['oranges-kg', 'Oranges à jus', 'Espagne', '1 kg', 'fruits-legumes', 1.99, '🍊', 'oranges', 'oranges jus kg', 0],
  ['tomates-grappe-kg', 'Tomates grappe', 'France', '1 kg', 'fruits-legumes', 2.79, '🍅', 'tomates-grappe', 'tomates grappe kg', 0],
  ['tomates-cerises', 'Tomates cerises', 'France', '250 g', 'fruits-legumes', 1.69, '🍅', 'tomates-cerises', 'tomates cerises barquette', 0],
  ['salade-batavia', 'Salade batavia', 'France', '1 pce', 'fruits-legumes', 1.15, '🥬', 'salade', 'salade batavia laitue', 0],
  ['carottes-kg', 'Carottes', 'France', '1 kg', 'fruits-legumes', 1.29, '🥕', 'carottes', 'carottes kg', 0],
  ['courgettes-kg', 'Courgettes', 'France', '1 kg', 'fruits-legumes', 1.89, '🥒', 'courgettes', 'courgettes kg', 0],
  ['pdt-2kg', 'Pommes de terre', 'France', '2,5 kg', 'fruits-legumes', 2.49, '🥔', 'pdt', 'pommes de terre pdt sac 2.5kg', 0],
  ['oignons-kg', 'Oignons jaunes', 'France', '1 kg', 'fruits-legumes', 1.39, '🧅', 'oignons', 'oignons jaunes kg', 0],
  ['avocat', 'Avocat', 'Pérou', '1 pce', 'fruits-legumes', 1.29, '🥑', 'avocat', 'avocat piece hass', 0],
  ['citrons', 'Citrons', 'Espagne', 'filet 500 g', 'fruits-legumes', 1.59, '🍋', 'citrons', 'citrons filet', 0],
  ['fraises-250', 'Fraises', 'France', '250 g', 'fruits-legumes', 2.99, '🍓', 'fraises', 'fraises barquette 250', 0],
  ['raisin-kg', 'Raisin blanc', 'Italie', '1 kg', 'fruits-legumes', 3.49, '🍇', 'raisin', 'raisin blanc kg', 0],
  ['concombre', 'Concombre', 'France', '1 pce', 'fruits-legumes', 1.09, '🥒', 'concombre', 'concombre piece', 0],
  ['poivrons', 'Poivrons mix', 'Espagne', '500 g', 'fruits-legumes', 2.29, '🫑', 'poivrons', 'poivrons mix rouge vert', 0],
  ['brocoli', 'Brocoli', 'France', '1 pce', 'fruits-legumes', 1.49, '🥦', 'brocoli', 'brocoli piece', 0],
  ['champignons-250', 'Champignons de Paris', 'France', '250 g', 'fruits-legumes', 1.35, '🍄', 'champignons', 'champignons paris 250', 0],
  ['ail', 'Ail', 'France', '3 têtes', 'fruits-legumes', 1.19, '🧄', 'ail', 'ail tetes filet', 0],
  ['epinards-150', 'Jeunes pousses', 'France', '150 g', 'fruits-legumes', 1.79, '🥬', 'jeunes-pousses', 'jeunes pousses epinards salade sachet', 0],
  ['kiwis', 'Kiwis', 'France', '6 pces', 'fruits-legumes', 2.15, '🥝', 'kiwis', 'kiwis x6', 0],
  ['poires-kg', 'Poires Williams', 'France', '1 kg', 'fruits-legumes', 2.49, '🍐', 'poires', 'poires williams kg', 0],

  ['steak-hache-400', 'Steak haché 15%', 'Marque distributeur', '400 g', 'boucherie', 4.29, '🥩', 'steak-hache-400', 'steak hache 15% 400g viande boeuf', 0],
  ['blanc-poulet-500', 'Blancs de poulet', 'Marque distributeur', '500 g', 'boucherie', 5.49, '🍗', 'blanc-poulet-500', 'blancs poulet filet 500', 0],
  ['poulet-entier', 'Poulet entier', 'France', '~1,4 kg', 'boucherie', 6.9, '🍗', 'poulet-entier', 'poulet entier ferme', 0],
  ['jambon-4tr', 'Jambon blanc', 'Herta', '4 tr', 'boucherie', 2.89, '🥓', 'jambon-4tr', 'jambon blanc herta 4 tranches jbn', 0],
  ['jambon-md-4tr', 'Jambon blanc', 'Marque distributeur', '4 tr', 'boucherie', 2.35, '🥓', 'jambon-4tr', 'jambon blanc md 4tr', 0],
  ['lardons-200', 'Lardons fumés', 'Marque distributeur', '200 g', 'boucherie', 1.99, '🥓', 'lardons-200', 'lardons fumes 200g', 0],
  ['saucisses-knack', 'Knacks', 'Herta', '350 g', 'boucherie', 2.45, '🌭', 'knacks', 'knacks saucisses strasbourg herta', 0],
  ['escalope-dinde-500', 'Escalopes de dinde', 'Marque distributeur', '500 g', 'boucherie', 4.79, '🦃', 'escalope-dinde', 'escalopes dinde 500', 0],
  ['saucisson-sec', 'Saucisson sec', 'Marque distributeur', '200 g', 'boucherie', 3.29, '🥖', 'saucisson', 'saucisson sec 200', 0],

  ['saumon-fume-4tr', 'Saumon fumé', 'Labeyrie', '4 tr · 120 g', 'poissonnerie', 4.99, '🐟', 'saumon-fume', 'saumon fume labeyrie 4tr', 0, 'city'],
  ['saumon-fume-md', 'Saumon fumé', 'Marque distributeur', '4 tr · 120 g', 'poissonnerie', 3.69, '🐟', 'saumon-fume', 'saumon fume md 4tr', 0],
  ['thon-nature-3x', 'Thon naturel', 'Petit Navire', '3 × 80 g', 'poissonnerie', 3.49, '🐠', 'thon-nature', 'thon naturel petit navire conserve', 0],
  ['thon-md', 'Thon naturel', 'Marque distributeur', '3 × 80 g', 'poissonnerie', 2.69, '🐠', 'thon-nature', 'thon naturel md conserve', 0],
  ['sardines', "Sardines à l'huile", 'Marque distributeur', '135 g', 'poissonnerie', 1.15, '🐟', 'sardines', 'sardines huile boite', 0],
  ['crevettes-200', 'Crevettes cuites', 'Marque distributeur', '200 g', 'poissonnerie', 3.89, '🦐', 'crevettes', 'crevettes cuites 200', 0],

  ['spag-500-md', 'Spaghetti', 'Marque distributeur', '500 g', 'epicerie', 0.79, '🍝', 'spaghetti-500', 'spaghetti pates 500g spagh', 0],
  ['spag-barilla-500', 'Spaghetti n°5', 'Barilla', '500 g', 'epicerie', 1.35, '🍝', 'spaghetti-500', 'spaghetti barilla n5 500', 0],
  ['spag-panzani-500', 'Spaghetti', 'Panzani', '500 g', 'epicerie', 1.13, '🍝', 'spaghetti-500', 'spaghetti panzani 500', 0],
  ['penne-500', 'Penne rigate', 'Marque distributeur', '500 g', 'epicerie', 0.79, '🍝', 'penne-500', 'penne rigate pates 500', 0],
  ['riz-1kg', 'Riz long grain', 'Marque distributeur', '1 kg', 'epicerie', 1.49, '🍚', 'riz-1kg', 'riz long grain 1kg', 0],
  ['semoule-1kg', 'Semoule de blé', 'Marque distributeur', '1 kg', 'epicerie', 1.29, '🌾', 'semoule-1kg', 'semoule ble couscous 1kg', 0],
  ['farine-1kg', 'Farine de blé T55', 'Francine', '1 kg', 'epicerie', 1.05, '🌾', 'farine-1kg', 'farine ble t55 francine', 0],
  ['sucre-1kg', 'Sucre en poudre', 'Daddy', '1 kg', 'epicerie', 1.19, '🍬', 'sucre-1kg', 'sucre poudre daddy 1kg', 0],
  ['huile-olive-75', "Huile d'olive vierge extra", 'Puget', '75 cl', 'epicerie', 7.9, '🫒', 'huile-olive-75', 'huile olive vierge extra puget 75cl', 0, 'city'],
  ['huile-olive-md', "Huile d'olive vierge extra", 'Marque distributeur', '75 cl', 'epicerie', 5.49, '🫒', 'huile-olive-75', 'huile olive md 75cl', 0],
  ['huile-tournesol-1l', 'Huile de tournesol', 'Lesieur', '1 L', 'epicerie', 2.79, '🌻', 'huile-tournesol', 'huile tournesol lesieur 1l', 0],
  ['vinaigre-balsam', 'Vinaigre balsamique', 'Marque distributeur', '25 cl', 'epicerie', 1.89, '🍇', 'vinaigre-balsam', 'vinaigre balsamique', 0],
  ['ketchup-heinz', 'Ketchup', 'Heinz', '570 g', 'epicerie', 2.15, '🍅', 'ketchup', 'ketchup heinz', 0],
  ['moutarde-dijon', 'Moutarde de Dijon', 'Maille', '215 g', 'epicerie', 1.49, '🟡', 'moutarde', 'moutarde dijon maille', 0],
  ['mayo-amora', 'Mayonnaise', 'Amora', '235 g', 'epicerie', 1.79, '🥚', 'mayonnaise', 'mayonnaise amora', 0],
  ['coulis-tomate', 'Coulis de tomates', 'Marque distributeur', '500 g', 'epicerie', 0.95, '🍅', 'coulis-tomate', 'coulis tomates sauce', 0],
  ['tomates-pelees', 'Tomates pelées', 'Marque distributeur', '400 g', 'epicerie', 0.89, '🍅', 'tomates-pelees', 'tomates pelees conserve', 0],
  ['mais-conserve', 'Maïs doux', 'Marque distributeur', '300 g', 'epicerie', 0.95, '🌽', 'mais', 'mais doux conserve', 0],
  ['petits-pois', 'Petits pois', 'Marque distributeur', '400 g', 'epicerie', 1.09, '🟢', 'petits-pois', 'petits pois conserve', 0],
  ['haricots-verts', 'Haricots verts extra-fins', 'Marque distributeur', '440 g', 'epicerie', 1.19, '🫘', 'haricots-verts', 'haricots verts extra fins', 0],
  ['lentilles-500', 'Lentilles vertes', 'Marque distributeur', '500 g', 'epicerie', 1.59, '🟤', 'lentilles', 'lentilles vertes 500', 0],
  ['pois-chiches', 'Pois chiches', 'Marque distributeur', '400 g', 'epicerie', 0.99, '🟡', 'pois-chiches', 'pois chiches conserve', 0],
  ['cafe-moulu-250', 'Café moulu', 'Carte Noire', '250 g', 'epicerie', 3.89, '☕', 'cafe-moulu-250', 'cafe moulu carte noire 250', 0, 'city'],
  ['cafe-md-250', 'Café moulu', 'Marque distributeur', '250 g', 'epicerie', 2.15, '☕', 'cafe-moulu-250', 'cafe moulu md 250', 0],
  ['dosettes-senseo', 'Dosettes café', 'Senseo', 'x36', 'epicerie', 4.49, '☕', 'dosettes-cafe', 'dosettes cafe senseo x36', 0, 'city'],
  ['the-lipton', 'Thé yellow label', 'Lipton', 'x50', 'epicerie', 2.89, '🍵', 'the-lipton', 'the lipton yellow label x50', 0],
  ['chocapic-450', 'Céréales Chocapic', 'Nestlé', '450 g', 'epicerie', 3.79, '🥣', 'cereales-choco', 'cereales chocapic nestle', 0],
  ['muesli-500', 'Muesli croustillant', 'Marque distributeur', '500 g', 'epicerie', 2.29, '🥣', 'muesli-500', 'muesli croustillant 500', 0],
  ['confiture-fraise', 'Confiture fraise', 'Bonne Maman', '370 g', 'epicerie', 2.69, '🍓', 'confiture-fraise', 'confiture fraise bonne maman', 0],
  ['nutella-400', 'Pâte à tartiner', 'Nutella', '400 g', 'epicerie', 3.81, '🍫', 'pate-tartiner-400', 'nutella pate tartiner 400g', 0],
  ['nutella-750', 'Pâte à tartiner', 'Nutella', '750 g', 'epicerie', 5.49, '🍫', 'pate-tartiner-750', 'nutella 750g', 0],
  ['pate-tartiner-md', 'Pâte à tartiner cacao', 'Marque distributeur', '400 g', 'epicerie', 2.15, '🍫', 'pate-tartiner-400', 'pate tartiner cacao md noisette', 0],
  ['compote-pomme-x4', 'Compotes pomme', 'Andros', '4 × 90 g', 'epicerie', 1.89, '🍎', 'compote-pomme', 'compotes pomme andros gourdes', 0],
  ['petit-beurre', 'Biscuits petit beurre', 'LU', '300 g', 'epicerie', 1.49, '🍪', 'petit-beurre', 'petit beurre lu biscuits', 0],
  ['prince-lu', 'Biscuits Prince', 'LU', '300 g', 'epicerie', 1.99, '🍪', 'prince', 'prince lu biscuits chocolat', 0],
  ['chocolat-milka', 'Chocolat au lait', 'Milka', '100 g', 'epicerie', 1.35, '🍫', 'chocolat-tablette', 'chocolat lait milka tablette', 0],
  ['chips-lays', 'Chips nature', "Lay's", '150 g', 'epicerie', 1.79, '🥔', 'chips-150', 'chips lays nature 150', 0],
  ['chips-md', 'Chips nature', 'Marque distributeur', '150 g', 'epicerie', 0.99, '🥔', 'chips-150', 'chips nature md 150', 0],
  ['olives-vert', 'Olives vertes', 'Marque distributeur', '200 g', 'epicerie', 1.45, '🫒', 'olives', 'olives vertes denoyautees', 0],

  ['eau-cristaline', 'Eau de source', 'Cristaline', '6 × 1,5 L', 'boissons', 1.74, '💧', 'eau-pack', 'eau source cristaline pack 6x1.5', 0],
  ['eau-evian', 'Eau minérale', 'Evian', '6 × 1,5 L', 'boissons', 3.89, '💧', 'eau-minerale', 'eau minerale evian pack', 0],
  ['coca-15', 'Coca-Cola', 'Coca-Cola', '1,5 L', 'boissons', 1.81, '🥤', 'cola-15', 'coca cola 1.5l soda', 0],
  ['coca-6x33', 'Coca-Cola', 'Coca-Cola', '6 × 33 cl', 'boissons', 3.99, '🥤', 'cola-canette', 'coca cola 6x33cl canettes', 0],
  ['cola-md-15', 'Cola', 'Marque distributeur', '1,5 L', 'boissons', 0.79, '🥤', 'cola-15', 'cola md 1.5l', 0],
  ['orangina-15', 'Orangina', 'Orangina', '1,5 L', 'boissons', 1.69, '🍊', 'orangina-15', 'orangina 1.5l', 0],
  ['jus-orange-1l', "Jus d'orange", 'Tropicana', '1 L', 'boissons', 2.49, '🍊', 'jus-orange-1l', 'jus orange tropicana 1l', 0, 'city'],
  ['jus-orange-md', "Pur jus d'orange", 'Marque distributeur', '1 L', 'boissons', 1.59, '🍊', 'jus-orange-1l', 'pur jus orange md 1l', 0],
  ['kronenbourg-10', 'Bière blonde', 'Kronenbourg', '10 × 25 cl', 'boissons', 6.49, '🍺', 'biere-pack', 'biere blonde kronenbourg 10x25', 0],
  ['beer-1664-6', 'Bière 1664', '1664', '6 × 25 cl', 'boissons', 4.89, '🍺', 'biere-1664', 'biere 1664 6x25', 0],
  ['bordeaux-75', 'Vin rouge Bordeaux', 'Marque distributeur', '75 cl', 'boissons', 4.5, '🍷', 'vin-rouge', 'vin rouge bordeaux 75cl', 0],
  ['smoothie', 'Smoothie fruits', 'Innocent', '750 ml', 'boissons', 3.29, '🥤', 'smoothie', 'smoothie innocent fruits', 1, 'city'],

  ['frites-1kg', 'Frites au four', 'McCain', '1 kg', 'surgeles', 2.89, '🍟', 'frites-1kg', 'frites four mccain 1kg', 0],
  ['pizza-royale', 'Pizza royale', 'Marque distributeur', '400 g', 'surgeles', 2.49, '🍕', 'pizza-royale', 'pizza royale surgelee', 0],
  ['poisson-pane', 'Bâtonnets de poisson', 'Findus', 'x15', 'surgeles', 3.59, '🐟', 'poisson-pane', 'batonnets poisson findus pane', 0],
  ['legumes-vapeur', 'Poêlée de légumes', 'Marque distributeur', '1 kg', 'surgeles', 2.15, '🥦', 'poelee-legumes', 'poelee legumes surgeles', 0],
  ['glace-vanille', 'Glace vanille', "Carte d'Or", '900 ml', 'surgeles', 3.99, '🍦', 'glace-vanille', 'glace vanille carte or', 0],
  ['nuggets', 'Nuggets de poulet', 'Marque distributeur', '400 g', 'surgeles', 2.99, '🍗', 'nuggets', 'nuggets poulet surgeles', 0],

  ['pq-x12', 'Papier toilette', 'Lotus', '12 roul.', 'hygiene', 4.4, '🧻', 'pq-x12', 'papier toilette lotus pq x12 ouate', 0],
  ['pq-md-x12', 'Papier toilette', 'Marque distributeur', '12 roul.', 'hygiene', 3.29, '🧻', 'pq-x12', 'papier toilette md pq x12', 0],
  ['essuie-tout-x3', 'Essuie-tout', 'Okay', '3 roul.', 'entretien', 2.49, '🧻', 'essuie-tout', 'essuie tout okay x3 sopalin', 0],
  ['lessive-2l', 'Lessive liquide', 'Ariel', '2 L', 'entretien', 7.9, '🫧', 'lessive-2l', 'lessive liquide ariel 2l', 0],
  ['lessive-md', 'Lessive liquide', 'Marque distributeur', '2 L', 'entretien', 4.49, '🫧', 'lessive-2l', 'lessive liquide md 2l', 0],
  ['lv-paic', 'Liquide vaisselle', 'Paic', '750 ml', 'entretien', 1.89, '🍽️', 'liquide-vaisselle', 'liquide vaisselle paic', 0],
  ['shampoing', 'Shampoing doux', 'Dop', '400 ml', 'hygiene', 2.79, '🧴', 'shampoing', 'shampoing doux dop', 0],
  ['dentifrice', 'Dentifrice', 'Signal', '75 ml', 'hygiene', 2.15, '😁', 'dentifrice', 'dentifrice signal 75ml', 0],
  ['sacs-poubelle', 'Sacs poubelle 50 L', 'Marque distributeur', '15 pces', 'entretien', 2.49, '🗑️', 'sacs-poubelle', 'sacs poubelle 50l', 0],
];

const EMOJI_FIX = { yogurt: '🥛' };

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unitFrom(n) {
  return Math.round(n * 100) / 100;
}

export function isoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

export function buildCatalog(now = new Date()) {
  const week = isoWeek(now);
  const discountIds = new Set(['lidl', 'aldi']);

  const products = RAW.map((row) => {
    const [id, name, brand, size, category, basePrice, emoji, family, tags, bio, flag] = row;
    return {
      id,
      name,
      brand,
      size,
      category,
      basePrice,
      emoji: EMOJI_FIX[emoji] || emoji,
      family,
      tags,
      bio: Boolean(bio),
      cityOnly: flag === 'city',
      md: /marque distributeur/i.test(brand),
    };
  });

  const promoTargets = [];
  const pool = [...products].sort((a, b) => hash(`${week}:${a.id}`) - hash(`${week}:${b.id}`));
  for (const p of pool) {
    if (promoTargets.length >= 14) break;
    if (p.basePrice < 1.1) continue;
    promoTargets.push(p.id);
  }
  const promoSet = new Set(promoTargets);

  const priced = products.map((p) => {
    const prices = {};
    for (const store of STORES) {
      if (p.cityOnly && discountIds.has(store.id)) {
        prices[store.id] = { available: false };
        continue;
      }
      const noise = ((hash(`${p.id}:${store.id}`) % 900) - 450) / 10000;
      let value = p.basePrice * store.multiplier * (1 + noise);

      if (p.md && discountIds.has(store.id)) value *= 0.97;
      if (!p.md && store.id === 'leclerc') value *= 0.98;

      const isPromo =
        promoSet.has(p.id) &&
        (hash(`${week}:${p.id}:${store.id}`) % 10 < 3 ||
          (store.id === 'leclerc' && p.id.startsWith('nutella')) ||
          (store.id === 'lidl' && p.family === 'pq-x12'));

      let promo = null;
      if (isPromo && prices) {
        const off = 12 + (hash(`${week}:off:${p.id}:${store.id}`) % 14);
        value *= 1 - off / 100;
        promo = { off, label: `-${off} %` };
      }

      prices[store.id] = {
        available: true,
        price: unitFrom(Math.max(0.29, value)),
        promo,
      };
    }
    return { ...p, prices };
  });

  return { products: priced, week, promoIds: promoTargets };
}

let cache = null;
let cacheWeek = null;

export function getCatalog() {
  const week = isoWeek();
  if (!cache || cacheWeek !== week) {
    cache = buildCatalog();
    cacheWeek = week;
  }
  return cache;
}

export function getProduct(id) {
  return getCatalog().products.find((p) => p.id === id) || null;
}

export function getStore(id) {
  return STORES.find((s) => s.id === id) || null;
}

export function cheapestOffer(product) {
  let best = null;
  for (const store of STORES) {
    const offer = product.prices[store.id];
    if (!offer?.available) continue;
    if (!best || offer.price < best.price) {
      best = { storeId: store.id, store, price: offer.price, promo: offer.promo };
    }
  }
  return best;
}

export function familyMembers(family, products = getCatalog().products) {
  return products.filter((p) => p.family === family);
}

export function cheapestInFamily(family, storeId, products = getCatalog().products) {
  let best = null;
  for (const p of familyMembers(family, products)) {
    const offer = p.prices[storeId];
    if (!offer?.available) continue;
    if (!best || offer.price < best.price) best = { product: p, ...offer };
  }
  return best;
}

export const BASKETS = {
  'petit-dej': {
    name: 'Petit-déjeuner',
    blurb: 'Lait, pain, beurre, confiture, café, jus, œufs.',
    ids: ['lait-dde-1l', 'pain-mie-complet', 'beurre-doux-250', 'confiture-fraise', 'cafe-md-250', 'jus-orange-md', 'oeufs-x6'],
  },
  etudiant: {
    name: 'Semaine étudiant',
    blurb: 'Pâtes, riz, sauce, thon, œufs, lait, yaourts, pommes.',
    ids: ['spag-500-md', 'riz-1kg', 'coulis-tomate', 'thon-md', 'oeufs-x6', 'lait-dde-1l', 'yaourt-nature-x8', 'pommes-golden-kg'],
  },
  famille: {
    name: 'Courses famille',
    blurb: 'Un chariot type pour 4 personnes.',
    ids: [
      'lait-dde-1l',
      'pain-mie-complet',
      'oeufs-x12',
      'beurre-doux-250',
      'yaourt-fruits-x8',
      'bananes-kg',
      'pdt-2kg',
      'steak-hache-400',
      'blanc-poulet-500',
      'spag-barilla-500',
      'nutella-400',
      'coca-15',
      'pq-md-x12',
      'lessive-md',
    ],
  },
  apero: {
    name: 'Apéro',
    blurb: 'Chips, olives, saucisson, fromage, bière.',
    ids: ['chips-md', 'olives-vert', 'saucisson-sec', 'camembert-250', 'kronenbourg-10'],
  },
};

export const DEMO_RECEIPT = {
  storeId: 'carrefour',
  storeLabel: 'Carrefour Market Saint-Cloud',
  date: '12/08/2026',
  text: `CARREFOUR MARKET
SAINT-CLOUD (92210)
01 47 71 00 00
SIRET 32247196000010
DATE 12/08/2026          14:18
TICKET 000452            CAISSE 3
LAIT DEMI ECREM 1L            1,09
PAIN MIE COMPLET              1,79
OEUFS PLEIN AIR X6            2,19
BEURRE DOUX 250G              2,45
YAOURT NATURE X8              2,29
BANANES 1.02KG                1,89
SPAGHETTI 500G                1,15
NUTELLA 400G                  3,89
COCA COLA 1.5L                1,85
PQ PURE OUATE X12             4,49
TOTAL ARTICLE(S)                10
** TOTAL EUR              23,08 **
Paiement: C.B.
MONTANT PAYE EUR             23,08
A BIENTOT DANS VOTRE
CARREFOUR MARKET
** MERCI DE VOTRE VISITE **`,
};
