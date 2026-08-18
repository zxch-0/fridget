import { cls } from '../lib/format.js';

export default function StoreBadge({ store, color, size = 'md', className }) {
  const name = typeof store === 'string' ? store : store?.name || store?.short;
  const c = color || store?.color || '#16382A';
  const letter = (typeof store === 'object' && store?.letter) || (name || '?').slice(0, 2);
  const dim = size === 'sm' ? 'h-6 w-6 text-[9px]' : size === 'lg' ? 'h-11 w-11 text-sm' : 'h-8 w-8 text-[10px]';
  return (
    <span className={cls('inline-flex items-center gap-2 min-w-0', className)}>
      <span
        className={cls('grid place-items-center rounded-lg font-bold text-white shrink-0', dim)}
        style={{ background: c }}
      >
        {letter}
      </span>
      {size !== 'sm' && <span className="truncate font-medium">{name}</span>}
    </span>
  );
}
