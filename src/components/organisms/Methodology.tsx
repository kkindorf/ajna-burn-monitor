import type { SupplyConsistency } from '../../types/dashboard.js';
import { SectionHeading } from '../atoms/SectionHeading.js';
import { Surface } from '../atoms/Surface.js';

interface MethodologyProps {
  consistency: SupplyConsistency;
}

export function Methodology({ consistency }: MethodologyProps) {
  return (
    <Surface className="grid gap-4">
      <SectionHeading eyebrow="Methodology" title="How this dashboard works" />
      <div className="grid gap-2 text-sm text-stone-600">
        <p>
          AJNA burns are indexed from Dune&apos;s ERC-20 transfer tables by
          filtering transfers sent to the zero address.
        </p>
        <p>
          The burn series starts on September 6, 2023 so it skips the
          launch-phase transfer on January 24, 2023.
        </p>
        <p>
          The chart, summary metrics, and transaction table all use that same
          visible series against AJNA&apos;s documented 1B protocol-launch / max
          supply.
        </p>
        <p>
          Burn totals are supplied by the API snapshot, and every burn
          transaction links to Etherscan.
        </p>
      </div>
      <p className={`rounded-2xl px-4 py-3 text-sm ${consistency.className}`}>
        {consistency.message}
      </p>
    </Surface>
  );
}
