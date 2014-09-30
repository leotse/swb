//////////////////
// portfolio.js //
//////////////////


// libs
var _ = require('underscore');
var log = require('./helpers/misc').log;


// const
var DATE_FORMAT = 'YYYY-MM-DD';


// represents a portfolio
module.exports = function Portfolio(cash) {
  var self = this;
  var positions = {};
  var trades = [];

  var origbalance = cash || 10000;
  var balance = origbalance;


  // gets the current balance
  self.balance = function() { return balance; };

  // gets the current positions
  self.positions = function() { return positions; };

  // outputs the p&l
  self.pnl = function(price) {
    log.debug('==================== p&l ====================');

    // calcualte position paper value
    var pvalue = 0;
    if(_.size(positions) === 0) { log.debug('no positions'); }
    else {
      var profit;
      _.each(positions, function(p) {
        pvalue += price * p.shares;
        profit = (price - p.price) * p.shares;
        log.debug('%s %s %s@$%s profit: $%s', 
          (p.shares >= 0 ? 'long' : 'short'), 
          p.ticker, 
          Math.abs(p.shares),
          p.price.toFixed(4), 
          profit.toFixed(2)
        );
      });
    }

    log.debug('cash balance: %s', balance.toFixed(2));
    log.debug('paper total: %s', (balance + pvalue).toFixed(2));
    log.debug('change: %s\%', ((balance + pvalue - origbalance) / origbalance * 100).toFixed(2));
    log.debug('==================== p&l ====================');
  };


  // long a position
  self.buy = function(date, ticker, price, shares) {
    log.debug('%s buying position %s %s@$%s', date.format(DATE_FORMAT), ticker, shares, price.toFixed(4));

    var position = positions[ticker];
    if(!position) {

      balance -= price * shares;
      position = { ticker: ticker, price: price, shares: shares };
      positions[ticker] = position;

    } else {

      // update average entry price
      if(position.shares > 0) { // simple average for long on long
        position.price = (position.shares * position.price + price * shares) / (position.shares + shares);
      } else if(position.shares < 0 && position.shares + share > 0) { // short cover + more
        position.price = price;
      }

      // update position
      balance -= price * shares;
      position.shares += shares;
    }
    
    // clean up portfolio entry if no shares left
    if(position.shares === 0) { delete positions[ticker]; }
  };


  // sell a long position
  self.sell = function(date, ticker, price, shares) {
    log.debug('%s selling position %s %s@$%s', date.format(DATE_FORMAT), ticker, shares, price.toFixed(4));

    var position = positions[ticker];
    if(!position) { 

      balance += price * shares;
      position = { ticker: ticker, price: price, shares: -shares }; 
      positions[ticker] = position;

    } else {

      // update average entry price
      if(position.shares < 0) { // simple average for short on short
        position.price = (-position.shares * position.price + price * shares) / (-position.shares + shares);
      } else if(position.shares < 0 && position.shares + share > 0) { // sell all + more
        position.price = price;
      }

      balance += price * shares;
      position.shares -= shares;
    }

    // clean up portfolio entry if no shares left
    if(position.shares === 0) { delete positions[ticker]; }
  };
}