import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { euro, when } from '../lib/format.js';
import { useApp } from '../lib/store.jsx';
import StoreBadge from './StoreBadge.jsx';

export default function ProductCard({ product }) {
  const { add } = useApp();
  if (!product) return null;
  const to = `/produit/${product.code || product.id}`;
  return (
    <article className="group relative flex flex-col rounded-3xl border border-forest-900/8 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift">
      <Link to={to} className="flex flex-1 flex-col">
        <div className="mb-3 flex items-start justify-between gap-3">
          {product.image ? (
            <img src={product.image} alt="" referrerPolicy="no-referrer" className="h-16 w-16 rounded-2xl bg-cream-100 object-contain p-1" />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cream-100 text-3xl">{product.emoji || '🛒'}</span>
          )}
          <span className="rounded-full bg-mint-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest-800">
            Prix réel
          </span>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest-600">{product.brand}</p>
        <h3 className="mt-0.5 font-serif text-lg leading-tight text-forest-900">{product.name}</h3>
        <p className="text-sm text-ink/55">{product.size}</p>
        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink/45">Relevé le plus bas</p>
            <p className="price-num font-serif text-2xl text-forest-900">{euro(product.best?.price)}</p>
          </div>
          {product.best && <StoreBadge store={product.best.store} color={product.best.color} size="sm" />}
        </div>
        {product.best && (
          <p className="mt-2 text-xs text-ink/50">
            {product.best.shop}
            {product.best.city ? ` · ${product.best.city}` : ''} · {when(product.best.date)}
            {product.best.stale ? ' · ancien' : ''}
          </p>
        )}
        {product.spread > 0.2 && (
          <p className="mt-1 text-xs text-tomato">Jusqu’à {euro(product.spread)} d’écart entre enseignes</p>
        )}
      </Link>
      <button
        type="button"
        onClick={() => add(product)}
        className="mt-3 inline-flex items-center justify-center gap-1 rounded-full border border-forest-900/10 py-2 text-sm font-semibold text-forest-900 hover:bg-cream-100"
      >
        <Plus className="h-4 w-4" />
        Panier
      </button>
    </article>
  );
}
