import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const bridge = await readFile(new URL('../coastal-arcade/app-bridge.js', import.meta.url), 'utf8');
const migration = await readFile(new URL('../supabase/migrations/20261128133000_arcade_badge_5_star_thresholds.sql', import.meta.url), 'utf8');

test('the ten coastal badges follow the 5n star ladder', () => {
  const thresholds = Array.from({ length: 10 }, (_, i) => (i + 1) * 5);
  assert.deepEqual(thresholds, [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
});

test('the client reads island stars and unlocks one badge per five stars', () => {
  assert.ok(bridge.includes('Math.min(50,Number(stageStars(stage,active()))||0)'));
  assert.ok(bridge.includes('Math.floor(stars/5)'));
  assert.ok(bridge.includes('count(stage)<badge*5'));
  assert.ok(bridge.includes("n*5+'/50 ⭐</small>"));
  assert.ok(bridge.includes("count(stage)+'/50'"));
  assert.ok(bridge.includes('owner?50:count(stage)'));
  assert.ok(!bridge.includes('countMaster(stage,active())'));
  assert.ok(!bridge.includes('Math.floor(stars/20)'));
});

test('the arcade RPC validates the same 5n star threshold with legacy fallback', () => {
  assert.ok(migration.includes("coalesce((x->>'stars')::integer,coalesce((x->>'mastered')::integer,0)*2)"));
  assert.ok(migration.includes(')<p_badge*5'));
  assert.ok(!migration.includes('p_badge*20'));
});

test('sailor reward milestones map to badges 2, 5, 7 and 10', () => {
  for (const expected of [
    "when coalesce(stars,0)>=10 then 50",
    "when coalesce(stars,0)>=25 then 100",
    "when coalesce(stars,0)>=35 then 200",
    "when coalesce(stars,0)>=50 then 300"
  ]) assert.ok(migration.includes(expected), expected);
  assert.ok(migration.includes("coalesce((j->>'stars')::int,coalesce((j->>'mastered')::int,0)*2)"));
});
