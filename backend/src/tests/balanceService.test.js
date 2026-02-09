import test from 'node:test';
import assert from 'node:assert/strict';
import { computeBalances } from '../services/balanceService.js';

test('computeBalances returns net and simplified settlements', () => {
  const expenses = [
    { payerId: 'A', amount: 60, splits: [{ participantId: 'A', amount: 20 }, { participantId: 'B', amount: 20 }, { participantId: 'C', amount: 20 }] },
    { payerId: 'B', amount: 30, splits: [{ participantId: 'A', amount: 10 }, { participantId: 'B', amount: 10 }, { participantId: 'C', amount: 10 }] }
  ];

  const { net, settlements } = computeBalances(expenses);
  assert.equal(net.find((n) => n.participantId === 'A').net, 30);
  assert.equal(net.find((n) => n.participantId === 'B').net, 0);
  assert.equal(net.find((n) => n.participantId === 'C').net, -30);
  assert.deepEqual(settlements, [{ from: 'C', to: 'A', amount: 30 }]);
});
