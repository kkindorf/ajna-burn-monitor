import { SectionHeading } from '../atoms/SectionHeading.js';
import { Surface } from '../atoms/Surface.js';

export function Methodology() {
  return (
    <Surface className="grid gap-4">
      <SectionHeading eyebrow="Methodology" title="How this dashboard works" />
      <div className="grid gap-2 text-sm text-stone-600">
        <p>
          The data pipeline fetches AJNA ERC-20 transfer logs sent to the zero
          address through Etherscan, then publishes the results as a snapshot.
        </p>
        <p>
          The public burn series starts at Ethereum block 18,078,582 on
          September 6, 2023. Earlier zero-address transfers were allocation
          movements, so they are not counted against the 1B launch-supply
          baseline.
        </p>
        <p>
          That snapshot supplies the chart, summary metrics, transaction
          history, and Etherscan links for inspecting each transaction.
        </p>
      </div>
      <p className="rounded-2xl bg-emerald-800/10 px-4 py-3 text-sm text-emerald-800">
        Published snapshots are verified so indexed burn totals match the
        observed reduction in total supply.
      </p>
    </Surface>
  );
}
