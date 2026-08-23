import type { BurnTransaction } from '../../types/burnSnapshot.js';
import { formatUtcDate } from '../../lib/display.js';

interface BurnTableRowProps {
  burn: BurnTransaction;
}

const tableCellClassName =
  'border-b border-stone-200 px-2.5 py-3 align-top first:pl-0 last:pr-0';

export function BurnTableRow({ burn }: BurnTableRowProps) {
  const burnDate = new Date(burn.timestamp * 1000);

  return (
    <tr>
      <td className={tableCellClassName}>
        <time dateTime={burnDate.toISOString()} title={burnDate.toUTCString()}>
          {formatUtcDate(burn.timestamp)}
        </time>
      </td>
      <td className={tableCellClassName} title={`${burn.amountBurnedRaw} raw`}>
        {burn.amountBurnedFormatted}
      </td>
      <td
        className={tableCellClassName}
        title={`${burn.cumulativeBurnedRaw} raw`}
      >
        {burn.cumulativeBurnedFormatted}
      </td>
      <td
        className={tableCellClassName}
        title={`${burn.remainingSupplyRaw} raw`}
      >
        {burn.remainingSupplyFormatted}
      </td>
      <td className={tableCellClassName}>
        <a
          className="font-medium text-emerald-800 underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
          href={`https://etherscan.io/tx/${burn.transactionHash}`}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`View transaction ${burn.transactionHash} on Etherscan`}
        >
          View on Etherscan
        </a>
      </td>
    </tr>
  );
}
