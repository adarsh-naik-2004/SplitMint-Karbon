const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
  return res.json();
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  groups: () => request('/groups'),
  createGroup: (payload) => request('/groups', { method: 'POST', body: JSON.stringify(payload) }),
  expenses: (groupId) => request(`/expenses?groupId=${groupId}`),
  createExpense: (payload) => request('/expenses', { method: 'POST', body: JSON.stringify(payload) }),
  balances: (groupId) => request(`/expenses/balances/${groupId}`),
  parseExpense: (payload) => request('/ai/parse-expense', { method: 'POST', body: JSON.stringify(payload) })
};
