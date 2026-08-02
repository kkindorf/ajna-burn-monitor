import { formatCompactTokenAmount } from '../lib/format.js';

interface MethodologyProps {
  dataConsistent: boolean;
  discrepancyRaw: string;
}

function buildConsistencyMessage(dataConsistent: boolean, discrepancyRaw: string): string {
  if (dataConsistent) {
    return 'Indexed burn totals match the observed reduction in total supply.';
  }

  const discrepancy = BigInt(discrepancyRaw);
  const magnitude = formatCompactTokenAmount(discrepancy < 0n ? -discrepancy : discrepancy);

  if (discrepancy < 0n) {
    return `Indexed burn totals exceed the observed reduction in total supply by ${magnitude}.`;
  }

  return `Indexed burn totals trail the observed reduction in total supply by ${magnitude}.`;
}

export function Methodology({ dataConsistent, discrepancyRaw }: MethodologyProps) {
  return (
    <section className="panel stack-gap">
      <div>
        <p className="section-label">Methodology</p>
        <h2>How this dashboard works</h2>
      </div>
      <div className="methodology-copy">
        <p>AJNA burns are indexed from Dune's ERC-20 transfer tables by filtering transfers sent to the zero address.</p>
        <p>The burn series starts on September 6, 2023 so it skips the launch-phase transfer on January 24, 2023.</p>
        <p>The chart, summary metrics, and transaction table all use that same visible series against AJNA's documented 1B protocol-launch / max supply.</p>
        <p>Burn totals are calculated from the visible burn series, and every burn transaction links to Etherscan.</p>
      </div>
      <p className={dataConsistent ? 'consistency-state success' : 'consistency-state warning'}>
        {buildConsistencyMessage(dataConsistent, discrepancyRaw)}
      </p>
    </section>
  );
}
