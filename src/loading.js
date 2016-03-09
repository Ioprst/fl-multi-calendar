
//Control the loading animation
var loading = (function () {
  'use strict';

  var refreshIcon;
  var hideTimeout;

  //Callbacks from config
  var onShowCallback;
  var onHideCallback;
  return {
    show: function show() {
      clearTimeout(hideTimeout);
      if (refreshIcon) { refreshIcon.classList.remove('animation-paused'); }
    },

    hide: function hide() {
      hideTimeout = setTimeout(function () {
        if (refreshIcon) { refreshIcon.classList.add('animation-paused'); }
      }, 500);
    },

    on: function on(showHide, callback) {
      if (callback && typeof callback !== 'function') {
        console.error('loading.on(): The parameter provided is not a function.');
      }

      if (showHide && showHide.toUpperCase() === 'SHOW') {
        onShowCallback = callback;
      } else if (showHide && showHide.toUpperCase() === 'HIDE') {
        onHideCallback = callback;
      } else {
        throw new Error('loading.on(): "' + showHide + '" is not a valid parameter option.');
      }
    },

    setLoadingElement: function setLoadingElement(el) {
      if (typeof el !== 'object') {
        throw new Error('setLoadingElement(): Invalid parameter for loading element.');
      }

      refreshIcon = el;
      refreshIcon.classList.add('rotate');
      refreshIcon.classList.add('animation-paused');
    }
  };
}());
