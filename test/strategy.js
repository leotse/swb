///////////////////////
// test/starategy.js //
///////////////////////

// main entry for any test script


// libs
var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var log = require('../helpers/misc').log;
var Market = require('../market');
var Portfolio = require('../portfolio');
var Oscillator = require('../strategies/oscillator');
var GCross = require('../strategies/gcross');
var Crosses = require('../strategies/crosses');


// test args
var tickers = [ 'msft', 'brk-b', 'dis', 'ddd', 'sbux', 'bjri', 'wfm', 'tsla', 'googl', 'aapl' ];
var indicators = [ 'change', 'sma' ];
var startDate = '2007-01-01';
var endDate = '2015-01-01';

var strategy = new Oscillator({ change: 2.5, ratio: 0.5, minOrder: 800 });
// var strategy = new GCross();  
// var strategy = new Crosses();

var portfolio = new Portfolio({ cash: 100000, cost: 0 });
var market = new Market({ 
  tickers: tickers, 
  indicators: indicators, 
  start: startDate, 
  end: endDate 
});

// script body
async.waterfall([ market.init, start ], onComplete) ;
function start(done) {

  log.debug('starting strategy test');

  // test trading strategy
  strategy.test(portfolio, market, onComplete);
  market.simulate();
}


function onComplete(err) {
  if(err) { throw err; }
  log.debug('market close!');
  portfolio.pnl(market.current());
}