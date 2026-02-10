const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // If backend sends validation details
    if (data?.details?.length) {
      throw new Error(data.details[0].message);
    }

    throw new Error(data?.error || data?.message || "Request failed");
  }

  return data;
}

function normalizeExpensesResponse(payload) {
  if (Array.isArray(payload)) {
    return {
      expenses: payload,
      pagination: {
        total: payload.length,
        limit: payload.length,
        skip: 0,
        hasMore: false,
      },
    };
  }

  return {
    expenses: Array.isArray(payload?.expenses) ? payload.expenses : [],
    pagination: payload?.pagination || {
      total: 0,
      limit: 0,
      skip: 0,
      hasMore: false,
    },
  };
}

function normalizeBalancesResponse(payload) {
  return {
    netBalances: Array.isArray(payload?.netBalances)
      ? payload.netBalances
      : Array.isArray(payload?.net)
        ? payload.net
        : [],
    settlements: Array.isArray(payload?.settlements) ? payload.settlements : [],
    summary: payload?.summary || null,
  };
}

export const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),

  groups: () => request("/groups"),
  createGroup: (payload) =>
    request("/groups", { method: "POST", body: JSON.stringify(payload) }),
  updateGroup: (id, payload) =>
    request(`/groups/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteGroup: (id) => request(`/groups/${id}`, { method: "DELETE" }),

  expenses: async (params = {}) => {
    const q = new URLSearchParams(params);
    const data = await request(`/expenses?${q.toString()}`);
    return normalizeExpensesResponse(data);
  },
  createExpense: (payload) =>
    request("/expenses", { method: "POST", body: JSON.stringify(payload) }),
  updateExpense: (id, payload) =>
    request(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: "DELETE" }),
  balances: async (groupId) => {
    const data = await request(`/expenses/balances/${groupId}`);
    return normalizeBalancesResponse(data);
  },

  parseExpense: (payload) =>
    request("/ai/parse-expense", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
