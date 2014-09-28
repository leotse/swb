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
function init(done) { data.init({ tickers: [ 'bjri' ] }, done); }
function script(done) {

  log.debug('starting test script');

  var stock = data.get('bjri');
  var interval = stock.interval('1997-01-01', '1997-02-01');

  _.each(interval, function(d) { 
    console.log('%s %s', 
      d.date.format('YYYY-MM-DD'),
      d.close.toFixed(4)
      // d.change.toFixed(4), 
      // d.sma50.toFixed(4)
    ); 
  });

  setImmediate(done);
}



function onComplete(err) {
  if(err) { throw err; }
  console.log('done!');
}