//////////////////////////////
// data/indicators/index.js //
//////////////////////////////


// exports the custom indicators
// an indicator should take a stock object and inject the calculated indicator into all data points in the series

module.exports = {
  change: require('./change'),
  sma: require('./sma')
}