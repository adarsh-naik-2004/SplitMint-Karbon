export default function TabTransactions({
  expenses,
  filters,
  activeGroup,
  onUpdateFilters,
  onApplyFilters,
  onEditExpense,
  onRemoveExpense
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History</h3>
          </div>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
            {expenses.length} {expenses.length === 1 ? 'record' : 'records'} found
          </span>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text"
              placeholder="Search descriptions..."
              value={filters.q}
              onChange={(e) => onUpdateFilters((f) => ({ ...f, q: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          <select
            value={filters.participant}
            onChange={(e) => onUpdateFilters((f) => ({ ...f, participant: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-gray-900 dark:text-white"
          >
            <option value="">All Members</option>
            {activeGroup?.participants.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minAmount}
            onChange={(e) => onUpdateFilters((f) => ({ ...f, minAmount: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500"
          />

          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxAmount}
            onChange={(e) => onUpdateFilters((f) => ({ ...f, maxAmount: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500"
          />

          <input
            type="date"
            placeholder="DD-MM-YYYY"
            value={filters.fromDate}
            onChange={(e) => onUpdateFilters((f) => ({ ...f, fromDate: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-gray-900 dark:text-white"
          />

          <input
            type="date"
            placeholder="DD-MM-YYYY"
            value={filters.toDate}
            onChange={(e) => onUpdateFilters((f) => ({ ...f, toDate: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm text-gray-900 dark:text-white"
          />
        </div>

        <button
          onClick={onApplyFilters}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-colors text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
          </svg>
          Filter
        </button>

        {/* Expense List */}
        <div className="mt-6">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">No transactions found</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Adjust your filters or add a new expense to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const payer = activeGroup?.participants.find(
                  (p) => p._id === expense.payerId
                );

                return (
                  <div key={expense._id} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-md dark:hover:shadow-teal-500/5 transition-shadow bg-white dark:bg-gray-800/50">
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {expense.description}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                              </svg>
                              {new Date(expense.date).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium uppercase tracking-wide">
                              {expense.splitMode}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                              style={{ backgroundColor: payer?.color || '#10b981' }}
                            >
                              {payer?.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Paid by <span className="font-medium text-gray-900 dark:text-white">{payer?.name || 'Unknown'}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            ₹{expense.amount.toFixed(2)}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditExpense(expense)}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded transition-colors"
                              title="Edit expense"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => onRemoveExpense(expense._id)}
                              className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                              title="Delete expense"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Splits */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-wrap gap-3">
                        {expense.splits.map((split) => {
                          const participant = activeGroup?.participants.find(
                            (p) => p._id === split.participantId
                          );
                          return (
                            <div key={split.participantId} className="flex items-center gap-2">
                              <div
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
                                style={{ backgroundColor: participant?.color || '#10b981' }}
                              >
                                {participant?.name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {participant?.name || 'Unknown'}
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                ₹{split.amount.toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}