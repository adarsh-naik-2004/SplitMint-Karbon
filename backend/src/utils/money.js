export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export function normalizeSplit({ amount, splitMode, participantIds, customValues = {} }) {
  const total = round2(Number(amount));
  if (!participantIds.length) throw new Error('At least one participant is required');

  if (splitMode === 'equal') {
    const base = Math.floor((total * 100) / participantIds.length);
    let remainder = Math.round(total * 100) - base * participantIds.length;
    return participantIds.map((id) => {
      const cents = base + (remainder-- > 0 ? 1 : 0);
      return { participantId: id, amount: cents / 100 };
    });
  }

  if (splitMode === 'custom') {
    const lines = participantIds.map((id) => ({ participantId: id, amount: round2(Number(customValues[id] || 0)) }));
    const sum = round2(lines.reduce((acc, s) => acc + s.amount, 0));
    if (sum !== total) throw new Error('Custom split must exactly match total amount');
    return lines;
  }

  if (splitMode === 'percentage') {
    const percentages = participantIds.map((id) => round2(Number(customValues[id] || 0)));
    const sumPct = round2(percentages.reduce((acc, p) => acc + p, 0));
    if (sumPct !== 100) throw new Error('Percentage split must total 100');
    const lines = participantIds.map((id, idx) => ({ participantId: id, amount: round2((total * percentages[idx]) / 100) }));
    const delta = round2(total - lines.reduce((acc, s) => acc + s.amount, 0));
    lines[0].amount = round2(lines[0].amount + delta);
    return lines;
  }

  throw new Error('Unsupported split mode');
}
