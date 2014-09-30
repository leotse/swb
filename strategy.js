/////////////////
// strategy.js //
/////////////////

// test strategy class to be refactored


// libs
var _ = require('underscore');


module.exports = function Strategy(portfolio) {
  var self = this;

  // test this strategy
  // assumes market reaply data is in reverse chronological order
  self.test = function(data) {
    var replay = data.reverse();
    _.each(replay, function(d) {
      if (portfolio.positions()[d.ticker]) {
        portfolio.buy(d.date, d.ticker, d.close, portfolio.positions()[d.ticker].shares);
      } else if(d.change >= 5) {
        var shares = Math.round(portfolio.balance() * 0.1 / d.close);
        portfolio.sell(d.date, d.ticker, d.close, shares);
      }
    });
  };
};