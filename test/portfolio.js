///////////////////////
// test/portfolio.js //
///////////////////////

// test portfolio class


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

  log.debug('starting portfolio tests');

  // retrieve stock time interval
  var stock = data.get('aapl');
  var interval = stock.interval('2013-01-01', '2014-01-01');

  // test portfolio
  var portfolio = new Portfolio(10000);
  portfolio.sell(moment.utc(), 'aapl', 100, 20);
  portfolio.buy(moment.utc(), 'aapl', 100, 30);
  portfolio.sell(moment.utc(), 'aapl', 100, 20);
  portfolio.buy(moment.utc(), 'aapl', 100, 20);
  portfolio.pnl(100);

  setImmediate(done);
}


function onComplete(err) {
  if(err) { throw err; }
  log.debug('done!');
}