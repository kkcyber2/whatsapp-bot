'use strict';

const test = require('node:test');
const assert = require('node:assert');

const order = require('../lib/order');
const { MENU } = require('../lib/menu');

test('classifyIntent distinguishes cancel from a new order', function () {
  // Regression: the original code tested /order/ before /cancel order/, so a
  // cancellation was parsed as a fresh order and never cancelled anything.
  assert.strictEqual(order.classifyIntent('cancel order'), 'cancel');
  assert.strictEqual(order.classifyIntent('please cancel my order'), 'cancel');
  assert.strictEqual(order.classifyIntent('stop order'), 'cancel');
  assert.strictEqual(order.classifyIntent('I want a beef steak'), 'order');
});

test('classifyIntent handles change, status and menu', function () {
  assert.strictEqual(order.classifyIntent('change order'), 'change');
  assert.strictEqual(order.classifyIntent('modify my order please'), 'change');
  assert.strictEqual(order.classifyIntent('order status'), 'status');
  assert.strictEqual(order.classifyIntent('when will order arrive'), 'status');
  assert.strictEqual(order.classifyIntent('show menu'), 'menu');
  assert.strictEqual(order.classifyIntent('what do you have'), 'menu');
});

test('classifyIntent treats blank and junk input as empty or chat', function () {
  assert.strictEqual(order.classifyIntent(''), 'empty');
  assert.strictEqual(order.classifyIntent('   '), 'empty');
  assert.strictEqual(order.classifyIntent(null), 'empty');
  assert.strictEqual(order.classifyIntent(undefined), 'empty');
  assert.strictEqual(order.classifyIntent(42), 'empty');
  assert.strictEqual(order.classifyIntent('hello there'), 'chat');
});

test('matchItems finds a single item and ignores word fragments', function () {
  assert.deepStrictEqual(order.matchItems('I want beef steak'), ['beef steak']);
  // "steaks" must not match "steak" because of word boundaries.
  assert.deepStrictEqual(order.matchItems('steaks please'), []);
});

test('matchItems prefers the longest variation', function () {
  // "french fries" should resolve once, as fries - not twice.
  assert.deepStrictEqual(order.matchItems('french fries'), ['fries']);
});

test('matchItems returns multiple items in the order mentioned', function () {
  assert.deepStrictEqual(order.matchItems('one lassi and a beef burger'), ['lassi', 'beef burger']);
  assert.deepStrictEqual(order.matchItems('beef burger and a lassi'), ['beef burger', 'lassi']);
});

test('matchItems does not depend on casing or extra whitespace', function () {
  assert.deepStrictEqual(order.matchItems('  BEEF    STEAK  '), ['beef steak']);
});

test('computeTotal sums prices correctly', function () {
  assert.strictEqual(order.computeTotal([]), 0);
  assert.strictEqual(order.computeTotal(['fries']), 250);
  assert.strictEqual(order.computeTotal(['fries', 'lassi']), 400);
  assert.strictEqual(order.computeTotal(['beef steak', 'fries', 'lassi']), 1600);
});

test('computeTotal ignores unknown items instead of returning NaN', function () {
  assert.strictEqual(order.computeTotal(['not on the menu']), 0);
  assert.strictEqual(order.computeTotal(['fries', 'nope']), 250);
});

test('parseOrder reports matched flag and real total', function () {
  const ok = order.parseOrder('I would like 2 beef karahi and lassi');
  assert.strictEqual(ok.matched, true);
  assert.deepStrictEqual(ok.items, ['beef karahi', 'lassi']);
  // Items are counted once even when a plural quantity is written.
  assert.strictEqual(ok.total, 1650);

  const bad = order.parseOrder('do you sell pizza');
  assert.strictEqual(bad.matched, false);
  assert.deepStrictEqual(bad.items, []);
  assert.strictEqual(bad.total, 0);
});

test('every menu item is reachable through its own name', function () {
  Object.keys(MENU).forEach(function (name) {
    assert.deepStrictEqual(order.matchItems(name), [name], 'item ' + name + ' must self-match');
  });
});

test('formatItemList title-cases each item', function () {
  assert.strictEqual(order.formatItemList(['beef steak', 'soft drinks']), 'Beef Steak, Soft Drinks');
  assert.strictEqual(order.formatItemList([]), '');
});
