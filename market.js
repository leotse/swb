///////////////
// market.js //
///////////////

// represents a market

// libs
var util = require('util');
var events = require('events');

var _ = require('underscore');
var moment = require('moment');

var data = require('./data');
var log = require('./helpers/misc').log;


// const
var DATE_FORMAT = 'YYYY-MM-DD';


// class defn
function Market(opts) {
  var tickers = opts.tickers;
  var start = moment.utc(opts.start, DATE_FORMAT);
  var end = moment.utc(opts.end, DATE_FORMAT);
  var current = {};

  if(!tickers || tickers.length === 0) { throw new Error('at least one ticker is required'); }
  if(!start.isValid() || !end.isValid()) { throw new Error('start and end date must be in format ' + DATE_FORMAT); }

  // init
  var self = this;
  events.EventEmitter.call(self);

  self.init = function(opts, callback) { data.init(opts, callback); };

  // public - returns the tickers available in this market
  self.tickers = function() { return tickers; };

  // public - returns the most current market quotes
  self.current = function() { return current; };

  // public - returns start emulating the market
  self.emulate = function(delay) {

    var datasets = _.chain(tickers)
      .map(function(ticker) { return data.get(ticker); })
      .map(function(stock) { return stock.interval(opts.start, opts.end); })
      .value();

    // start emulating market
    var pointers = _.map(datasets, function(s) { 
      return { 
        i: s.length - 1, 
        dataset: s 
      };
    });

    var quote, date = start;
    while(date.diff(end) <= 0) {
      _.each(pointers, function(p) {
        quote = p.dataset[p.i];
        if(quote && quote.date.diff(date) === 0) {
          self.emit('change', quote);
          current[quote.ticker] = quote;
          p.i--;
        }
      });
      date.add(1, 'days');
    }
    self.emit('close');
  };
};

util.inherits(Market, events.EventEmitter);


// export
module.exports = Market;