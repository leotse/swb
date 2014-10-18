/////////////////////////////
// data/indicators/smac.js //
/////////////////////////////

// calculate the average change for the past x days

// libs
var _ = require('underscore');
var numbers = require('numbers');
var log = require('../../helpers/misc').log;

// indicator logic
module.exports = function applyIndicator(stock) {
  var series = stock.series();

  // dependency check
  if(!_.isNumber(series[0].change)) { throw new Error('smac indicator must be applied after change indicator'); }

  // add smac indicators
  smac(5, series);
  smac(20, series);
  smac(50, series);
};

function smac(days, series) {
  if(series.length < days) { return log.debug('unable to apply 5-day avg change'); }
  // apply change average
  var i, slice;
  for(i = 0; i < series.length - days; i++) {
    slice = _.pluck(series.slice(i, i + days), 'change');
    series[i]['smac' + days] = numbers.statistic.mean(slice);
  }
}