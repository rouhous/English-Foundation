/**
 * My English Journey — student reward ledger / pure functions.
 * Amounts are in Omani baisa. All payouts require an authenticated,
 * transactional backend. This module can be used for READ-ONLY previews.
 */
export const STARS_PER_BADGE = 20;
export const BADGE_BAISA = 10;
export const STAGE_MAX_STARS = 200;
export const MAX_STAGE_BADGE_BAISA = 100; // 10 badges * 10 baisa
export const MAX_STAGE_TREASURE_BAISA = 50;
export const MAX_STAGE_BAISA = 150;
export const TREASURE_CHOICES = Object.freeze([5,10,15,20]);

const whole = (v) => Number.isFinite(Number(v)) ? Math.max(0,Math.floor(Number(v))) : 0;
export function earnedBadgeBaisa(stars) {
  return Math.floor(Math.min(STAGE_MAX_STARS,whole(stars))/STARS_PER_BADGE)*BADGE_BAISA;
}
export function nextMilestone(stars) {
  const n=whole(stars);
  return n>=STAGE_MAX_STARS ? null : (Math.floor(n/STARS_PER_BADGE)+1)*STARS_PER_BADGE;
}
export function stageStatus({stars=0, treasureEarned=0}={}) {
  const badge=earnedBadgeBaisa(stars);
  const treasure=Math.min(MAX_STAGE_TREASURE_BAISA,whole(treasureEarned));
  return Object.freeze({
    badge,treasure,earned:badge+treasure,
    treasureRemaining:MAX_STAGE_TREASURE_BAISA-treasure,
    totalStageLimit:MAX_STAGE_BAISA,
    nextBadgeStars:nextMilestone(stars)
  });
}
/** Server proposes a choice in [5,10,15,20] and uses the remaining cap. */
export function calculateTreasure({treasureEarned=0, proposed=0}={}) {
  const prior=Math.min(MAX_STAGE_TREASURE_BAISA,whole(treasureEarned));
  const requested=TREASURE_CHOICES.includes(proposed)?proposed:0;
  const award=Math.min(MAX_STAGE_TREASURE_BAISA-prior,requested);
  return {award,treasureEarned:prior+award,remaining:MAX_STAGE_TREASURE_BAISA-prior-award};
}
export function chooseTreasure(random=Math.random()) {
  const n=Number(random);
  if(!Number.isFinite(n)||n<0||n>=1) throw new RangeError('random must be in [0,1)');
  return TREASURE_CHOICES[Math.floor(n*TREASURE_CHOICES.length)];
}
/** Passed as VERIFIED per-stage totals from database, not numbers from students. */
export function studentWallet({stages=[],settlements=[]}={}) {
  const badgeEarned=stages.reduce((s,x)=>s+earnedBadgeBaisa(x.stars),0);
  const treasureEarned=stages.reduce((s,x)=>s+Math.min(MAX_STAGE_TREASURE_BAISA,whole(x.treasureEarned)),0);
  const lifetimeEarned=badgeEarned+treasureEarned;
  const totalDelivered=settlements.reduce((s,x)=>s+whole(x.amount),0);
  return Object.freeze({badgeEarned,treasureEarned,lifetimeEarned,totalDelivered,
    outstanding:Math.max(0,lifetimeEarned-totalDelivered)});
}
/** Teacher chooses exact delivered amount; never erase student earnings. */
export function validateSettlement(amount,wallet) {
  const n=Number(amount);
  if(!Number.isSafeInteger(n)||n<=0||n>wallet.outstanding)
    throw new RangeError('Delivery amount must be a positive whole baisa within outstanding balance');
  return n;
}
/**
 * SERVER CONTRACT:
 * - Student cannot update earned/treasure/settlements directly.
 * - Server awards badge baisa deterministically from verified stage stars.
 * - One treasure claim per unique event; claim selected uniformly from choices,
 *   then capped to 50 per stage using a DB transaction and row lock.
 * - Teacher sees only their linked students, and can record delivery amount
 *   in a server-authorized, idempotent settlement row with timestamp and actor.
 * - Zeroing displayed outstanding is recording a full settlement; does not
 *   wipe history, and does not reset treasure-earned 50 baisa stage cap.
 * - Student and teacher display same server-calculated wallet after sync.
 * - No student PIN is needed for opening treasure; account identity still required.
 */