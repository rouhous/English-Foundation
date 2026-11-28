import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const bridge = await readFile(new URL('../coastal-arcade/app-bridge.js', import.meta.url), 'utf8');
const coastalHtml = await readFile(new URL('../coastal-arcade/index.html', import.meta.url), 'utf8');
const unlockSource = await readFile(new URL('../coastal-arcade/badge-unlocks.js', import.meta.url), 'utf8');
const migration = await readFile(new URL('../supabase/migrations/20261128133000_arcade_badge_5_star_thresholds.sql', import.meta.url), 'utf8');
const dataMigration = await readFile(new URL('../supabase/migrations/20261128143000_migrate_legacy_island_stars_div4.sql', import.meta.url), 'utf8');
const boatRewards = await readFile(new URL('../boat-game/rewards.js', import.meta.url), 'utf8');
const boatHtml = await readFile(new URL('../boat-game/index.html', import.meta.url), 'utf8');
const coastalBadges = await readFile(new URL('../games/coastal-badges.js', import.meta.url), 'utf8');
const arcade = await readFile(new URL('../games/arcade.js', import.meta.url), 'utf8');

const sandbox = { module: { exports: {} } };
sandbox.globalThis = sandbox;
vm.runInNewContext(unlockSource, sandbox, { filename: 'coastal-arcade/badge-unlocks.js' });
const unlockedBadges = sandbox.module.exports.unlockedBadges;
const migrateLegacyStars = sandbox.module.exports.migrateLegacyStars;

test('pure unlockedBadges follows the 5-star ladder at boundaries', () => {
  for (const [stars, expected] of [[0, 0], [4, 0], [5, 1], [49, 9], [50, 10]]) {
    assert.equal(unlockedBadges(stars), expected, `stars=${stars}`);
  }
});


test('legacy island-star conversion handles requested old-scale values and missing fields', () => {
  for (const [oldStars, expectedStars, expectedBadges] of [
    [0, 0, 0],
    [4, 1, 0],
    [20, 5, 1],
    [100, 25, 5],
    [200, 50, 10]
  ]) {
    const migrated = migrateLegacyStars(oldStars, null);
    assert.equal(migrated, expectedStars, `old stars=${oldStars}`);
    assert.equal(unlockedBadges(migrated), expectedBadges, `badges for old stars=${oldStars}`);
  }
  // Missing stars: use the documented old-scale estimate mastered * 2, then divide by 4.
  assert.equal(migrateLegacyStars(undefined, 10), 5);
  assert.equal(unlockedBadges(migrateLegacyStars(undefined, 10)), 1);
  assert.equal(migrateLegacyStars(null, 20), 10);
  assert.equal(unlockedBadges(migrateLegacyStars(null, 20)), 2);
  assert.equal(migrateLegacyStars(undefined, undefined), 0);
});

test('legacy conversion never removes an earned 20-star badge (exhaustive 0..200)', () => {
  for (let oldStars = 0; oldStars <= 200; oldStars++) {
    const oldBadges = Math.floor(oldStars / 20);
    const newStars = migrateLegacyStars(oldStars, null);
    const newBadges = unlockedBadges(newStars);
    assert.ok(newBadges >= oldBadges, `oldStars=${oldStars}: ${oldBadges} -> ${newBadges}`);
    assert.equal(newBadges, oldBadges, `threshold equivalence at oldStars=${oldStars}`);
  }
});

test('source migration converts every level_stats object and preserves other JSON fields', () => {
  assert.ok(dataMigration.includes('update public.mej_student_progress'));
  assert.ok(dataMigration.includes('jsonb_array_elements(progress.level_stats)'));
  assert.ok(dataMigration.includes("(item.value->>'mastered')::numeric * 2"));
  assert.ok(dataMigration.includes("(item.value->>'stars')::numeric"));
  assert.ok(dataMigration.includes('/ 4'));
  assert.match(dataMigration, /least\(\s*50/);
  assert.ok(dataMigration.includes("jsonb_set("));
  assert.ok(dataMigration.includes("'{stars}'"));
  assert.ok(dataMigration.includes('order by item.ordinality'));
  assert.ok(dataMigration.includes("where jsonb_typeof(progress.level_stats) = 'array'"));
  assert.ok(!dataMigration.includes('delete from'));
  assert.ok(!dataMigration.includes('truncate'));
});

test('the student coastal iframe uses the helper and the 0–50 star contract', () => {
  assert.ok(coastalHtml.includes('<script src="badge-unlocks.js"></script>'));
  assert.ok(coastalHtml.includes('state.unlocked=window.MEJCoastalUnlockedBadges(d.stageStars)'));
  assert.ok(coastalHtml.includes('d.stageStars>50'));
  assert.ok(coastalHtml.includes("d.stageStars+'/50 نجمة إتقان · '"));
  assert.ok(!coastalHtml.includes('Math.floor(d.stageStars/20)'));
  assert.ok(!coastalHtml.includes('/200 نجمة إتقان'));
});

test('no legacy /20 or /200 star scales remain anywhere under coastal-arcade', async () => {
  const root = new URL('../coastal-arcade/', import.meta.url);
  async function collect(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) files.push(...await collect(full));
      else if (entry.isFile()) files.push(full);
    }
    return files;
  }
  for (const file of await collect(root.pathname)) {
    const source = await readFile(file, 'utf8');
    // Strip embedded image payloads; they are not executable scale logic.
    const code = source.replace(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g, '');
    assert.doesNotMatch(code, /\/(?:20|200)(?=\D|$)/, path.relative(root.pathname, file));
  }
});

test('the bridge reads island stars and unlocks one badge per five stars', () => {
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

test('the boat game client uses the same 5-star / 50-star scale', () => {
  assert.ok(boatRewards.includes('STARS_PER_BADGE=5'));
  assert.ok(boatRewards.includes('STAGE_MAX_STARS=50'));
  assert.ok(boatHtml.includes('max="50"'));
  assert.ok(boatHtml.includes('نجوم المرحلة: 0 / 50'));
  assert.ok(!boatHtml.includes('/ 200'));
  assert.ok(!boatHtml.includes('0,200'));
});

test('coastal reference metadata and standalone arcade host use the 50-star cap', () => {
  assert.ok(coastalBadges.includes('requiredMasteryStars:(i+1)*5'));
  assert.ok(coastalBadges.includes('masteryStarsPerBadge:5'));
  assert.ok(coastalBadges.includes('masteryStarsPerPhase:50'));
  assert.ok(arcade.includes('n>50'));
  assert.ok(!arcade.includes('n>200'));
});
