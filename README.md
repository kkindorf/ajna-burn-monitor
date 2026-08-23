# Ajna Burn Monitor

Ajna Burn Monitor is a small frontend for exploring AJNA burn activity.

The live site is [ajnaburn.eth.limo](https://ajnaburn.eth.limo/).

The app reads two static JSON files produced by the companion
[`ajna-burn-snapshot-pipeline`](https://github.com/kkindorf/ajna-burn-snapshot-pipeline)
repository:

- `/data/summary.json`
- `/data/burns.json`

## What it shows

- Current AJNA supply against the 1B launch baseline
- Cumulative AJNA burned since September 6, 2023
- Burn transaction history with direct Etherscan links
- A responsive Tailwind CSS interface built from Atomic Design components

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set the snapshot origin:

   - Copy `.env.example` to `.env.local`
   - Set `VITE_BURNS_DATA_BASE_URL` to the deployed snapshot origin
   - For local testing, serve the pipeline repository over HTTP and point the
     variable at that server's origin

3. Start the app:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - type-check and build production assets
- `npm run preview` - preview the production build locally
- `npm run typecheck` - run TypeScript checks
- `npm run lint` - run ESLint
- `npm run format` - format the codebase with Prettier
- `npm run format:check` - check formatting without writing changes

## UI architecture

The UI uses Tailwind CSS and Atomic Design:

- `src/components/atoms` contains focused, reusable primitives
- `src/components/molecules` combines atoms into small controls and data views
- `src/components/organisms` composes dashboard sections
- `src/hooks` contains data fetching and dashboard interaction state

`App.tsx` only selects the loading, error, or ready dashboard state. ESLint enforces a 100-line maximum for component files.

## Deployment

The frontend is deployed as a static site on IPFS and resolved through ENS.

The current flow is:

1. GitHub Actions builds the app on `main`.
2. The production build in `dist/` is published to IPFS through Filebase.
3. The workflow prints the CID in the GitHub Actions summary.
4. The ENS `contenthash` for `ajnaburn.eth` is updated to that CID.
5. The site resolves at `https://ajnaburn.eth.limo/`.

GitHub Actions needs these repository secrets:

- `FILEBASE_ACCESS_KEY`
- `FILEBASE_SECRET_KEY`
- `FILEBASE_BUCKET`

The deployed frontend also needs the snapshot origin at build time through
`VITE_BURNS_DATA_BASE_URL`.

## Data flow

The frontend fetches both JSON files at runtime and prepares them for display.
Burn indexing, total calculations, and snapshot generation live in the companion
data repository.

If you change the snapshot origin, update `VITE_BURNS_DATA_BASE_URL` and restart
the dev server.

If you publish a new frontend CID later, rerun the `Deploy frontend to IPFS` workflow and update the ENS `contenthash` to the new `ipfs://<CID>` value.
