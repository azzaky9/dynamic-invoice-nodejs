const util = require("util");

module.exports = function nestedLog(data) {
  if (data instanceof Object) {
    console.log(util.inspect(data, false, null, true /* enable colors */));

    return;
  }
};
