import { Search, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store.jsx';

export default function SearchBar({ large = false, initial = '', autoFocus = false }) {
  const [q, setQ] = useState(initial);
  const nav = useNavigate();
  const { remember } = useApp();

  const go = (e) => {
    e?.preventDefault();
    const t = q.trim();
    if (!t) return;
    remember(t);
    nav(`/recherche?q=${encodeURIComponent(t)}`);
  };

  return (
    <form onSubmit={go} className={`relative ${large ? 'w-full' : 'w-full max-w-xl'}`}>
      <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest-600" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Un produit, une marque, « petit-déj pas cher »…"
        className={`w-full rounded-full border border-forest-900/10 bg-white pl-11 pr-28 text-ink shadow-card placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-mint-500 ${
          large ? 'h-14 text-base' : 'h-11 text-sm'
        }`}
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full bg-forest-900 px-4 py-2 text-sm font-semibold text-cream-50 hover:bg-forest-800"
      >
        <Search className="h-4 w-4" />
        Chercher
      </button>
    </form>
  );
}
