import { CHAINS, STAPLE_BASKETS, detectBasket, matchChain } from './chains.js';

const OP = 'https://prices.openfoodfacts.org/api/v1';
const cache = new Map();
const TTL = 7 * 60 * 1000;

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function qs(params) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    u.set(k, String(v));
  }
  return u.toString();
}

async function getJSON(url) {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.t < TTL) return hit.v;
  let res;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' } });
  } catch {
    res = null;
  }
  if (!res || !res.ok) {
    const fallback = `/api/live${url.replace(OP, '')}`;
    res = await fetch(fallback);
  }
  if (!res.ok) throw new Error(`Open Prices ${res.status}`);
  const v = await res.json();
  cache.set(url, { t: Date.now(), v });
  return v;
}

function isFrance(item) {
  const loc = item.location || {};
  return loc.osm_address_country_code === 'FR' || /france/i.test(loc.osm_address_country || '');
}

function ageDays(iso) {
  if (!iso) return 999;
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 86400000));
}

function sizeOf(p) {
  if (p.quantity) return p.quantity;
  if (p.product_quantity && p.product_quantity_unit) {
    const n = p.product_quantity;
    const u = p.product_quantity_unit;
    if (u === 'ml' && n >= 1000) return `${n / 1000} L`;
    if (u === 'g' && n >= 1000) return `${n / 1000} kg`;
    return `${n} ${u}`;
  }
  return '';
}

function brandOf(p) {
  return (p.brands || '').split(',')[0].trim() || 'Marque';
}

function mapProduct(p) {
  return {
    id: p.code,
    code: p.code,
    name: p.product_name || 'Produit',
    brand: brandOf(p),
    size: sizeOf(p),
    image: p.image_url || null,
    emoji: '🛒',
    bio: (p.labels_tags || []).some((t) => /organic|bio/.test(t)),
    nutriscore: p.nutriscore_grade && p.nutriscore_grade !== 'unknown' ? p.nutriscore_grade : null,
    priceCount: p.price_count || 0,
    source: 'open-prices',
  };
}

function rankProducts(items, query) {
  const tokens = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1);
  return [...items].sort((a, b) => {
    const ha = `${a.product_name || ''} ${a.brands || ''}`.toLowerCase();
    const hb = `${b.product_name || ''} ${b.brands || ''}`.toLowerCase();
    const sa = tokens.reduce((s, t) => s + (ha.includes(t) ? 3 : 0), 0) + Math.min(8, (a.price_count || 0) / 20);
    const sb = tokens.reduce((s, t) => s + (hb.includes(t) ? 3 : 0), 0) + Math.min(8, (b.price_count || 0) / 20);
    return sb - sa;
  });
}

export function groupOffers(priceItems) {
  const fr = (priceItems || []).filter(
    (i) => i.currency === 'EUR' && i.price > 0 && i.price < 250 && isFrance(i) && !i.duplicate_of,
  );
  const buckets = new Map();
  for (const it of fr) {
    const chain = matchChain(it.location);
    if (!buckets.has(chain.id)) buckets.set(chain.id, { chain, rows: [] });
    buckets.get(chain.id).rows.push(it);
  }

  const offers = [];
  for (const { chain, rows } of buckets.values()) {
    const recent = rows.filter((r) => ageDays(r.date) <= 75);
    const pool = recent.length ? recent : rows;
    pool.sort((a, b) => a.price - b.price || ageDays(a.date) - ageDays(b.date));
    const best = pool[0];
    const loc = best.location || {};
    offers.push({
      storeId: chain.id,
      store: chain.name,
      color: chain.color,
      letter: chain.letter,
      available: true,
      price: best.price,
      promo: best.price_is_discounted
        ? { off: best.price_without_discount ? Math.round((1 - best.price / best.price_without_discount) * 100) : null, label: 'promo' }
        : null,
      before: best.price_without_discount || null,
      date: best.date,
      city: loc.osm_address_city || '',
      postcode: loc.osm_address_postcode || '',
      shop: loc.osm_name || loc.osm_brand || chain.name,
      samples: rows.length,
      stale: ageDays(best.date) > 45,
    });
  }
  offers.sort((a, b) => a.price - b.price);
  return offers;
}

function attachOffers(product, offers) {
  const available = offers.filter((o) => o.available);
  const best = available[0] || null;
  const worst = available[available.length - 1] || null;
  return {
    ...product,
    offers,
    best,
    worst,
    spread: best && worst ? Math.round((worst.price - best.price) * 100) / 100 : 0,
    spreadPct: best && worst && worst.price ? Math.round(((worst.price - best.price) / worst.price) * 100) : 0,
  };
}

export async function fetchPricesForCodes(codes, { days = 120, size = 80 } = {}) {
  const unique = [...new Set(codes.filter(Boolean))];
  if (!unique.length) return [];
  const chunks = [];
  for (let i = 0; i < unique.length; i += 10) chunks.push(unique.slice(i, i + 10));
  const pages = await Promise.all(
    chunks.map((c) =>
      getJSON(
        `${OP}/prices?${qs({
          product_code__in: c.join(','),
          currency: 'EUR',
          date__gte: daysAgo(days),
          duplicate_of__isnull: true,
          order_by: '-date',
          size,
        })}`,
      ),
    ),
  );
  return pages.flatMap((p) => p.items || []);
}

async function hydrateMany(rawProducts) {
  const products = rawProducts.map(mapProduct);
  const prices = await fetchPricesForCodes(products.map((p) => p.code));
  const byCode = new Map();
  for (const row of prices) {
    const code = row.product_code;
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code).push(row);
  }
  return products
    .map((p) => attachOffers(p, groupOffers(byCode.get(p.code) || [])))
    .filter((p) => p.best);
}

export async function searchProducts(query, { limit = 10 } = {}) {
  const q = String(query || '').trim();
  if (!q) return latestDeals(limit);

  if (/^\d{8,14}$/.test(q)) {
    const one = await productDetail(q);
    return one ? [one.product] : [];
  }

  const data = await getJSON(
    `${OP}/products?${qs({
      product_name__like: q,
      price_count__gte: 1,
      order_by: '-price_count',
      size: 24,
    })}`,
  );
  let items = data.items || [];
  if (items.length < 5) {
    const extra = await getJSON(
      `${OP}/products?${qs({
        brands__like: q,
        price_count__gte: 1,
        order_by: '-price_count',
        size: 12,
      })}`,
    );
    const seen = new Set(items.map((i) => i.code));
    for (const it of extra.items || []) {
      if (!seen.has(it.code)) items.push(it);
    }
  }
  items = rankProducts(items, q).slice(0, limit);
  return hydrateMany(items);
}

export async function productDetail(code) {
  if (!code || !/^\d{6,14}$/.test(String(code))) return null;
  const [prod, pricePage] = await Promise.all([
    getJSON(`${OP}/products/code/${code}`).catch(() => null),
    getJSON(
      `${OP}/prices?${qs({
        product_code: code,
        currency: 'EUR',
        date__gte: daysAgo(180),
        duplicate_of__isnull: true,
        order_by: '-date',
        size: 80,
      })}`,
    ).catch(() => ({ items: [] })),
  ]);
  const raw = prod && prod.code ? prod : pricePage.items?.[0]?.product;
  if (!raw?.code) return null;
  const all = (pricePage.items || []).filter(isFrance);
  const product = attachOffers(mapProduct(raw), groupOffers(pricePage.items || []));
  const history = all.slice(0, 24).map((it) => {
    const chain = matchChain(it.location);
    return {
      price: it.price,
      date: it.date,
      city: it.location?.osm_address_city,
      shop: it.location?.osm_name,
      store: chain.name,
      color: chain.color,
      discounted: it.price_is_discounted,
    };
  });
  return { product, history, equivalents: [], similar: [] };
}

export async function latestDeals(limit = 8) {
  const data = await getJSON(
    `${OP}/prices?${qs({
      price_is_discounted: true,
      currency: 'EUR',
      date__gte: daysAgo(40),
      duplicate_of__isnull: true,
      order_by: '-date',
      size: 40,
    })}`,
  );
  const seen = new Set();
  const picked = [];
  for (const row of data.items || []) {
    if (!isFrance(row) || !row.product?.code || seen.has(row.product.code)) continue;
    seen.add(row.product.code);
    picked.push(row.product);
    if (picked.length >= limit) break;
  }
  if (!picked.length) {
    const pop = await getJSON(
      `${OP}/products?${qs({ price_count__gte: 15, order_by: '-price_count', size: limit })}`,
    );
    return hydrateMany(pop.items || []);
  }
  return hydrateMany(picked);
}

export async function liveSearch(query) {
  const q = String(query || '').trim();
  const basketId = detectBasket(q);
  if (basketId) {
    const basket = await buildLiveBasket(basketId);
    const best = basket.bestStore;
    return {
      query: q,
      understood: { intent: 'basket', basketId, raw: q },
      answer: best
        ? `Pour un panier « ${basket.name} », le moins-disant sur les relevés récents est ${best.store} à ${fmt(best.total)}.`
        : `Panier « ${basket.name} » : couverture incomplète sur Open Prices.`,
      insight: 'Totaux calculés uniquement avec des prix réellement relevés (magasin + date). Les trous sont signalés.',
      results: basket.products,
      basket,
    };
  }

  if (!q) {
    const results = await latestDeals(12);
    return {
      query: '',
      understood: { intent: 'deals', raw: '' },
      answer: 'Dernières promos et prix relevés en France.',
      insight: 'Source : Open Prices (Open Food Facts). Chaque carte indique le magasin, la ville et la date.',
      results,
      basket: null,
    };
  }

  const results = await searchProducts(q, { limit: 12 });
  const top = results[0];
  return {
    query: q,
    understood: { intent: 'search', raw: q },
    answer: top
      ? `${top.name} (${top.brand}${top.size ? `, ${top.size}` : ''}) : ${fmt(top.best.price)} chez ${top.best.store}${top.best.city ? ` · ${top.best.city}` : ''}.`
      : `Aucun relevé Open Prices pour « ${q} ».`,
    insight: top
      ? `Relevé ${whenFr(top.best.date)}${top.best.stale ? ' (un peu ancien)' : ''}. ${top.offers.length} enseigne${top.offers.length > 1 ? 's' : ''} en France. Source : Open Prices.`
      : 'Essayez une marque, un format, ou le code-barres.',
    results,
    basket: null,
  };
}

export async function buildLiveBasket(id) {
  const def = STAPLE_BASKETS[id];
  if (!def) return null;
  const lists = await Promise.all(def.queries.map((query) => searchProducts(query, { limit: 1 })));
  const products = lists.map((l) => l[0]).filter(Boolean);
  const opt = optimizeLive(products.map((p) => ({ product: p, qty: 1 })));
  return { id, ...def, ...opt, products };
}

export function optimizeLive(items) {
  const ready = items.filter((it) => it.product?.offers?.length);
  const storeIds = new Map();
  for (const it of ready) {
    for (const o of it.product.offers) storeIds.set(o.storeId, { storeId: o.storeId, store: o.store, color: o.color });
  }

  const byStore = [...storeIds.values()]
    .map((s) => {
      let total = 0;
      let missing = 0;
      const lines = ready.map((it) => {
        const offer = it.product.offers.find((o) => o.storeId === s.storeId);
        const qty = it.qty || 1;
        if (!offer) {
          missing += 1;
          return { name: it.product.name, qty, available: false, price: null, line: 0 };
        }
        const line = Math.round(offer.price * qty * 100) / 100;
        total += line;
        return { name: it.product.name, qty, available: true, price: offer.price, line, promo: offer.promo, city: offer.city, date: offer.date };
      });
      return { ...s, total: Math.round(total * 100) / 100, missing, lines };
    })
    .sort((a, b) => a.missing - b.missing || a.total - b.total);

  const splitLines = ready.map((it) => {
    const best = it.product.best;
    const qty = it.qty || 1;
    return {
      name: it.product.name,
      qty,
      storeId: best?.storeId,
      store: best?.store,
      color: best?.color,
      price: best ? best.price * qty : null,
      line: best ? Math.round(best.price * qty * 100) / 100 : 0,
      city: best?.city,
      date: best?.date,
    };
  });
  const splitTotal = Math.round(splitLines.reduce((s, l) => s + (l.line || 0), 0) * 100) / 100;
  const complete = byStore.find((s) => s.missing === 0) || byStore[0] || null;

  return {
    items: ready.map((it) => ({ product: it.product, qty: it.qty || 1 })),
    byStore,
    split: { total: splitTotal, lines: splitLines, gain: complete ? Math.round((complete.total - splitTotal) * 100) / 100 : 0 },
    bestStore: complete
      ? { storeId: complete.storeId, store: complete.store, color: complete.color, total: complete.total, missing: complete.missing }
      : null,
  };
}

export async function compareLive(storeIds, basketId = 'famille') {
  const basket = await buildLiveBasket(basketId);
  const wanted = storeIds?.length ? storeIds : ['lidl', 'leclerc', 'carrefour'];
  const columns = wanted.map((id) => basket.byStore.find((s) => s.storeId === id)).filter(Boolean);
  return { basket: { id: basket.id, name: basket.name, blurb: basket.blurb }, columns, all: basket.byStore, products: basket.products };
}

export async function enrichReceipt(analysis) {
  const lines = analysis.items || [];
  const searches = await Promise.all(
    lines.map(async (item) => {
      const q = item.match?.name || item.name;
      try {
        const found = await searchProducts(q, { limit: 1 });
        return { item, live: found[0] || null };
      } catch {
        return { item, live: null };
      }
    }),
  );

  const items = searches.map(({ item, live }) => {
    if (!live) return { ...item, live: null };
    const best = live.best;
    return {
      ...item,
      live,
      match: {
        id: live.code,
        name: live.name,
        brand: live.brand,
        size: live.size,
        emoji: live.image ? '📷' : item.match?.emoji || '🛒',
        image: live.image,
      },
      comparisons: live.offers,
      best,
      savingIfBest: best ? Math.round((item.price - best.price * (item.qty || 1)) * 100) / 100 : 0,
    };
  });

  const paid = Math.round(items.reduce((s, r) => s + r.price, 0) * 100) / 100;
  const byStoreMap = new Map();
  for (const row of items) {
    for (const o of row.comparisons || []) {
      if (!byStoreMap.has(o.storeId)) {
        byStoreMap.set(o.storeId, { storeId: o.storeId, store: o.store, color: o.color, total: 0, missing: 0 });
      }
    }
  }
  for (const [, acc] of byStoreMap) {
    for (const row of items) {
      const o = (row.comparisons || []).find((c) => c.storeId === acc.storeId);
      if (!o) acc.missing += 1;
      else acc.total += o.price * (row.qty || 1);
    }
    acc.total = Math.round(acc.total * 100) / 100;
    acc.delta = Math.round((paid - acc.total) * 100) / 100;
  }
  const byStore = [...byStoreMap.values()].sort((a, b) => a.missing - b.missing || a.total - b.total);
  const bestStore = byStore[0] || null;
  const splitLines = items.map((row) => ({
    name: row.match?.name || row.name,
    qty: row.qty,
    paid: row.price,
    storeId: row.best?.storeId,
    store: row.best?.store,
    color: row.best?.color,
    price: row.best ? row.best.price * row.qty : row.price,
    city: row.best?.city,
    date: row.best?.date,
  }));
  const splitTotal = Math.round(splitLines.reduce((s, l) => s + l.price, 0) * 100) / 100;
  const saveVsPaid = bestStore ? Math.round((paid - bestStore.total) * 100) / 100 : 0;

  return {
    ...analysis,
    live: true,
    items,
    paid,
    byStore,
    bestStore,
    saveVsPaid,
    split: { total: splitTotal, gain: Math.round((paid - splitTotal) * 100) / 100, lines: splitLines },
    advice: {
      headline: bestStore
        ? `Sur les relevés Open Prices, ${bestStore.store} sort à ${fmt(bestStore.total)} contre ${fmt(paid)} payés.`
        : analysis.advice?.headline,
      detail:
        'Comparaison faite avec des prix réellement photographiés (étiquettes / tickets), pas une grille inventée. Un relevé peut dater de quelques jours et d’une autre ville.',
      misses: items
        .filter((r) => r.best && r.savingIfBest > 0.25)
        .sort((a, b) => b.savingIfBest - a.savingIfBest)
        .slice(0, 3)
        .map((r) => `${r.match?.name || r.name} : ${fmt(r.best.price)} chez ${r.best.store}${r.best.city ? ` (${r.best.city})` : ''}`),
      coverage: items.length ? Math.round((items.filter((i) => i.live).length / items.length) * 100) : 0,
    },
  };
}

export async function fetchStats() {
  const s = await getJSON(`${OP}/stats`);
  return {
    prices: s.price_count,
    products: s.product_with_price_count,
    locations: s.location_with_price_count,
    updated: s.updated,
  };
}

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n);
}

export function whenFr(iso) {
  if (!iso) return '';
  const days = ageDays(iso);
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return 'hier';
  if (days < 21) return `il y a ${days} j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export { CHAINS };
