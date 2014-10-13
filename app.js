////////////
// app.js //
////////////

// main entry for any test script


// libs
var util = require('util');

var _ = require('underscore');
var async = require('async');
var moment = require('moment');

var data = require('./data');
var log = require('./helpers/misc').log;
var Strategy = require('./strategy');
var Portfolio = require('./portfolio');
var Market = require('./market');

// args
var tickers = [ 'aapl', 'msft', 'brk-a', 'grmn' ];
var startDate = '1986-03-01';
var endDate = '1986-04-01';

// start test app
async.waterfall([ init, start ], onComplete) ;

function init(done) { 
  data.init({ 
    tickers: tickers,
    indicators: [ 'change', 'sma' ] 
  }, done); 
}

function start(done) {
  // some dirty test code here
  // move to proper test when ready
  console.log('dirty code');
  setImmediate(done);
}

function onComplete(err) {
  if(err) { throw err; }
  log.debug('done!');
}