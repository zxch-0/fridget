import { Link } from 'react-router-dom';

export default function Logo({ dark = false, to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 group">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-forest-900 shadow-sm">
        <svg viewBox="0 0 36 36" className="h-6 w-6" aria-hidden>
          <rect x="7" y="4" width="22" height="28" rx="4" fill="#F6F1E8" />
          <rect x="7" y="4" width="22" height="10" rx="4" fill="#EDE4D3" />
          <rect x="7" y="13" width="22" height="1.4" fill="#16382A" />
          <rect x="22" y="18" width="5" height="2.2" rx="1" fill="#3DDC97" />
          <path d="M24.5 19.2c2.4.6 4.4 2.8 3.2 5.2l-4.1-3.2c-.8-.6.2-2.2.9-2z" fill="#E85D4C" />
        </svg>
      </span>
      <span className={`font-serif text-[1.35rem] leading-none tracking-tight ${dark ? 'text-cream-50' : 'text-forest-900'}`}>
        Fridget
      </span>
    </Link>
  );
}
