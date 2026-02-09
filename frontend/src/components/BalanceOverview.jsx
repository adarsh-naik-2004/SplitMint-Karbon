export default function BalanceOverview({ balances, contributionTable, activeGroup }) {
  return (
    <div className="balance-overview">
      <div className="balance-grid">
        {/* Net Balances */}
        <div className="balance-card">
          <div className="card-header">
            <h4>💰 Net Balances</h4>
          </div>

          <div className="balance-table">
            {balances.netBalances.length === 0 ? (
              <div className="empty-message">No transactions yet</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th className="text-right">Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {balances.netBalances.map((row) => {
                    const participant = activeGroup?.participants.find(
                      (x) => x._id === row.participantId
                    );

                    return (
                      <tr key={row.participantId}>
                        <td>
                          <div className="participant-cell">
                            <span
                              className="participant-indicator"
                              style={{
                                backgroundColor: participant?.color || "#22c55e",
                              }}
                            />
                            {participant?.name || row.participantId.slice(-4)}
                          </div>
                        </td>

                        <td className="text-right">
                          <span
                            className={`balance-amount ${
                              row.net >= 0 ? "positive" : "negative"
                            }`}
                          >
                            ₹{Math.abs(row.net).toFixed(2)}
                            {row.net >= 0 ? " ↑" : " ↓"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Settlement Suggestions */}
        <div className="balance-card">
          <div className="card-header">
            <h4>🎯 Settlement Suggestions</h4>
          </div>

          <div className="settlements-list">
            {balances.settlements.length === 0 ? (
              <div className="empty-message">All settled up! 🎉</div>
            ) : (
              balances.settlements.map((settlement, index) => {
                const fromParticipant = activeGroup?.participants.find(
                  (x) => x._id === settlement.from
                );

                const toParticipant = activeGroup?.participants.find(
                  (x) => x._id === settlement.to
                );

                return (
                  <div key={index} className="settlement-item">
                    <div className="settlement-flow">
                      <div className="settlement-participant">
                        <span
                          className="participant-dot"
                          style={{
                            backgroundColor: fromParticipant?.color || "#ef4444",
                          }}
                        />
                        <span className="participant-name">
                          {fromParticipant?.name ||
                            settlement.fromName ||
                            settlement.from?.slice(-4) ||
                            "Unknown"}
                        </span>
                      </div>

                      <div className="settlement-arrow">
                        <span className="arrow-line"></span>
                        <span className="arrow-head">→</span>
                      </div>

                      <div className="settlement-participant">
                        <span
                          className="participant-dot"
                          style={{
                            backgroundColor: toParticipant?.color || "#22c55e",
                          }}
                        />
                        <span className="participant-name">
                          {toParticipant?.name ||
                            settlement.toName ||
                            settlement.to?.slice(-4) ||
                            "Unknown"}
                        </span>
                      </div>
                    </div>

                    <div className="settlement-amount">
                      ₹{settlement.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Group Contributions */}
        <div className="balance-card full-width">
          <div className="card-header">
            <h4>📊 Group Contributions</h4>
          </div>

          <div className="balance-table">
            {contributionTable.length === 0 ? (
              <div className="empty-message">No data available</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th className="text-right">Paid</th>
                    <th className="text-right">Share</th>
                    <th className="text-right">Net</th>
                  </tr>
                </thead>

                <tbody>
                  {contributionTable.map((row) => (
                    <tr key={row._id}>
                      <td>
                        <div className="participant-cell">
                          <span
                            className="participant-indicator"
                            style={{ backgroundColor: row.color || "#22c55e" }}
                          />
                          {row.name}
                        </div>
                      </td>

                      <td className="text-right">₹{row.paid.toFixed(2)}</td>
                      <td className="text-right">₹{row.share.toFixed(2)}</td>

                      <td className="text-right">
                        <span
                          className={`balance-amount ${
                            row.net >= 0 ? "positive" : "negative"
                          }`}
                        >
                          ₹{Math.abs(row.net).toFixed(2)}
                          {row.net >= 0 ? " ↑" : " ↓"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
