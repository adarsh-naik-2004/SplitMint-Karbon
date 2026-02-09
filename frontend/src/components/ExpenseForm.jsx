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
    <div className="expense-form">
      <div className="form-header">
        <h3>{editingExpenseId ? '✏️ Edit Expense' : '➕ Add New Expense'}</h3>
        {editingExpenseId && (
          <button onClick={onCancel} className="cancel-edit-btn">
            Cancel
          </button>
        )}
      </div>

      {/* AI Parser - MintSense */}
      <div className="mintsense-section">
        <div className="mintsense-header">
          <span className="ai-badge">✨ MintSense AI</span>
          <small>Type naturally: "Spent 1200 on dinner last night"</small>
        </div>
        <div className="ai-input-group">
          <textarea
            rows={2}
            value={aiText}
            placeholder="Describe your expense in plain language..."
            onChange={(e) => onUpdateAiText(e.target.value)}
            className="ai-textarea"
          />
          <button onClick={onParseAi} className="ai-parse-btn" disabled={!aiText.trim()}>
            Parse
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="form-grid">
        <div className="input-group full-width">
          <label>Description</label>
          <input
            type="text"
            placeholder="What did you spend on?"
            value={expenseDraft.description}
            onChange={(e) => onUpdateDraft((d) => ({ ...d, description: e.target.value }))}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            placeholder="0.00"
            step="0.01"
            value={expenseDraft.amount}
            onChange={(e) => onUpdateDraft((d) => ({ ...d, amount: e.target.value }))}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>Date</label>
          <input
            type="date"
            value={expenseDraft.date}
            onChange={(e) => onUpdateDraft((d) => ({ ...d, date: e.target.value }))}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label>Paid By</label>
          <select
            value={expenseDraft.payerId}
            onChange={(e) => onUpdateDraft((d) => ({ ...d, payerId: e.target.value }))}
            className="input-field"
          >
            {activeGroup.participants.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Split Mode</label>
          <select
            value={expenseDraft.splitMode}
            onChange={(e) => onUpdateDraft((d) => ({ ...d, splitMode: e.target.value }))}
            className="input-field"
          >
            <option value="equal">Equal Split</option>
            <option value="custom">Custom Amount</option>
            <option value="percentage">By Percentage</option>
          </select>
        </div>
      </div>

      {/* Participant Selection */}
      <div className="participants-select">
        <label className="form-label">Split Among</label>
        <div className="participant-chips">
          {activeGroup.participants.map((p) => (
            <label key={p._id} className="participant-chip">
              <input
                type="checkbox"
                checked={expenseDraft.selectedParticipants.includes(p._id)}
                onChange={(e) => {
                  const list = e.target.checked
                    ? [...expenseDraft.selectedParticipants, p._id]
                    : expenseDraft.selectedParticipants.filter((id) => id !== p._id);
                  onUpdateDraft((d) => ({ ...d, selectedParticipants: list }));
                }}
              />
              <span
                className="chip-dot"
                style={{ backgroundColor: p.color || '#22c55e' }}
              />
              <span className="chip-name">{p.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Split Values */}
      {expenseDraft.splitMode !== 'equal' && expenseDraft.selectedParticipants.length > 0 && (
        <div className="custom-splits">
          <label className="form-label">
            {expenseDraft.splitMode === 'percentage' ? 'Percentage Split' : 'Custom Amounts'}
          </label>
          {expenseDraft.selectedParticipants.map((id) => {
            const p = activeGroup.participants.find((x) => x._id === id);
            return (
              <div key={id} className="split-input-row">
                <span className="split-name">
                  <span
                    className="split-dot"
                    style={{ backgroundColor: p.color || '#22c55e' }}
                  />
                  {p?.name}
                </span>
                <input
                  type="number"
                  placeholder={expenseDraft.splitMode === 'percentage' ? '0%' : '₹0.00'}
                  step={expenseDraft.splitMode === 'percentage' ? '1' : '0.01'}
                  value={expenseDraft.customValues[id] || ''}
                  onChange={(e) => onUpdateSplitValue(id, Number(e.target.value))}
                  className="split-input"
                />
              </div>
            );
          })}
        </div>
      )}

      <button onClick={onSave} className="save-expense-btn">
        {editingExpenseId ? 'Update Expense' : 'Add Expense'}
      </button>
    </div>
  );
}