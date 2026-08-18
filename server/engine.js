import {
  BASKETS,
  CATEGORIES,
  STORES,
  cheapestInFamily,
  cheapestOffer,
  getCatalog,
  getProduct,
  getStore,
} from './catalog.js';

export function normalize(input = '') {
  return String(input)
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, ' ')
    .replace(/[^a-z0-9,.x]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'au', 'aux', 'et', 'ou', 'en',
  'pour', 'pas', 'plus', 'tres', 'le', 'mon', 'ma', 'mes', 'ce', 'cet', 'cette',
  'avec', 'sans', 'sur', 'dans', 'chez', 'des', 'd', 'l', 'a', 'the', 'of',
  'meilleur', 'meilleure', 'meilleurs', 'prix', 'pas', 'cher', 'chere', 'moins',
  'trouver', 'compare', 'comparer', 'comparatif', 'ou', 'acheter', 'achat',
]);

const SYNONYMS = {
  lait: ['lait', 'brique', 'uht'],
  dde: ['demi', 'ecreme', 'dde'],
  yaourt: ['yaourt', 'yogourt', 'yogurt', 'yahourt', 'pot'],
  oeuf: ['oeuf', 'oeufs'],
  pdt: ['pdt', 'pomme', 'terre', 'patate', 'patates'],
  pq: ['pq', 'papier', 'toilette', 'ouate', 'pq'],
  coca: ['coca', 'cola', 'cocacola'],
  nutella: ['nutella', 'pate', 'tartiner', 'noisette'],
  spag: ['spag', 'spagh', 'spaghetti', 'spaghettis', 'pates'],
  pates: ['pates', 'spaghetti', 'penne', 'tagliatelle'],
  mie: ['mie', 'sandwich'],
  hache: ['hache', 'steak', 'viande'],
  jbn: ['jambon', 'jbn', 'blanc'],
  sopalin: ['essuie', 'tout', 'sopalin'],
  lessive: ['lessive', 'linge'],
  eau: ['eau', 'pack', 'cristaline'],
  bio: ['bio', 'biologique', 'organic'],
};

const INTENT_BASKETS = [
  { re: /petit[-\s]?d[eé]j|breakfast|petit dej/i, id: 'petit-dej' },
  { re: /etudiant|studieux|fac|crous/i, id: 'etudiant' },
  { re: /famille|foyer|chariot|courses de la semaine/i, id: 'famille' },
  { re: /apero|aperitif|chips.*biere|soiree/i, id: 'apero' },
];

export function tokensOf(text) {
  return normalize(text)
    .split(' ')
    .map((t) => t.replace(/^[x]/, ''))
    .filter((t) => t.length > 1 && !STOP.has(t));
}

function expand(tokens) {
  const out = new Set(tokens);
  for (const t of tokens) {
    for (const [key, vals] of Object.entries(SYNONYMS)) {
      if (t === key || vals.includes(t)) vals.forEach((v) => out.add(v));
    }
  }
  return [...out];
}

export function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
  }
  return prev[b.length];
}

function scoreProduct(product, queryTokens, rawQuery) {
  const hay = normalize(`${product.name} ${product.brand} ${product.size} ${product.tags} ${product.family}`);
  const hayTokens = new Set(tokensOf(hay));
  const expanded = expand(queryTokens);
  if (!expanded.length) return 0;
  const original = new Set(queryTokens);

  let score = 0;
  let hits = 0;
  for (const t of expanded) {
    const weight = original.has(t) ? (t.length > 4 ? 7 : 5) : 1.2;
    if (hayTokens.has(t) || hay.includes(t)) {
      hits += 1;
      score += weight;
    } else if (original.has(t)) {
      let fuzzy = false;
      for (const h of hayTokens) {
        if (h.length < 4 || t.length < 4) continue;
        if (levenshtein(t, h) === 1) {
          score += 2;
          fuzzy = true;
          break;
        }
      }
      if (!fuzzy && t.length > 3 && hay.includes(t.slice(0, 4))) score += 0.5;
    }
  }

  if (hits === 0 && score < 2) return 0;
  const nq = normalize(rawQuery);
  const brand = normalize(product.brand);
  if (normalize(product.name).includes(nq)) score += 12;
  if (brand && nq.includes(brand)) score += 18;
  if (queryTokens.includes('bio') && product.bio) score += 8;
  if (queryTokens.includes('bio') && !product.bio) score -= 3;
  if (product.md && queryTokens.some((t) => ['nutella', 'coca', 'barilla', 'heinz', 'herta', 'lactel'].includes(t))) {
    score -= 6;
  }
  return score;
}

export function interpretQuery(query) {
  const q = query.trim();
  const n = normalize(q);
  const tokens = tokensOf(q);
  let intent = 'search';
  let basketId = null;
  for (const b of INTENT_BASKETS) {
    if (b.re.test(q) || b.re.test(n)) {
      intent = 'basket';
      basketId = b.id;
      break;
    }
  }
  if (/quel magasin|ou faire|enseigne la moins|moins chere enseigne/i.test(q) || /enseigne/.test(n)) {
    intent = 'store';
  }
  const bio = /\bbio\b/.test(n);
  const brandHints = ['nutella', 'coca', 'herta', 'barilla', 'panzani', 'lactel', 'danone', 'heinz', 'lipton', "harry's", 'harrys', 'president', 'tropicana'];
  const brand = brandHints.find((b) => n.includes(normalize(b))) || null;
  const sizeMatch = n.match(/(\d+(?:[.,]\d+)?)\s?(l|cl|ml|kg|g|tr)\b/) || n.match(/\bx\s?(\d+)\b/);
  return { raw: q, normalized: n, tokens, intent, basketId, bio, brand, size: sizeMatch?.[0] || null };
}

function summarizeProduct(product) {
  const offers = STORES.map((store) => {
    const offer = product.prices[store.id];
    return {
      storeId: store.id,
      store: store.name,
      color: store.color,
      available: Boolean(offer?.available),
      price: offer?.available ? offer.price : null,
      promo: offer?.promo || null,
    };
  });
  const available = offers.filter((o) => o.available);
  const best = available.reduce((a, b) => (a.price <= b.price ? a : b), available[0]);
  const worst = available.reduce((a, b) => (a.price >= b.price ? a : b), available[0]);
  return {
    ...product,
    offers,
    best,
    worst,
    spread: best && worst ? unit(worst.price - best.price) : 0,
    spreadPct: best && worst && worst.price ? Math.round(((worst.price - best.price) / worst.price) * 100) : 0,
  };
}

function unit(n) {
  return Math.round(n * 100) / 100;
}

export function searchProducts(query, { limit = 18, category = null } = {}) {
  const { products } = getCatalog();
  const understood = interpretQuery(query || '');
  if (understood.intent === 'basket' && understood.basketId) {
    const basket = buildNamedBasket(understood.basketId);
    return { understood, basket, results: basket.products };
  }

  const scored = products
    .map((p) => ({ p, s: query ? scoreProduct(p, understood.tokens, query) : 0 }))
    .filter(({ p, s }) => {
      if (category && p.category !== category) return false;
      if (!query) return true;
      return s > 0;
    })
    .sort((a, b) => b.s - a.s || a.p.basePrice - b.p.basePrice);

  const top = (query ? scored : products.filter((p) => !category || p.category === category).map((p) => ({ p, s: 1 })))
    .slice(0, limit)
    .map(({ p }) => summarizeProduct(p));

  return { understood, results: top, basket: null };
}

export function productDetail(id) {
  const product = getProduct(id);
  if (!product) return null;
  const summary = summarizeProduct(product);
  const { products } = getCatalog();
  const alts = products
    .filter((p) => p.family === product.family && p.id !== product.id)
    .map(summarizeProduct);
  const similar = products
    .filter((p) => p.category === product.category && p.id !== product.id && p.family !== product.family)
    .slice(0, 6)
    .map(summarizeProduct);
  return { product: summary, equivalents: alts, similar };
}

export function weeklyDeals(limit = 8) {
  const { products, week } = getCatalog();
  const deals = [];
  for (const p of products) {
    for (const store of STORES) {
      const offer = p.prices[store.id];
      if (offer?.promo) {
        const best = cheapestOffer(p);
        deals.push({
          product: summarizeProduct(p),
          storeId: store.id,
          store: store.name,
          color: store.color,
          price: offer.price,
          promo: offer.promo,
          vsBest: best && best.storeId !== store.id ? best : null,
        });
      }
    }
  }
  deals.sort((a, b) => b.promo.off - a.promo.off);
  const seen = new Set();
  const unique = [];
  for (const d of deals) {
    if (seen.has(d.product.id)) continue;
    seen.add(d.product.id);
    unique.push(d);
    if (unique.length >= limit) break;
  }
  return { week, deals: unique };
}

function lineTotal(items, storeId) {
  let total = 0;
  let missing = 0;
  const lines = items.map((item) => {
    const qty = item.qty || 1;
    const product = typeof item.product === 'object' ? item.product : getProduct(item.productId || item.id);
    if (!product) {
      missing += 1;
      return { ...item, available: false, line: 0 };
    }
    const familyBest = cheapestInFamily(product.family, storeId);
    if (!familyBest) {
      missing += 1;
      return { product, qty, available: false, line: 0 };
    }
    const line = unit(familyBest.price * qty);
    total += line;
    return {
      product: familyBest.product,
      requested: product,
      qty,
      available: true,
      price: familyBest.price,
      promo: familyBest.promo,
      line,
    };
  });
  return { total: unit(total), missing, lines };
}

export function optimizeBasket(rawItems) {
  const items = (rawItems || [])
    .map((it) => ({
      productId: it.productId || it.id,
      product: getProduct(it.productId || it.id),
      qty: Math.max(1, Number(it.qty) || 1),
    }))
    .filter((it) => it.product);

  const byStore = STORES.map((store) => {
    const calc = lineTotal(items, store.id);
    return { store, ...calc };
  }).sort((a, b) => a.total - b.total || a.missing - b.missing);

  const split = items.map((item) => {
    let best = null;
    for (const store of STORES) {
      const offer = cheapestInFamily(item.product.family, store.id);
      if (!offer) continue;
      if (!best || offer.price < best.price) {
        best = { store, product: offer.product, price: offer.price, promo: offer.promo, qty: item.qty };
      }
    }
    return {
      requested: item.product,
      qty: item.qty,
      pick: best,
      line: best ? unit(best.price * item.qty) : 0,
    };
  });
  const splitTotal = unit(split.reduce((s, l) => s + l.line, 0));
  const mono = byStore[0];
  const splitGain = unit((mono?.total || 0) - splitTotal);

  return {
    items: items.map((i) => ({ product: summarizeProduct(i.product), qty: i.qty })),
    byStore: byStore.map((s) => ({
      storeId: s.store.id,
      store: s.store.name,
      color: s.store.color,
      type: s.store.type,
      total: s.total,
      missing: s.missing,
      lines: s.lines.map((l) => ({
        name: l.product?.name,
        brand: l.product?.brand,
        qty: l.qty,
        price: l.price || null,
        line: l.line,
        available: l.available,
        promo: l.promo || null,
      })),
    })),
    split: {
      total: splitTotal,
      gain: splitGain,
      lines: split.map((l) => ({
        name: l.requested.name,
        qty: l.qty,
        storeId: l.pick?.store.id || null,
        store: l.pick?.store.name || null,
        color: l.pick?.store.color || null,
        productName: l.pick?.product.name,
        brand: l.pick?.product.brand,
        price: l.pick?.price || null,
        line: l.line,
      })),
    },
    bestStore: mono
      ? { storeId: mono.store.id, store: mono.store.name, color: mono.store.color, total: mono.total }
      : null,
  };
}

export function buildNamedBasket(id) {
  const def = BASKETS[id];
  if (!def) return null;
  const opt = optimizeBasket(def.ids.map((pid) => ({ productId: pid, qty: 1 })));
  return { id, ...def, ...opt, products: opt.items.map((i) => i.product) };
}

export function compareStores(storeIds, basketId = 'famille') {
  const ids = (storeIds || []).filter((id) => getStore(id));
  const picked = ids.length ? ids : ['lidl', 'leclerc', 'carrefour'];
  const basket = buildNamedBasket(basketId) || buildNamedBasket('famille');
  const columns = picked.map((id) => basket.byStore.find((s) => s.storeId === id)).filter(Boolean);
  return { basket: { id: basket.id, name: basket.name, blurb: basket.blurb }, columns, all: basket.byStore };
}

export function aiSearch(query) {
  const found = searchProducts(query, { limit: 12 });
  const { understood, results, basket } = found;
  let answer;
  let insight;

  if (understood.intent === 'basket' && basket) {
    const best = basket.bestStore;
    answer = `Pour un panier « ${basket.name} », l'enseigne la plus douce aujourd'hui est ${best.store} à ${fmt(best.total)}.`;
    const runner = basket.byStore[1];
    insight = runner
      ? `Écart de ${fmt(runner.total - best.total)} avec ${runner.store}. En mixant les enseignes, on descend à ${fmt(basket.split.total)}.`
      : '';
  } else if (understood.intent === 'store') {
    const fam = buildNamedBasket('famille');
    const best = fam.bestStore;
    answer = `Sur un chariot famille, ${best.store} sort en tête à ${fmt(best.total)}.`;
    insight = `Lidl et Aldi restent les plus bas sur les marques distributeurs ; Leclerc gagne souvent sur les grandes marques en promo.`;
  } else if (results.length) {
    const top = results[0];
    answer = `Meilleur prix pour ${top.name}${top.brand && !top.md ? ` ${top.brand}` : ''} ${top.size} : ${top.best.store} à ${fmt(top.best.price)}.`;
    insight =
      top.spread > 0.15
        ? `Jusqu'à ${fmt(top.spread)} d'écart (${top.spreadPct} %) selon l'enseigne. ${top.worst.store} est le plus cher.`
        : `Les prix sont assez serrés sur cette référence.`;
  } else {
    answer = `Je n'ai pas reconnu « ${query} ». Essayez une marque, un format (1 L, 500 g) ou un rayon.`;
    insight = 'Exemples : « lait demi-écrémé », « nutella 400 », « petit-déj pas cher ».';
  }

  return {
    query,
    understood,
    answer,
    insight,
    results,
    basket,
    suggestions: suggest(query, results),
  };
}

function suggest(query, results) {
  if (results?.length) {
    return [...new Set(results.slice(0, 4).map((r) => r.name))];
  }
  return ['lait demi-écrémé', 'Nutella 400g', 'spaghetti 500g', 'panier étudiant'];
}

export function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

export async function maybePolish(payload) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return payload;
  try {
    const base = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 180,
        messages: [
          {
            role: 'system',
            content:
              'Tu es Fridget, assistant courses français, ton chaleureux et précis. Reformule answer et insight en 2 phrases max. Ne change aucun chiffre. JSON {answer, insight}.',
          },
          { role: 'user', content: JSON.stringify({ query: payload.query, answer: payload.answer, insight: payload.insight }) },
        ],
      }),
    });
    if (!res.ok) return payload;
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    const json = JSON.parse(text.replace(/```json|```/g, '').trim());
    return { ...payload, answer: json.answer || payload.answer, insight: json.insight || payload.insight, llm: true };
  } catch {
    return payload;
  }
}

export function catalogStats() {
  const { products, week } = getCatalog();
  return {
    products: products.length,
    stores: STORES.length,
    categories: CATEGORIES.length,
    week,
    avgSpread: unit(
      products.reduce((s, p) => s + summarizeProduct(p).spreadPct, 0) / products.length,
    ),
  };
}

export { summarizeProduct, STORES, CATEGORIES, BASKETS };
