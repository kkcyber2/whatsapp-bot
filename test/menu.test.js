'use strict';

const test = require('node:test');
const assert = require('node:assert');

const { MENU, MENU_IMAGE_URL } = require('../lib/menu');

test('every menu entry has a positive integer price', function () {
  Object.keys(MENU).forEach(function (name) {
    const price = MENU[name].price;
    assert.strictEqual(typeof price, 'number', name + ' price must be a number');
    assert.ok(Number.isInteger(price), name + ' price must be an integer, got ' + price);
    assert.ok(price > 0, name + ' price must be positive');
  });
});

test('no two items share a variation, which would make matching ambiguous', function () {
  const seen = new Map();
  Object.keys(MENU).forEach(function (name) {
    MENU[name].variations.forEach(function (variation) {
      if (seen.has(variation)) {
        // Only fail when the duplicate belongs to a different item.
        assert.strictEqual(seen.get(variation), name,
          'variation "' + variation + '" is claimed by both ' + seen.get(variation) + ' and ' + name);
      }
      seen.set(variation, name);
    });
  });
});

test('every item lists itself as a variation', function () {
  Object.keys(MENU).forEach(function (name) {
    assert.ok(MENU[name].variations.includes(name), name + ' must be its own variation');
  });
});

test('menu image URL is https', function () {
  assert.match(MENU_IMAGE_URL, /^https:\/\//);
});
