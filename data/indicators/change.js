///////////////////////////////
// data/indicators/change.js //
///////////////////////////////

// an extremely simple indicator to calculate the % change
// assumes data is arranged in reverse chronological order
// this is because that's the order raw data from yahoo finance returns


// libs
var _ = require('underscore');


// indicator logic
module.exports = function applyChangeIndicator(stock) {
  _.each(stock.series(), function(s) {
    s.change = (s.close - s.open) / s.open * 100;
    s.change = s.change;
  });
};