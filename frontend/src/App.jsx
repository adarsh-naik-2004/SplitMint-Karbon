import { useEffect, useMemo, useState } from 'react';
import { api } from './services/api';

const emptyExpense = { description: '', amount: '', date: '', splitMode: 'equal' };

export default function App() {
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [activeGroup, setActiveGroup] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState({ net: [], settlements: [] });
  const [expenseForm, setExpenseForm] = useState(emptyExpense);
  const [aiText, setAiText] = useState('');

  useEffect(() => {
    api.me().then(setUser).catch(() => {});
  }, []);

  async function refreshGroupData(groupId) {
    const [exp, bal] = await Promise.all([api.expenses(groupId), api.balances(groupId)]);
    setExpenses(exp);
    setBalances(bal);
  }

  useEffect(() => {
    if (!user) return;
    api.groups().then((g) => {
      setGroups(g);
      if (g[0]) setActiveGroup(g[0]._id);
    });
  }, [user]);

  useEffect(() => {
    if (activeGroup) refreshGroupData(activeGroup);
  }, [activeGroup]);

  const summary = useMemo(() => {
    const totalSpent = expenses.reduce((a, e) => a + e.amount, 0);
    const myNet = balances.net[0]?.net || 0;
    return { totalSpent: totalSpent.toFixed(2), owedToMe: Math.max(myNet, 0).toFixed(2), iOwe: Math.max(-myNet, 0).toFixed(2) };
  }, [expenses, balances]);

  async function handleAuth(mode) {
    const fn = mode === 'register' ? api.register : api.login;
    const me = await fn(authForm);
    setUser(me);
  }

  async function handleCreateGroup() {
    const group = await api.createGroup({ name: groupName });
    setGroups((g) => [group, ...g]);
    setActiveGroup(group._id);
    setGroupName('');
  }

  async function handleCreateExpense() {
    const group = groups.find((g) => g._id === activeGroup);
    const ownerId = group.participants[0]._id;
    await api.createExpense({ ...expenseForm, groupId: activeGroup, payerId: ownerId, selectedParticipants: group.participants.map((p) => p._id) });
    setExpenseForm(emptyExpense);
    refreshGroupData(activeGroup);
  }

  async function handleAiParse() {
    const result = await api.parseExpense({ text: aiText });
    setExpenseForm((p) => ({ ...p, ...result.draft }));
  }

  if (!user) {
    return (
      <main className="container auth">
        <h1>SplitMint Karbon</h1>
        <input placeholder="Name" onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
        <input placeholder="Email" onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
        <input placeholder="Password" type="password" onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
        <div className="row">
          <button onClick={() => handleAuth('register')}>Register</button>
          <button onClick={() => handleAuth('login')}>Login</button>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <header className="header"><h1>SplitMint</h1><button onClick={() => api.logout().then(() => setUser(null))}>Logout</button></header>
      <section className="cards">
        <Card label="Total Spent" value={`₹${summary.totalSpent}`} />
        <Card label="You Owe" value={`₹${summary.iOwe}`} />
        <Card label="Owed To You" value={`₹${summary.owedToMe}`} />
      </section>
      <section className="grid">
        <div className="panel">
          <h3>Groups</h3>
          <div className="row"><input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="New group" /><button onClick={handleCreateGroup}>Create</button></div>
          {groups.map((g) => <button className={`listItem ${g._id === activeGroup ? 'active' : ''}`} key={g._id} onClick={() => setActiveGroup(g._id)}>{g.name}</button>)}
        </div>
        <div className="panel">
          <h3>Add Expense</h3>
          <input placeholder="Description" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
          <input placeholder="Amount" type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} />
          <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
          <button onClick={handleCreateExpense}>Save Expense</button>
          <h4>MintSense AI</h4>
          <textarea rows={3} placeholder="Dinner ₹1200 yesterday" value={aiText} onChange={(e) => setAiText(e.target.value)} />
          <button onClick={handleAiParse}>Parse with AI</button>
        </div>
      </section>
      <section className="panel">
        <h3>Settlement Suggestions</h3>
        {balances.settlements.map((s, i) => <div key={i}>{s.from.slice(-4)} pays {s.to.slice(-4)}: ₹{s.amount.toFixed(2)}</div>)}
      </section>
      <section className="panel">
        <h3>History</h3>
        {expenses.map((e) => <div key={e._id} className="txn"><span>{e.description}</span><strong>₹{e.amount.toFixed(2)}</strong></div>)}
      </section>
    </main>
  );
}

function Card({ label, value }) {
  return <article className="card"><p>{label}</p><h2>{value}</h2></article>;
}
