import cors from 'cors';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASKETS, CATEGORIES, DEMO_RECEIPT, STORES, getCatalog, getProduct } from './catalog.js';
import {
  aiSearch,
  buildNamedBasket,
  catalogStats,
  compareStores,
  maybePolish,
  optimizeBasket,
  productDetail,
  searchProducts,
  weeklyDeals,
} from './engine.js';
import { analyzeReceipt } from './receipt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, name: 'fridget', time: new Date().toISOString() });
});

app.get('/api/meta', (_req, res) => {
  res.json({
    stores: STORES,
    categories: CATEGORIES,
    baskets: Object.entries(BASKETS).map(([id, b]) => ({ id, name: b.name, blurb: b.blurb })),
    stats: catalogStats(),
    demoReceipt: { storeId: DEMO_RECEIPT.storeId, storeLabel: DEMO_RECEIPT.storeLabel, date: DEMO_RECEIPT.date },
  });
});

app.get('/api/deals', (_req, res) => {
  res.json(weeklyDeals(10));
});

app.get('/api/search', (req, res) => {
  const q = String(req.query.q || '');
  const category = req.query.category ? String(req.query.category) : null;
  res.json(searchProducts(q, { category, limit: Number(req.query.limit) || 24 }));
});

app.post('/api/ai/search', async (req, res) => {
  const query = String(req.body?.query || req.body?.q || '');
  const payload = aiSearch(query);
  res.json(await maybePolish(payload));
});

app.get('/api/products/:id', (req, res) => {
  const detail = productDetail(req.params.id);
  if (!detail) return res.status(404).json({ error: 'Produit introuvable' });
  res.json(detail);
});

app.get('/api/products', (_req, res) => {
  const { products, week } = getCatalog();
  res.json({ week, products });
});

app.post('/api/receipt', async (req, res) => {
  const { text = '', storeId = null, demo = false } = req.body || {};
  if (!demo && !String(text).trim()) {
    return res.status(400).json({ error: 'Ticket vide' });
  }
  const analysis = analyzeReceipt({ text, storeId, demo });
  const polished = await maybePolish({
    query: 'ticket',
    answer: analysis.advice.headline,
    insight: analysis.advice.detail,
  });
  analysis.advice.headline = polished.answer;
  analysis.advice.detail = polished.insight;
  res.json(analysis);
});

app.post('/api/basket/optimize', (req, res) => {
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  res.json(optimizeBasket(items));
});

app.get('/api/baskets/:id', (req, res) => {
  const basket = buildNamedBasket(req.params.id);
  if (!basket) return res.status(404).json({ error: 'Panier inconnu' });
  res.json(basket);
});

app.post('/api/compare', (req, res) => {
  const storeIds = req.body?.storeIds || req.body?.stores || [];
  const basketId = req.body?.basketId || 'famille';
  res.json(compareStores(storeIds, basketId));
});

app.get('/api/product-exists/:id', (req, res) => {
  res.json({ ok: Boolean(getProduct(req.params.id)) });
});

/** Relais Open Prices (si le navigateur ne peut pas l'appeler). */
app.use('/api/live', async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });
  const target = `https://prices.openfoodfacts.org/api/v1${req.url}`;
  try {
    const r = await fetch(target, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Fridget/1.0 (https://github.com/zxch-0/fridget)',
      },
    });
    const text = await r.text();
    res.status(r.status);
    res.set('Content-Type', r.headers.get('content-type') || 'application/json');
    res.send(text);
  } catch (err) {
    res.status(502).json({ error: 'Open Prices injoignable depuis le serveur', detail: String(err.message || err) });
  }
});

if (fs.existsSync(dist)) {
  app.use(express.static(dist, { maxAge: '1h', extensions: ['html'] }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

const port = Number(process.env.PORT) || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Fridget prêt sur http://0.0.0.0:${port}`);
});
