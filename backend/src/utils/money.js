/**
 * Round to 2 decimal places with proper floating point handling
 */
export const round2 = (n) => {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
};

/**
 * Validate and normalize split distribution
 * @param {Object} params - Split parameters
 * @param {number} params.amount - Total amount to split
 * @param {string} params.splitMode - Split mode (equal, custom, percentage)
 * @param {string[]} params.participantIds - Array of participant IDs
 * @param {Object} params.customValues - Custom amounts or percentages per participant
 * @returns {Array} Array of split objects with participantId and amount
 */
export function normalizeSplit({ amount, splitMode, participantIds, customValues = {} }) {
  const total = round2(Number(amount));

  if (!participantIds || participantIds.length === 0) {
    throw new Error('At least one participant is required');
  }

  if (total <= 0) {
    throw new Error('Amount must be greater than 0');
  }

  if (splitMode === 'equal') {
    return equalSplit(total, participantIds);
  }

  if (splitMode === 'custom') {
    return customAmountSplit(total, participantIds, customValues);
  }

  if (splitMode === 'percentage') {
    return percentageSplit(total, participantIds, customValues);
  }

  throw new Error(`Unsupported split mode: ${splitMode}`);
}

/**
 * Equal split with proper remainder distribution
 */
function equalSplit(total, participantIds) {
  const totalCents = Math.round(total * 100);
  const count = participantIds.length;
  const baseCents = Math.floor(totalCents / count);
  let remainder = totalCents - baseCents * count;

  return participantIds.map((id, index) => {
    const cents = baseCents + (index < remainder ? 1 : 0);
    return {
      participantId: id,
      amount: round2(cents / 100)
    };
  });
}

/**
 * Custom amount split with validation
 */
function customAmountSplit(total, participantIds, customValues) {
  const splits = participantIds.map((id) => ({
    participantId: id,
    amount: round2(Number(customValues[id] || 0))
  }));

  // Validate all amounts are non-negative
  const negativeAmount = splits.find((s) => s.amount < 0);
  if (negativeAmount) {
    throw new Error('Split amounts cannot be negative');
  }

  const sum = round2(splits.reduce((acc, s) => acc + s.amount, 0));
  const totalRounded = round2(total);

  if (Math.abs(sum - totalRounded) > 0.01) {
    throw new Error(`Custom split total (${sum}) must equal expense amount (${totalRounded})`);
  }

  // Adjust for any rounding errors in the first split
  const actualSum = splits.reduce((acc, s) => acc + s.amount, 0);
  if (actualSum !== total) {
    const adjustment = round2(total - actualSum);
    splits[0].amount = round2(splits[0].amount + adjustment);
  }

  return splits;
}

/**
 * Percentage split with validation and rounding adjustment
 */
function percentageSplit(total, participantIds, customValues) {
  const percentages = participantIds.map((id) => {
    const pct = Number(customValues[id] || 0);
    if (pct < 0 || pct > 100) {
      throw new Error(`Percentage must be between 0 and 100, got ${pct} for participant ${id}`);
    }
    return pct;
  });

  const sumPct = round2(percentages.reduce((acc, p) => acc + p, 0));

  if (Math.abs(sumPct - 100) > 0.01) {
    throw new Error(`Percentage split must total 100, got ${sumPct}`);
  }

  // Calculate amounts based on percentages
  const splits = participantIds.map((id, idx) => ({
    participantId: id,
    amount: round2((total * percentages[idx]) / 100)
  }));

  // Adjust first split to handle rounding errors
  const actualSum = splits.reduce((acc, s) => acc + s.amount, 0);
  const difference = round2(total - actualSum);

  if (Math.abs(difference) > 0) {
    splits[0].amount = round2(splits[0].amount + difference);
  }

  return splits;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Validate amount is a valid positive number
 */
export function isValidAmount(amount) {
  const num = Number(amount);
  return !isNaN(num) && isFinite(num) && num > 0;
}