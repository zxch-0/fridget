import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { euro } from '../lib/format.js';
import { liveSearch } from '../lib/openprices.js';
import { useApp } from '../lib/store.jsx';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { remember } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (q) remember(q);
    let alive = true;
    setLoading(true);
    setErr('');
    liveSearch(q)
      .then((res) => {
        if (alive) setData(res);
      })
      .catch((e) => {
        if (alive) {
          setData(null);
          setErr(e.message || 'Open Prices injoignable');
        }
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [q]);

  const results = data?.results || [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SearchBar initial={q} autoFocus={!q} large />
      <p className="mt-3 text-xs text-ink/50">
        Prix réels · Open Prices (Open Food Facts) · relevés citoyens en magasin, avec date et ville.
      </p>

      {loading && <p className="mt-8 text-sm text-ink/50">Interrogation des relevés Open Prices…</p>}
      {err && <p className="mt-8 text-sm text-tomato">{err}</p>}

      {data && !loading && (
        <div className="mt-6 rounded-3xl bg-forest-900 px-5 py-4 text-cream-50 shadow-card">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-mint-400">
            <Sparkles className="h-3.5 w-3.5" />
            D’après les derniers relevés
          </p>
          <p className="mt-1 font-serif text-xl md:text-2xl">{data.answer}</p>
          {data.insight && <p className="mt-1 text-sm text-cream-200/75">{data.insight}</p>}
        </div>
      )}

      {data?.basket && (
        <div className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-forest-900/8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-forest-600">Panier type</p>
              <h2 className="font-serif text-2xl">{data.basket.name}</h2>
              <p className="text-sm text-ink/60">{data.basket.blurb}</p>
            </div>
            {data.basket.bestStore && (
              <p className="text-right">
                <span className="block text-xs text-ink/50">Moins-disant (relevés)</span>
                <span className="font-serif text-2xl">{data.basket.bestStore.store}</span>
                <span className="ml-2 price-num">{euro(data.basket.bestStore.total)}</span>
              </p>
            )}
          </div>
          <div className="mt-4 flex gap-2 overflow-auto no-scrollbar">
            {(data.basket.byStore || []).slice(0, 8).map((s) => (
              <div key={s.storeId} className="min-w-[8.5rem] rounded-2xl bg-cream-100 p-3">
                <p className="text-xs font-semibold">{s.store}</p>
                <p className="price-num font-serif text-xl">{euro(s.total)}</p>
                {s.missing > 0 && <p className="text-[10px] text-ink/45">{s.missing} trou(s)</p>}
              </div>
            ))}
          </div>
          <Link to="/comparer" className="mt-3 inline-block text-sm font-semibold text-forest-700">
            Ouvrir le comparateur →
          </Link>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((p) => (
          <ProductCard key={p.code || p.id} product={p} />
        ))}
      </div>

      {!loading && !err && results.length === 0 && (
        <p className="mt-10 text-center text-ink/55">Aucun produit avec un prix relevé pour cette recherche.</p>
      )}
    </div>
  );
}
