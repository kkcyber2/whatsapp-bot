'use strict';

const { MENU } = require('./menu');

function normaliseText(text) {
  if (typeof text !== 'string') return '';
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Work out what the customer is trying to do.
 * Specific verbs are checked before the general order branch, otherwise
 * "cancel order" would be parsed as a new order.
 */
function classifyIntent(text) {
  const t = normaliseText(text);
  if (!t) return 'empty';
  if (/\b(cancel|stop)\b.{0,12}\border\b|\border\b.{0,12}\bcancel\b/.test(t)) return 'cancel';
  if (/\bchange\b.{0,12}\border\b|\border\b.{0,12}\bchange\b|\bmodify\b/.test(t)) return 'change';
  if (/\border status\b|\bwhere is my order\b|\bwhen will (my )?order\b|\border kab\b|\btrack\b/.test(t)) return 'status';
  if (/\bmenu\b|\bwhat do you (have|serve)\b|\bprices?\b/.test(t)) return 'menu';
  if (/\border\b|\bwant\b|\bneed\b|\bgive me\b|\bi'd like\b|\bi would like\b|\bbuy\b/.test(t)) return 'order';
  return 'chat';
}

/** Match a free-text message against the menu, each item at most once. */
function matchItems(text, menu) {
  const source = menu || MENU;
  const t = normaliseText(text);
  if (!t) return [];

  const found = [];
  for (const canonical of Object.keys(source)) {
    // Longest variation first so "french fries" wins over "fries".
    const variations = (source[canonical].variations || [canonical]).slice()
      .sort(function (a, b) { return b.length - a.length; });
    for (const variation of variations) {
      if (new RegExp('\\b' + escapeRegExp(variation) + '\\b').test(t)) {
        found.push(canonical);
        break;
      }
    }
  }

  // Keep the order the customer mentioned them in.
  return found.sort(function (a, b) {
    return t.indexOf(a.split(' ')[0]) - t.indexOf(b.split(' ')[0]);
  });
}

function computeTotal(items, menu) {
  const source = menu || MENU;
  return items.reduce(function (sum, item) {
    return sum + (source[item] ? source[item].price : 0);
  }, 0);
}

function formatItemList(items) {
  return items.map(function (item) {
    return item.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }).join(', ');
}

function parseOrder(text, menu) {
  const items = matchItems(text, menu);
  return { items: items, total: computeTotal(items, menu), matched: items.length > 0 };
}

module.exports = {
  normaliseText: normaliseText,
  classifyIntent: classifyIntent,
  matchItems: matchItems,
  computeTotal: computeTotal,
  formatItemList: formatItemList,
  parseOrder: parseOrder,
};
