export default function ExpenseForm({
  expenseDraft,
  editingExpenseId,
  activeGroup,
  aiText,
  onUpdateDraft,
  onUpdateSplitValue,
  onSave,
  onCancel,
  onParseAi,
  onUpdateAiText
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {editingExpenseId ? (
            <>
              <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Edit Expense</h2>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Add New Expense</h2>
            </>
          )}
        </div>
        {editingExpenseId && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Cancel
          </button>
        )}
      </div>

      <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            MintSense AI
          </div>
          <p className="text-xs text-gray-700">Type naturally: "Spent 1200 on dinner last night"</p>
        </div>
        <div className="flex gap-2">
          <textarea
            rows={2}
            value={aiText}
            placeholder="Describe your expense in plain language..."
            onChange={(e) => onUpdateAiText(e.target.value)}
            className="flex-1 px-3 py-2 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm"
          />
          <button
            onClick={onParseAi}
            disabled={!aiText.trim()}
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Parse
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="sm:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <input
            id="description"
            type="text"
            placeholder="What did you spend on?"
            value={expenseDraft.description}
            onChange={(e) => onUpdateDraft((d) => ({ ...d, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1.5">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
            <input
              id="amount"
              type="number"
              placeholder="0.00"
              step="0.01"
              value={expenseDraft.amount}
              onChange={(e) => onUpdateDraft((d) => ({ ...d, amount: e.target.value }))}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1.5">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={expenseDraft.date}
            onChange={(e) => onUpdateDraft((d) => ({ ...d, date: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="payer" className="block text-sm font-medium text-gray-700 mb-1.5">
            Paid By
          </label>
          <select
            id="payer"
            value={expenseDraft.payerId}
            onChange={(e) => onUpdateDraft((d) => ({ ...d, payerId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            {activeGroup.participants.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="split-mode" className="block text-sm font-medium text-gray-700 mb-1.5">
            Split Mode
          </label>
          <select
            id="split-mode"
            value={expenseDraft.splitMode}
            onChange={(e) => onUpdateDraft((d) => ({ ...d, splitMode: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            <option value="equal">Equal Split</option>
            <option value="custom">Custom Amount</option>
            <option value="percentage">By Percentage</option>
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Split Among
        </label>
        <div className="flex flex-wrap gap-2">
          {activeGroup.participants.map((p) => (
            <label
              key={p._id}
              className="flex items-center gap-2 px-3 py-2 border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-primary-300 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50"
            >
              <input
                type="checkbox"
                checked={expenseDraft.selectedParticipants.includes(p._id)}
                onChange={(e) => {
                  const list = e.target.checked
                    ? [...expenseDraft.selectedParticipants, p._id]
                    : expenseDraft.selectedParticipants.filter((id) => id !== p._id);
                  onUpdateDraft((d) => ({ ...d, selectedParticipants: list }));
                }}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                style={{ backgroundColor: p.color || '#10b981' }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700">{p.name}</span>
            </label>
          ))}
        </div>
      </div>

      {expenseDraft.splitMode !== 'equal' && expenseDraft.selectedParticipants.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {expenseDraft.splitMode === 'percentage' ? 'Percentage Split' : 'Custom Amounts'}
          </label>
          <div className="space-y-2">
            {expenseDraft.selectedParticipants.map((id) => {
              const p = activeGroup.participants.find((x) => x._id === id);
              return (
                <div key={id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                      style={{ backgroundColor: p.color || '#10b981' }}
                    >
                      {p?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{p?.name}</span>
                  </div>
                  <div className="relative w-32">
                    <input
                      type="number"
                      placeholder={expenseDraft.splitMode === 'percentage' ? '0' : '0.00'}
                      step={expenseDraft.splitMode === 'percentage' ? '1' : '0.01'}
                      value={expenseDraft.customValues[id] || ''}
                      onChange={(e) => onUpdateSplitValue(id, Number(e.target.value))}
                      className="w-full pr-8 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                      {expenseDraft.splitMode === 'percentage' ? '%' : '₹'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={onSave}
        className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
        </svg>
        {editingExpenseId ? 'Update Expense' : 'Add Expense'}
      </button>
    </div>
  );
}