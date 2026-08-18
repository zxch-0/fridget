import { ArrowRight, Camera, ScanLine, Sparkles, Store, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import StoreBadge from '../components/StoreBadge.jsx';
import { CHAINS } from '../lib/chains.js';
import { fetchStats, latestDeals } from '../lib/openprices.js';
import { useApp } from '../lib/store.jsx';

export default function Home() {
  const { recent } = useApp();
  const [deals, setDeals] = useState([]);
  const [liveStats, setLiveStats] = useState(null);

  useEffect(() => {
    latestDeals(8).then(setDeals).catch(() => {});
    fetchStats().then(setLiveStats).catch(() => {});
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden grain">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:py-16">
          <div className="rise">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-forest-700 ring-1 ring-forest-900/10">
              <Sparkles className="h-3.5 w-3.5" />
              Prix réels · Open Prices
            </p>
            <h1 className="mt-5 font-serif text-4xl leading-[1.05] text-forest-950 sm:text-5xl md:text-[3.4rem]">
              Vos courses,
              <span className="italic text-forest-600"> au juste prix.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-ink/70 md:text-lg">
              Fridget interroge les relevés citoyens d’Open Prices (étiquettes et tickets photographiés en magasin). Chaque prix a une date et une ville.
            </p>
            <div className="mt-6">
              <SearchBar large />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {['lait demi-écrémé', 'Nutella 400g', 'Coca-Cola 1.5', 'panier étudiant'].map((s) => (
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
            <div className="absolute -bottom-4 left-4 right-6 rounded-2xl bg-white/95 p-3 shadow-card ring-1 ring-forest-900/8 backdrop-blur sm:left-auto sm:right-6 sm:w-72">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-forest-600">Open Prices · France</p>
              <p className="font-serif text-xl text-forest-950">
                {liveStats ? `${(liveStats.prices / 1000).toFixed(0)} k relevés` : 'Relevés citoyens'}
              </p>
              <p className="text-xs text-ink/60">Prix photographiés en magasin, pas une grille inventée.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-forest-900/8 bg-white/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-4">
          <Stat k={liveStats ? liveStats.prices.toLocaleString('fr-FR') : '…'} l="prix relevés" />
          <Stat k={liveStats ? liveStats.products.toLocaleString('fr-FR') : '…'} l="produits avec un prix" />
          <Stat k={liveStats ? liveStats.locations.toLocaleString('fr-FR') : '…'} l="magasins" />
          <Stat k="ODbL" l="données ouvertes OFF" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">Comment ça marche</p>
        <h2 className="mt-2 font-serif text-3xl text-forest-950">Trois gestes, un frigo moins cher.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Step icon={Sparkles} n="01" t="Cherchez un vrai prix" d="Marque, format ou code-barres. On interroge Open Prices, pas une moyenne inventée." />
          <Step icon={ScanLine} n="02" t="Scannez le ticket" d="La photo reste sur l’appareil. Chaque ligne est recoupée avec les derniers relevés en France." />
          <Step icon={Wallet} n="03" t="Voyez l’écart" d="Date, ville, enseigne : vous savez si le détour vaut le coup — ou si le relevé est trop vieux." />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest-600">Promos relevées</p>
            <h2 className="mt-2 font-serif text-3xl text-forest-950">Les derniers prix barrés</h2>
          </div>
          <Link to="/recherche?q=nutella" className="hidden text-sm font-semibold text-forest-700 md:inline">
            Chercher
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {deals.slice(0, 4).map((p) => (
            <ProductCard key={p.code} product={p} />
          ))}
        </div>
      </section>

      <section className="bg-forest-950 text-cream-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-mint-400">Ticket de caisse</p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">Posez le ticket. On fait le reste.</h2>
            <p className="mt-3 text-cream-200/75">
              Photo ou import, Fridget extrait les lignes puis les compare aux prix réellement photographiés dans les autres enseignes.
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
          <h2 className="font-serif text-3xl text-forest-950">Enseignes reconnues</h2>
        </div>
        <p className="mt-2 max-w-xl text-ink/65">
          Dès qu’un relevé Open Prices mentionne le magasin, on le rattache. D’autres enseignes apparaissent aussi, au fil des photos.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {CHAINS.slice(0, 16).map((s) => (
            <div key={s.id} className="rounded-2xl bg-white p-3 ring-1 ring-forest-900/8">
              <StoreBadge store={s} color={s.color} />
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
