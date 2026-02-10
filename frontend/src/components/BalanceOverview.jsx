export default function BalanceOverview({ balances, contributionTable, activeGroup }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Net Balances</h3>
        </div>

        {balances.netBalances.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mb-2" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
              <path d="M32 22v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <p className="text-sm text-gray-600">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {balances.netBalances.map((row) => {
              const participant = activeGroup?.participants.find(
                (x) => x._id === row.participantId
              );

              return (
                <div key={row.participantId} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                      style={{ backgroundColor: participant?.color || '#10b981' }}
                    >
                      {participant?.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="font-medium text-gray-900">
                      {participant?.name || row.participantId.slice(-4)}
                    </span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${row.net >= 0 ? 'text-primary-700' : 'text-red-700'}`}>
                    <span className="font-semibold">₹{Math.abs(row.net).toFixed(2)}</span>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      {row.net >= 0 ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                      )}
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Settlement Suggestions</h3>
        </div>

        {balances.settlements.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <svg className="w-12 h-12 text-primary-300 mb-2" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
              <path d="M20 32l8 8 16-16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="text-sm text-primary-700 font-medium">All settled up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {balances.settlements.map((settlement, index) => {
              const fromParticipant = activeGroup?.participants.find(
                (x) => x._id === settlement.from
              );

              const toParticipant = activeGroup?.participants.find(
                (x) => x._id === settlement.to
              );

              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                      style={{ backgroundColor: fromParticipant?.color || '#ef4444' }}
                    >
                      {fromParticipant?.name?.charAt(0).toUpperCase() || 
                       settlement.fromName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className="text-sm text-gray-700">
                      {fromParticipant?.name ||
                        settlement.fromName ||
                        settlement.from?.slice(-4) ||
                        'Unknown'}
                    </span>
                  </div>

                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>

                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-sm text-gray-700">
                      {toParticipant?.name ||
                        settlement.toName ||
                        settlement.to?.slice(-4) ||
                        'Unknown'}
                    </span>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                      style={{ backgroundColor: toParticipant?.color || '#10b981' }}
                    >
                      {toParticipant?.name?.charAt(0).toUpperCase() || 
                       settlement.toName?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </div>

                  <div className="ml-3 px-2 py-1 bg-primary-100 text-primary-700 rounded font-semibold text-sm">
                    ₹{settlement.amount.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 lg:col-span-2">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">Group Contributions</h3>
        </div>

        {contributionTable.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mb-2" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2"/>
            </svg>
            <p className="text-sm text-gray-600">No data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Participant</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Paid</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Share</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Net</th>
                </tr>
              </thead>
              <tbody>
                {contributionTable.map((row) => (
                  <tr key={row._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                          style={{ backgroundColor: row.color || '#10b981' }}
                        >
                          {row.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-700">₹{row.paid.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-sm text-gray-700">₹{row.share.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`flex items-center justify-end gap-1 font-semibold ${row.net >= 0 ? 'text-primary-700' : 'text-red-700'}`}>
                        ₹{Math.abs(row.net).toFixed(2)}
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          {row.net >= 0 ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                          )}
                        </svg>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}