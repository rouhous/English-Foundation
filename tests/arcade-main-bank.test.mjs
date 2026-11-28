import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const mainHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const coastalHtml = await readFile(new URL('../coastal-arcade/index.html', import.meta.url), 'utf8');
const bridge = await readFile(new URL('../coastal-arcade/app-bridge.js', import.meta.url), 'utf8');
const hiddenHost = await readFile(new URL('../assets/mej-sailor-host.js', import.meta.url), 'utf8');

function matchingJsonEnd(source, start) {
  let depth = 0, inString = false, escaped = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
    } else {
      if (ch === '"') inString = true;
      else if (ch === '{' || ch === '[') depth++;
      else if (ch === '}' || ch === ']') {
        depth--;
        if (depth === 0) return i + 1;
      }
    }
  }
  throw new Error('Unterminated JSON value');
}

function extractBank(html) {
  const marker = 'const BANK=';
  const at = html.indexOf(marker);
  assert.notEqual(at, -1, 'main island BANK exists');
  const start = at + marker.length;
  return JSON.parse(html.slice(start, matchingJsonEnd(html, start)));
}

function extractCoastalGame(html) {
  const marker = 'window.MEJV11Inline=';
  const at = html.indexOf(marker);
  assert.notEqual(at, -1, 'coastal inline game bundle exists');
  const start = at + marker.length;
  return JSON.parse(html.slice(start, matchingJsonEnd(html, start))).game;
}

const bank = extractBank(mainHtml);
const gameHtml = extractCoastalGame(coastalHtml);

test('the canonical island bank contains exactly 2,600 questions: 200 per stage', () => {
  assert.equal(bank.length, 2600);
  for (let stage = 0; stage <= 12; stage++) {
    assert.equal(bank.filter(q => q.g === stage).length, 200, 'stage ' + stage);
  }
});

test('coastal games no longer contain the standalone 12-word/legacy grade banks', () => {
  assert.ok(!gameHtml.includes('window.MEJV10Data'));
  assert.ok(!gameHtml.includes('MEJGradeBanks'));
  assert.ok(!gameHtml.includes('const V='));
  assert.ok(!gameHtml.includes('data[group]'));
  assert.ok(gameHtml.includes('window.MEJ_GAME_CONTEXT?.bank'));
  assert.ok(gameHtml.includes('const recordDeck=bankWordRows(120)'));
  assert.ok(gameHtml.includes('const visualDeck=photoRecordsForGrade()'));
  for (const name of ['vocabDeck', 'sentenceRows', 'grammarDeck', 'escapeDeck', 'evidenceDeck', 'detectiveDeck', 'argumentDeck', 'listeningDeck', 'storyDeck']) {
    assert.ok(gameHtml.includes('const ' + name + '=bankDeck('), name + ' uses the island bank');
  }
});

test('every inline game script parses after the bank adapter change', () => {
  const scripts = gameHtml.split('<script>').slice(1).map(part => part.split('</script>')[0]);
  assert.ok(scripts.length >= 2);
  for (let i = 0; i < scripts.length; i++) {
    assert.doesNotThrow(() => new vm.Script(scripts[i], { filename: 'coastal-game-inline-' + i + '.js' }));
  }
});

test('bankDeck returns unique question IDs and puts unmastered questions first', () => {
  const startMarker = '/* MEJ_MAIN_BANK_DECK_HELPER_START */';
  const endMarker = '/* MEJ_MAIN_BANK_DECK_HELPER_END */';
  const start = gameHtml.indexOf(startMarker), end = gameHtml.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, 'testable bank deck helper boundaries exist');
  const helper = gameHtml.slice(start + startMarker.length, end);
  const sample = [
    { id: 'g-1', type: 'Grammar', mastered: true },
    { id: 'g-2', type: 'Grammar', mastered: false },
    { id: 'g-3', type: 'Grammar', mastered: true },
    { id: 'g-4', type: 'Grammar', mastered: false },
    { id: 'v-1', type: 'Vocabulary', mastered: false },
    { id: 'v-2', type: 'Vocabulary', mastered: false },
    { id: 'v-3', type: 'Vocabulary', mastered: true },
    { id: 'v-3', type: 'Vocabulary', mastered: false }
  ];
  const context = { MEJ_BANK: sample };
  vm.runInNewContext(helper + '\nthis.selectBankDeck=bankDeck;', context);
  const deck = context.selectBankDeck(['Grammar'], ['Vocabulary'], 6);
  const ids = deck.map(q => q.id);
  assert.equal(deck.length, 6);
  assert.equal(new Set(ids).size, 6, 'no duplicate questions in one session');
  assert.ok(deck.every(q => q.mastered !== true), 'unmastered items fill the session first');
  const short = context.selectBankDeck(['Grammar'], [], 10);
  const masteredIndex = short.findIndex(q => q.mastered === true);
  assert.ok(masteredIndex >= 0);
  assert.ok(short.slice(0, masteredIndex).every(q => q.mastered !== true));
});

test('the main app sends only the selected stage bank with learner mastery flags', () => {
  assert.ok(bridge.includes('function mejCoastalBankPayload(stage,profile)'));
  assert.ok(bridge.includes('byGrade[stage]'));
  assert.ok(bridge.includes('mastered:Number(correct[q.id])>=2'));
  assert.ok(bridge.includes('bank:mejCoastalBankPayload(stage,p)'));
  assert.ok(coastalHtml.includes('window.MEJ_GAME_BANK=Array.isArray(d.bank)'));
  assert.ok(coastalHtml.includes('JSON.stringify(window.MEJ_GAME_BANK||[])'));
  assert.ok(gameHtml.includes('MEJ_BANK.length!==200'));
});

test('Hidden Objects also draws from the island bank and prioritises unmastered words', () => {
  assert.ok(hiddenHost.includes('byGrade[stage]'));
  assert.ok(hiddenHost.includes("'Phonics','Blend'"));
  assert.ok(hiddenHost.includes('(Number(correct[q.id])>=2?mastered:unmastered)'));
  assert.ok(hiddenHost.includes('shuffle(unmastered,stage*197+badge*173)'));
  assert.ok(hiddenHost.includes('shuffle(mastered,stage*197+badge*173+1)'));
});
