////////////
// app.js //
////////////

// main entry for any test script


// libs
var _ = require('underscore');
var async = require('async');
var moment = require('moment');
var data = require('./data');
var log = require('./helpers/misc').log;
var Strategy = require('./strategy');
var Portfolio = require('./portfolio');


// script body
async.waterfall([ init, backtest ], onComplete) ;

function init(done) { 
  data.init({ 
    tickers: [ 'aapl' ],
    indicators: [ 'change', 'sma' ] 
  }, done); 
}

function backtest(done) {

  log.debug('starting backtest');

  // retrieve backtest time interval
  var stock = data.get('aapl');
  var interval = stock.interval('2013-01-01', '2014-01-01');

  // test portfolio
  var portfolio = new Portfolio(10000);
  // portfolio.sell(moment.utc(), 'aapl', 100, 20);
  portfolio.sell(moment.utc(), 'aapl', 100, 10);
  portfolio.sell(moment.utc(), 'aapl', 110, 10);
  portfolio.pnl(100);

  // test trading strategy
  // var strategy = new Strategy(portfolio);
  // strategy.test(interval);
  // portfolio.pnl(interval[0].close);

  // debug output
  // _.each(interval, function(d) { 
  //   console.log('%s %s %s %s\% %s', 
  //     d.date.format('YYYY-MM-DD'),
  //     d.open.toFixed(4),
  //     d.close.toFixed(4),
  //     d.change.toFixed(4), 
  //     d.sma50.toFixed(4)
  //   ); 
  // });

  setImmediate(done);
}



function onComplete(err) {
  if(err) { throw err; }
  log.debug('done!');
}