export default function GroupSidebar({
  groups,
  activeGroupId,
  groupDraft,
  activeGroup,
  onSelectGroup,
  onEditGroup,
  onRemoveGroup,
  onUpdateDraft,
  onSaveGroup
}) {
  const isEditing = activeGroup && groupDraft.name;

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="section-title">
          <span className="title-icon">👥</span>
          Your Groups
        </h3>
        
        <div className="groups-list">
          {groups.length === 0 ? (
            <div className="empty-groups">
              <p>No groups yet</p>
              <small>Create your first group below</small>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group._id}
                className={`group-item ${activeGroupId === group._id ? 'active' : ''}`}
              >
                <button
                  className="group-name"
                  onClick={() => onSelectGroup(group._id)}
                >
                  <span className="group-icon">
                    {group.participants.slice(0, 2).map((p, i) => (
                      <span
                        key={i}
                        className="participant-dot"
                        style={{ backgroundColor: p.color || '#22c55e' }}
                      />
                    ))}
                  </span>
                  <span className="name-text">{group.name}</span>
                  <span className="participant-count">
                    {group.participants.length}
                  </span>
                </button>
                
                <div className="group-actions">
                  <button
                    onClick={() => onEditGroup(group)}
                    className="icon-btn"
                    title="Edit group"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onRemoveGroup(group._id)}
                    className="icon-btn danger"
                    title="Delete group"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">
          {isEditing ? '✏️ Edit Group' : '➕ Create Group'}
        </h3>

        <div className="group-form">
          <input
            type="text"
            placeholder="Group name (e.g., Trip to Goa)"
            value={groupDraft.name}
            onChange={(e) => onUpdateDraft((d) => ({ ...d, name: e.target.value }))}
            className="input-field"
          />

          <div className="participants-section">
            <label className="form-label">Participants (max 3)</label>
            {groupDraft.participants.map((participant, index) => (
              <div key={index} className="participant-input">
                <input
                  type="text"
                  placeholder={`Participant ${index + 1}`}
                  value={participant.name}
                  onChange={(e) => {
                    const next = [...groupDraft.participants];
                    next[index] = { ...next[index], name: e.target.value };
                    onUpdateDraft((d) => ({ ...d, participants: next }));
                  }}
                  className="input-field"
                />
                <input
                  type="color"
                  value={participant.color || '#22c55e'}
                  onChange={(e) => {
                    const next = [...groupDraft.participants];
                    next[index] = { ...next[index], color: e.target.value };
                    onUpdateDraft((d) => ({ ...d, participants: next }));
                  }}
                  className="color-picker"
                  title="Choose color"
                />
              </div>
            ))}

            {groupDraft.participants.length < 3 && (
              <button
                onClick={() =>
                  onUpdateDraft((d) => ({
                    ...d,
                    participants: [
                      ...d.participants,
                      { name: '', color: '#f59e0b', avatar: '' }
                    ]
                  }))
                }
                className="add-participant-btn"
              >
                + Add Participant
              </button>
            )}
          </div>

          <button onClick={onSaveGroup} className="save-group-btn">
            {isEditing ? 'Update Group' : 'Create Group'}
          </button>
        </div>
      </div>
    </aside>
  );
}