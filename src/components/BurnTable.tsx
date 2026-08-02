import type { BurnTransaction } from '../types/burn.js';

interface BurnTableProps {
  burns: BurnTransaction[];
  hasMore: boolean;
  onLoadMore: () => void;
}

export function BurnTable({ burns, hasMore, onLoadMore }: BurnTableProps) {
  return (
    <section className="panel stack-gap">
      <div className="section-head">
        <div>
          <p className="section-label">History</p>
          <h2>Burn transactions</h2>
          <p className="muted-copy">Visible burn history starting September 6, 2023.</p>
        </div>
      </div>
      {burns.length > 0 ? (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">AJNA burned</th>
                  <th scope="col">Cumulative burned</th>
                  <th scope="col">Remaining supply</th>
                  <th scope="col">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {burns.map((burn) => (
                  <tr key={burn.transactionHash}>
                    <td>
                      <time dateTime={`${burn.date}T00:00:00Z`} title={new Date(burn.timestamp * 1000).toUTCString()}>
                        {burn.date}
                      </time>
                    </td>
                    <td title={`${burn.amountBurnedRaw} raw`}>{burn.amountBurnedFormatted}</td>
                    <td title={`${burn.cumulativeBurnedRaw} raw`}>{burn.cumulativeBurnedFormatted}</td>
                    <td title={`${burn.remainingSupplyRaw} raw`}>{burn.remainingSupplyFormatted}</td>
                    <td>
                      <a
                        href={burn.etherscanUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`View transaction ${burn.transactionHash} on Etherscan`}
                      >
                        View on Etherscan
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMore ? (
            <button type="button" className="button" onClick={onLoadMore}>
              Load more
            </button>
          ) : null}
        </>
      ) : (
        <div className="empty-state">
          <p>No burn transactions were found for the selected period.</p>
        </div>
      )}
    </section>
  );
}
