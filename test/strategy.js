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
var Strategy = require('../strategies/oscillator');


// test args
var tickers = [ 'msft', 'brk-b', 'dis', 'ddd', 'sbux', 'bjri', 'wfm', 'tsla', 'goog', 'aapl' ];
var startDate = '2007-01-01';
var endDate = '2014-01-01';

var portfolio = new Portfolio({ cash: 100000, cost: 0 });
var strategy = new Strategy(portfolio, { change: 2.5, ratio: 0.5, minOrder: 800 });
var market = new Market({ tickers: tickers, start: startDate, end: endDate });

// script body
async.waterfall([ init, start ], onComplete) ;

function init(done) { 
  market.init({ 
    tickers: tickers,
    indicators: [ 'change', 'sma' ] 
  }, done); 
}

function start(done) {

  log.debug('starting strategy test');

  // test trading strategy
  strategy.test(market, onComplete);
  market.emulate();
}


function onComplete(err) {
  if(err) { throw err; }
  log.debug('market close!');
  portfolio.pnl(market.current());
}