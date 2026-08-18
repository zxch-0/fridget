import { Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { api } from '../lib/api.js';
import { euro } from '../lib/format.js';
import { useApp } from '../lib/store.jsx';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { categories, remember } = useApp();
  const [category, setCategory] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q) remember(q);
    let alive = true;
    setLoading(true);
    api
      .aiSearch(q || 'promos de la semaine')
      .then((res) => {
        if (alive) setData(res);
      })
      .catch(() => alive && setData(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [q]);

  const results = useMemo(() => {
    const list = data?.results || [];
    if (!category) return list;
    return list.filter((p) => p.category === category);
  }, [data, category]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <SearchBar initial={q} autoFocus={!q} large />

      {loading && <p className="mt-8 text-sm text-ink/50">Fridget réfléchit…</p>}

      {data && !loading && (
        <div className="mt-6 rounded-3xl bg-forest-900 px-5 py-4 text-cream-50 shadow-card">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-mint-400">
            <Sparkles className="h-3.5 w-3.5" />
            L’IA a compris
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
                <span className="block text-xs text-ink/50">Meilleure enseigne</span>
                <span className="font-serif text-2xl">{data.basket.bestStore.store}</span>
                <span className="ml-2 price-num">{euro(data.basket.bestStore.total)}</span>
              </p>
            )}
          </div>
          <div className="mt-4 flex gap-2 overflow-auto no-scrollbar">
            {(data.basket.byStore || []).slice(0, 6).map((s) => (
              <div key={s.storeId} className="min-w-[8.5rem] rounded-2xl bg-cream-100 p-3">
                <p className="text-xs font-semibold">{s.store}</p>
                <p className="price-num font-serif text-xl">{euro(s.total)}</p>
              </div>
            ))}
          </div>
          <Link to="/comparer" className="mt-3 inline-block text-sm font-semibold text-forest-700">
            Ouvrir le comparateur →
          </Link>
        </div>
      )}

      <div className="mt-6 flex gap-2 overflow-auto no-scrollbar">
        <Chip active={!category} onClick={() => setCategory('')}>
          Tous
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
            {c.emoji} {c.name}
          </Chip>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {!loading && results.length === 0 && (
        <p className="mt-10 text-center text-ink/55">Aucun produit pour cette recherche.</p>
      )}
    </div>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
        active ? 'bg-forest-900 text-cream-50' : 'bg-white text-ink/70 ring-1 ring-forest-900/10'
      }`}
    >
      {children}
    </button>
  );
}
