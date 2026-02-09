import { useEffect, useMemo, useState } from 'react';
import { api } from './services/api';
import AuthScreen from './components/AuthScreen';
import Dashboard from './components/Dashboard';
import GroupSidebar from './components/GroupSidebar';
import ExpenseForm from './components/ExpenseForm';
import BalanceOverview from './components/BalanceOverview';
import ExpenseList from './components/ExpenseList';

const defaultExpense = {
  description: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  payerId: '',
  splitMode: 'equal',
  selectedParticipants: [],
  customValues: {}
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState('');
  const [groupDraft, setGroupDraft] = useState({ 
    name: '', 
    participants: [{ name: '', color: '#22c55e', avatar: '' }] 
  });

  const [filters, setFilters] = useState({ 
    q: '', 
    participant: '', 
    minAmount: '', 
    maxAmount: '', 
    fromDate: '', 
    toDate: '' 
  });
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({ net: [], settlements: [] });
  const [expenseDraft, setExpenseDraft] = useState(defaultExpense);
  const [editingExpenseId, setEditingExpenseId] = useState('');
  const [aiText, setAiText] = useState('');

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
    setExpenses(data);
  }

  async function saveGroup() {
    const participants = groupDraft.participants.filter((p) => p.name.trim()).slice(0, 3);
    if (!groupDraft.name.trim()) return;

    if (activeGroup) {
      const payload = {
        name: groupDraft.name,
        participants: participants.map((p) => ({ 
          _id: p._id, 
          name: p.name, 
          color: p.color, 
          avatar: p.avatar 
        }))
      };
      await api.updateGroup(activeGroupId, payload);
    } else {
      await api.createGroup({ name: groupDraft.name, participants });
    }

    await loadGroups();
    resetGroupDraft();
  }

  function resetGroupDraft() {
    setGroupDraft({ name: '', participants: [{ name: '', color: '#22c55e', avatar: '' }] });
  }

  function editGroup(group) {
    setActiveGroupId(group._id);
    setGroupDraft({
      name: group.name,
      participants: group.participants.slice(1).map((p) => ({ 
        _id: p._id, 
        name: p.name, 
        color: p.color || '#22c55e', 
        avatar: p.avatar || '' 
      }))
    });
  }

  async function removeGroup(id) {
    if (!confirm('Delete this group and all its expenses?')) return;
    await api.deleteGroup(id);
    setActiveGroupId('');
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
      customValues: Object.fromEntries(exp.splits.map((s) => [s.participantId, s.amount]))
    });
  }

  async function removeExpense(id) {
    if (!confirm('Delete this expense?')) return;
    await api.deleteExpense(id);
    await loadExpenses();
    setBalances(await api.balances(activeGroupId));
  }

  async function parseAi() {
    const result = await api.parseExpense({ text: aiText });
    setExpenseDraft((d) => ({ 
      ...d, 
      description: result.draft.description || d.description, 
      amount: result.draft.amount || d.amount, 
      date: result.draft.date || d.date 
    }));
    setAiText('');
  }

  const summary = useMemo(() => {
    const totalSpent = expenses.reduce((a, e) => a + e.amount, 0);
    const ownerId = activeGroup?.participants?.[0]?._id;
    const ownerNet = balances.net.find((n) => n.participantId === ownerId)?.net || 0;
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
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuth={setUser} />;
  }

  return (
    <div className="app">
      <Dashboard 
        summary={summary} 
        user={user}
        onLogout={() => api.logout().then(() => setUser(null))}
      />

      <div className="main-container">
        <GroupSidebar
          groups={groups}
          activeGroupId={activeGroupId}
          groupDraft={groupDraft}
          activeGroup={activeGroup}
          onSelectGroup={setActiveGroupId}
          onEditGroup={editGroup}
          onRemoveGroup={removeGroup}
          onUpdateDraft={setGroupDraft}
          onSaveGroup={saveGroup}
        />

        <main className="content">
          {activeGroup ? (
            <>
              <ExpenseForm
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
                }}
                onParseAi={parseAi}
                onUpdateAiText={setAiText}
              />

              <BalanceOverview
                balances={balances}
                contributionTable={contributionTable}
                activeGroup={activeGroup}
              />

              <ExpenseList
                expenses={expenses}
                filters={filters}
                activeGroup={activeGroup}
                onUpdateFilters={setFilters}
                onApplyFilters={loadExpenses}
                onEditExpense={startEditExpense}
                onRemoveExpense={removeExpense}
              />
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h2>No Group Selected</h2>
              <p>Create or select a group to start tracking expenses</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}