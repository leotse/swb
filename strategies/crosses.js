///////////////////////////
// strategies/crosses.js //
///////////////////////////

// implementation of the crosses strategy
// buy when closing price crosses sma from below
// sell when closing price crosses sma from above
// essentially changes the position from short to long every time the lines cross

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

      // calculate current spread
      var current = quote.close - quote.sma20;

      // if this is the first quote of a security, don't do anything just yet
      // observe the state of the market and initialize the spreads accordingly
      if(!prevSpreads[quote.ticker]) {
        prevSpreads[quote.ticker] = current;
        return;
      }

      // check our current position
      var position = portfolio.position(quote.ticker);
      var shares = position ? position.net().shares : 0;

      // detect crosses
      if(current >= 0 && prevSpreads[quote.ticker] < 0) {
        
        // golden cross

        // close any short positions
        if(shares < 0) {
          portfolio.buy(quote.date, quote.ticker, quote.close, -shares);
        }

        // and go long
        var order = Math.floor(portfolio.balance() / quote.close * 0.1);
        if(order > 0) {
          portfolio.buy(quote.date, quote.ticker, quote.close, order);
        }


      } else if(current <= 0 && prevSpreads[quote.ticker] > 0) {
        
        // death cross

        // sell any long positions
        if(shares > 0) {
          portfolio.sell(quote.date, quote.ticker, quote.close, shares);
        }

        // and go short
        var order = Math.floor(portfolio.balance() / quote.close * 0.1);
        if(order > 0) {
          portfolio.sell(quote.date, quote.ticker, quote.close, order);
        }
      }

      // update previous spread
      prevSpreads[quote.ticker] = current;
    });
  };
};