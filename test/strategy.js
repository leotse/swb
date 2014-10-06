///////////////////////
// test/starategy.js //
///////////////////////

// main entry for any test script


// libs
var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var data = require('../data');
var log = require('../helpers/misc').log;

var Market = require('../market');
var Portfolio = require('../portfolio');
var Strategy = require('../strategies/oscillator');


// test args
var tickers = [ 'goog', 'aapl', 'msft', 'brk-b', 'dis', 'ddd', 'sbux', 'bjri', 'wfm', 'tsla' ];
var startDate = '2010-01-01';
var endDate = '2014-01-01';

var portfolio = new Portfolio(100000);
var strategy = new Strategy(portfolio, { change: 2 });
var market = new Market({ tickers: tickers, start: startDate, end: endDate });

// script body
async.waterfall([ init, start ], onComplete) ;

function init(done) { 
  data.init({ 
    tickers: tickers,
    indicators: [ 'change' ]
    // indicators: [ 'change', 'sma' ] 
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