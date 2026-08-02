# Ajna Burn Monitor

A minimal, local-only dashboard for tracking AJNA burns. It uses a generated JSON snapshot for fast local development and can refresh that snapshot from Dune when needed.

## What It Shows

- Cumulative AJNA burned since September 6, 2023
- Remaining supply based on AJNA's documented 1B protocol-launch / max-supply baseline
- A transaction table with direct Etherscan links
- A very bare UI that is easy to restyle later with Tailwind

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Set `DUNE_API_KEY`
   - Optionally adjust `DUNE_API_BASE_URL`

3. Refresh the local snapshot from Dune if you want current data:

   ```bash
   npm run sync:burns
   ```

4. Start the local app:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - type-check and build production assets
- `npm run preview` - preview the production build locally
- `npm run sync:burns` - fetch AJNA burn data from Dune and write `public/data/burns.json` and `public/data/summary.json`
- `npm test` - run the Vitest suite
- `npm run typecheck` - run TypeScript checks
- `npm run lint` - run ESLint
- `npm run format` - format the codebase with Prettier
- `npm run format:check` - check formatting without writing changes

## Data Notes

- The burn series starts on September 6, 2023 so the chart stays stable.
- The snapshot is stored locally in `public/data/`.
- Deployment is intentionally deferred for now.

## Deployment

Deployment is not enabled yet. For now, the GitHub workflow only runs lint, tests, and a production build on pushes, pull requests, and manual dispatches.

When you're ready to publish the app, the next step is to extend the workflow with a deploy job for whichever host you choose. A common setup is:

- keep the current CI job as-is
- add a scheduled or manual data refresh job if you want GitHub Actions to regenerate `public/data/`
- add a deploy job once the hosting target is decided

This keeps the repository local-first until you're ready to turn deployment on.
