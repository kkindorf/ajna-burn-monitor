import type { BurnHistoryRow } from '../../types/dashboard.js';
import { Button } from '../atoms/Button.js';
import { EmptyState } from '../atoms/EmptyState.js';
import { SectionHeading } from '../atoms/SectionHeading.js';
import { Surface } from '../atoms/Surface.js';
import { BurnTableRow } from '../molecules/BurnTableRow.js';

interface BurnHistoryProps {
  rows: BurnHistoryRow[];
  hasHistory: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

const headings = [
  'Date',
  'AJNA burned',
  'Cumulative burned',
  'Remaining supply',
  'Transaction',
];

export function BurnHistory({
  rows,
  hasHistory,
  hasMore,
  onLoadMore,
}: BurnHistoryProps) {
  return (
    <Surface className="grid gap-4">
      <SectionHeading
        eyebrow="History"
        title="Burn transactions"
        description="Visible burn history starting September 6, 2023."
      />
      {hasHistory ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl text-left text-sm">
              <thead className="text-xs tracking-wider text-stone-600 uppercase">
                <tr>
                  {headings.map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="border-b border-stone-200 px-2.5 py-3 font-medium first:pl-0 last:pr-0"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <BurnTableRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
          {hasMore ? (
            <Button type="button" onClick={onLoadMore} className="w-fit">
              Load more
            </Button>
          ) : null}
        </>
      ) : (
        <EmptyState>
          No burn transactions were found for the selected period.
        </EmptyState>
      )}
    </Surface>
  );
}
