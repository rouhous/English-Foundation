/**
 * My English Journey — boat minigame reward policy.
 * UI-only calculator. Never use client-side values to settle real-money prizes.
 * Backend must verify the authenticated student, stage, stars and unique treasure claims.
 */
export const MILESTONES = Object.freeze([
  { stars: 40, cap: 50, badge: 2 },
  { stars: 100, cap: 50 },
  { stars: 140, cap: 100 },
  { stars: 200, cap: 100 },
]);
export const MAX_STAGE_BAISA = 300;
export const TREASURE_STEP = 5;

export function unlockedCap(stars) {
  const n = Number(stars);
  if (!Number.isFinite(n)) return 0;
  return MILESTONES.reduce((sum, m) => sum + (n >= m.stars ? m.cap : 0), 0);
}
export function normalizeAward(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.floor(n / TREASURE_STEP) * TREASURE_STEP;
}
export function stageStatus({ stars = 0, awarded = 0 } = {}) {
  const cap = unlockedCap(stars);
  const paid = Math.min(MAX_STAGE_BAISA, Math.max(0, normalizeAward(awarded)));
  return Object.freeze({ cap, paid, remaining: Math.max(0, cap - paid), unlocked: cap > 0 });
}
export function calculateTreasure({ stars, awarded, proposed }) {
  const status = stageStatus({ stars, awarded });
  const award = Math.min(status.remaining, normalizeAward(proposed));
  return { award, ...stageStatus({ stars, awarded: status.paid + award }) };
}
export function nextMilestone(stars) {
  return MILESTONES.find(m => Number(stars) < m.stars)?.stars ?? null;
}
/*
 * INTEGRATION CONTRACT — not a payment implementation:
 * A) App passes verified STAGE stars (0–200), never total account stars.
 * B) Award endpoint authenticates student, looks up stage stars from trusted DB,
 *    and atomically stores a unique treasure-claim ID + amount (5-baisa units).
 * C) Backend locks/checks aggregate stage payouts <= unlockedCap(stars);
 *    transaction isolation/idempotency prevent double claims and concurrent races.
 * D) Display server-confirmed balances, not localStorage as money.
 * E) Unlimited game attempts continue after cap; prizes stay at zero until
 *    another star milestone unlocks additional allowance.
 */