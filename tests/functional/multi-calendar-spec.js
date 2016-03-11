/*globals expect, xDivTester, jasmine, moment, afterAll, beforeAll */

'use strict'; //jshint ignore:line

// Clone an object
function clone(obj) {
  var temp;
  if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj) {
    return obj;
  }

  if (obj instanceof Date) {
    temp = new obj.constructor(); //or new Date(obj);
  } else {
    temp = obj.constructor();
  }

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      obj.isActiveClone = null;
      temp[key] = clone(obj[key]);
      delete obj.isActiveClone;
    }
  }

  return temp;
}

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
    title: 'Today event 1',
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
    title: 'Today event 2',
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
      window.xConf = clone(demoConf);
      xdiv = document.createElement('x-div');
      xdiv.setAttribute('data-config', 'xConf');
    });

    afterEach(function () {
      xdiv.remove();
      delete window.xConf;
    });

    it('throw if there is no config file', function () {
      xdiv.removeAttribute('data-config');
      expect(function () { xDivTester.callWith(xdiv); }).toThrowError(/config/i);
    });

    it('throw if the config file does not exist', function () {
      delete window.xConf;
      expect(function () {  xDivTester.callWith(xdiv); }).toThrowError(/config/i);
    });

    it('throw if there is no loadUrl in the config', function () {
      window.xConf = Object.create(demoConf);
      window.xConf.loadUrl = undefined;
      expect(function () {  xDivTester.callWith(xdiv); }).toThrowError(/url/i);
    });

    it('throw if loadUrl is invalid', function () {
      window.xConf.loadUrl = '```';
      expect(function () { xDivTester.callWith(xdiv); }).toThrowError(/url/i);
    });

    it('throw if there is no "calendars" field in the config file', function () {
      window.xConf.calendars = undefined;
      expect(function () { xDivTester.callWith(xdiv); }).toThrowError(/calendars/i);
    });

    it('throw if the "calendars" field is not an array', function () {
      window.xConf.calendars = {};
      expect(function () { xDivTester.callWith(xdiv); }).toThrowError(/calendars/i);
    });

    it('throw if the "calendars" array is empty', function () {
      window.xConf.calendars = [];
      expect(function () { xDivTester.callWith(xdiv); }).toThrowError(/calendars/i);
    });

    it('throw if a calendar element doesn\'t have a uid', function () {
      window.xConf.calendars[0].uid = undefined;
      expect(function () { xDivTester.callWith(xdiv); }).toThrowError(/uid/);
    });

    it('not throw if a calendar element doesn\'t have a name', function () {
      window.xConf.calendars[0].name = undefined;
      expect(function () { xDivTester.callWith(xdiv); }).not.toThrowError();
    });

    it('not throw if a calendar element doesn\'t have a description', function () {
      window.xConf.calendars[0].description = undefined;
      expect(function () { xDivTester.callWith(xdiv); }).not.toThrowError();
    });

    it('not throw if a calendar element doesn\'t have click functions', function () {
      window.xConf.calendars[0].titleClick = undefined;
      window.xConf.calendars[0].dayHeaderClick = undefined;
      window.xConf.calendars[0].eventClick = undefined;
      expect(function () { xDivTester.callWith(xdiv); }).not.toThrowError();
    });

  });

  //Prepares an x-div for setup and teardown within a suite.
  function setupCalendar(config, configName) {
    //Begin to listen for http calls using the XMLHttpRequest function
    jasmine.Ajax.install();

    //Initialise calendar
    window.xConf2 = config;
    var xdiv = document.createElement('x-div');
    xdiv.setAttribute('data-config', configName);
    document.body.appendChild(xdiv);
    xDivTester.callWith(xdiv);

    //Respond request
    var request = jasmine.Ajax.requests.mostRecent();
    request.respondWith({
      status: 200,
      responseText: JSON.stringify(demoData),
    });

    return xdiv;
  }

  function teardownCalendar(el, configName) {
    el.remove();
    delete window[configName];
  }

  describe('after initialised (with 1000px width) show', function () {
    var xdiv;
    var configName = 'xConf2';

    beforeAll(function () {
      window.innerWidth = 1000;
      var newConfig = clone(demoConf);
      xdiv = setupCalendar(newConfig, configName);
    });

    afterAll(function () {
      teardownCalendar(xdiv, configName);
    });

    it('as many calendars as elements in the "calendars" array in the config file', function () {
      var NumberOfCalendars = xdiv.querySelector('.calendars').children.length;
      expect(NumberOfCalendars).toEqual(demoConf.calendars.length);
    });

    it('a weekpicker', function () {
      var weekpickers = xdiv.querySelectorAll('input');
      expect(weekpickers).toBeDefined();
      expect(weekpickers.length).toEqual(1);
    });

    it('calendar titles according to the config object', function () {
      var calendars = xdiv.querySelector('.calendars').children;

      Array.prototype.forEach.call(calendars, function (cal, i) {
        var title;
        var titleContent;
        title = cal.querySelector('.fl-row-title a');
        expect(title).toBeDefined();
        titleContent = title.innerText;
        expect(titleContent).toEqual(window.xConf2.calendars[i].name);
      });
    });

    it('calendar descriptions according to the config object', function () {
      var calendars = xdiv.querySelector('.calendars').children;
      for (var i = 0; i < calendars.length; i++) {
        var description = calendars[i].querySelector('.fl-row-title em');
        expect(description).toBeDefined();
        var descriptionContent = description.innerText;
        expect(descriptionContent).toEqual(window.xConf2.calendars[i].description);
      }
    });

    it('control buttons', function () {
      var dateControlBtns = xdiv.querySelectorAll('.fc-button-group button');
      var refreshBtn = xdiv.querySelectorAll('.fc-button-group');
      var btnsTotal = dateControlBtns.length + refreshBtn.length;
      expect(btnsTotal).toEqual(4);
    });

    it('a main header', function () {
      var mainHeaderElements = xdiv.querySelectorAll('.fc-toolbar h2');
      expect(mainHeaderElements.length).toEqual(1);

      //Check that there is text in there
      //At least 13 letters "Jan 1 - 1 2016"
      expect(mainHeaderElements[0].innerText.length).toBeGreaterThan(13);
    });

    it('the same date in the weekpicker and in the main header', function () {
      var mainHeader = xdiv.querySelector('.fc-toolbar h2');
      var mainTitle = mainHeader.innerText;
      var weekPicker = xdiv.querySelector('input');

      //Get date from main header
      //match ["Mar 7 — 13 2016", "Mar ", "13 2016"] in "Mar 7 — 13 2016"
      var titleMatch = mainTitle.match(/(\w+\s)+\w+\s\—\s(\w+\s\w+)$/) || [];
      var titeDateStr = titleMatch[1] + titleMatch[2];
      var titleDate = moment(titeDateStr);
      var titleWeek = titleDate.format('YYYY') + '-W' + titleDate.format('WW');

      var weekPickerWeek = weekPicker.value;
      expect(titleWeek).toEqual(weekPickerWeek);
    });

    it('the loaded events that happen today', function () {
      var calendars = xdiv.querySelector('.calendars').children;

      Array.prototype.forEach.call(calendars, function (cal) {
        var events = cal.querySelectorAll('.fc-event-container');

        //The demostration data has only one event this week.
        expect(events.length).toEqual(1);
        var eventText = events[0].innerText.toLowerCase();
        expect(eventText.indexOf('today')).toBeGreaterThan(-1);
      });
    });
  });

  describe('fire config click event when clicking on', function () {
    //Create config object
    var newConfig = clone(demoConf);

    //Create spies and add them to config obj.
    var eventClickSpy = jasmine.createSpy();
    var dayHeaderClickSpy = jasmine.createSpy();
    var titleClickSpy = jasmine.createSpy();

    newConfig.calendars.forEach(function (cal) {
      cal.eventClick = eventClickSpy;
      cal.dayHeaderClick = dayHeaderClickSpy;
      cal.titleClick = titleClickSpy;
    });

    // var xdiv = setupAndTeardownMultiCalendar(newConfig);

    xit('day headers');
    xit('events');
    xit('titles');
    xit('descriptions');
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

  describe('in a screen width of 600px', function () {
    xit('show in the day mode');
    xit('show weekpicker date by weeks');
    xit('show ony one day\'s date in the title');
    dateChangeChecks();
  });
});
