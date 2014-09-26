////////////////
// numbers.js //
////////////////

// simple script to test out how the numbers package work

// libs
var _ = require('underscore');
var numbers = require('numbers');


// args
var s = [ 1, 2, 3, 4, 5 ];
var t = _.map(s, function(n) { return n % 2; });

console.log(s);
console.log(t);


// script
console.log(numbers.statistic.correlation(s, t));