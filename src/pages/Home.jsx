import { ArrowRight, Camera, ScanLine, Sparkles, Store, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import StoreBadge from '../components/StoreBadge.jsx';
import { api } from '../lib/api.js';
import { euro } from '../lib/format.js';
import { useApp } from '../lib/store.jsx';

export default function Home() {
  const { stores, stats, recent } = useApp();
  const [deals, setDeals] = useState([]);
  const [week, setWeek] = useState(null);

  useEffect(() => {
    api.deals().then((d) => {
      setDeals(d.deals || []);
      setWeek(d.week);
    }).catch(() => {});
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden grain">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:py-16">
          <div className="rise">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-forest-700 ring-1 ring-forest-900/10">
              <Sparkles className="h-3.5 w-3.5" />
              IA courses · France
            </p>
            <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-forest-950 sm:text-5xl md:text-[3.4rem]">
              Vos courses,
              <span className="italic text-forest-600"> au juste prix.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-ink/70 md:text-lg">
              Fridget lit un ticket de caisse, reconnaît les produits et vous dit où ils sont moins chers — Lidl, Leclerc, Carrefour et le reste.
            </p>
            <div className="mt-6">
              <SearchBar large />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['lait demi-écrémé', 'Nutella 400g', 'panier étudiant', 'papier toilette'].map((s) => (
                <Link
                  key={s}
                  to={`/recherche?q=${encodeURIComponent(s)}`}
                  className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-forest-800 ring-1 ring-forest-900/10 hover:bg-white"
                >
                  {s}
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-5 py-3 text-sm font-semibold text-cream-50"
              >
                <Camera className="h-4 w-4" />
                Scanner un ticket
              </Link>
              <Link
                to="/comparer"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-forest-900 ring-1 ring-forest-900/10"
              >
                Comparer les enseignes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="relative rise" style={{ animationDelay: '80ms' }}>
            <img
              src="/hero.jpg"
              alt="Cuisine et frigo vintage, courses du marché"
              className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift ring-1 ring-forest-900/10"
            />
            <div className="absolute -bottom-4 left-4 right-6 rounded-2xl bg-white/95 p-3 shadow-card ring-1 ring-forest-900/8 backdrop-blur sm:left-auto sm:right-6 sm:w-64">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-forest-600">Ticket type · Carrefour</p>
              <p className="font-serif text-xl text-forest-950">
                {demoSave != null ? `− ${euro(demoSave)} chez Lidl` : 'Lidl reprend la main'}
              </p>
              <p className="text-xs text-ink/60">Sur 10 produits du ticket démo</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-forest-900/8 bg-white/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
          <Stat k={stats.stores || 10} l="enseignes" />
          <Stat k={`${stats.products || 110}+`} l="produits suivis" />
          <Stat k={`${stats.avgSpread || 24} %`} l="d’écart moyen" />
          <Stat k={`S${week || stats.week || '—'}`} l="promos de la semaine" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">Comment ça marche</p>
        <h2 className="mt-2 font-serif text-3xl text-forest-950">Trois gestes, un frigo moins cher.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Step icon={Sparkles} n="01" t="Demandez à l’IA" d="Tapez un produit, une marque ou un menu (« petit-déj », « semaine étudiant »). Fridget comprend le besoin." />
          <Step icon={ScanLine} n="02" t="Scannez le ticket" d="Choisissez l’enseigne, photographiez le reçu. La lecture se fait sur votre appareil." />
          <Step icon={Wallet} n="03" t="Voyez l’économie" d="Chaque ligne est comparée. On vous dit où aller — ou s’il ne vaut pas le détour." />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">Cette semaine</p>
            <h2 className="mt-2 font-serif text-3xl text-forest-950">Les écarts qui valent le clic</h2>
          </div>
          <Link to="/recherche?q=promo" className="hidden text-sm font-semibold text-forest-700 md:inline">
            Tout voir
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deals.slice(0, 4).map((d) => (
            <ProductCard key={d.product.id} product={d.product} />
          ))}
        </div>
      </section>

      <section className="bg-forest-950 text-cream-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint-400">Ticket de caisse</p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">Posez le ticket. On fait le reste.</h2>
            <p className="mt-3 text-cream-200/75">
              Photo ou import, Fridget extrait les lignes, rattache chaque produit à une famille (lait 1 L, PQ x12…) et compare le prix payé aux neuf autres enseignes.
            </p>
            <Link
              to="/scan"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-mint-500 px-5 py-3 text-sm font-semibold text-forest-950"
            >
              Essayer le ticket Carrefour
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <img
            src="/sample-receipt.jpg"
            alt="Exemple de ticket Carrefour Market"
            className="w-full rounded-[1.6rem] object-cover shadow-lift ring-1 ring-white/10"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-forest-600" />
          <h2 className="font-serif text-3xl text-forest-950">Les enseignes suivies</h2>
        </div>
        <p className="mt-2 max-w-xl text-ink/65">
          Prix indicatifs calés sur le positionnement réel : discount, indépendants, hypers, urbain. Les promos tournent chaque semaine.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stores.map((s) => (
            <div key={s.id} className="rounded-2xl bg-white p-3 ring-1 ring-forest-900/8">
              <StoreBadge store={s} color={s.color} />
              <p className="mt-2 text-[11px] leading-snug text-ink/55">{s.note}</p>
            </div>
          ))}
        </div>
        {recent.length > 0 && (
          <p className="mt-8 text-sm text-ink/55">
            Récemment :{' '}
            {recent.slice(0, 4).map((r, i) => (
              <Link key={r} to={`/recherche?q=${encodeURIComponent(r)}`} className="font-medium text-forest-700">
                {r}
                {i < Math.min(3, recent.length - 1) ? ' · ' : ''}
              </Link>
            ))}
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({ k, l }) {
  return (
    <div>
      <p className="font-serif text-3xl text-forest-900">{k}</p>
      <p className="text-sm text-ink/55">{l}</p>
    </div>
  );
}

function Step({ icon: Icon, n, t, d }) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-forest-900/8">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cream-100 text-forest-800">
          <Icon className="h-5 w-5" />
        </span>
        <span className="font-mono text-xs text-ink/35">{n}</span>
      </div>
      <h3 className="mt-4 font-serif text-xl">{t}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink/65">{d}</p>
    </article>
  );
}
