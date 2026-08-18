import { Camera, Home, Scale, Search, ShoppingBasket } from 'lucide-react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useApp } from '../lib/store.jsx';
import Logo from './Logo.jsx';

const links = [
  { to: '/', label: 'Accueil', icon: Home, end: true },
  { to: '/recherche', label: 'Recherche', icon: Search },
  { to: '/scan', label: 'Scanner', icon: Camera },
  { to: '/comparer', label: 'Comparer', icon: Scale },
];

export default function Layout() {
  const { basket, toast } = useApp();
  const count = basket.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="min-h-screen bg-cream-100 text-ink">
      <header className="sticky top-0 z-40 border-b border-forest-900/8 bg-cream-50/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-sm font-medium ${
                    isActive ? 'bg-forest-900 text-cream-50' : 'text-ink/70 hover:bg-white'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <Link
            to="/panier"
            className="relative inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-forest-900/10"
          >
            <ShoppingBasket className="h-4 w-4" />
            <span className="hidden sm:inline">Panier</span>
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-tomato px-1 text-[11px] text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="pb-28 md:pb-0">
        <Outlet />
      </main>

      <footer className="hidden border-t border-forest-900/8 bg-forest-950 text-cream-100 md:block">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-4 py-12">
          <div>
            <Logo dark />
            <p className="mt-3 max-w-sm text-sm text-cream-200/70">
              Prix réels via Open Prices (Open Food Facts, licence ODbL). Vos photos de ticket restent sur l’appareil.
            </p>
          </div>
          <p className="text-xs text-cream-200/50">
            © {new Date().getFullYear()} Fridget · données{' '}
            <a className="underline" href="https://prices.openfoodfacts.org" target="_blank" rel="noreferrer">
              Open Prices
            </a>
          </p>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-forest-900/10 bg-cream-50/95 px-2 py-2 backdrop-blur md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <ul className="grid grid-cols-5 items-end">
          <Tab to="/" icon={Home} label="Home" end />
          <Tab to="/recherche" icon={Search} label="Prix" />
          <li className="grid place-items-center">
            <Link
              to="/scan"
              className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-forest-900 text-mint-400 shadow-lift"
              aria-label="Scanner un ticket"
            >
              <Camera className="h-6 w-6" />
            </Link>
          </li>
          <Tab to="/comparer" icon={Scale} label="VS" />
          <Tab to="/panier" icon={ShoppingBasket} label="Panier" badge={count} />
        </ul>
      </nav>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-forest-900 px-4 py-2 text-sm text-cream-50 shadow-lift md:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function Tab({ to, icon: Icon, label, end, badge }) {
  return (
    <li>
      <NavLink
        to={to}
        end={end}
        className={({ isActive }) =>
          `relative flex flex-col items-center gap-0.5 text-[10px] font-medium ${isActive ? 'text-forest-800' : 'text-ink/45'}`
        }
      >
        <Icon className="h-5 w-5" />
        {label}
        {badge > 0 && (
          <span className="absolute right-3 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-tomato text-[9px] text-white">
            {badge}
          </span>
        )}
      </NavLink>
    </li>
  );
}
