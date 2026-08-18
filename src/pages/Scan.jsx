import { Camera, Check, ImagePlus, Loader2, ReceiptText, Sparkles, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import StoreBadge from '../components/StoreBadge.jsx';
import { api } from '../lib/api.js';
import { euro, when } from '../lib/format.js';
import { enrichReceipt } from '../lib/openprices.js';
import { readReceipt } from '../lib/ocr.js';
import { useApp } from '../lib/store.jsx';

export default function Scan() {
  const { stores, add, saveScan } = useApp();
  const [storeId, setStoreId] = useState('carrefour');
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const store = stores.find((s) => s.id === storeId);

  const onFile = async (file) => {
    if (!file) return;
    setError('');
    setResult(null);
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const text = await readReceipt(file, setStatus);
      setStatus('Lecture du ticket…');
      const parsed = await api.receipt({ text, storeId });
      setStatus('Croisement avec les prix réels…');
      const analysis = await enrichReceipt(parsed);
      setResult(analysis);
      saveScan({ storeId, paid: analysis.paid, save: analysis.saveVsPaid, count: analysis.items.length });
    } catch (e) {
      setError(e.message || 'Lecture impossible. Essayez le ticket démo ou une photo plus nette.');
    } finally {
      setBusy(false);
      setStatus('');
    }
  };

  const runDemo = async () => {
    setError('');
    setBusy(true);
    setStoreId('carrefour');
    setPreview('/sample-receipt.jpg');
    setStatus('Lecture du ticket exemple…');
    try {
      const parsed = await api.receipt({ demo: true, storeId: 'carrefour' });
      setStatus('Croisement avec les prix réels Open Prices…');
      const analysis = await enrichReceipt(parsed);
      setResult(analysis);
      saveScan({ storeId: 'carrefour', paid: analysis.paid, save: analysis.saveVsPaid, count: analysis.items.length, demo: true });
    } catch (e) {
      setError(e.message || 'Erreur démo');
    } finally {
      setBusy(false);
      setStatus('');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-forest-600">Scanner</p>
      <h1 className="mt-1 font-serif text-3xl text-forest-950 md:text-4xl">Votre ticket, toutes les enseignes.</h1>
      <p className="mt-2 max-w-2xl text-ink/65">
        Choisissez d’abord le magasin où vous avez payé. La photo est lue ici, dans le navigateur — elle n’est pas envoyée.
      </p>

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold">1. Magasin du ticket</p>
        <div className="flex gap-2 overflow-auto no-scrollbar pb-1">
          {stores.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStoreId(s.id)}
              className={`shrink-0 rounded-2xl px-3 py-2 ring-1 transition ${
                storeId === s.id ? 'bg-forest-900 text-cream-50 ring-forest-900' : 'bg-white text-ink ring-forest-900/10'
              }`}
            >
              <StoreBadge store={s} color={storeId === s.id ? '#3DDC97' : s.color} size="sm" />
              <span className="ml-2 text-sm font-medium">{s.short}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="mb-2 text-sm font-semibold">2. Photo ou import</p>
          <label className="relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.8rem] border border-dashed border-forest-900/20 bg-white p-6 text-center">
            {preview ? (
              <img src={preview} alt="Ticket" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-cream-100 text-forest-800">
                  <ImagePlus className="h-6 w-6" />
                </span>
                <p className="mt-3 font-serif text-xl">Déposez le ticket ici</p>
                <p className="mt-1 text-sm text-ink/55">JPG, PNG · lumière uniforme, ticket à plat</p>
              </>
            )}
            {busy && (
              <div className="absolute inset-0 grid place-items-center bg-forest-950/55 text-cream-50">
                <div className="relative w-full max-w-xs px-4 text-center">
                  <div className="scanline absolute inset-x-6 h-0.5 bg-mint-400" />
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                  <p className="mt-3 text-sm font-medium">{status || 'Traitement…'}</p>
                </div>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-forest-900 px-4 py-2 text-sm font-semibold text-cream-50"
            >
              <Camera className="h-4 w-4" />
              Prendre / importer
            </button>
            <button
              type="button"
              onClick={runDemo}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold ring-1 ring-forest-900/10"
            >
              <ReceiptText className="h-4 w-4" />
              Ticket exemple Carrefour
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-tomato">{error}</p>}
        </div>

        <div>
          {!result && (
            <div className="rounded-[1.8rem] bg-cream-200/40 p-6 text-sm text-ink/60">
              <Upload className="h-5 w-5 text-forest-700" />
              <p className="mt-3 font-serif text-xl text-forest-950">En attendant</p>
              <p className="mt-1">
                Le ticket démo est lu, puis chaque ligne est comparée aux <strong>vrais relevés</strong> Open Prices (date + ville).
              </p>
              {store && (
                <p className="mt-3 text-xs">
                  Enseigne sélectionnée : <strong>{store.name}</strong>
                </p>
              )}
            </div>
          )}
          {result && <ResultPanel result={result} onAdd={add} />}
        </div>
      </div>
    </div>
  );
}

function ResultPanel({ result, onAdd }) {
  const [tab, setTab] = useState('ticket');
  const best = result.bestStore;

  return (
    <div className="space-y-4">
      <div className="rounded-[1.8rem] bg-forest-900 p-5 text-cream-50">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-mint-400">
          <Sparkles className="h-3.5 w-3.5" />
          Verdict Fridget
        </p>
        <p className="mt-2 font-serif text-2xl leading-snug">{result.advice.headline}</p>
        <p className="mt-2 text-sm text-cream-200/75">{result.advice.detail}</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Mini k="Payé" v={euro(result.paid)} />
          <Mini k={best?.store || 'Min'} v={euro(best?.total)} />
          <Mini k="Économie" v={euro(result.saveVsPaid)} accent />
        </div>
      </div>

      <div className="flex gap-2">
        {[
          ['ticket', 'Ticket annoté'],
          ['enseignes', 'Par magasin'],
          ['mix', 'Panier mixte'],
        ].map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              tab === id ? 'bg-forest-900 text-cream-50' : 'bg-white ring-1 ring-forest-900/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'ticket' && (
        <ol className="receipt divide-y divide-forest-900/10 overflow-hidden rounded-[1.4rem] px-4 py-2 font-mono text-[13px]">
          <li className="flex justify-between py-2 text-[10px] uppercase tracking-widest text-ink/45">
            <span>{result.store.name}</span>
            <span>{result.items.length} lignes</span>
          </li>
          {result.items.map((item, i) => (
            <li key={`${item.name}-${i}`} className="py-2.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] uppercase tracking-wide text-ink/80">{item.name}</p>
                  {item.match && (
                    <p className="mt-0.5 font-sans text-[11px] text-forest-700">
                      {item.match.emoji} {item.match.name} · {item.match.brand}
                    </p>
                  )}
                  {!item.match && <p className="font-sans text-[11px] text-tomato">Non reconnu</p>}
                </div>
                <p className="price-num shrink-0">{euro(item.price)}</p>
              </div>
              {item.best && (
                <p className="mt-1 font-sans text-[11px] text-tomato">
                  {euro(item.best.price)} chez {item.best.store}
                  {item.best.city ? ` (${item.best.city})` : ''} · {when(item.best.date)}
                  {item.savingIfBest > 0.05 ? ` · ${euro(item.savingIfBest)} de moins` : ''}
                </p>
              )}
              {item.match && (
                <button
                  type="button"
                  onClick={() => onAdd(item.live || item.match)}
                  className="mt-1 font-sans text-[11px] font-semibold text-forest-700"
                >
                  + au panier
                </button>
              )}
            </li>
          ))}
        </ol>
      )}

      {tab === 'enseignes' && (
        <ul className="space-y-2">
          {result.byStore.map((s, idx) => (
            <li key={s.storeId} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2.5 ring-1 ring-forest-900/8">
              <span className="flex items-center gap-2 text-sm font-medium">
                {idx === 0 && <Check className="h-4 w-4 text-forest-600" />}
                <i className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                {s.store}
              </span>
              <span className="text-right">
                <span className="price-num font-semibold">{euro(s.total)}</span>
                <span className={`ml-2 text-xs ${s.delta > 0 ? 'text-forest-700' : 'text-ink/40'}`}>
                  {s.delta > 0 ? `− ${euro(s.delta)}` : '='}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {tab === 'mix' && (
        <div className="rounded-3xl bg-white p-4 ring-1 ring-forest-900/8">
          <p className="text-sm text-ink/65">
            Si chaque ligne va au moins-disant : <strong className="price-num">{euro(result.split.total)}</strong>
            {' '}({euro(result.split.gain)} vs ticket).
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {result.split.lines.map((l, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  {l.name}
                  <span className="ml-2 text-xs text-ink/45">{l.store}</span>
                </span>
                <span className="price-num">{euro(l.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.advice.misses?.length > 0 && (
        <ul className="text-sm text-ink/70">
          {result.advice.misses.map((m) => (
            <li key={m}>· {m}</li>
          ))}
        </ul>
      )}

      <Link to="/comparer" className="inline-block text-sm font-semibold text-forest-700">
        Comparer un panier type →
      </Link>
    </div>
  );
}

function Mini({ k, v, accent }) {
  return (
    <div className="rounded-2xl bg-white/10 px-2 py-2">
      <p className="text-[10px] uppercase tracking-wider text-cream-200/60">{k}</p>
      <p className={`price-num font-serif text-lg ${accent ? 'text-mint-400' : ''}`}>{v}</p>
    </div>
  );
}
