import type { BurnHistoryRow } from '../../types/dashboard.js';

interface BurnTableRowProps {
  row: BurnHistoryRow;
}

const cellClassName =
  'border-b border-stone-200 px-2.5 py-3 align-top first:pl-0 last:pr-0';

export function BurnTableRow({ row }: BurnTableRowProps) {
  return (
    <tr>
      <td className={cellClassName}>
        <time dateTime={row.dateTime} title={row.dateTitle}>
          {row.date}
        </time>
      </td>
      <td className={cellClassName} title={row.amountBurnedTitle}>
        {row.amountBurned}
      </td>
      <td className={cellClassName} title={row.cumulativeBurnedTitle}>
        {row.cumulativeBurned}
      </td>
      <td className={cellClassName} title={row.remainingSupplyTitle}>
        {row.remainingSupply}
      </td>
      <td className={cellClassName}>
        <a
          className="font-medium text-emerald-800 underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
          href={row.transactionUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={row.transactionLabel}
        >
          View on Etherscan
        </a>
      </td>
    </tr>
  );
}
