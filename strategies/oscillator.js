//////////////////////////////
// strategies/oscillator.js //
//////////////////////////////

// test strategy class to be refactored


// libs


// strategy impl
module.exports = function OscillatorStrategy(portfolio, opts) {
  var self = this;
  var change = opts.change;

  // make sure change threshold is specified
  if(!change) { throw new Error('change threshold must be specified for this strategy'); }

  // test this strategy for the given 'market'
  self.test = function(market, callback) {
    var pctPerTrade = 0.1;
    var position;

    market.on('close', callback);
    market.on('change', function(quote) { 
      // console.log('%s %s %s', quote.date.format('YYYY-MM-DD'), quote.ticker, quote.close.toFixed(4)); 
      position = portfolio.position(quote.ticker);
      if (position && position.net().shares > 0 && quote.change >= change) {
        portfolio.sell(quote.date, quote.ticker, quote.close, portfolio.positions()[quote.ticker].net().shares);
      } else if(quote.change <= -change) {
        var shares = Math.floor(portfolio.balance() * pctPerTrade / quote.close);
        portfolio.buy(quote.date, quote.ticker, quote.close, shares);
      }
    });
  };
};