////////////
// app.js //
////////////

// main entry for any test script


// libs
var util = require('util');

var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var log = require('./helpers/misc').log;
var Strategy = require('./strategy');
var Portfolio = require('./portfolio');
var Market = require('./market');

// args
var tickers = [ 'aapl' ];
var indicators = [ 'change', 'sma', 'smac' ];
var startDate = '1980-01-01';
var endDate = '1981-01-01';

var market = new Market({
  tickers: tickers,
  indicators: indicators,
  start: startDate,
  end: endDate
});

// start test app
async.waterfall([ market.init, start ], onComplete) ;
function start(done) {
  // some dirty test code here
  // move to proper test when ready
  market.on('change', function(q) { 
    console.log('%s \t %s \t %s', 
      q.date.format('YYYY-MM-DD'), 
      q.change.toFixed(4),
      _.isNumber(q.smac5) ? q.smac5.toFixed(4) : '-'
    );
  });
  market.on('close', done);
  market.simulate();
}

function onComplete(err) {
  if(err) { throw err; }
  log.debug('done!');
}