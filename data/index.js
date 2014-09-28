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
var indicators = require('./indicators');
var Stock = require('./stock');


// public - initialize the module
module.exports.init = function(opts, callback) {
  log.debug('initializing stock data');

  // parse arguments
  var tickers;
  if(_.isFunction(opts)) { callback = opts; } 
  else { tickers = opts.tickers; }

  // get a list of available data files
  var dir = path.join(__dirname, './raw');
  var dirfiles = fs.readdirSync(dir);
  var files = _.chain(dirfiles).reduce(function(memo, file) {
    var doti = file.indexOf('.');
    var ticker = file.substring(0, doti);
    var ext = file.substring(doti + 1);
    if(_.contains(tickers, ticker) && (ext === 'csv' || ext === 'ds')) {
      if(!memo[ticker]) { memo[ticker] = { ticker: ticker }; }
      memo[ticker][ext] = path.join(dir, file);
    }
    return memo;
  }, {}).toArray().value();

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
        stock.commit();
        setImmediate(done);
      }
    ], fileDone);
  }, callback);
};


// public - get ticker history
module.exports.get = function(ticker) { return data[ticker]; };