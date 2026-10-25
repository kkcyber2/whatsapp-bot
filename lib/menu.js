'use strict';

/**
 * Menu catalogue. Prices are integers in PKR so totals never round-trip
 * through a formatted string.
 */
const MENU = {
  'beef steak': { price: 1200, variations: ['beef steak', 'steak', 'beefsteak', 'stak', 'beaf steak'] },
  'beef burger': { price: 800, variations: ['beef burger', 'burger', 'beefburger', 'burgr', 'beaf burger'] },
  'beef karahi': { price: 1500, variations: ['beef karahi', 'karahi', 'beef karhai', 'karhi', 'beaf karahi'] },
  'beef handi': { price: 1400, variations: ['beef handi', 'handi', 'hndi', 'beaf handi'] },
  'beef nihari': { price: 1300, variations: ['beef nihari', 'nihari', 'nehari', 'beaf nihari'] },
  fries: { price: 250, variations: ['fries', 'french fries', 'chips', 'fry', 'fris'] },
  salad: { price: 200, variations: ['salad', 'fresh salad', 'salat', 'saled'] },
  'soft drinks': { price: 100, variations: ['soft drink', 'soft drinks', 'coke', 'pepsi', 'sprite', 'drink'] },
  lassi: { price: 150, variations: ['lassi', 'sweet lassi', 'lasy', 'lasee'] },
};

const MENU_IMAGE_URL =
  'https://graphicsfamily.com/wp-content/uploads/edd/2024/12/Restaurant-Food-Menu-Design-in-Photoshop.jpg';

module.exports = { MENU, MENU_IMAGE_URL };
