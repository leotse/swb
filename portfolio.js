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

  // public - get a specific position
  self.position = function(ticker) { return positions[ticker]; };

  // public - long a position
  self.buy = function(date, ticker, price, shares) {
    var position = positions[ticker];
    if(position) { position.buy(date, price, shares); }
    else { 
      position = new Position(ticker); 
      position.buy(date, price, shares);
      positions[ticker] = position;
    }
    balance -= price * shares;
    log.debug('%s buying position %s %s@%s balance: %s', date.format(DATE_FORMAT), ticker, shares, price.toFixed(4), balance.toFixed(4));
  };

  // public - sell a long position
  self.sell = function(date, ticker, price, shares) {
    var position = positions[ticker];
    if(position) { position.sell(date, price, shares); }
    else {
      position = new Position(ticker);
      position.sell(date, price, shares);
      positions[ticker] = position;
    }
    balance += price * shares;
    log.debug('%s selling position %s %s@%s balance: %s', date.format(DATE_FORMAT), ticker, shares, price.toFixed(4), balance.toFixed(4));
  };

  // public - calculate pnl for the given prices map
  self.pnl = function(market) {
    var quote, pnet, pl, asset = 0;
    _.each(positions, function(position, ticker) {
      quote = market[ticker].close;
      pnet = position.net();

      if(!quote && pnet.type !== 'closed') { throw new Error('pnl w/ incompleted market data not supported currently'); }
      if(pnet.type !== 'closed') {
        asset += pnet.shares * quote;
        pl = (quote - pnet.price) * pnet.shares;
        console.log('%s %s %s@%s p/l: %s', 
          pnet.type,
          ticker,
          Math.abs(pnet.shares),
          pnet.price.toFixed(4),
          pl.toFixed(4)
        );
      }
    });

    var total = balance + asset;
    var change = (total - origbalance) / origbalance * 100;
    console.log('net: %s -> %s change: %s\%', origbalance.toFixed(2), total.toFixed(2), change.toFixed(2));  
  };
};