/** My English Journey — stars-only boat game. No cash, wallet, or payout API. */
export const STARS_PER_BADGE=20;
export const STAGE_MAX_STARS=200;
export const MAX_BADGES=10;
const whole=v=>Number.isFinite(Number(v))?Math.max(0,Math.floor(Number(v))):0;
export function nextMilestone(stars){
 const n=Math.min(STAGE_MAX_STARS,whole(stars));
 return n>=STAGE_MAX_STARS?null:(Math.floor(n/STARS_PER_BADGE)+1)*STARS_PER_BADGE;
}
export function stageStatus({stars=0}={}){
 const earned=Math.min(STAGE_MAX_STARS,whole(stars));
 const badges=Math.floor(earned/STARS_PER_BADGE);
 return Object.freeze({stars:earned,badges,maxBadges:MAX_BADGES,nextBadgeStars:nextMilestone(earned),remainingStars:STAGE_MAX_STARS-earned});
}
/** Collecting gems and chests grants game points only, never mastery stars. */
export function collectGameObject(type){
 return type==='gem'?1:type==='chest'?2:0;
}
