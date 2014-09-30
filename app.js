////////////
// app.js //
////////////

// main entry for any test script


// libs
var _ = require('underscore');
var async = require('async');
var data = require('./data');
var log = require('./helpers/misc').log;
var Strategy = require('./strategy');
var Portfolio = require('./portfolio');


// script body
async.waterfall([ init, backtest ], onComplete) ;

function init(done) { 
  data.init({ 
    tickers: [ 's&p' ],
    indicators: [ 'change', 'sma' ] 
  }, done); 
}

function backtest(done) {

  log.debug('starting backtest');

  // retrieve backtest time interval
  var stock = data.get('s&p');
  var interval = stock.interval('2009-01-01', '2014-01-01');

  // test strategy
  var portfolio = new Portfolio(10000);
  var strategy = new Strategy(portfolio);
  strategy.test(interval);
  portfolio.pnl(interval[0].close);

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
  console.log('done!');
}