import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PriceBars from '../components/PriceBars.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../lib/api.js';
import { euro } from '../lib/format.js';
import { useApp } from '../lib/store.jsx';

export default function Product() {
  const { id } = useParams();
  const { add } = useApp();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    setData(null);
    api
      .product(id)
      .then(setData)
      .catch(() => setErr('Produit introuvable'));
  }, [id]);

  if (err) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p>{err}</p>
        <Link to="/recherche" className="mt-3 inline-block text-forest-700">
          Retour
        </Link>
      </div>
    );
  }
  if (!data) return <p className="px-4 py-16 text-center text-ink/50">Chargement…</p>;

  const p = data.product;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.8rem] bg-white p-8 text-center ring-1 ring-forest-900/8">
          <span className="text-7xl">{p.emoji}</span>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-forest-600">{p.brand}</p>
          <h1 className="font-serif text-3xl text-forest-950">{p.name}</h1>
          <p className="text-ink/55">{p.size}</p>
          {p.bio && <p className="mt-2 text-xs font-bold uppercase text-forest-700">Bio</p>}
          <button
            type="button"
            onClick={() => add(p)}
            className="mt-6 w-full rounded-full bg-forest-900 py-3 text-sm font-semibold text-cream-50"
          >
            Ajouter au panier
          </button>
        </div>
        <div>
          <p className="text-sm text-ink/55">Moins cher chez</p>
          <p className="font-serif text-4xl text-forest-950">
            {p.best?.store} <span className="price-num">{euro(p.best?.price)}</span>
          </p>
          {p.spread > 0 && (
            <p className="mt-1 text-sm text-tomato">
              {euro(p.spread)} d’écart avec {p.worst?.store} ({p.spreadPct} %)
            </p>
          )}
          <div className="mt-6 rounded-[1.4rem] bg-white p-5 ring-1 ring-forest-900/8">
            <PriceBars offers={p.offers} />
          </div>
        </div>
      </div>

      {data.equivalents?.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl">Équivalents</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.equivalents.map((e) => (
              <ProductCard key={e.id} product={e} />
            ))}
          </div>
        </section>
      )}

      {data.similar?.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl">Dans le même rayon</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.similar.map((e) => (
              <ProductCard key={e.id} product={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
