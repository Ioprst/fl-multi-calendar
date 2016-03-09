
/**
 * @method autoReload : Calls reload() every couple seconds.
 * @param  {boolean}   activate    Turn autoreload on or off.
 * @return {void}
 */
var autoReload = (function () {
  'use strict';

  var module;
  var method;
  var timer;

  function autoReloader() {
    if (typeof module[method] === 'function') {
      module[method]();
    }
  }

  //Real function
  return function (obj, met, interval) {
    module = obj;
    method = met;
    if (interval) {
      //TODO: set this interval back to 60 seconds
      timer = setInterval(autoReloader, interval);
    } else {
      clearInterval(timer);
    }
  };
}());
