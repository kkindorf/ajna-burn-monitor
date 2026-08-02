# Ajna Burn Monitor

A minimal dashboard for tracking AJNA burns. It uses a generated JSON snapshot for fast local development and can refresh that snapshot from Dune when needed. The intended public home for the site is `ajnaburn.eth`, surfaced through the `eth.limo` gateway.

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
- The app is built with a relative asset base so it can be published to ENS/IPFS and served through `ajnaburn.eth.limo`.

## Deployment

`eth.limo` is the gateway, not the storage layer. To publish `ajnaburn.eth`, the site needs to live on IPFS, Swarm, or Arweave, and the ENS `contenthash` record needs to point at that content.

Current GitHub Actions CI only runs lint, tests, and a production build on pushes, pull requests, and manual dispatches.

When you're ready to publish the app, the remaining steps are:

- upload the built `dist/` folder to your chosen decentralized host
- set the ENS `contenthash` for `ajnaburn.eth`
- access the site at `https://ajnaburn.eth.limo/`

If you want automated publishing, the repo will need a pinning or upload service plus credentials.
