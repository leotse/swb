////////////
// app.js //
////////////

// main entry for any test script


// libs
var _ = require('underscore');
var async = require('async');
var data = require('./data');
var log = require('./helpers/misc').log;


// script body
async.waterfall([ init, script ], onComplete) ;
function init(done) { data.init({ tickers: [ 'aapl' ] }, done); }
function script(done) {

  log.debug('starting test script');

  var stock = data.get('aapl');
  var interval = stock.interval('2005-02-01', '2005-04-01');

  _.each(interval, function(d) { 
    console.log('%s %s', 
      d.date.format('YYYY-MM-DD'),
      d.close.toFixed(2)
      // d.change.toFixed(2), 
      // d.sma50.toFixed(2)
    ); 
  });

  setImmediate(done);
}



function onComplete(err) {
  if(err) { throw err; }
  console.log('done!');
}