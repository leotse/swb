//////////////////
// portfolio.js //
//////////////////


// libs
var _ = require('underscore');
var log = require('./helpers/misc').log;


// const
var DATE_FORMAT = 'YYYY-MM-DD';


// represents a portfolio
module.exports = function Portfolio(balance) {
  var self = this;
  var positions = {};
  var transactions = [];

  balance = balance || 10000;


  // gets the current balance
  self.balance = function() { return balance; };

  // gets the current positions
  self.positions = function() { return positions; };

  // outputs the p&l
  self.pnl = function(price) {
    if(_.size(positions) > 0) {
      var profit;
      _.each(positions, function(p) {
        profit = (price - p.price) * p.shares * (p.type === 'long' ? 1 : -1);
        log.debug('%s %s %s %s', p.ticker, p.shares, p.price.toFixed(4), profit.toFixed(4));
      });
    } else { log.debug('no positions'); }
    log.debug('balance: %s', balance.toFixed(2));
  };


  // long a position
  self.buy = function(date, ticker, price, shares) {
    log.debug('%s buying position %s %s@$%s', date.format(DATE_FORMAT), ticker, shares, price.toFixed(4));

    var position = positions[ticker];
    if(!position) { positions[ticker] = { type: 'long', ticker: ticker, price: price, shares: shares }; }
    else {
      var totalshares = shares + position.shares;
      var avgprice = (position.shares * position.price + price * shares) / (position.shares + shares);
      position.shares = totalshares;
      position.price = avgprice;
    }
    balance -= price * shares;
  };


  // sell a long position
  self.sell = function(date, ticker, price, shares) {
    log.debug('%s selling position %s %s@$%s', date.format(DATE_FORMAT), ticker, shares, price.toFixed(4));

    var position = positions[ticker];
    if(!position || position.shares < shares) { throw new Error('short selling not supported at this time'); }

    // sell position
    position.shares -= shares;
    balance += price * shares;

    // clean up portfolio entry if no shares left
    if(position.shares === 0) { delete positions[ticker]; }
  };
}