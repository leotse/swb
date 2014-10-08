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
module.exports = function Portfolio(opts) {
  var self = this;
  var cash = opts.cash;
  var cost = opts.cost;

  if(_.isUndefined(cash) || _.isUndefined(cost)) { throw new Error('cash and transaction cost are required to init a portfolio'); }

  var origbalance = cash;
  var balance = cash;
  var positions = {};
  var trades = [];

  // public - gets the transaction cost
  self.cost = function() { return cost; }

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
    balance -= cost;

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
    balance -= cost;

    log.debug('%s selling position %s %s@%s balance: %s', date.format(DATE_FORMAT), ticker, shares, price.toFixed(4), balance.toFixed(4));
  };

  // public - calculate the current paper balance
  self.paper = function(market) {
    var quote, net, shares, price, asset = 0;
    _.each(positions, function(position, ticker) {
      quote = market[ticker].close;
      if(!quote) { throw new Error('pnl w/ incompleted market data not supported currently'); }

      net = position.net();
      shares = net.shares;
      price = net.price;
      if(net.type !== 'closed') {
        asset += net.shares * quote;
      }
    });
    return asset  + balance;
  };

  // public - print pnl for the given prices map
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