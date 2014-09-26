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
async.waterfall([ data.init, script ], onComplete) ;
function script(done) {

  log.debug('starting test script');

  var stock = data.get('aapl');
  var filtered = stock.interval('2014-05-01', '2014-06-30');

  _.each(filtered, function(d) { 
    console.log('%s %s %s %s% %s', 
      d.date.format('YYYY-MM-DD'),
      d.open.toFixed(2), 
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