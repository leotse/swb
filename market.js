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

  if(!tickers || tickers.length === 0) { throw new Error('at least one ticker is required'); }
  if(!start.isValid() || !end.isValid()) { throw new Error('start and end date must be in format ' + DATE_FORMAT); }

  // init
  var self = this;
  events.EventEmitter.call(self);


  // start emulating the mraket
  self.emulate = function() {
    var ticker = tickers[0];
    var interval = data.get(ticker).interval(opts.start, opts.end);
    var history = interval.reverse();
    _.each(history, function(d) {
      self.emit('change', d);
    });
  };
};
util.inherits(Market, events.EventEmitter);


// export
module.exports = Market;