import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { euro } from '../lib/format.js';
import { optimizeLive, productDetail } from '../lib/openprices.js';
import { useApp } from '../lib/store.jsx';

export default function Basket() {
  const { basket, setQty, remove, clear } = useApp();
  const [opt, setOpt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!basket.length) {
      setOpt(null);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    Promise.all(basket.map((i) => productDetail(i.code || i.id).then((d) => ({ product: d?.product, qty: i.qty }))))
      .then((rows) => {
        if (!alive) return;
        setOpt(optimizeLive(rows.filter((r) => r.product)));
      })
      .catch(() => alive && setOpt(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [JSON.stringify(basket)]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-600">Panier</p>
          <h1 className="mt-1 font-serif text-3xl text-forest-950">Optimisé sur les relevés</h1>
        </div>
        {basket.length > 0 && (
          <button type="button" onClick={clear} className="text-sm font-semibold text-tomato">
            Vider
          </button>
        )}
      </div>

      {basket.length === 0 && (
        <div className="mt-10 rounded-[1.8rem] bg-white p-8 text-center ring-1 ring-forest-900/8">
          <p className="font-serif text-2xl">Le bac est vide.</p>
          <p className="mt-2 text-ink/60">Ajoutez des produits depuis la recherche, ou scannez un ticket.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link to="/recherche" className="rounded-full bg-forest-900 px-4 py-2 text-sm font-semibold text-cream-50">
              Chercher
            </Link>
            <Link to="/scan" className="rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-forest-900/10">
              Scanner
            </Link>
          </div>
        </div>
      )}

      {basket.length > 0 && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <ul className="space-y-2">
            {basket.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-forest-900/8">
                {item.image ? (
                  <img src={item.image} alt="" referrerPolicy="no-referrer" className="h-12 w-12 rounded-xl object-contain" />
                ) : (
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-cream-100 text-2xl">{item.emoji || '🛒'}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.name}</p>
                  <p className="text-xs text-ink/50">
                    {item.brand} · {item.size}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-cream-100 px-1">
                  <button type="button" className="h-8 w-8" onClick={() => setQty(item.id, item.qty - 1)}>
                    −
                  </button>
                  <span className="w-5 text-center text-sm">{item.qty}</span>
                  <button type="button" className="h-8 w-8" onClick={() => setQty(item.id, item.qty + 1)}>
                    +
                  </button>
                </div>
                <button type="button" onClick={() => remove(item.id)} className="text-ink/35 hover:text-tomato" aria-label="Retirer">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>

          <div>
            {loading && <p className="text-sm text-ink/50">Calcul sur les relevés…</p>}
            {opt?.bestStore && (
              <div className="rounded-[1.6rem] bg-forest-900 p-5 text-cream-50">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mint-400">Un seul magasin</p>
                <p className="mt-1 font-serif text-3xl">{opt.bestStore.store}</p>
                <p className="price-num text-2xl text-mint-400">{euro(opt.bestStore.total)}</p>
                {opt.bestStore.missing > 0 && (
                  <p className="mt-2 text-xs text-cream-200/70">{opt.bestStore.missing} produit(s) sans relevé dans cette enseigne.</p>
                )}
                {opt.split && opt.split.gain > 0.4 && (
                  <p className="mt-3 text-sm text-cream-200/75">
                    En mixant les enseignes : {euro(opt.split.total)} ({euro(opt.split.gain)} de mieux, si vous avez le temps).
                  </p>
                )}
              </div>
            )}
            <ol className="mt-3 space-y-1.5">
              {(opt?.byStore || []).slice(0, 8).map((s, i) => (
                <li key={s.storeId} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm ring-1 ring-forest-900/8">
                  <span className="flex items-center gap-2">
                    <span className="w-4 font-mono text-[11px] text-ink/40">{i + 1}</span>
                    {s.store}
                  </span>
                  <span className="price-num font-semibold">
                    {euro(s.total)}
                    {s.missing > 0 && <span className="ml-1 text-[10px] font-normal text-ink/40">({s.missing})</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
