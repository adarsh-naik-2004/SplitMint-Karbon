import { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { api } from './services/api';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import GroupSidebar from './components/GroupSidebar';
import TabOverview from './components/TabOverview';
import TabTransactions from './components/TabTransactions';
import TabNewEntry from './components/TabNewEntry';

const defaultExpense = {
  description: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  payerId: '',
  splitMode: 'equal',
  selectedParticipants: [],
  customValues: {},
  category: 'uncategorized'
};

const navTabs = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'transactions', label: 'Transactions' },
  { id: 'new', label: 'New Entry' }
];

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState('');
  const [groupDraft, setGroupDraft] = useState({
    name: '',
    participants: [{ name: '', color: '#10b981', avatar: '' }]
  });
  const [editingGroupId, setEditingGroupId] = useState('');

  const [filters, setFilters] = useState({
    q: '',
    participant: '',
    minAmount: '',
    maxAmount: '',
    fromDate: '',
    toDate: ''
  });
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({ netBalances: [], settlements: [], summary: null });
  const [expenseDraft, setExpenseDraft] = useState(defaultExpense);
  const [editingExpenseId, setEditingExpenseId] = useState('');
  const [aiText, setAiText] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState('');

  const activeGroup = groups.find((g) => g._id === activeGroupId);

  useEffect(() => {
    api.me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    loadGroups();
  }, [user]);

  useEffect(() => {
    if (!activeGroupId) return;
    loadExpenses();
    api.balances(activeGroupId).then(setBalances);
    setAiSummary('');
    setAiSummaryError('');
  }, [activeGroupId]);

  useEffect(() => {
    if (!activeGroup) return;
    setExpenseDraft((d) => ({
      ...d,
      payerId: d.payerId || activeGroup.participants[0]?._id,
      selectedParticipants: d.selectedParticipants.length
        ? d.selectedParticipants
        : activeGroup.participants.map((p) => p._id)
    }));
  }, [activeGroupId, groups.length]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  async function loadGroups() {
    const data = await api.groups();
    setGroups(data);
    if (!activeGroupId && data[0]) setActiveGroupId(data[0]._id);
  }

  async function loadExpenses() {
    const params = {
      groupId: activeGroupId,
      ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''))
    };
    const data = await api.expenses(params);
    setExpenses(data.expenses);
  }

  async function saveGroup() {
    const participants = groupDraft.participants
      .filter((p) => p.name.trim())
      .slice(0, 3);

    if (!groupDraft.name.trim()) {
      alert('Please enter a group name');
      return;
    }

    try {
      if (editingGroupId) {
        const payload = {
          name: groupDraft.name,
          participants: participants.map((p) => ({
            _id: p._id,
            name: p.name,
            color: p.color,
            avatar: p.avatar
          }))
        };
        await api.updateGroup(editingGroupId, payload);
      } else {
        const payload = {
          name: groupDraft.name,
          participants: participants.map((p) => ({
            name: p.name,
            color: p.color || '#10b981',
            avatar: p.avatar || ''
          }))
        };
        await api.createGroup(payload);
      }

      await loadGroups();
      resetGroupDraft();
    } catch (error) {
      alert(error.message || 'Failed to save group');
    }
  }

  function resetGroupDraft() {
    setGroupDraft({ name: '', participants: [{ name: '', color: '#10b981', avatar: '' }] });
    setEditingGroupId('');
  }

  function editGroup(group) {
    setEditingGroupId(group._id);
    setActiveGroupId(group._id);
    setGroupDraft({
      name: group.name,
      participants: group.participants.slice(1).map((p) => ({
        _id: p._id,
        name: p.name,
        color: p.color || '#10b981',
        avatar: p.avatar || ''
      }))
    });
  }

  async function removeGroup(id) {
    if (!confirm('Delete this group and all its expenses?')) return;
    await api.deleteGroup(id);
    setActiveGroupId('');
    resetGroupDraft();
    await loadGroups();
  }

  function updateSplitValue(participantId, value) {
    setExpenseDraft((d) => ({
      ...d,
      customValues: { ...d.customValues, [participantId]: value }
    }));
  }

  async function saveExpense() {
    const payload = {
      ...expenseDraft,
      groupId: activeGroupId,
      amount: Number(expenseDraft.amount)
    };

    if (editingExpenseId) {
      await api.updateExpense(editingExpenseId, payload);
    } else {
      await api.createExpense(payload);
    }

    setEditingExpenseId('');
    setExpenseDraft(defaultExpense);
    await loadExpenses();
    setBalances(await api.balances(activeGroupId));
    setActiveTab('overview');
  }

  function startEditExpense(exp) {
    setEditingExpenseId(exp._id);
    setExpenseDraft({
      description: exp.description,
      amount: exp.amount,
      date: new Date(exp.date).toISOString().slice(0, 10),
      payerId: exp.payerId,
      splitMode: exp.splitMode,
      selectedParticipants: exp.splits.map((s) => s.participantId),
      customValues: Object.fromEntries(exp.splits.map((s) => [s.participantId, s.amount])),
      category: exp.category || 'uncategorized'
    });
    setActiveTab('new');
  }

  async function removeExpense(id) {
    if (!confirm('Delete this expense?')) return;
    await api.deleteExpense(id);
    await loadExpenses();
    setBalances(await api.balances(activeGroupId));
  }

  async function parseAi() {
    if (!aiText.trim()) return;

    try {
      const result = await api.parseExpense({ text: aiText });

      if (result.note) {
        alert(result.note);
      }

      setExpenseDraft((d) => ({
        ...d,
        description: result.draft.description || d.description,
        amount: result.draft.amount || d.amount,
        date: result.draft.date || d.date,
        category: result.draft.category || d.category || 'uncategorized'
      }));
      setAiText('');
    } catch (error) {
      alert(error.message || 'AI parsing failed. Please enter details manually.');
    }
  }

  async function generateAiSummary() {
    if (!activeGroup || expenses.length === 0) {
      setAiSummary('No expenses yet. Add a few entries to generate an AI summary.');
      setAiSummaryError('');
      return;
    }

    setIsAiSummaryLoading(true);
    setAiSummaryError('');

    try {
      const result = await api.generateSummary({
        groupName: activeGroup.name,
        expenses: expenses.map((expense) => ({
          description: expense.description,
          amount: expense.amount,
          date: new Date(expense.date).toISOString().slice(0, 10),
          category: expense.category || 'uncategorized'
        }))
      });

      setAiSummary(result.summary || 'No summary returned.');
    } catch (error) {
      setAiSummaryError(error.message || 'Failed to generate AI summary.');
    } finally {
      setIsAiSummaryLoading(false);
    }
  }


  const summary = useMemo(() => {
    const totalSpent = expenses.reduce((a, e) => a + e.amount, 0);
    const ownerId = activeGroup?.participants?.[0]?._id;
    const ownerNet = balances.netBalances.find((n) => n.participantId === ownerId)?.net || 0;
    return { totalSpent, ownerNet };
  }, [expenses, balances, activeGroupId]);

  const contributionTable = useMemo(() => {
    if (!activeGroup) return [];
    return activeGroup.participants.map((p) => {
      const paid = expenses.filter((e) => e.payerId === p._id).reduce((a, e) => a + e.amount, 0);
      const share = expenses.reduce((a, e) =>
        a + (e.splits.find((s) => s.participantId === p._id)?.amount || 0), 0
      );
      return { ...p, paid, share, net: paid - share };
    });
  }, [activeGroup, expenses]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-teal-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-gray-400">Loading SplitMint...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuth={setUser} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header
        summary={summary}
        user={user}
        activeGroup={activeGroup}
        onLogout={() => api.logout().then(() => setUser(null))}
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        <div className="lg:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800 dark:text-gray-100"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span>Menu</span>
            <svg
              className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isMobileMenuOpen && (
            <div id="mobile-navigation" className="px-4 pb-4 space-y-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-1 flex gap-1">
                {navTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-teal-500 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <GroupSidebar
                groups={groups}
                activeGroupId={activeGroupId}
                groupDraft={groupDraft}
                editingGroupId={editingGroupId}
                onSelectGroup={setActiveGroupId}
                onEditGroup={editGroup}
                onRemoveGroup={removeGroup}
                onUpdateDraft={setGroupDraft}
                onSaveGroup={saveGroup}
                onCancelEdit={resetGroupDraft}
                className="w-full border rounded-xl border-gray-200 dark:border-gray-700"
              />
            </div>
          )}
        </div>

        <GroupSidebar
          groups={groups}
          activeGroupId={activeGroupId}
          groupDraft={groupDraft}
          editingGroupId={editingGroupId}
          onSelectGroup={setActiveGroupId}
          onEditGroup={editGroup}
          onRemoveGroup={removeGroup}
          onUpdateDraft={setGroupDraft}
          onSaveGroup={saveGroup}
          onCancelEdit={resetGroupDraft}
          className="hidden lg:block"
        />

        <main className="flex-1 overflow-y-auto">
          {activeGroup ? (
            <div className="max-w-7xl mx-auto">
              <div className="hidden lg:block sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                <div className="flex px-4 lg:px-6">
                  {navTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 lg:p-6">
                {activeTab === 'overview' && (
                  <TabOverview
                    balances={balances}
                    contributionTable={contributionTable}
                    activeGroup={activeGroup}
                    summary={summary}
                    aiSummary={aiSummary}
                    aiSummaryError={aiSummaryError}
                    isAiSummaryLoading={isAiSummaryLoading}
                    onGenerateAiSummary={generateAiSummary}
                  />
                )}

                {activeTab === 'transactions' && (
                  <TabTransactions
                    expenses={expenses}
                    filters={filters}
                    activeGroup={activeGroup}
                    onUpdateFilters={setFilters}
                    onApplyFilters={loadExpenses}
                    onEditExpense={startEditExpense}
                    onRemoveExpense={removeExpense}
                  />
                )}

                {activeTab === 'new' && (
                  <TabNewEntry
                    expenseDraft={expenseDraft}
                    editingExpenseId={editingExpenseId}
                    activeGroup={activeGroup}
                    aiText={aiText}
                    onUpdateDraft={setExpenseDraft}
                    onUpdateSplitValue={updateSplitValue}
                    onSave={saveExpense}
                    onCancel={() => {
                      setEditingExpenseId('');
                      setExpenseDraft(defaultExpense);
                      setActiveTab('overview');
                    }}
                    onParseAi={parseAi}
                    onUpdateAiText={setAiText}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" opacity="0.2" />
                <path d="M20 32h24M32 20v24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Group Selected</h2>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Create or select a group from the menu to start tracking expenses
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
