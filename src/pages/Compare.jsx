import { useEffect, useState } from 'react';
import { CHAINS } from '../lib/chains.js';
import { euro, when } from '../lib/format.js';
import { compareLive } from '../lib/openprices.js';

const BASKETS = [
  { id: 'famille', name: 'Courses famille' },
  { id: 'etudiant', name: 'Semaine étudiant' },
  { id: 'petit-dej', name: 'Petit-déjeuner' },
  { id: 'apero', name: 'Apéro' },
];

export default function Compare() {
  const [picked, setPicked] = useState(['lidl', 'leclerc', 'carrefour']);
  const [basketId, setBasketId] = useState('famille');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

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
    setErr('');
    compareLive(picked, basketId)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setErr(e.message || 'Impossible de charger les relevés'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [picked.join(','), basketId]);

  const cols = data?.columns || [];
  const min = Math.min(...cols.filter((c) => c.missing === 0).map((c) => c.total), Infinity);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-600">Comparateur</p>
      <h1 className="mt-1 font-serif text-3xl text-forest-950 md:text-4xl">Même chariot, vrais relevés.</h1>
      <p className="mt-2 max-w-2xl text-ink/65">
        Chaque case est un prix photographié (Open Prices). Un trou signifie : pas de relevé récent pour ce code-barres dans cette enseigne.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {BASKETS.map((b) => (
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
        {CHAINS.slice(0, 10).map((s) => (
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

      {loading && <p className="mt-8 text-sm text-ink/50">Collecte des relevés Open Prices…</p>}
      {err && <p className="mt-8 text-sm text-tomato">{err}</p>}

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
                        {line?.date && (
                          <span className="mt-0.5 block text-[10px] font-sans font-normal text-ink/40">
                            {line.city} · {when(line.date)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-cream-100 font-serif text-lg">
                <td className="px-4 py-3">Total relevé</td>
                {cols.map((c) => (
                  <td key={c.storeId} className={`px-4 py-3 price-num ${c.missing === 0 && c.total === min ? 'text-forest-700' : ''}`}>
                    {euro(c.total)}
                    {c.missing > 0 && <span className="ml-2 font-sans text-[10px] text-ink/45">{c.missing} trou(s)</span>}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {data?.all && (
        <div className="mt-8">
          <h2 className="font-serif text-2xl">Classement (moins de trous, puis moins cher)</h2>
          <ol className="mt-3 space-y-2">
            {data.all.map((s, i) => (
              <li key={s.storeId} className="flex items-center justify-between rounded-2xl bg-white px-4 py-2.5 ring-1 ring-forest-900/8">
                <span className="flex items-center gap-3 text-sm">
                  <span className="w-5 font-mono text-xs text-ink/40">{i + 1}</span>
                  <i className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  {s.store}
                </span>
                <span className="price-num font-semibold">
                  {euro(s.total)}
                  {s.missing > 0 && <span className="ml-2 text-xs font-normal text-ink/40">{s.missing} manquant(s)</span>}
                </span>
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
