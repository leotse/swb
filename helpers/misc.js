/////////////
// misc.js //
/////////////

var util = require('util');
var moment = require('moment');


/////////////
// loggers //
/////////////

module.exports.log = {};

module.exports.log.debug = function() {
  var date = moment().utc().format();
  arguments[0] = util.format('[%s] %s', date, arguments[0]);
  console.log.apply(console, arguments);
};

module.exports.log.error = function() {
  var date = moment().utc().format();
  arguments[0] = util.format('[%s] %s', date, arguments[0]);
  console.error.apply(console, arguments);
};
