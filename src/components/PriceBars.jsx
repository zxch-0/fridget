import { euro, when } from '../lib/format.js';

export default function PriceBars({ offers }) {
  const available = (offers || []).filter((o) => o.available && o.price != null);
  if (!available.length) return <p className="text-sm text-ink/50">Pas encore de relevé en France pour ce code-barres.</p>;
  const max = Math.max(...available.map((o) => o.price));
  const min = Math.min(...available.map((o) => o.price));
  return (
    <ul className="space-y-3">
      {available
        .slice()
        .sort((a, b) => a.price - b.price)
        .map((o) => {
          const best = o.price === min;
          return (
            <li key={o.storeId}>
              <div className="grid grid-cols-[7.5rem_1fr_4.6rem] items-center gap-3">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <i className="h-2.5 w-2.5 rounded-full" style={{ background: o.color }} />
                  {o.store}
                </span>
                <div className="h-2.5 overflow-hidden rounded-full bg-cream-200">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(18, (o.price / max) * 100)}%`,
                      background: best ? '#2D6A4F' : o.color,
                    }}
                  />
                </div>
                <span className={`price-num text-right text-sm font-semibold ${best ? 'text-forest-700' : ''}`}>
                  {euro(o.price)}
                </span>
              </div>
              <p className="mt-0.5 pl-[7.5rem] text-[11px] text-ink/45">
                {o.city || o.shop} · {when(o.date)}
                {o.promo ? ' · promo' : ''}
                {o.stale ? ' · relevé ancien' : ''}
              </p>
            </li>
          );
        })}
    </ul>
  );
}
