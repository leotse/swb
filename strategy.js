/////////////////
// strategy.js //
/////////////////

// test strategy class to be refactored


// libs
var _ = require('underscore');


module.exports = function Strategy(portfolio) {
  var self = this;

  // test this strategy for the given 'market'
  self.test = function(market, callback) {
    market.on('close', callback);
    market.on('change', function(quote) { 
      // console.log('%s %s %s', quote.date.format('YYYY-MM-DD'), quote.ticker, quote.close.toFixed(4)); 
      if (portfolio.positions()[quote.ticker]) {
        portfolio.sell(quote.date, quote.ticker, quote.close, portfolio.positions()[quote.ticker].shares);
      } else if(quote.change <= -1) {
        var shares = Math.round(portfolio.balance() * 0.1 / quote.close);
        portfolio.buy(quote.date, quote.ticker, quote.close, shares);
      }
    });
  };
};