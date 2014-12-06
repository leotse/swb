//////////////////////////
// strategies/gcross.js //
//////////////////////////

// implementation of the so called golden cross strategy
// buy when sma10 crosses sma20 from below
// sell when close below sma20
// play with the spread and support level

// libs
var log = require('../helpers/misc').log;


// strategy impl
module.exports = function GoldenCrossStrategy(opts) {
  var self = this;

  // test this strategy for the given 'market'
  self.test = function(portfolio, market, callback) {

    var prevSpreads = {};
    market.on('close', callback);
    market.on('change', function(quote) {

      // calculate current spread and support
      // var current = quote.sma10 - quote.sma20;
      var current = quote.close - quote.sma20;
      var support = quote.sma20;

      // if this is the first quote of a security, don't do anything just yet
      // observe the state of the market and initialize the spreads accordingly
      if(!prevSpreads[quote.ticker]) {
        prevSpreads[quote.ticker] = current;
        return;
      }

      // detect golden cross
      if(current >= 0 && prevSpreads[quote.ticker] < 0) {
        var shares = Math.floor(portfolio.balance() / quote.close);
        if(shares > 0) {
          portfolio.buy(quote.date, quote.ticker, quote.close, shares);
        }
      }

      // detect exit
      var position = portfolio.position(quote.ticker);
      var shares = position ? position.net().shares : 0;
      if(shares > 0 && quote.close < support) {
        portfolio.sell(quote.date, quote.ticker, quote.close, shares);
      }

      // update ticker state
      prevSpreads[quote.ticker] = current;
    });
  };
};