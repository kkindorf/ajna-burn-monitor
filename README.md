# Ajna Burn Monitor

Minimal frontend for the AJNA burn dashboard.

This repo now only handles the UI. The burn data itself comes from the separate `ajna-burn-monitor-api` repo, which serves:

- `/data/summary.json`
- `/data/burns.json`

## What it shows

- Cumulative AJNA burned since September 6, 2023
- Remaining supply against AJNA's 1B launch baseline
- A transaction table with direct Etherscan links
- A very bare UI that is easy to restyle later with Tailwind

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set the API origin:

   - Copy `.env.example` to `.env`
   - Set `VITE_BURNS_DATA_BASE_URL` to the deployed API origin
   - For local development, point it at your local API server

3. Start the app:

   ```bash
   npm run dev
   ```

## Deployment

This frontend is designed to live on IPFS and be resolved through `ajnaburn.eth.limo`.

The current deployment path is:

1. GitHub Actions builds the Vite app on `main`.
2. The build output in `dist/` is published to IPFS through Filebase.
3. GitHub Actions prints the CID in the workflow summary.
4. You paste that CID into the `contenthash` record for `ajnaburn.eth`.
5. The site becomes available through the ENS gateway at `https://ajnaburn.eth.limo/`.

If the ENS app wants a prefixed value instead of a bare CID, use `ipfs://<CID>`.

To use the workflow, add these repository secrets:

- `FILEBASE_ACCESS_KEY`
- `FILEBASE_SECRET_KEY`
- `FILEBASE_BUCKET`

The frontend build is also wired to the deployed API origin through `VITE_BURNS_DATA_BASE_URL`, so the static site can keep reading fresh JSON from the separate API repo.

## Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - type-check and build production assets
- `npm run preview` - preview the production build locally
- `npm run typecheck` - run TypeScript checks
- `npm run lint` - run ESLint
- `npm run format` - format the codebase with Prettier
- `npm run format:check` - check formatting without writing changes

## Data flow

The frontend fetches the API snapshot at runtime. It does not calculate burn totals, query Dune, or write JSON snapshots anymore.

If you change the API origin, update `VITE_BURNS_DATA_BASE_URL` and restart the dev server.

If you want to publish a new frontend CID later, rerun the `Deploy frontend to IPFS` workflow and update the ENS `contenthash` to the new `ipfs://...` value.
