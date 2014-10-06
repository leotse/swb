/////////////////
// position.js //
/////////////////


// position class
module.exports = function Position(ticker) {
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
};