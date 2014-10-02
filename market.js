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

    var datasets = _.chain(tickers)
      .map(function(ticker) { return data.get(ticker); })
      .map(function(stock) { return stock.interval(opts.start, opts.end); })
      .value();

    var lengths = _.chain(datasets)
      .countBy(function(s) { return s.length; })
      .size()
      .value();
    if(lengths > 1) { throw new Error('asymmetric market data not supported at this time'); }

    var i, j, dataset, dateLength = datasets[0].length;
    for(i = 0; i < dateLength; i++) {
      for(j = 0; j < datasets.length; j++) {
        dataset = datasets[j];
        self.emit('change', dataset[i]);
      }
    }
  };
};
util.inherits(Market, events.EventEmitter);


// export
module.exports = Market;