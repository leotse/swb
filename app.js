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


// start test app
async.waterfall([ init, start ], onComplete) ;


function init(done) { 
  data.init({ 
    tickers: [ 'aapl' ],
    indicators: [ 'change', 'sma' ] 
  }, done); 
}

function start(done) {
  var market = new Market({ tickers: ['aapl'], start: '2013-01-01', end: '2014-02-01'});
  market.on('change', function(data) {
    console.log(data.sma50);
  });
  market.emulate();
}

function onComplete(err) {
  if(err) { throw err; }
  log.debug('done!');
}