import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PriceBars from '../components/PriceBars.jsx';
import { euro, when } from '../lib/format.js';
import { productDetail } from '../lib/openprices.js';
import { useApp } from '../lib/store.jsx';

export default function Product() {
  const { id } = useParams();
  const { add } = useApp();
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    setData(null);
    setErr('');
    productDetail(id)
      .then(setData)
      .catch(() => setErr('Produit introuvable ou Open Prices injoignable'));
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
  if (!data) return <p className="px-4 py-16 text-center text-ink/50">Chargement des relevés…</p>;

  const p = data.product;
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.8rem] bg-white p-8 text-center ring-1 ring-forest-900/8">
          {p.image ? (
            <img src={p.image} alt="" referrerPolicy="no-referrer" className="mx-auto h-40 w-40 object-contain" />
          ) : (
            <span className="text-7xl">{p.emoji}</span>
          )}
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-forest-600">{p.brand}</p>
          <h1 className="font-serif text-3xl text-forest-950">{p.name}</h1>
          <p className="text-ink/55">{p.size}</p>
          <p className="mt-2 font-mono text-[11px] text-ink/40">{p.code}</p>
          <button
            type="button"
            onClick={() => add(p)}
            className="mt-6 w-full rounded-full bg-forest-900 py-3 text-sm font-semibold text-cream-50"
          >
            Ajouter au panier
          </button>
        </div>
        <div>
          <p className="text-sm text-ink/55">Moins cher relevé en France</p>
          <p className="font-serif text-4xl text-forest-950">
            {p.best?.store} <span className="price-num">{euro(p.best?.price)}</span>
          </p>
          {p.best && (
            <p className="mt-1 text-sm text-ink/60">
              {p.best.shop}
              {p.best.city ? ` · ${p.best.city}` : ''} · {when(p.best.date)} · {p.best.samples} relevé(s)
            </p>
          )}
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

      {data.history?.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl">Derniers relevés en France</h2>
          <p className="mt-1 text-sm text-ink/55">Chaque ligne est un prix photographié ou lu sur un ticket.</p>
          <ul className="mt-4 divide-y divide-forest-900/8 overflow-hidden rounded-[1.4rem] bg-white ring-1 ring-forest-900/8">
            {data.history.map((h, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm">
                <span className="flex items-center gap-2">
                  <i className="h-2.5 w-2.5 rounded-full" style={{ background: h.color }} />
                  {h.store}
                  <span className="text-ink/45">
                    {h.shop}
                    {h.city ? ` · ${h.city}` : ''}
                  </span>
                </span>
                <span className="price-num font-semibold">
                  {euro(h.price)}
                  <span className="ml-2 text-xs font-normal text-ink/45">{when(h.date)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
