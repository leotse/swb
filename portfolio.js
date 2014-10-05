//////////////////
// portfolio.js //
//////////////////


// libs
var _ = require('underscore');
var log = require('./helpers/misc').log;
var Position = require('./position');


// const
var DATE_FORMAT = 'YYYY-MM-DD';


// represents a portfolio
module.exports = function Portfolio(cash) {
  var self = this;
  var positions = {};
  var trades = [];

  var origbalance = cash || 10000;
  var balance = origbalance;


  // public - gets the current balance
  self.balance = function() { return balance; };

  // public - gets the current positions
  self.positions = function() { return positions; };

  // public - long a position
  self.buy = function(date, ticker, price, shares) {
    log.debug('%s buying position %s %s@%s', date.format(DATE_FORMAT), ticker, shares, price.toFixed(4));

    var position = positions[ticker];
    if(position) { position.buy(date, price, shares); }
    else { 
      position = new Position(ticker); 
      position.buy(date, price, shares);
      positions[ticker] = position;
    }
    balance -= price * shares;
  };

  // public - sell a long position
  self.sell = function(date, ticker, price, shares) {
    log.debug('%s selling position %s %s@%s', date.format(DATE_FORMAT), ticker, shares, price.toFixed(4));

    var position = positions[ticker];
    if(position) { position.sell(date, price, shares); }
    else {
      position = new Position(ticker);
      position.sell(date, price, shares);
      positions[ticker] = position;
    }
    balance += price * shares;
  };

  // public - calculate pnl for the given prices map
  self.pnl = function(quotes) {
    var quote, pnet, pl, total = 0;
    _.each(positions, function(position, ticker) {
      quote = quotes[ticker];
      pnet = position.net();

      if(!quote && pnet.type !== 'closed') { throw new Error('pnl w/ incompleted market data not supported currently'); }
      if(pnet.type === 'closed') {

        pl = pnet.balance;
        total += pl;
        console.log('%s %s p/l: %s',
          pnet.type,
          ticker,
          pnet.balance
        );
      } else {

        pl = (quote - pnet.price) * pnet.shares;
        total += pl;
        console.log('%s %s %s@%s p/l: %s', 
          pnet.type,
          ticker,
          Math.abs(pnet.shares),
          pnet.price.toFixed(4),
          pl.toFixed(4)
        );
      }
    });

    console.log('total p/l: %s', total);
  };
}