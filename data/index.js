///////////////////
// data/index.js //
///////////////////

// wrapper to load historic data
var data = {};


// libs
var fs = require('fs');
var path = require('path');
var readline = require('readline');

var _ = require('underscore');
var async = require('async');

var log = require('../helpers/misc').log;
var Stock = require('./stock');
var download = require('./downloader');


// public - initialize the module
module.exports.init = function(opts, callback) {
  log.debug('initializing stock data');

  // parse arguments
  var tickers, indicators, refresh;
  if(_.isFunction(opts)) { callback = opts; } 
  else { 
    tickers = opts.tickers; 
    indicators = opts.indicators;
    refresh = opts.refresh;
  }

  // calculate tickers w/ missing data files
  var dir = path.join(__dirname, './raw');
  var dirfiles = fs.readdirSync(dir);
  var missing = _.filter(tickers, function(ticker) {
    return dirfiles.indexOf(ticker + '.csv') < 0 || 
      dirfiles.indexOf(ticker + '.ds') < 0;
  });

  // download missing files
  download(missing, function(err) {
    if(err) { return callback(err); }

    var files = _.chain(tickers).reduce(function(memo, ticker) {
      if(!memo[ticker]) { memo[ticker] = { ticker: ticker }; }
      memo[ticker]['csv'] = path.join(__dirname, 'raw', ticker + '.csv');
      memo[ticker]['ds'] = path.join(__dirname, 'raw', ticker + '.ds');
      return memo;
    }, {}).toArray().value();

    // start loading data
    loadData(files, callback);
  });


  // start loading data into memory for simulation
  function loadData(files, callback) {

    // start processing csv and ds files for each ticker
    async.eachSeries(files, function(file, fileDone) {

      // init stock object for this file
      var stock =  new Stock(file.ticker);
      data[file.ticker] = stock;

      async.series([
        function(done) {
          // input data streams
          var istream = fs.createReadStream(file.csv);
          var rl = readline.createInterface({ 
            input: istream, 
            terminal: false 
          });

          // read file!
          rl.on('line', function(line) { stock.parsePrice(line); });
          rl.on('close', done);
        },
        function(done) {
          // input data streams
          var istream = fs.createReadStream(file.ds);
          var rl = readline.createInterface({ 
            input: istream, 
            terminal: false 
          });

          // read file!
          rl.on('line', function(line) { stock.parseSplit(line); });
          rl.on('close', done);

        },
        function(done) {
          stock.commit(indicators);
          setImmediate(done);
        }
      ], fileDone);
    }, callback);
  }
};


// public - get ticker history
module.exports.get = function(ticker) { return data[ticker]; };