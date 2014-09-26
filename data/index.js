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
var moment = require('moment');

var log = require('../helpers/misc').log;
var indicators = require('./indicators');


// constants
var DATE_FORMAT = 'YYYY-MM-DD';
var DATE_FORMAT2 = 'YYYYMMDD';
var SPLIT_TAG = 'SPLIT';


// public - initialize the module
module.exports.init = function(callback) {

  log.debug('initializing stock data');

  // get a list of available data files
  var dir = path.join(__dirname, './raw');
  var dirfiles = fs.readdirSync(dir);
  var files = _.chain(dirfiles).reduce(function(memo, file) {
    var doti = file.indexOf('.');
    var ticker = file.substring(0, doti);
    var ext = file.substring(doti + 1);
    if(ext === 'csv' || ext === 'ds') {
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


// private - stock class
function Stock(ticker) {
  var self = this;
  var series = [];
  var splits = [];
  var initialized = false;

  // for init only, parses and stores a line of data
  self.parsePrice = function(line) {
    var parts = line.split(',');
    if(parts.length !== 7) { return log.error('invalid price line: %s', line); }

    var date = moment.utc(parts[0], DATE_FORMAT);
    if(!date.isValid()) { return log.error('invalid price line: %s', line); }

    var open = Number(parts[1]), high = Number(parts[2]), low = Number(parts[3]),
      close = Number(parts[4]), volume = Number(parts[5]), adjClose = Number(parts[6]);

    series.push({
      date: date,
      open: open,
      high: high,
      low: low,
      close: close,
      volume: volume,
      adjClose: adjClose
    });
  };

  // for init only, parses and split adjust prices
  // needs to be called after prices are parsed
  self.parseSplit = function(line) {
    var parts = line.split(',');
    if(parts.length !== 3) { return log.error('invalid split line: %s', line); }

    var date = moment.utc(parts[1], DATE_FORMAT2);
    if(!date.isValid()) { return log.error('invalid split line: %s', line); }

    if(parts[0] === SPLIT_TAG) {
      var factorParts = parts[2].split(':');
      var factor = Number(factorParts[1]) / Number(factorParts[0]);
      splits.push({
        date: date,
        factor: factor
      });
    }
  };

  self.commit = function() {

    var prices = self.series();

    // split adjust stock prices
    if(splits.length > 0) {
      var i = 0, j = 0, factor = 1;
      var price, split = splits[0];
      while(i < prices.length) {
        price = prices[i++];
        price.open = price.open * factor;
        price.high = price.high * factor;
        price.low = price.low * factor;
        price.close = price.close * factor;

        if(split && price.date.diff(split.date) === 0) {
          split = splits[j++];
          factor = factor * split.factor;
        }
      }
    }

    // init completed
    initialized = true;
  }

  // return the entire series
  self.series = function() { 
    // ensureInitialized();
    return series; 
  };

  // return the stock splits data
  self.splits = function() {
    // ensureInitialized();
    return splits;
  }

  // return an interval, inclusive start and end parameter
  self.interval = function(start, end) {
    ensureInitialized();
    start = moment.utc(start, DATE_FORMAT);
    end = moment.utc(end, DATE_FORMAT);
    if(!start.isValid() || !end.isValid()) { throw new Error('invalid start or end date, dates must be in format: ' + DATE_FORMAT); }
    return _.filter(series, function(datum) {
      if(start.diff(datum.date) <= 0 && end.diff(datum.date) >= 0) {
        return true;
      }
      return false;
    });
  };

  // helper - ensure stock is initialized properly
  function ensureInitialized() {
    if(!initialized) { throw new Error('stock ' + ticker + ' is not initialized'); }
    return true;
  }
}