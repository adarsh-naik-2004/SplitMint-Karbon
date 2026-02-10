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
    <aside className="w-full lg:w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto hidden lg:block">
      <div className="p-4 lg:p-6 space-y-6">
        {/* Groups List */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
              Your Groups
            </h2>
          </div>

          <div className="space-y-2">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-gray-400 dark:text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No groups yet</p>
                <span className="text-xs text-gray-500 dark:text-gray-500">Create your first group below</span>
              </div>
            ) : (
              groups.map((group) => (
                <div
                  key={group._id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    activeGroupId === group._id
                      ? 'bg-teal-500/10 dark:bg-teal-500/10 border-teal-500 dark:border-teal-500'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <button
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    onClick={() => onSelectGroup(group._id)}
                  >
                    <div className="flex -space-x-2">
                      {group.participants.slice(0, 3).map((p, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white border-2 border-white dark:border-gray-900"
                          style={{ backgroundColor: p.color || '#10b981' }}
                        >
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {group.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {group.participants.length} members
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditGroup(group)}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded transition-colors"
                      title="Edit group"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => onRemoveGroup(group._id)}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                      title="Delete group"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Create/Edit Group */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            {isEditing ? (
              <>
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                  Edit Group
                </h3>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                </svg>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                  New Group
                </h3>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="group-name" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
                Group Name
              </label>
              <input
                id="group-name"
                type="text"
                placeholder="Ex: Trip to Iceland"
                value={groupDraft.name}
                onChange={(e) => onUpdateDraft((d) => ({ ...d, name: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-500 focus:border-transparent transition-shadow text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                Participants
              </label>
              <div className="space-y-2">
                {groupDraft.participants.map((participant, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Name`}
                      value={participant.name}
                      onChange={(e) => {
                        const next = [...groupDraft.participants];
                        next[index] = { ...next[index], name: e.target.value };
                        onUpdateDraft((d) => ({ ...d, participants: next }));
                      }}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-500 focus:border-transparent transition-shadow text-gray-900 dark:text-white placeholder-gray-500"
                    />
                    <input
                      type="color"
                      value={participant.color || '#10b981'}
                      onChange={(e) => {
                        const next = [...groupDraft.participants];
                        next[index] = { ...next[index], color: e.target.value };
                        onUpdateDraft((d) => ({ ...d, participants: next }));
                      }}
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 dark:border-gray-700 cursor-pointer bg-gray-50 dark:bg-gray-800"
                      title="Choose color"
                    />
                  </div>
                ))}
              </div>

              {groupDraft.participants.length < 3 && (
                <button
                  type="button"
                  onClick={() =>
                    onUpdateDraft((d) => ({
                      ...d,
                      participants: [
                        ...d.participants,
                        { name: '', color: '#f59e0b', avatar: '' }
                      ]
                    }))
                  }
                  className="mt-2 flex items-center gap-2 px-3 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-lg transition-colors w-full justify-center"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add Participant
                </button>
              )}
            </div>

            <button
              onClick={onSaveGroup}
              className="w-full py-2.5 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all shadow-lg hover:shadow-xl"
            >
              {isEditing ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}