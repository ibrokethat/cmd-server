'use strict';

module.exports = function authToken () {
  var rand = function() {
    return Math.random().toString(36).substr(2);
  };

  return rand() + rand();
};
