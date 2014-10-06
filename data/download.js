/////////////////
// download.js //
/////////////////

// script to download raw data files from yahoo-finance

// libs
var fs = require('fs');
var path = require('path');
var util = require('util');

var _ = require('underscore');
var async = require('async');
var request = require('request');
var log = require('../helpers/misc').log;


// const
var HISTORICAL_URL = 'http://ichart.finance.yahoo.com/table.csv?s=%s';
var SPLIT_URL = 'http://ichart.finance.yahoo.com/x?s=%s&g=v';
var HISTORICAL_LOCAL = path.join(__dirname, './raw/%s.csv');
var SPLIT_LOCAL = path.join(__dirname, './raw/%s.ds');


// args
var symbols = [ 
  { symbol: '^GSPC', name: 's&p' }, 
  { symbol: '^IXIC', name: 'nasdaq' }, 
  'aapl', 'msft', 'tsla', 'sbux', 'brk-b', 'dis', 'ddd', 'wfm', 'bjri', 'goog', 'c', 'gs', 'jpm', 'nok', 'bbry'
];


// start script
async.eachSeries(symbols, function(symbol, callback) {

  var historical = getArgs(symbol, HISTORICAL_URL, HISTORICAL_LOCAL);
  var split = getArgs(symbol, SPLIT_URL, SPLIT_LOCAL);

  async.series([

    function(done) { download(historical.url, historical.local, done); },
    function(done) { download(split.url, split.local, done); }

  ], callback);

}, function(err) {
  if(err) { throw err;}
  log.debug('downloaded data for %s', symbols);
});


// helper - generate url and path
function getArgs(symbol, urlTemplate, localTemplate) {

  // parse symbol object
  var url, local;
  if(_.isString(symbol)) {

    url = util.format(urlTemplate, symbol);
    local = util.format(localTemplate, symbol);

  } else if(_.has(symbol, 'symbol') && _.has(symbol, 'name')) {

    url = util.format(urlTemplate, symbol.symbol);
    local = util.format(localTemplate, symbol.name);

  } else { throw new Error('invalid symbol: ' + symbol); }

  return { url: url, local: local };
}


// helper - download a file
function download(url, local, callback) {

  // setup local output stream
  var out = fs.createWriteStream(local);
  out.on('finish', callback);

  // start download
  log.debug('downloading %s to %s', url, local);
  request(url).pipe(out);
}