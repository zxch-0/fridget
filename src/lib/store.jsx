import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';

const Ctx = createContext(null);
const KEY = 'fridget-v1';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function AppProvider({ children }) {
  const saved = load();
  const [meta, setMeta] = useState(null);
  const [basket, setBasket] = useState(saved.basket || []);
  const [scans, setScans] = useState(saved.scans || []);
  const [recent, setRecent] = useState(saved.recent || []);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.meta().then(setMeta).catch(() => setMeta({ stores: [], categories: [], baskets: [], stats: {} }));
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify({ basket, scans, recent }));
  }, [basket, scans, recent]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const value = useMemo(() => {
    const add = (product, qty = 1) => {
      setBasket((cur) => {
        const i = cur.findIndex((x) => x.id === product.id);
        if (i >= 0) {
          const next = [...cur];
          next[i] = { ...next[i], qty: next[i].qty + qty };
          return next;
        }
        return [...cur, { id: product.id, name: product.name, brand: product.brand, emoji: product.emoji, size: product.size, qty }];
      });
      setToast(`${product.name} ajouté au panier`);
    };
    const setQty = (id, qty) => {
      setBasket((cur) => (qty <= 0 ? cur.filter((x) => x.id !== id) : cur.map((x) => (x.id === id ? { ...x, qty } : x))));
    };
    const remove = (id) => setBasket((cur) => cur.filter((x) => x.id !== id));
    const clear = () => setBasket([]);
    const remember = (q) => {
      const t = q.trim();
      if (!t) return;
      setRecent((cur) => [t, ...cur.filter((x) => x !== t)].slice(0, 8));
    };
    const saveScan = (scan) => {
      setScans((cur) => [{ id: Date.now(), at: new Date().toISOString(), ...scan }, ...cur].slice(0, 12));
    };
    return {
      meta,
      stores: meta?.stores || [],
      categories: meta?.categories || [],
      baskets: meta?.baskets || [],
      stats: meta?.stats || {},
      basket,
      scans,
      recent,
      toast,
      setToast,
      add,
      setQty,
      remove,
      clear,
      remember,
      saveScan,
    };
  }, [meta, basket, scans, recent, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  return useContext(Ctx);
}
