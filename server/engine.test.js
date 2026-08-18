import test from 'node:test';
import assert from 'node:assert/strict';
import { aiSearch, interpretQuery, searchProducts } from './engine.js';
import { analyzeReceipt, parseReceiptText } from './receipt.js';
import { DEMO_RECEIPT } from './catalog.js';

test('search finds milk', () => {
  const { results } = searchProducts('lait demi-écrémé');
  assert.ok(results.length > 0);
  assert.match(results[0].name.toLowerCase(), /lait/);
});

test('search understands nutella', () => {
  const { results } = searchProducts('nutella 400');
  assert.equal(results[0].id, 'nutella-400');
});

test('basket intent', () => {
  const i = interpretQuery('un petit-déj pas cher');
  assert.equal(i.intent, 'basket');
  const ai = aiSearch('panier étudiant');
  assert.ok(ai.basket);
  assert.ok(ai.bestStore || ai.basket.bestStore);
});

test('demo receipt parses 10 items', () => {
  const parsed = parseReceiptText(DEMO_RECEIPT.text);
  assert.equal(parsed.items.length, 10);
  assert.equal(parsed.detectedStore, 'carrefour');
});

test('receipt analysis finds savings', () => {
  const a = analyzeReceipt({ demo: true, storeId: 'carrefour' });
  assert.equal(a.items.length, 10);
  assert.ok(a.items.every((i) => i.match));
  assert.ok(a.bestStore.storeId);
  assert.ok(a.paid > 20);
});
