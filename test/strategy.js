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
var Strategy = require('../strategy');
var Portfolio = require('../portfolio');


// script body
async.waterfall([ init, start ], onComplete) ;

function init(done) { 
  data.init({ 
    tickers: [ 'aapl' ],
    indicators: [ 'change', 'sma' ] 
  }, done); 
}

function start(done) {

  log.debug('starting strategy test');

  // retrieve stock time interval
  var stock = data.get('aapl');
  var interval = stock.interval('2011-01-01', '2013-01-01');

  // test trading strategy
  var portfolio = new Portfolio(10000);
  var strategy = new Strategy(portfolio);
  strategy.test(interval);
  portfolio.pnl(interval[0].close);

  setImmediate(done);
}


function onComplete(err) {
  if(err) { throw err; }
  log.debug('done!');
}