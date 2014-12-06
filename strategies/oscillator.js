//////////////////////////////
// strategies/oscillator.js //
//////////////////////////////

// test strategy class to be refactored


// libs
var log = require('../helpers/misc').log;


// strategy impl
module.exports = function OscillatorStrategy(opts) {
  var self = this;
  var change = opts.change;
  var ratio = opts.ratio;
  var minOrder = opts.minOrder;

  // make sure change threshold is specified
  if(!change) { throw new Error('change threshold must be set for this strategy'); }

  // test this strategy for the given 'market'
  self.test = function(portfolio, market, callback) {
    var position;

    market.on('close', callback);
    market.on('change', function(quote) { 
      // console.log('%s %s %s', quote.date.format('YYYY-MM-DD'), quote.ticker, quote.close.toFixed(4)); 
      position = portfolio.position(quote.ticker);
      if (position && position.net().shares > 0 && quote.change >= change) {
        portfolio.sell(quote.date, quote.ticker, quote.close, portfolio.positions()[quote.ticker].net().shares);
      } else if(quote.change <= -change) {
        var shares = Math.floor(portfolio.balance() * ratio / quote.close);
        var cost = shares * quote.close;
        if(shares > 0 && cost >= minOrder) {
          portfolio.buy(quote.date, quote.ticker, quote.close, shares);
        } else {
          log.debug('missed entry: %s %s %s\% due to insufficient capital: %s', 
            quote.date.format('YYYY-MM-DD'),
            quote.ticker, 
            quote.change.toFixed(2),
            portfolio.balance().toFixed(2)
          );
        }
      }
    });
  };
};