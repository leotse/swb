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


// public - initialize the module
module.exports.init = function(callback) {

  log.debug('initializing stock data');

  // get a list of available data files
  var dir = path.join(__dirname, './raw');
  var files = _.chain(fs.readdirSync(dir))
    .filter(function(f) { return f.indexOf('.csv') >= 0 })
    .map(function(f) { return path.join(dir, f); })
    .value();

  async.eachSeries(files, function(file, done) {

    // init stock object for this file
    var ticker = file.match(/([^\/\.]+)\.csv/i)[1];
    var stock =  new Stock(ticker);
    data[ticker] = stock;

    // input data streams
    var istream = fs.createReadStream(file);
    var rl = readline.createInterface({ 
      input: istream, 
      terminal: false 
    });

    // read file!
    rl.on('line', function(line) { stock.parse(line); });
    rl.on('close', function() { 
      _.each(indicators, function(apply) { apply(stock); });
      setImmediate(done); 
    });

  }, callback);
};


// public - get ticker history
module.exports.get = function(ticker) { return data[ticker]; };


// private - stock class
function Stock(ticker) {
  var self = this;
  var series = [];

  // for init only, parses and stores a line of data
  self.parse = function(line) {
    var parts = line.split(',');
    if(parts.length !== 7) { return log.error('invalid line: %s', line); }

    var date = moment.utc(parts[0], DATE_FORMAT);
    if(!date.isValid()) { return log.error('invalid line: %s', line); }

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
  }

  // return the entire series
  self.series = function() { return series; }

  // return an interval, inclusive start and end parameter
  self.interval = function(start, end) {
    start = moment.utc(start, DATE_FORMAT);
    end = moment.utc(end, DATE_FORMAT);
    if(!start.isValid() || !end.isValid()) { throw new Error('invalid start or end date, dates must be in format: ' + DATE_FORMAT); }
    return _.filter(series, function(datum) {
      if(start.diff(datum.date) <= 0 && end.diff(datum.date) >= 0) {
        return true;
      }
      return false;
    });
  }
}