import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const rootHtml = read('../index.html');
const bridge = read('../coastal-arcade/app-bridge.js');
const coastalHtml = read('../coastal-arcade/index.html');
const standaloneAdapter = read('../coastal-arcade/grade-question-banks.js');

function extractInlineGame(html) {
  const marker = 'window.MEJV11Inline=';
  const start = html.indexOf(marker);
  const end = html.indexOf(';\n</script>', start);
  assert.ok(start >= 0 && end > start, 'inline game payload must exist');
  return JSON.parse(html.slice(start + marker.length, end)).game;
}

const game = extractInlineGame(coastalHtml);
const providerStart = bridge.indexOf('/* MEJ_ISLAND_BANK_PROVIDER_V1_START');
const providerEnd = bridge.indexOf('/* MEJ_ISLAND_BANK_PROVIDER_V1_END */', providerStart);
assert.ok(providerStart >= 0 && providerEnd > providerStart);
const providerSource = bridge.slice(providerStart + '/* MEJ_ISLAND_BANK_PROVIDER_V1_START'.length, providerEnd);

function buildVocabulary(questions, correct = {}) {
  const pure = providerSource.slice(0, providerSource.indexOf('window.MEJ_GAME_BANK_PROVIDER='));
  const sandbox = {};
  vm.runInNewContext(pure + '\nthis.build=mejBuildGameVocabulary;', sandbox);
  return sandbox.build(questions, correct);
}

function rootBank() {
  const start = rootHtml.indexOf('const BANK=') + 'const BANK='.length;
  const end = rootHtml.indexOf('];\nconst PHOTO=', start) + 1;
  assert.ok(start > 'const BANK='.length && end > start, 'authoritative BANK declaration must be found');
  return JSON.parse(rootHtml.slice(start, end).trim().replace(/;\s*$/, ''));
}

test('the authoritative island bank remains 2600 questions across 13 levels', () => {
  const bank = rootBank();
  assert.equal(bank.length, 2600);
  const counts = Array.from({ length: 13 }, (_, level) => bank.filter(q => q.g === level).length);
  assert.deepEqual(counts, Array(13).fill(200));
});

test('game vocabulary is extracted from bank questions and deduplicated by word', () => {
  const questions = [
    { id: 'L6-000', type: 'Vocabulary', word: 'hobby', answer: 'هواية' },
    { id: 'L6-001', type: 'Vocabulary', word: 'hobby', answer: 'hobby' },
    { id: 'L6-003', type: 'Spelling', word: 'hobby', answer: 'hobby' },
    { id: 'L6-004', type: 'Vocabulary', word: 'skating', answer: 'التزلج' },
    { id: 'L6-005', type: 'Vocabulary', prompt: "What does 'cycling' mean?", answer: 'ركوب الدراجة' },
    { id: 'L6-006', type: 'Grammar', prompt: 'She ___ tennis.', answer: 'plays' }
  ];
  const words = buildVocabulary(questions, {
    'L6-000': 2, 'L6-001': 2, 'L6-003': 1,
    'L6-004': 2, 'L6-005': 0
  });
  assert.equal(words.length, 3);
  assert.deepEqual(words.map(w => w[0]).sort(), ['cycling', 'hobby', 'skating']);
  assert.equal(words.find(w => w[0] === 'hobby')[1], 'هواية');
  assert.equal(words.find(w => w[0] === 'cycling')[1], 'ركوب الدراجة');
  assert.equal(words.find(w => w[0] === 'skating')[4].mastered, true);
  assert.equal(words[0][4].mastered, false, 'unmastered vocabulary must be first');
  assert.equal(words.at(-1)[4].mastered, true, 'mastered vocabulary must follow unmastered vocabulary');
});

test('provider exposes only the selected level as levelWords and prioritizes unmastered across visual review', () => {
  const sandbox = {
    window: {},
    byGrade: {
      2: [
        { id: 'L2-1', type: 'Vocabulary', word: 'house', answer: 'منزل' },
        { id: 'L2-2', type: 'Spelling', word: 'house', answer: 'house' }
      ],
      3: [
        { id: 'L3-1', type: 'Vocabulary', word: 'weather', answer: 'الطقس' },
        { id: 'L3-2', type: 'Spelling', word: 'weather', answer: 'weather' }
      ]
    },
    active: () => ({ correct: { 'L2-1': 2, 'L2-2': 2 } })
  };
  vm.runInNewContext(providerSource, sandbox);
  const bank = sandbox.window.MEJ_GAME_BANK_PROVIDER(3);
  assert.equal(bank.stage, 3);
  assert.equal(bank.questionCount, 2);
  assert.deepEqual(Array.from(bank.levelWords), ['weather']);
  assert.deepEqual(Array.from(bank.masteredWords), []);
  assert.deepEqual(Array.from(bank.visualVocabulary, row => row[0]), ['weather', 'house']);
  assert.equal(bank.visualVocabulary[0][4].mastered, false);
  assert.equal(bank.visualVocabulary[1][4].mastered, true);
});

test('game decks remove duplicate IDs and place unmastered items before mastered items', () => {
  const start = game.indexOf('function shuffleDeck(source){');
  const end = game.indexOf('const recordDeck=', start);
  assert.ok(start >= 0 && end > start, 'deck selection implementation must exist');
  const sandbox = {
    grade: 6,
    localStorage: { getItem: () => '[]', setItem: () => {} }
  };
  vm.runInNewContext(game.slice(start, end) + '\nthis.pick=variedDeck;', sandbox);
  const source = [
    ['mastered', 'مكتسب', '🔎', 'مكتسب', { id: 'm1', mastered: true }],
    ['new-one', 'جديد', '🔎', 'جديد', { id: 'u1', mastered: false }],
    ['new-one duplicate', 'جديد', '🔎', 'جديد', { id: 'u1', mastered: false }],
    ['new-two', 'جديد', '🔎', 'جديد', { id: 'u2', mastered: false }],
    ['mastered-two', 'مكتسب', '🔎', 'مكتسب', { id: 'm2', mastered: true }]
  ];
  const selected = Array.from(sandbox.pick(source, 'test', 10));
  const ids = selected.map(row => row[4].id);
  assert.equal(new Set(ids).size, ids.length, 'a session deck must never repeat an item');
  assert.deepEqual(ids.slice(0, 2).sort(), ['u1', 'u2']);
  assert.equal(selected.length, 4);
});

test('embedded and standalone adapters no longer contain grade-specific 12-word lists', () => {
  assert.match(game, /const V=\{\};/);
  assert.match(game, /bank\.vocabulary/);
  assert.match(game, /bank\.visualVocabulary/);
  assert.doesNotMatch(game, /\n1:\[\['apple'/);
  assert.match(standaloneAdapter, /const V=\{\};/);
  assert.match(standaloneAdapter, /bank\.vocabulary/);
  assert.doesNotMatch(standaloneAdapter, /\n1:\[\['apple'/);
});

test('coastal game and Hidden Objects receive the bank provider data', () => {
  assert.match(coastalHtml, /MEJ_GAME_BANK_PROVIDER\?\./);
  assert.match(coastalHtml, /bankStage,bank/);
  assert.match(coastalHtml, /masteredWords:bank\?\.masteredWords\|\|\[\]/);
  assert.match(coastalHtml, /levelWords:bank\?\.levelWords\|\|\[\]/);
  assert.doesNotMatch(coastalHtml, /masteredWords:\[\],levelWords:\[\]/);
});

test('the game deck prioritizes unmastered words and stores stable item keys', () => {
  assert.match(game, /function deckKey\(item\)/);
  assert.match(game, /function deckMastered\(item\)/);
  assert.match(game, /freshUnmastered/);
  assert.match(game, /usedUnmastered/);
  assert.match(game, /selected\.map\(deckKey\)/);
});
