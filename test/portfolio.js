///////////////////////
// test/portfolio.js //
///////////////////////

// test portfolio class


// libs
var util = require('util');
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
  var portfolio = new Portfolio(5000000);
  var date = moment.utc();

  // brk-b - buy and hold
  portfolio.buy(date, 'brk-b', 100000, 10);
  portfolio.buy(date, 'brk-b', 110000, 5);
  portfolio.buy(date, 'brk-b', 120000, 3);
  portfolio.buy(date, 'brk-b', 130000, 2);
  // result: long 20@108500.0000

  // aapl - buy low sell high
  portfolio.buy(date, 'aapl', 80, 100);
  portfolio.sell(date, 'aapl', 100, 100);
  // result: no position, $2000 profit

  // ddd - increase position on the way down, sell high
  portfolio.buy(date, 'ddd', 80, 100);
  portfolio.buy(date, 'ddd', 40, 200);
  portfolio.sell(date, 'ddd', 100, 300);
  // result: no position, $14000 profit

  // tsla - buy high sell low
  portfolio.buy(date, 'tsla', 250, 100);
  portfolio.buy(date, 'tsla', 200, 100);
  portfolio.sell(date, 'tsla', 150, 200);
  // result: no position, $15000 loss

  // wfm - panicky trader
  portfolio.buy(date, 'wfm', 100, 50);
  portfolio.sell(date, 'wfm', 100, 50);
  portfolio.buy(date, 'wfm', 100, 50);
  portfolio.sell(date, 'wfm', 100, 50);
  // result: closed, $0 balance

  // msft - short and hold
  portfolio.sell(date, 'msft', 25, 100);
  portfolio.sell(date, 'msft', 30, 100);
  portfolio.sell(date, 'msft', 35, 100);
  // result: short 300@30.000

  // sbux - real life trades
  portfolio.buy(date, 'sbux', 40, 100);
  portfolio.sell(date, 'sbux', 50, 50);
  portfolio.sell(date, 'sbux', 60, 50);
  portfolio.buy(date, 'sbux', 70, 100);
  portfolio.buy(date, 'sbux', 50, 100);
  portfolio.buy(date, 'sbux', 40, 100);
  // result: long 300@53.3333, -$14500 balance

  // print positions
  // var net;
  // _.each(portfolio.positions(), function(p, ticker) {
  //   console.log('%s %s', ticker, JSON.stringify(p.net()));
  // });

  // print pnl
  portfolio.pnl({
    'brk-b': 110000.0000,
    'aapl': 120.0000,
    'ddd': 80.0000,
    'tsla': 300.0000,
    'wfm': 120.0000,
    'msft': 28.0000,
    'sbux': 78.000
  });

  // test completed!
  setImmediate(done);
}


function onComplete(err) {
  if(err) { throw err; }
  log.debug('done!');
}