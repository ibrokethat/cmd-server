'use strict';

module.exports = function extractNumbers (str) {

  str = str.replace(/[\D -\.]/g,'');
  return str;
};
