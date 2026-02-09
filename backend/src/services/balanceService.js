import { round2 } from '../utils/money.js';

/**
 * Compute balances and settlement suggestions for a group's expenses
 * @param {Array} expenses - Array of expense documents
 * @returns {Object} Balance information including net balances and settlements
 */
export function computeBalances(expenses) {
  const paid = new Map();
  const owed = new Map();

  // Calculate how much each person paid and owes
  for (const exp of expenses) {
    // Track payments
    const currentPaid = paid.get(exp.payerId) || 0;
    paid.set(exp.payerId, round2(currentPaid + exp.amount));

    // Track what each person owes
    for (const split of exp.splits) {
      const currentOwed = owed.get(split.participantId) || 0;
      owed.set(split.participantId, round2(currentOwed + split.amount));
    }
  }

  // Get all unique participant IDs
  const allParticipants = [...new Set([...paid.keys(), ...owed.keys()])];

  // Calculate net balance for each participant
  const netBalances = allParticipants.map((id) => ({
    participantId: id,
    paid: round2(paid.get(id) || 0),
    owed: round2(owed.get(id) || 0),
    net: round2((paid.get(id) || 0) - (owed.get(id) || 0))
  }));

  // Generate settlement suggestions
  const settlements = generateSettlements(netBalances);

  // Calculate summary statistics
  const totalSpent = round2([...paid.values()].reduce((sum, val) => sum + val, 0));
  const totalOwed = round2([...owed.values()].reduce((sum, val) => sum + val, 0));

  return {
    netBalances,
    settlements,
    summary: {
      totalSpent,
      totalOwed,
      participantCount: allParticipants.length
    }
  };
}

/**
 * Generate minimal settlement transactions using greedy algorithm
 * @param {Array} netBalances - Array of net balance objects
 * @returns {Array} Array of settlement transactions
 */
function generateSettlements(netBalances) {
  // Separate creditors (owed money) and debtors (owe money)
  const creditors = netBalances
    .filter((b) => b.net > 0.01) // Use threshold to avoid floating point issues
    .map((b) => ({ participantId: b.participantId, amount: b.net }))
    .sort((a, b) => b.amount - a.amount); // Sort descending

  const debtors = netBalances
    .filter((b) => b.net < -0.01)
    .map((b) => ({ participantId: b.participantId, amount: Math.abs(b.net) }))
    .sort((a, b) => b.amount - a.amount); // Sort descending

  const settlements = [];
  let i = 0;
  let j = 0;

  // Greedy matching algorithm for minimal transactions
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settleAmount = round2(Math.min(debtor.amount, creditor.amount));

    if (settleAmount > 0.01) {
      // Only add if meaningful amount
      settlements.push({
        from: debtor.participantId,
        to: creditor.participantId,
        amount: settleAmount
      });

      debtor.amount = round2(debtor.amount - settleAmount);
      creditor.amount = round2(creditor.amount - settleAmount);
    }

    if (debtor.amount <= 0.01) i++;
    if (creditor.amount <= 0.01) j++;
  }

  return settlements;
}

/**
 * Get balance between two specific participants
 * @param {Array} expenses - Array of expense documents
 * @param {string} participant1Id - First participant ID
 * @param {string} participant2Id - Second participant ID
 * @returns {Object} Balance information between two participants
 */
export function getBalanceBetween(expenses, participant1Id, participant2Id) {
  let participant1Paid = 0;
  let participant1Owed = 0;
  let participant2Paid = 0;
  let participant2Owed = 0;

  for (const exp of expenses) {
    // Check if expense involves both participants
    const p1Split = exp.splits.find((s) => s.participantId === participant1Id);
    const p2Split = exp.splits.find((s) => s.participantId === participant2Id);

    if (exp.payerId === participant1Id && p2Split) {
      participant1Paid += p2Split.amount;
    }
    if (exp.payerId === participant2Id && p1Split) {
      participant2Paid += p1Split.amount;
    }
    if (p1Split) {
      participant1Owed += p1Split.amount;
    }
    if (p2Split) {
      participant2Owed += p2Split.amount;
    }
  }

  const netBalance = round2(participant1Paid - participant2Paid);

  return {
    participant1: {
      id: participant1Id,
      paid: round2(participant1Paid),
      owed: round2(participant1Owed)
    },
    participant2: {
      id: participant2Id,
      paid: round2(participant2Paid),
      owed: round2(participant2Owed)
    },
    netBalance,
    owesTo: netBalance < 0 ? participant2Id : participant1Id,
    amount: Math.abs(netBalance)
  };
}

/**
 * Get participant statistics
 * @param {Array} expenses - Array of expense documents
 * @param {string} participantId - Participant ID
 * @returns {Object} Participant statistics
 */
export function getParticipantStats(expenses, participantId) {
  let totalPaid = 0;
  let totalOwed = 0;
  let expenseCount = 0;

  for (const exp of expenses) {
    const split = exp.splits.find((s) => s.participantId === participantId);

    if (exp.payerId === participantId || split) {
      expenseCount++;
    }

    if (exp.payerId === participantId) {
      totalPaid += exp.amount;
    }

    if (split) {
      totalOwed += split.amount;
    }
  }

  return {
    participantId,
    totalPaid: round2(totalPaid),
    totalOwed: round2(totalOwed),
    netBalance: round2(totalPaid - totalOwed),
    expenseCount
  };
}