import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { euro } from '../lib/format.js';
import { useApp } from '../lib/store.jsx';

export default function Compare() {
  const { stores, baskets } = useApp();
  const [picked, setPicked] = useState(['lidl', 'leclerc', 'carrefour']);
  const [basketId, setBasketId] = useState('famille');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggle = (id) => {
    setPicked((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 4) return [...cur.slice(1), id];
      return [...cur, id];
    });
  };

  useEffect(() => {
    if (picked.length < 2) return;
    let alive = true;
    setLoading(true);
    api
      .compare(picked, basketId)
      .then((d) => alive && setData(d))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [picked.join(','), basketId]);

  const cols = data?.columns || [];
  const min = Math.min(...cols.map((c) => c.total), Infinity);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-600">Comparateur</p>
      <h1 className="mt-1 font-serif text-3xl text-forest-950 md:text-4xl">Même chariot, trois enseignes.</h1>
      <p className="mt-2 max-w-2xl text-ink/65">
        On prend un panier type (ou le vôtre plus tard) et on le valorise dans chaque magasin, équivalents marques distributeurs compris.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(baskets.length ? baskets : [
          { id: 'famille', name: 'Courses famille' },
          { id: 'etudiant', name: 'Semaine étudiant' },
          { id: 'petit-dej', name: 'Petit-déjeuner' },
          { id: 'apero', name: 'Apéro' },
        ]).map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBasketId(b.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              basketId === b.id ? 'bg-forest-900 text-cream-50' : 'bg-white ring-1 ring-forest-900/10'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {stores.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => toggle(s.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              picked.includes(s.id) ? 'text-white' : 'bg-white text-ink/70 ring-1 ring-forest-900/10'
            }`}
            style={picked.includes(s.id) ? { background: s.color } : undefined}
          >
            {s.short}
          </button>
        ))}
      </div>

      {loading && <p className="mt-8 text-sm text-ink/50">Calcul des chariots…</p>}

      {cols.length > 0 && (
        <div className="mt-8 overflow-x-auto rounded-[1.6rem] bg-white ring-1 ring-forest-900/8">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-forest-900/8 text-left">
                <th className="px-4 py-3 font-medium text-ink/50">Produit</th>
                {cols.map((c) => (
                  <th key={c.storeId} className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      <i className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                      {c.store}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lineNames(cols).map((name, idx) => (
                <tr key={name + idx} className="border-b border-forest-900/5">
                  <td className="px-4 py-2.5 font-medium">{name}</td>
                  {cols.map((c) => {
                    const line = c.lines[idx];
                    const prices = cols.map((x) => x.lines[idx]?.price).filter((n) => n != null);
                    const best = line?.price != null && line.price === Math.min(...prices);
                    return (
                      <td key={c.storeId} className={`px-4 py-2.5 price-num ${best ? 'font-semibold text-forest-700' : ''}`}>
                        {line?.available ? euro(line.price) : '—'}
                        {line?.promo && <span className="ml-1 text-[10px] text-tomato">{line.promo.label}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-cream-100 font-serif text-lg">
                <td className="px-4 py-3">Total</td>
                {cols.map((c) => (
                  <td key={c.storeId} className={`px-4 py-3 price-num ${c.total === min ? 'text-forest-700' : ''}`}>
                    {euro(c.total)}
                    {c.total === min && <span className="ml-2 font-sans text-[10px] font-bold uppercase">gagnant</span>}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {data?.all && (
        <div className="mt-8">
          <h2 className="font-serif text-2xl">Classement complet</h2>
          <ol className="mt-3 space-y-2">
            {data.all.map((s, i) => (
              <li key={s.storeId} className="flex items-center justify-between rounded-2xl bg-white px-4 py-2.5 ring-1 ring-forest-900/8">
                <span className="flex items-center gap-3 text-sm">
                  <span className="w-5 font-mono text-xs text-ink/40">{i + 1}</span>
                  <i className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  {s.store}
                  <span className="text-xs text-ink/40">{s.type}</span>
                </span>
                <span className="price-num font-semibold">{euro(s.total)}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function lineNames(cols) {
  const first = cols[0];
  if (!first) return [];
  return first.lines.map((l) => l.name || '—');
}
