import { DEMO_RECEIPT, STORES, cheapestInFamily, getCatalog, getStore } from './catalog.js';
import { fmt, levenshtein, normalize, tokensOf } from './engine.js';

const SKIP =
  /^(total|sous[-\s]?total|tva|cb|carte|especes|espece|rendu|merci|ticket|caisse|vendeur|siret|date|paiement|montant|article|articles|a bientot|bonjour|carrefour market|leclerc|intermarche|lidl|auchan|casino|monoprix|franprix|aldi|super u|saint|siret|tel|telephone|tva intra|net a payer|dont tva|\*\*|-+$)/i;

export const RECEIPT_ALIASES = [
  { re: /lait.+(dde|demi|ecrem)|dde 1l|lait demi/i, family: 'lait-dde-1l' },
  { re: /pain\s*mie.*complet|p\.?\s*mie complet|mie complet/i, family: 'pain-mie-complet' },
  { re: /pain\s*mie|p\.?\s*mie/i, family: 'pain-mie-nature' },
  { re: /oeufs?.+x\s*12|oeufs?.+12/i, family: 'oeufs-x12' },
  { re: /oeufs?.+(plein\s*air|p\.?\s*air|x\s*6)/i, family: 'oeufs-x6' },
  { re: /beurre.+(demi\s*sel|d\.?\s*sel)/i, family: 'beurre-demi-sel-250' },
  { re: /beurre/i, family: 'beurre-doux-250' },
  { re: /yaourt.+fruit|yogou?rt.+fruit/i, family: 'yaourt-fruits-x8' },
  { re: /yaourt|yogou?rt|yahourt/i, family: 'yaourt-nature-x8' },
  { re: /banane/i, family: 'bananes' },
  { re: /spaghet|spagh|pates 500/i, family: 'spaghetti-500' },
  { re: /nutella|pate a tartiner|p\.?\s*tartiner/i, family: 'pate-tartiner-400' },
  { re: /coca|cola/i, family: 'cola-15' },
  { re: /\bpq\b|papier toilette|p\.?\s*toilette|pure ouate|ouate x/i, family: 'pq-x12' },
  { re: /emmental|emm\.?\s*rape|emment/i, family: 'emmental-rape-200' },
  { re: /creme fr/i, family: 'creme-fraiche-20' },
  { re: /fromage blanc|from\.?\s*blanc/i, family: 'fromage-blanc-500' },
  { re: /jambon|jbn/i, family: 'jambon-4tr' },
  { re: /steak|hache|s\.?\s*hache/i, family: 'steak-hache-400' },
  { re: /blanc.+poulet|filet poulet/i, family: 'blanc-poulet-500' },
  { re: /saumon/i, family: 'saumon-fume' },
  { re: /thon/i, family: 'thon-nature' },
  { re: /riz/i, family: 'riz-1kg' },
  { re: /huile d.?olive|h\.?\s*olive/i, family: 'huile-olive-75' },
  { re: /cafe/i, family: 'cafe-moulu-250' },
  { re: /chips/i, family: 'chips-150' },
  { re: /essuie|sopalin/i, family: 'essuie-tout' },
  { re: /lessive/i, family: 'lessive-2l' },
  { re: /eau|cristaline|evian/i, family: 'eau-pack' },
  { re: /jus d.?orange|pur jus/i, family: 'jus-orange-1l' },
  { re: /pommes? de terre|\bpdt\b/i, family: 'pdt' },
  { re: /tomate grappe/i, family: 'tomates-grappe' },
  { re: /baguette/i, family: 'baguette' },
  { re: /dentifrice/i, family: 'dentifrice' },
  { re: /shampo/i, family: 'shampoing' },
  { re: /ketchup/i, family: 'ketchup' },
  { re: /confiture/i, family: 'confiture-fraise' },
  { re: /compote/i, family: 'compote-pomme' },
  { re: /croissant/i, family: 'croissants-x4' },
  { re: /mozza/i, family: 'mozzarella-125' },
  { re: /camembert/i, family: 'camembert-250' },
  { re: /comte/i, family: 'comte-200' },
];

function parsePrice(raw) {
  if (!raw) return null;
  const n = Number(String(raw).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

export function parseReceiptText(text) {
  const lines = String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const items = [];
  let detectedStore = null;
  let detectedTotal = null;

  const header = lines.slice(0, 8).join(' ').toLowerCase();
  for (const store of STORES) {
    if (header.includes(store.name.toLowerCase()) || header.includes(store.short.toLowerCase())) {
      detectedStore = store.id;
      break;
    }
  }
  if (/carrefour/.test(header)) detectedStore = 'carrefour';

  for (const line of lines) {
    const compact = line.replace(/\s+/g, ' ').trim();
    if (SKIP.test(compact.replace(/^\*+\s*/, ''))) {
      const tot = compact.match(/total[^0-9]*(\d+[.,]\d{2})/i);
      if (tot) detectedTotal = parsePrice(tot[1]);
      continue;
    }
    if (/siret|siren|\d{5}\s+\d{3}/i.test(compact) && compact.length < 40) continue;

    const qtyPrice = compact.match(/(\d+)\s*[xX×]\s*(\d+[.,]\d{2})\s+(\d+[.,]\d{2})\s*$/);
    const simple = compact.match(/(\d+[.,]\d{2})\s*€?\s*$/);
    let qty = 1;
    let price = null;
    let name = compact;

    if (qtyPrice) {
      qty = Number(qtyPrice[1]);
      price = parsePrice(qtyPrice[3]) || parsePrice(qtyPrice[2]) * qty;
      name = compact.slice(0, qtyPrice.index).trim();
    } else if (simple) {
      price = parsePrice(simple[1]);
      name = compact.slice(0, simple.index).trim();
    } else {
      continue;
    }

    name = name.replace(/[.\-–]+$/g, '').replace(/\s{2,}/g, ' ').trim();
    if (!name || name.length < 2 || price == null || price > 80 || price <= 0) continue;
    if (/^total/i.test(name)) {
      detectedTotal = price;
      continue;
    }
    items.push({ raw: compact, name, qty, price });
  }

  return { items, detectedStore, detectedTotal };
}

function aliasFamily(name) {
  const n = name;
  for (const a of RECEIPT_ALIASES) {
    if (a.re.test(n)) return a.family;
  }
  return null;
}

export function matchItem(name, products) {
  const family = aliasFamily(name);
  if (family) {
    const members = products.filter((p) => p.family === family);
    const branded = members.find((p) => !p.md) || members[0];
    if (branded) return { product: branded, confidence: 0.93, family, via: 'alias' };
  }

  const qTokens = tokensOf(name);
  if (!qTokens.length) return { product: null, confidence: 0, family: null, via: 'none' };

  let best = null;
  for (const p of products) {
    const hay = normalize(`${p.name} ${p.brand} ${p.size} ${p.tags}`);
    const hayTokens = new Set(tokensOf(hay));
    let score = 0;
    for (const t of qTokens) {
      if (hayTokens.has(t) || hay.includes(t)) score += t.length >= 4 ? 4 : 2;
      else {
        for (const h of hayTokens) {
          if (h.length > 3 && t.length > 3 && levenshtein(t, h) === 1) {
            score += 2;
            break;
          }
        }
      }
    }
    const nname = normalize(name);
    if (normalize(p.name).split(' ').every((w) => w.length < 3 || nname.includes(w))) score += 5;
    if (!best || score > best.score) best = { product: p, score };
  }

  if (!best || best.score < 4) return { product: null, confidence: 0, family: null, via: 'none' };
  const confidence = Math.min(0.9, 0.45 + best.score / 18);
  return { product: best.product, confidence, family: best.product.family, via: 'fuzzy' };
}

export function analyzeReceipt({ text, storeId, demo = false }) {
  const source = demo ? DEMO_RECEIPT.text : text;
  const parsed = parseReceiptText(source);
  const store = getStore(storeId || parsed.detectedStore || DEMO_RECEIPT.storeId) || getStore('carrefour');
  const { products } = getCatalog();

  const rows = parsed.items.map((item) => {
    const match = matchItem(item.name, products);
    const product = match.product;
    const comparisons = STORES.map((s) => {
      if (!product) return { storeId: s.id, store: s.name, color: s.color, available: false, price: null };
      const offer = cheapestInFamily(product.family, s.id, products);
      if (!offer) return { storeId: s.id, store: s.name, color: s.color, available: false, price: null };
      return {
        storeId: s.id,
        store: s.name,
        color: s.color,
        available: true,
        price: offer.price,
        promo: offer.promo,
        productName: offer.product.name,
        brand: offer.product.brand,
      };
    });
    const available = comparisons.filter((c) => c.available);
    const best = available.reduce((a, b) => (a.price <= b.price ? a : b), available[0] || null);
    const here = comparisons.find((c) => c.storeId === store.id);
    const paid = item.price;
    const savingIfBest = best ? Math.round((paid - best.price * item.qty) * 100) / 100 : 0;
    return {
      ...item,
      match: product
        ? {
            id: product.id,
            name: product.name,
            brand: product.brand,
            size: product.size,
            emoji: product.emoji,
            family: product.family,
            category: product.category,
          }
        : null,
      confidence: match.confidence,
      via: match.via,
      comparisons,
      best,
      here,
      savingIfBest,
    };
  });

  const paid = Math.round(rows.reduce((s, r) => s + r.price, 0) * 100) / 100;
  const byStoreTotals = STORES.map((s) => {
    let total = 0;
    let missing = 0;
    for (const row of rows) {
      const offer = row.comparisons.find((c) => c.storeId === s.id);
      if (!offer?.available) {
        total += row.price;
        missing += 1;
      } else {
        total += offer.price * row.qty;
      }
    }
    return {
      storeId: s.id,
      store: s.name,
      color: s.color,
      type: s.type,
      total: Math.round(total * 100) / 100,
      missing,
      delta: Math.round((paid - total) * 100) / 100,
    };
  }).sort((a, b) => a.total - b.total);

  const splitLines = rows.map((row) => {
    const best = row.best;
    return {
      name: row.match?.name || row.name,
      qty: row.qty,
      paid: row.price,
      storeId: best?.storeId || null,
      store: best?.store || null,
      color: best?.color || null,
      price: best ? best.price * row.qty : row.price,
    };
  });
  const splitTotal = Math.round(splitLines.reduce((s, l) => s + l.price, 0) * 100) / 100;
  const bestStore = byStoreTotals[0];
  const saveVsPaid = Math.round((paid - (bestStore?.total || paid)) * 100) / 100;

  const winners = {};
  for (const line of splitLines) {
    if (!line.storeId) continue;
    winners[line.storeId] = (winners[line.storeId] || 0) + 1;
  }

  const advice = buildAdvice({ store, paid, bestStore, saveVsPaid, splitTotal, rows });

  return {
    demo: Boolean(demo),
    store: { id: store.id, name: store.name, color: store.color },
    detectedStore: parsed.detectedStore,
    detectedTotal: parsed.detectedTotal,
    paid,
    items: rows,
    unmatched: rows.filter((r) => !r.match).length,
    byStore: byStoreTotals,
    bestStore,
    saveVsPaid,
    split: { total: splitTotal, gain: Math.round((paid - splitTotal) * 100) / 100, lines: splitLines, winners },
    advice,
    rawText: source,
  };
}

function buildAdvice({ store, paid, bestStore, saveVsPaid, splitTotal, rows }) {
  const n = rows.length;
  const matched = rows.filter((r) => r.match).length;
  const headline =
    saveVsPaid > 0.4
      ? `Sur ce ticket ${store.name}, Fridget aurait pris ${bestStore.store} : ${fmt(saveVsPaid)} de moins.`
      : `Ce ticket ${store.name} est déjà bien calé. L'écart avec ${bestStore.store} est mince.`;
  const detail =
    splitTotal + 0.3 < (bestStore?.total || paid)
      ? `En piochant le moins cher de chaque enseigne, on descend à ${fmt(splitTotal)} — intéressant seulement si les magasins sont sur le trajet.`
      : `Inutile de multiplier les enseignes : un seul magasin suffit.`;
  const misses = rows
    .filter((r) => r.best && r.savingIfBest > 0.35)
    .sort((a, b) => b.savingIfBest - a.savingIfBest)
    .slice(0, 3)
    .map((r) => `${r.match?.name || r.name} est plus doux chez ${r.best.store} (${fmt(r.best.price)})`);
  return {
    headline,
    detail,
    misses,
    coverage: n ? Math.round((matched / n) * 100) : 0,
  };
}

export { DEMO_RECEIPT };
