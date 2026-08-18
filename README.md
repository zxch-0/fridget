# Fridget

**Vos courses, au juste prix.**

Fridget est une application web complète pour comparer les prix entre enseignes françaises, interroger une IA produit, et **scanner un ticket de caisse** afin de voir ce que le même chariot aurait coûté ailleurs.

![Fridget](public/og.jpg)

## Ce que ça fait

- **Recherche IA** — « lait demi-écrémé », « Nutella 400 », « petit-déj pas cher », « panier étudiant ».
- **Scan de ticket** — vous choisissez le magasin, vous photographiez le reçu. L’OCR tourne **dans le navigateur** (Tesseract, français) : la photo ne quitte pas l’appareil. Seul le texte reconnu part à l’API.
- **Comparaison** — 10 enseignes (Lidl, Aldi, Leclerc, Intermarché, Super U, Carrefour, Auchan, Casino, Monoprix, Franprix), équivalents marque distributeur compris.
- **Panier optimisé** — un seul magasin, ou mix si le détour vaut le coup.
- **Promos tournantes** chaque semaine ISO.

Les prix sont **indicatifs** (positionnement réel des enseignes + variations déterministes + promos hebdo). Branchez un flux de prix réel plus tard sans changer l’interface.

## Démarrer en local

```bash
npm install
npm run dev
```

- Interface : [http://localhost:5173](http://localhost:5173)
- API : [http://localhost:8787/api/health](http://localhost:8787/api/health)

```bash
npm test          # moteur de recherche + parseur de ticket
npm run build
npm start         # sert dist + API (PORT=8080 par défaut)
```

Copiez `.env.example` vers `.env` si besoin.

| Variable | Rôle |
| --- | --- |
| `PORT` | Port HTTP en production |
| `OPENAI_API_KEY` | Optionnel — reformule les phrases de l’IA. **Les prix restent calculés localement.** |
| `OPENAI_BASE_URL` / `OPENAI_MODEL` | Endpoint compatible OpenAI |

## Déployer

Un seul process Node. Le `npm start` sert l’API **et** le front compilé.

### Docker

```bash
docker compose up --build
# http://localhost:8080
```

### Railway / Render / Fly.io

1. Reliez le dépôt.
2. Build : `npm install && npm run build`
3. Start : `npm start`
4. Posez `PORT` (souvent injecté tout seul).

`Procfile` et `Dockerfile` sont déjà là.

### Vercel / Netlify

Hébergement statique seul : ce n’est pas le mode prévu (l’API Express est nécessaire). Préférez un PaaS Node ou Docker.

## Utiliser le scan

1. Ouvrez **Scanner**.
2. Sélectionnez l’enseigne du ticket.
3. Photo, import, **ou** « Ticket exemple Carrefour » (reçu du 12/08/2026, déjà dans `/sample-receipt.jpg`).
4. Fridget annote chaque ligne, calcule l’économie, et propose un panier mixte.

Première lecture OCR : téléchargement du modèle français (~2 Mo). Le ticket démo n’en a pas besoin.

## Architecture

```
server/          API Express + moteur de prix / IA / tickets
src/             React + Vite + Tailwind
public/          visuels, PWA, ticket exemple
```

- `src/lib/openprices.js` — client Open Prices (prix réels)
- `src/lib/chains.js` — rattachement enseigne (Lidl, Leclerc…)
- `server/receipt.js` — parseur de ticket FR
- `src/lib/ocr.js` — prétraitement image + Tesseract
- `GET /api/live/*` — relais Open Prices si besoin

## Licence

Usage libre dans ce dépôt. Marques citées (Carrefour, Nutella, etc.) appartiennent à leurs propriétaires — utilisées uniquement comme références de comparaison.
