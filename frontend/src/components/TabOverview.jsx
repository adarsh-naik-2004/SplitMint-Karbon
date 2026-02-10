import { useState } from 'react';

export default function TabOverview({
  balances,
  contributionTable,
  activeGroup,
  summary,
  aiSummary,
  aiSummaryError,
  isAiSummaryLoading,
  onGenerateAiSummary
}) {
  const [isAiInfoOpen, setIsAiInfoOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">MintSense AI</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Insights, categorization, and smart settlements</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAiInfoOpen((open) => !open)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/40 rounded-md"
            >
              <span className="text-sm">i</span>
              AI Info
            </button>
            <button
              type="button"
              onClick={onGenerateAiSummary}
              disabled={isAiSummaryLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-500 hover:bg-teal-600 rounded-md disabled:opacity-50"
            >
              {isAiSummaryLoading ? 'Generating...' : 'Generate Summary'}
            </button>
          </div>
        </div>

        {isAiInfoOpen && (
          <div className="mt-3 rounded-lg border border-teal-200 dark:border-teal-500/40 bg-teal-50/60 dark:bg-gray-800/70 p-3 text-xs text-gray-700 dark:text-gray-300 space-y-1">
            <p>✅ Natural language input → structured expense draft.</p>
            <p>✅ Auto-category suggestions are applied in New Entry.</p>
            <p>✅ Readable group summary is generated from Overview.</p>
            <p>✅ Intelligent settlement paths are calculated in balances.</p>
          </div>
        )}

        {(aiSummary || aiSummaryError) && (
          <div className={`mt-3 rounded-lg p-3 text-sm ${aiSummaryError ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}>
            {aiSummaryError || aiSummary}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide">Group Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{summary.totalSpent.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            ↗ Calculated from {activeGroup?.participants.length || 0} participants
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-500/10 dark:bg-teal-500/10 rounded-lg">
              <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide">Your Net Balance</p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                ₹{Math.max(summary.ownerNet, 0).toFixed(2)}
                <span className="text-sm font-normal ml-1">Owed to you</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            ⚡ Real-time settlement calculation
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-teal-500/10 dark:bg-teal-500/10 rounded-lg">
              <svg className="w-5 h-5 text-teal-600 dark:text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide">Pending Settlements</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{balances.settlements.length}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            ⭕ Optimized to minimize transfers
          </p>
        </div>
      </div>

      {/* Net Balances & Smart Settlements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Balances */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Net Balances</h3>
          </div>

          {balances.netBalances.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-gray-400 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {balances.netBalances.map((row) => {
                const participant = activeGroup?.participants.find(
                  (x) => x._id === row.participantId
                );

                return (
                  <div key={row.participantId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                        style={{ backgroundColor: participant?.color || '#10b981' }}
                      >
                        {participant?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {participant?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                        Participant
                      </span>
                    </div>

                    <div className={`flex items-center gap-1.5 font-semibold ${row.net >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}`}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        {row.net >= 0 ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"/>
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"/>
                        )}
                      </svg>
                      <span>₹{Math.abs(row.net).toFixed(2)}</span>
                      <span className="text-xs font-normal">
                        {row.net >= 0 ? 'to receive' : 'to pay'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Smart Settlements */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Settlements</h3>
          </div>

          {balances.settlements.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">Everything is perfectly balanced!</p>
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
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                        style={{ backgroundColor: fromParticipant?.color || '#ef4444' }}
                      >
                        {fromParticipant?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {fromParticipant?.name || 'Unknown'}
                      </span>
                    </div>

                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                    </svg>

                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {toParticipant?.name || 'Unknown'}
                      </span>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                        style={{ backgroundColor: toParticipant?.color || '#10b981' }}
                      >
                        {toParticipant?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    </div>

                    <div className="ml-3 px-3 py-1.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg font-bold text-sm">
                      ₹{settlement.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Group Contributions */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Group Contributions</h3>
        </div>

        {contributionTable.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-gray-400 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">No data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Participant
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Total Paid
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Fair Share
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    Net Position
                  </th>
                </tr>
              </thead>
              <tbody>
                {contributionTable.map((row) => (
                  <tr key={row._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                          style={{ backgroundColor: row.color || '#10b981' }}
                        >
                          {row.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{row.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-sm text-gray-700 dark:text-gray-300">₹{row.paid.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-sm text-gray-700 dark:text-gray-300">₹{row.share.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`flex items-center justify-end gap-1 font-semibold ${row.net >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-red-600 dark:text-red-400'}`}>
                        {row.net >= 0 ? '+' : ''}₹{row.net.toFixed(2)}
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