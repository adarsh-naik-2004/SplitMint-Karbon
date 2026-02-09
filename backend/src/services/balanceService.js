import { round2 } from '../utils/money.js';

export function computeBalances(expenses) {
  const paid = new Map();
  const owed = new Map();

  for (const exp of expenses) {
    paid.set(exp.payerId, round2((paid.get(exp.payerId) || 0) + exp.amount));
    for (const split of exp.splits) {
      owed.set(split.participantId, round2((owed.get(split.participantId) || 0) + split.amount));
    }
  }

  const all = [...new Set([...paid.keys(), ...owed.keys()])];
  const net = all.map((id) => ({
    participantId: id,
    net: round2((paid.get(id) || 0) - (owed.get(id) || 0))
  }));

  const creditors = net.filter((n) => n.net > 0).map((n) => ({ ...n }));
  const debtors = net.filter((n) => n.net < 0).map((n) => ({ ...n, net: Math.abs(n.net) }));
  const settlements = [];

  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = round2(Math.min(debtors[i].net, creditors[j].net));
    if (amount > 0) {
      settlements.push({ from: debtors[i].participantId, to: creditors[j].participantId, amount });
      debtors[i].net = round2(debtors[i].net - amount);
      creditors[j].net = round2(creditors[j].net - amount);
    }
    if (debtors[i].net === 0) i += 1;
    if (creditors[j].net === 0) j += 1;
  }

  return { net, settlements };
}
