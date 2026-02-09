import { useEffect, useMemo, useState } from 'react';
import { api } from './services/api';

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
  const [mode, setMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState('');
  const [groupDraft, setGroupDraft] = useState({ name: '', participants: [{ name: '', color: '#22c55e', avatar: '' }] });

  const [filters, setFilters] = useState({ q: '', participant: '', minAmount: '', maxAmount: '', fromDate: '', toDate: '' });
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({ net: [], settlements: [] });
  const [expenseDraft, setExpenseDraft] = useState(defaultExpense);
  const [editingExpenseId, setEditingExpenseId] = useState('');
  const [aiText, setAiText] = useState('');

  const activeGroup = groups.find((g) => g._id === activeGroupId);

  useEffect(() => {
    api.me().then(setUser).catch(() => {});
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
      selectedParticipants: d.selectedParticipants.length ? d.selectedParticipants : activeGroup.participants.map((p) => p._id)
    }));
  }, [activeGroupId, groups.length]);

  async function loadGroups() {
    const data = await api.groups();
    setGroups(data);
    if (!activeGroupId && data[0]) setActiveGroupId(data[0]._id);
  }

  async function loadExpenses() {
    const params = { groupId: activeGroupId, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '')) };
    const data = await api.expenses(params);
    setExpenses(data);
  }

  async function handleAuth() {
    const fn = mode === 'register' ? api.register : api.login;
    const me = await fn(authForm);
    setUser(me);
  }

  async function saveGroup() {
    const participants = groupDraft.participants.filter((p) => p.name.trim()).slice(0, 3);
    if (!groupDraft.name.trim()) return;

    if (activeGroup) {
      const payload = {
        name: groupDraft.name,
        participants: participants.map((p) => ({ _id: p._id, name: p.name, color: p.color, avatar: p.avatar }))
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
      participants: group.participants.slice(1).map((p) => ({ _id: p._id, name: p.name, color: p.color || '#22c55e', avatar: p.avatar || '' }))
    });
  }

  async function removeGroup(id) {
    await api.deleteGroup(id);
    setActiveGroupId('');
    await loadGroups();
  }

  function updateSplitValue(participantId, value) {
    setExpenseDraft((d) => ({ ...d, customValues: { ...d.customValues, [participantId]: value } }));
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
    await api.deleteExpense(id);
    await loadExpenses();
    setBalances(await api.balances(activeGroupId));
  }

  async function parseAi() {
    const result = await api.parseExpense({ text: aiText });
    setExpenseDraft((d) => ({ ...d, description: result.draft.description || d.description, amount: result.draft.amount || d.amount, date: result.draft.date || d.date }));
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
      const share = expenses.reduce((a, e) => a + (e.splits.find((s) => s.participantId === p._id)?.amount || 0), 0);
      return { ...p, paid, share, net: paid - share };
    });
  }, [activeGroup, expenses]);

  if (!user) {
    return (
      <main className={`authShell ${mode}`}>
        <section className="authCard">
          <h1>SplitMint — Your Gateway to Karbon</h1>
          <p>Modern split expense app with smart settlements.</p>
          <div className="tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button>
          </div>
          {mode === 'register' && <input placeholder="Name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />}
          <input placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
          <input type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
          <button className="primary" onClick={handleAuth}>{mode === 'register' ? 'Create account' : 'Sign in'}</button>
        </section>
      </main>
    );
  }

  return (
    <main className="app">
      <header>
        <h2>SplitMint Dashboard</h2>
        <button onClick={() => api.logout().then(() => setUser(null))}>Logout</button>
      </header>

      <section className="cards">
        <Card label="Total Spent" value={`₹${summary.totalSpent.toFixed(2)}`} />
        <Card label="You Owe" value={`₹${Math.max(-summary.ownerNet, 0).toFixed(2)}`} />
        <Card label="Owed To You" value={`₹${Math.max(summary.ownerNet, 0).toFixed(2)}`} />
      </section>

      <section className="layout">
        <aside>
          <h3>Groups</h3>
          {groups.map((g) => (
            <div key={g._id} className={`groupItem ${activeGroupId === g._id ? 'active' : ''}`}>
              <button onClick={() => setActiveGroupId(g._id)}>{g.name}</button>
              <div>
                <button onClick={() => editGroup(g)}>Edit</button>
                <button onClick={() => removeGroup(g._id)}>Delete</button>
              </div>
            </div>
          ))}

          <h4>{activeGroup ? 'Edit Group' : 'Create Group'}</h4>
          <input placeholder="Group name" value={groupDraft.name} onChange={(e) => setGroupDraft((d) => ({ ...d, name: e.target.value }))} />
          {groupDraft.participants.map((p, i) => (
            <div key={i} className="participantRow">
              <input placeholder="Participant name" value={p.name} onChange={(e) => {
                const next = [...groupDraft.participants];
                next[i] = { ...next[i], name: e.target.value };
                setGroupDraft((d) => ({ ...d, participants: next }));
              }} />
              <input type="color" value={p.color || '#22c55e'} onChange={(e) => {
                const next = [...groupDraft.participants];
                next[i] = { ...next[i], color: e.target.value };
                setGroupDraft((d) => ({ ...d, participants: next }));
              }} />
            </div>
          ))}
          {groupDraft.participants.length < 3 && <button onClick={() => setGroupDraft((d) => ({ ...d, participants: [...d.participants, { name: '', color: '#f59e0b', avatar: '' }] }))}>+ Add participant</button>}
          <button className="primary" onClick={saveGroup}>Save Group</button>
        </aside>

        <section>
          <div className="filters">
            <input placeholder="Search description" value={filters.q} onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))} />
            <input placeholder="Min" type="number" value={filters.minAmount} onChange={(e) => setFilters((f) => ({ ...f, minAmount: e.target.value }))} />
            <input placeholder="Max" type="number" value={filters.maxAmount} onChange={(e) => setFilters((f) => ({ ...f, maxAmount: e.target.value }))} />
            <button onClick={loadExpenses}>Apply Filters</button>
          </div>

          {activeGroup && (
            <div className="expenseForm">
              <h3>{editingExpenseId ? 'Edit Expense' : 'Add Expense'}</h3>
              <input placeholder="Description" value={expenseDraft.description} onChange={(e) => setExpenseDraft((d) => ({ ...d, description: e.target.value }))} />
              <div className="row">
                <input type="number" placeholder="Amount" value={expenseDraft.amount} onChange={(e) => setExpenseDraft((d) => ({ ...d, amount: e.target.value }))} />
                <input type="date" value={expenseDraft.date} onChange={(e) => setExpenseDraft((d) => ({ ...d, date: e.target.value }))} />
              </div>

              <select value={expenseDraft.payerId} onChange={(e) => setExpenseDraft((d) => ({ ...d, payerId: e.target.value }))}>
                {activeGroup.participants.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
              </select>

              <select value={expenseDraft.splitMode} onChange={(e) => setExpenseDraft((d) => ({ ...d, splitMode: e.target.value }))}>
                <option value="equal">Equal</option>
                <option value="custom">Custom Amount</option>
                <option value="percentage">Percentage</option>
              </select>

              <div className="participantChecks">
                {activeGroup.participants.map((p) => (
                  <label key={p._id}>
                    <input
                      type="checkbox"
                      checked={expenseDraft.selectedParticipants.includes(p._id)}
                      onChange={(e) => {
                        const list = e.target.checked
                          ? [...expenseDraft.selectedParticipants, p._id]
                          : expenseDraft.selectedParticipants.filter((id) => id !== p._id);
                        setExpenseDraft((d) => ({ ...d, selectedParticipants: list }));
                      }}
                    />
                    {p.name}
                  </label>
                ))}
              </div>

              {expenseDraft.splitMode !== 'equal' && expenseDraft.selectedParticipants.map((id) => {
                const p = activeGroup.participants.find((x) => x._id === id);
                return (
                  <div key={id} className="row">
                    <span>{p?.name}</span>
                    <input
                      type="number"
                      placeholder={expenseDraft.splitMode === 'percentage' ? '%' : 'Amount'}
                      value={expenseDraft.customValues[id] || ''}
                      onChange={(e) => updateSplitValue(id, Number(e.target.value))}
                    />
                  </div>
                );
              })}

              <button className="primary" onClick={saveExpense}>Save Expense</button>
              {editingExpenseId && <button onClick={() => { setEditingExpenseId(''); setExpenseDraft(defaultExpense); }}>Cancel Edit</button>}

              <h4>MintSense</h4>
              <textarea rows={2} value={aiText} placeholder="Spent 1200 on dinner last night" onChange={(e) => setAiText(e.target.value)} />
              <button onClick={parseAi}>Parse Statement</button>
            </div>
          )}

          <h3>Balances</h3>
          <table>
            <thead><tr><th>Participant</th><th>Net (₹)</th></tr></thead>
            <tbody>
              {balances.net.map((row) => {
                const p = activeGroup?.participants.find((x) => x._id === row.participantId);
                return <tr key={row.participantId}><td>{p?.name || row.participantId.slice(-4)}</td><td className={row.net >= 0 ? 'green' : 'red'}>{row.net.toFixed(2)}</td></tr>;
              })}
            </tbody>
          </table>

          <h3>Settlement Suggestions</h3>
          {balances.settlements.map((s, i) => {
            const from = activeGroup?.participants.find((x) => x._id === s.from)?.name || s.from.slice(-4);
            const to = activeGroup?.participants.find((x) => x._id === s.to)?.name || s.to.slice(-4);
            return <p key={i}>{from} → {to}: ₹{s.amount.toFixed(2)}</p>;
          })}

          <h3>Group Contributions</h3>
          <table>
            <thead><tr><th>Name</th><th>Paid</th><th>Share</th><th>Net</th></tr></thead>
            <tbody>
              {contributionTable.map((r) => <tr key={r._id}><td>{r.name}</td><td>{r.paid.toFixed(2)}</td><td>{r.share.toFixed(2)}</td><td>{r.net.toFixed(2)}</td></tr>)}
            </tbody>
          </table>

          <h3>Transactions</h3>
          {expenses.map((e) => (
            <div className="txn" key={e._id}>
              <div>
                <strong>{e.description}</strong>
                <small>{new Date(e.date).toLocaleDateString()} • {e.splitMode}</small>
              </div>
              <div>
                <strong>₹{e.amount.toFixed(2)}</strong>
                <button onClick={() => startEditExpense(e)}>Edit</button>
                <button onClick={() => removeExpense(e._id)}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}

function Card({ label, value }) {
  return <article className="card"><p>{label}</p><h3>{value}</h3></article>;
}
