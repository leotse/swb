////////////////////
// test/market.js //
////////////////////

// main entry for any test script


// libs
var util = require('util');

var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var data = require('../data');
var log = require('../helpers/misc').log;
var Strategy = require('../strategy');
var Portfolio = require('../portfolio');
var Market = require('../market');

// args
var tickers = [ 'aapl', 'msft' ];
var startDate = '1986-03-01';
var endDate = '1986-04-01';

// start test app
async.waterfall([ init, start ], onComplete) ;

function init(done) { 
  data.init({ 
    tickers: tickers,
    indicators: [ 'change', 'sma' ] 
  }, done); 
}

function start(done) {
  var market = new Market({ tickers: tickers, start: startDate, end: endDate });
  market.on('change', function(data) { console.log('%s %s %s', data.date.format('YYYY-MM-DD'), data.ticker, data.close.toFixed(4)); });
  market.on('close', done);
  market.emulate();
}

function onComplete(err) {
  if(err) { throw err; }
  log.debug('done!');
}