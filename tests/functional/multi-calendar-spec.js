/*globals expect, xDivTester */

'use strict'; //jshint ignore:line

// Make date into YYYY-MM-DDformat
function convertDate(d) {
  function pad(s) {
    return (s < 10) ? '0' + s : s;
  }

  return [pad(d.getFullYear()), pad(d.getMonth() + 1), d.getDate()].join('-');
}

var demoData = {
  12345: [{
    id: '12345',
    title: 'Simple title',
    start: '2016-02-19 09:00:00',
    end: '2016-02-19 18:00:00',
    tooltip: 'LOL'
  }, {
    id: '12345',
    title: 'Today event',
    start: convertDate(new Date()) + ' 09:00:00',
    end: convertDate(new Date()) + ' 18:00:00',
    tooltip: 'LOL'
  }],
  7899: [{
    id: '23456',
    title: '09:00 &ndash; 18:00<br \/><strong><i class=\'fa fa-suitcase\'><\/i> Jonny<\/strong>',
    start: '2016-02-19 09:00:00',
    end: '2016-02-19 18:00:00',
    tooltip: 'LOL'
  }, {
    id: '12345',
    title: 'Today event',
    start: convertDate(new Date()) + ' 09:00:00',
    end: convertDate(new Date()) + ' 18:00:00',
    tooltip: 'LOL'
  }]
};

var demoConf = {
  loadUrl: 'http://localhost:5000',
  calendars: [{
      name: 'Karl Marx',
      uid: '12345',
      description: 'Software Developer', //optional
      titleClick: function () {}, //optional

      dayHeaderClick: function () {},

      eventClick: function () {},
    }, {
      name: 'Friedrich Hegel',
      uid: '7899',
      description: 'HR Manager', //optional
      titleClick: function () {},

      dayHeaderClick: function () {},

      eventClick: function () {},
    },
  ],
};

describe('The multi-calendar should', function () {
  describe('when initialised', function () {
    var xdiv;

    beforeEach(function () {
      delete window.xConf;
      window.xConf = Object.create(demoConf);
      xdiv = document.createElement('x-div');
      xdiv.setAttribute('data-controller', '../../build/multi-calendar');
      xdiv.setAttribute('data-config', 'xConf');
    });

    afterEach(function () {
      var els = document.querySelectorAll('x-div');
      Array.prototype.forEach.call(els, function (el) {
        el.remove();
      });

      els = null;
      delete window.xConf;
    });

    it('throw if there is no config file', function () {
      xdiv.removeAttribute('data-config');
      expect(function () { xDivTester.callWith(xdiv); }).toThrow();
    });

    it('throw if the config file does not exist', function () {
      delete window.xConf;
      expect(function () {  xDivTester.callWith(xdiv); }).toThrow();
    });

    it('throw if there is no loadUrl in the config', function () {
      window.xConf = Object.create(demoConf);
      delete window.xConf.loadUrl;
      expect(function () {  xDivTester.callWith(xdiv); }).toThrow();
    });

    it('throw if loadUrl is invalid', function () {
      window.xConf.loadUrl = '```';
      xdiv.setAttribute('data-config', 'xConf');
      expect(function () { xDivTester.callWith(xdiv); }).toThrow(new Error('Invalid url'));
    });

    xit('throw if there is no "calendars" field in the config file');
    xit('not throw if the "calendars" field is not an array');
    xit('throw if the "calendars" array is empty');
    xit('throw if a calendar element doesn\'t have a uid');
    xit('not throw if a calendar element doesn\'t have a name');
    xit('not throw if a calendar element doesn\'t have a name');
    xit('not throw if a calendar element doesn\'t have click functions');
  });

  describe('after initialised (with 1000px width) show', function () {
    xit('as many calendars as elements in the "calendars" array in the config file');
    xit('a datepicker');
    xit('calendar titles');
    xit('calendar subtitles');
    xit('control buttons');
    xit('a main header');
    xit('the same date in the datepicker and in the main header');
    xit('the loaded events that happen today');
  });

  describe('fire config click event when clicking on', function () {
    xit('day headers');
    xit('events');
    xit('titles');
    xit('subtitles');
  });

  describe('not fire a config click event when clicking on', function () {
    xit('an empty day');
    xit('outside of the calendar');
    xit('the main calendar title');
    xit('any of the control buttons');
  });


  function dateChangeChecks() {
    describe('when changing the date', function () {
      function dateChangeMatches() {
        xit('have changed the main title');
        xit('have changed the url hash');
        xit('have changed the dates shown in the calendar');
        xit('have changed the dates of all calendars to the same value');
        xit('show the events happening in the new date');
      }

      describe('via the weekpicker', function () {
        dateChangeMatches();
      });

      describe('via the left arrow', function () {
        dateChangeMatches();
      });

      describe('via the right arrow', function () {
        dateChangeMatches();
      });
    });
  }

  describe('in a screen width of 1000px', function () {
    xit('show in the week mode');
    xit('show weekpicker date by weeks');
    xit('show title in day range');
    dateChangeChecks();
  });

  describe('in a screen width of 1000px', function () {
    xit('show in the day mode');
    xit('show weekpicker date by weeks');
    xit('show ony one day\'s date in the title');
    dateChangeChecks();
  });
});
