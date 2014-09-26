////////////////////////////
// data/indicators/sma.js //
////////////////////////////

// simple indicator to calculate 50 day simple moving average


// libs
var _ = require('underscore');


// indicator logic
module.exports = function applyChangeIndicator(stock) {
  var series = stock.series();
  ma(50, series);
  ma(100, series);
  ma(200, series);
};


// helper - calculate moving average
function ma(interval, series) {
  if(series.length < interval) { throw new Error('interval must be greater than # of items in the series'); }
  var i, j, length = series.length, total = 0;
  for(i = 0; i < interval; i++) { total += series[i].close; }
  for(i = 0, j = interval; j < length; i++, j++) {
    series[i]['sma' + interval] = total / interval;
    total = total - series[i].close + series[j].close;
  }
}