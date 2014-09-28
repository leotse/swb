///////////////////
// data/stock.js //
///////////////////


// lib
var path = require('path');
var _ = require('underscore');
var moment = require('moment');
var log = require('../helpers/misc').log;


// constants
var DATE_FORMAT = 'YYYY-MM-DD';
var DATE_FORMAT2 = 'YYYYMMDD';
var SPLIT_TAG = 'SPLIT';


// stock class
module.exports = function Stock(ticker) {
  var self = this;
  var series = [];
  var splits = [];
  var initialized = false;

  // for init only, parses and stores a line of data
  self.parsePrice = function(line) {
    var parts = line.split(',');
    if(parts.length !== 7) { return; } // log.error('invalid price line: %s', line); }

    var date = moment.utc(parts[0], DATE_FORMAT);
    if(!date.isValid()) { return; } // log.error('invalid price line: %s', line); }

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
    if(parts.length !== 3) { return; } // log.error('invalid split line: %s', line); }

    var date = moment.utc(parts[1], DATE_FORMAT2);
    if(!date.isValid()) { return; } // log.error('invalid split line: %s', line); }

    if(parts[0] === SPLIT_TAG) {
      var factorParts = parts[2].split(':');
      var factor = Number(factorParts[1]) / Number(factorParts[0]);
      splits.push({
        date: date,
        factor: factor
      });
    }
  };

  self.commit = function(indicators) {

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
          factor = factor * split.factor;
          split = splits[++j];
        }
      }
    }

    // apply indicators
    if(indicators && indicators.length > 0) {
      var apply;
      _.each(indicators, function(indicator) {
        apply = require(path.join(__dirname, './indicators', indicator));
        apply(self);
      });
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
};