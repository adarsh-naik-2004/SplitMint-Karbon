export default function ExpenseList({
  expenses,
  filters,
  activeGroup,
  onUpdateFilters,
  onApplyFilters,
  onEditExpense,
  onRemoveExpense
}) {
  return (
    <div className="expense-list">
      <div className="list-header">
        <h3>📝 Transaction History</h3>
        <span className="expense-count">{expenses.length} expenses</span>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <input
            type="text"
            placeholder="🔍 Search description..."
            value={filters.q}
            onChange={(e) => onUpdateFilters((f) => ({ ...f, q: e.target.value }))}
            className="filter-input"
          />
          
          <select
            value={filters.participant}
            onChange={(e) => onUpdateFilters((f) => ({ ...f, participant: e.target.value }))}
            className="filter-input"
          >
            <option value="">All Participants</option>
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
            className="filter-input"
          />

          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxAmount}
            onChange={(e) => onUpdateFilters((f) => ({ ...f, maxAmount: e.target.value }))}
            className="filter-input"
          />

          <input
            type="date"
            placeholder="From Date"
            value={filters.fromDate}
            onChange={(e) => onUpdateFilters((f) => ({ ...f, fromDate: e.target.value }))}
            className="filter-input"
          />

          <input
            type="date"
            placeholder="To Date"
            value={filters.toDate}
            onChange={(e) => onUpdateFilters((f) => ({ ...f, toDate: e.target.value }))}
            className="filter-input"
          />
        </div>

        <button onClick={onApplyFilters} className="apply-filters-btn">
          Apply Filters
        </button>
      </div>

      {/* Expense Items */}
      <div className="expenses-container">
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💸</div>
            <p>No expenses found</p>
            <small>Add your first expense above</small>
          </div>
        ) : (
          <div className="expenses-grid">
            {expenses.map((expense) => {
              const payer = activeGroup?.participants.find(
                (p) => p._id === expense.payerId
              );
              
              return (
                <div key={expense._id} className="expense-item">
                  <div className="expense-main">
                    <div className="expense-info">
                      <div className="expense-description">
                        {expense.description}
                      </div>
                      <div className="expense-meta">
                        <span className="expense-date">
                          📅 {new Date(expense.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="expense-split-mode">
                          {expense.splitMode === 'equal' && '⚖️ Equal'}
                          {expense.splitMode === 'custom' && '🎯 Custom'}
                          {expense.splitMode === 'percentage' && '📊 Percentage'}
                        </span>
                      </div>
                      <div className="expense-payer">
                        <span
                          className="payer-dot"
                          style={{ backgroundColor: payer?.color || '#22c55e' }}
                        />
                        <span className="payer-text">
                          Paid by {payer?.name || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div className="expense-actions">
                      <div className="expense-amount">
                        ₹{expense.amount.toFixed(2)}
                      </div>
                      <div className="action-buttons">
                        <button
                          onClick={() => onEditExpense(expense)}
                          className="action-btn edit"
                          title="Edit expense"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => onRemoveExpense(expense._id)}
                          className="action-btn delete"
                          title="Delete expense"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Splits breakdown */}
                  <div className="expense-splits">
                    {expense.splits.map((split) => {
                      const participant = activeGroup?.participants.find(
                        (p) => p._id === split.participantId
                      );
                      return (
                        <div key={split.participantId} className="split-item">
                          <span
                            className="split-indicator"
                            style={{
                              backgroundColor: participant?.color || '#22c55e'
                            }}
                          />
                          <span className="split-participant">
                            {participant?.name || 'Unknown'}
                          </span>
                          <span className="split-amount">
                            ₹{split.amount.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}