import { useState } from 'react';

export default function TabNewEntry({
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
  const [isAiHelpOpen, setIsAiHelpOpen] = useState(false);

  return (
    <div className="max-w-4xl">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Record Transaction
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Keep your team's balances up to date
            </p>
          </div>
          {editingExpenseId && (
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Cancel
            </button>
          )}
        </div>

        {/* MintSense AI */}
        <div className="bg-gradient-to-br from-teal-500/10 to-teal-600/5 border border-teal-500/30 dark:border-teal-500/30 rounded-lg p-4 mb-6">
          <div className="flex flex-col gap-3 mb-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-500 text-white text-xs font-bold rounded uppercase tracking-wide">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                Mintsense AI
              </div>
              <button
                type="button"
                onClick={() => setIsAiHelpOpen((open) => !open)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-white/70 dark:bg-gray-800/70 border border-teal-500/30 rounded-md hover:bg-white dark:hover:bg-gray-800"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9a3.5 3.5 0 116.544 2c-.657 1.313-1.772 1.875-2.507 2.515-.452.394-.765.85-.765 1.485M12 17h.01"/>
                </svg>
                AI Help
              </button>
            </div>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              Type naturally: "Spent 1200 on dinner at Olive Garden yesterday"
            </p>
          </div>

          {isAiHelpOpen && (
            <div className="mb-3 rounded-lg border border-teal-500/30 bg-white/70 dark:bg-gray-900/60 p-3 text-xs text-gray-700 dark:text-gray-300 space-y-2">
              <p className="font-semibold text-gray-900 dark:text-white">MintSense AI features</p>
              <ul className="space-y-1">
                <li>✅ Convert natural language into structured expense drafts.</li>
                <li>✅ Auto-categorize expense types (food, transport, utilities, etc.).</li>
                <li>✅ Generate readable group summaries from Dashboard Overview.</li>
                <li>✅ Suggest intelligent settlement paths in balances.</li>
              </ul>
              <p className="font-semibold text-gray-900 dark:text-white">How to write prompts</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Mention amount, description, and date in one sentence.</li>
                <li>Use words like <span className="font-semibold">today</span>, <span className="font-semibold">yesterday</span>, or exact dates (e.g. 2026-02-10).</li>
                <li>You can write mixed language or short notes; AI will still try to understand.</li>
              </ul>
              <p className="font-semibold text-gray-900 dark:text-white">Example prompts</p>
              <ul className="space-y-1">
                <li>• "Paid 850 for groceries today"</li>
                <li>• "Uber ride 230 on 2026-02-10"</li>
                <li>• "Dinner at BBQ Nation yesterday 1800"</li>
              </ul>
              <p>After parsing, verify category, participants, and split mode before saving.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              rows={2}
              value={aiText}
              placeholder="Describe your expense in plain language..."
              onChange={(e) => onUpdateAiText(e.target.value)}
              className="flex-1 px-3 py-2 border border-teal-500/30 dark:border-teal-500/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500"
            />
            <button
              onClick={onParseAi}
              disabled={!aiText.trim()}
              className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Parse
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div>
            <label htmlFor="description" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Description
            </label>
            <input
              id="description"
              type="text"
              placeholder="What was this for?"
              value={expenseDraft.description}
              onChange={(e) => onUpdateDraft((d) => ({ ...d, description: e.target.value }))}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                  ₹
                </span>
                <input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={expenseDraft.amount}
                  onChange={(e) => onUpdateDraft((d) => ({ ...d, amount: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={expenseDraft.date}
                onChange={(e) => onUpdateDraft((d) => ({ ...d, date: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="payer" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Paid By
              </label>
              <select
                id="payer"
                value={expenseDraft.payerId}
                onChange={(e) => onUpdateDraft((d) => ({ ...d, payerId: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                {activeGroup.participants.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="split-mode" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Split Mode
              </label>
              <select
                id="split-mode"
                value={expenseDraft.splitMode}
                onChange={(e) => onUpdateDraft((d) => ({ ...d, splitMode: e.target.value }))}
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
              >
                <option value="equal">Equal</option>
                <option value="custom">Custom Amount</option>
                <option value="percentage">By Percentage</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Category
            </label>
            <select
              id="category"
              value={expenseDraft.category || 'uncategorized'}
              onChange={(e) => onUpdateDraft((d) => ({ ...d, category: e.target.value }))}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
            >
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="entertainment">Entertainment</option>
              <option value="utilities">Utilities</option>
              <option value="shopping">Shopping</option>
              <option value="healthcare">Healthcare</option>
              <option value="other">Other</option>
              <option value="uncategorized">Uncategorized</option>
            </select>
          </div>
        </div>

        {/* Split Among */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Split Among
          </label>
          <div className="flex flex-wrap gap-2">
            {activeGroup.participants.map((p) => (
              <label
                key={p._id}
                className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg cursor-pointer transition-all ${
                  expenseDraft.selectedParticipants.includes(p._id)
                    ? 'border-teal-500 bg-teal-500/10 dark:bg-teal-500/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
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
                  className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500"
                />
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                  style={{ backgroundColor: p.color || '#10b981' }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {p.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Split Values */}
        {expenseDraft.splitMode !== 'equal' && expenseDraft.selectedParticipants.length > 0 && (
          <div className="mb-6">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
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
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {p?.name}
                      </span>
                    </div>
                    <div className="relative w-32">
                      <input
                        type="number"
                        placeholder={expenseDraft.splitMode === 'percentage' ? '0' : '0.00'}
                        step={expenseDraft.splitMode === 'percentage' ? '1' : '0.01'}
                        value={expenseDraft.customValues[id] || ''}
                        onChange={(e) => onUpdateSplitValue(id, Number(e.target.value))}
                        className="w-full pr-8 pl-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 dark:text-white"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                        {expenseDraft.splitMode === 'percentage' ? '%' : '₹'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={onSave}
          className="w-full py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
          </svg>
          {editingExpenseId ? 'Update Transaction' : 'Save Transaction'}
        </button>
      </div>
    </div>
  );
}