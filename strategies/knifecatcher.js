////////////////////////////////
// strategies/knifecatcher.js //
////////////////////////////////

// implementation of the knife catching strategy
// the assumption is what goes down comes back up
// when a security goes down significanly it keeps buying the "dip"
// exit when there's a reasonable "pop"

// i still have no idea why this works so well

// libs
var log = require('../helpers/misc').log;

// strategy impl
module.exports = function KnifeCatching(opts) {
  var self = this;
  var change = opts.change;
  var ratio = opts.ratio;

  // test this strategy for the given 'market'
  self.test = function(portfolio, market, callback) {
    market.on('close', callback);
    market.on('change', function(quote) {

      // detect big change!
      var change = quote.change;
      if(Math.abs(change) > opts.change) {
        if(change < 0) {

          // big negative!

          // go long
          var order = Math.floor(portfolio.balance() / quote.close * ratio);
          if(order > 0) {
            portfolio.buy(quote.date, quote.ticker, quote.close, order);
          }

        } else if(change > opts.change) {

          // big positive!

          // sell existing position
          var position = portfolio.position(quote.ticker);
          var owned = position ? position.net().shares : 0;
          if(owned > 0) {
            portfolio.sell(quote.date, quote.ticker, quote.close, owned);
          }

        }
      }
    });
  };
};