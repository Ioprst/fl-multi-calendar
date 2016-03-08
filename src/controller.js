/*globals xController, MultiCalendar*/

xController(function (xDivEl) {
  'use strict';
  var config = window[xDivEl.dataset.config];
  if (typeof config !== 'object') {
    throw new Error('x-div multiCalendar: No configuration object provided.');
  }

  config.targetEl = xDivEl;
  new MultiCalendar(config);
});
