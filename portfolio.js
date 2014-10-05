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
        log.debug('%s %s %s@%s profit: $%s', 
          (p.shares >= 0 ? 'long' : 'short'), 
          p.ticker, 
          Math.abs(p.shares),
          p.price.toFixed(4), 
          profit.toFixed(2)
        );
      });
    }

    log.debug('open positions: $%s', pvalue.toFixed(2));
    log.debug('cash balance: $%s', balance.toFixed(2));
    log.debug('paper total: $%s', (balance + pvalue).toFixed(2));
    log.debug('change: %s\%', ((balance + pvalue - origbalance) / origbalance * 100).toFixed(2));
    log.debug('==================== p&l ====================');
  };


  // long a position
  self.buy = function(date, ticker, price, shares) {
    log.debug('%s buying position %s %s@%s', date.format(DATE_FORMAT), ticker, shares, price.toFixed(4));

    var position = positions[ticker];
    if(position) { position.buy(date, price, shares); }
    else { 
      position = new Position(ticker); 
      position.buy(date, price, shares);
      positions[ticker] = position;
    } 
  };


  // sell a long position
  self.sell = function(date, ticker, price, shares) {
    log.debug('%s selling position %s %s@%s', date.format(DATE_FORMAT), ticker, shares, price.toFixed(4));

    var position = positions[ticker];
    if(position) { position.sell(date, price, shares); }
    else {
      position = new Position(ticker);
      position.sell(date, price, shares);
      positions[ticker] = position;
    }
  };
}


// helper class position
function Position(ticker) {
  if(!ticker) { throw new Error('ticker is required when creating a new position'); }
  var self = this;
  var transactions = [];
  var balance = 0;
  var shares = 0;
  var price = 0;

  // public - buy a position
  self.buy = function(bdate, bprice, bshares) { 

    // short covering check
    if(shares < 0 && shares + bshares > 0) { throw new Error('position smaller than short cover amount; close current position before going long'); }

    // execute trade
    add('buy',  bdate, bprice, bshares);
    shares += bshares;
    balance -= bprice * bshares;

    // update avg price accordingly
    if(shares < 0) { price = price; } // no update to avg price when covering a portion of the position
    else if(shares === 0) { price = null; } // position closed
    else { price = (price * (shares - bshares) + bprice * bshares) / shares;  }
  };

  // public - sell a position
  self.sell = function(bdate, bprice, bshares) { 

    // make sure there's enough shares to sell
    if(shares > 0 && shares - bshares < 0) { throw new Error('position smaller than sell amount; close current position before going short'); }

    // execute trade
    add('sell', bdate, bprice, bshares); 
    shares -= bshares;
    balance += bprice * bshares;

    // update avg price accordingly
    if(shares < 0) { price = (price * (-shares - bshares) + bprice * bshares) / -shares; }
    else if(shares > 0) { price = price } // no change for selling existing position
    else { price = null; } // position closed
  };

  // public - calc net position
  self.net = function() {
    var type;
    if(shares > 0) { type = 'long'; }
    else if(shares < 0) { type = 'short'; }
    else { type = 'closed'; }

    return {
      type: type,
      balance: balance,
      shares: shares,
      price: price
    }
  };


  // helper - add a new position
  function add(type, date, price, shares) {
    transactions.push({
      type: type,
      date: date, 
      price: price,
      shares: shares
    });
  }
}