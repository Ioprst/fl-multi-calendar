/*globals expect, xDivTester, jasmine, moment, afterAll, beforeAll,  */

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

/**
 * @function getCalendars
 * @param {HTMLElement}
 * @return {array} of HTMLElements
 */
function getCalendars(xdiv) {
  var htmlCol = xdiv.querySelector('.calendars').children;
  return [].slice.call(htmlCol);
}

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
    window[configName] = config;
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
    jasmine.Ajax.uninstall();
    el.remove();
    delete window[configName];
  }

  describe('after initialised (with 1000px width) show', function () {
    var xdiv;
    var configName = 'xConf2';

    beforeAll(function (done) {
      window.innerWidth = 1000;
      var newConfig = clone(demoConf);
      xdiv = setupCalendar(newConfig, configName);
      xdiv.addEventListener('multiCalendarAllEventsRendered', function () {

        done(); //Make the specs async
      });
    });

    afterAll(function (done) {
      teardownCalendar(xdiv, configName);
      done();
    });

    it('as many calendars as elements in the "calendars" array in the config file',
      function (done) {
        var NumberOfCalendars = xdiv.querySelector('.calendars').children.length;
        expect(NumberOfCalendars).toEqual(demoConf.calendars.length);
        done();
      });

    it('a weekpicker', function (done) {
      var weekpickers = xdiv.querySelectorAll('input');
      expect(weekpickers).toBeDefined();
      expect(weekpickers.length).toEqual(1);
      done();
    });

    it('calendar titles according to the config object', function (done) {
      var calendars = getCalendars(xdiv);

      Array.prototype.forEach.call(calendars, function (cal, i) {
        var title;
        var titleContent;
        title = cal.querySelector('.fl-row-title a');
        expect(title).toBeDefined();
        titleContent = title.innerText;
        expect(titleContent).toEqual(window.xConf2.calendars[i].name);
        done();
      });
    });

    it('calendar descriptions according to the config object', function (done) {
      var calendars = getCalendars(xdiv);
      for (var i = 0; i < calendars.length; i++) {
        var description = calendars[i].querySelector('.fl-row-title em');
        expect(description).toBeDefined();
        var descriptionContent = description.innerText;
        expect(descriptionContent).toEqual(window.xConf2.calendars[i].description);
      }

      done();
    });

    it('control buttons', function (done) {
      var dateControlBtns = xdiv.querySelectorAll('.fc-button-group button');
      var refreshBtn = xdiv.querySelectorAll('.fc-button-group');
      var btnsTotal = dateControlBtns.length + refreshBtn.length;
      expect(btnsTotal).toEqual(4);
      done();
    });

    it('a main header', function (done) {
      var mainHeaderElements = xdiv.querySelectorAll('.fc-toolbar h2');
      expect(mainHeaderElements.length).toEqual(1);

      //Check that there is text in there
      //At least 13 letters "Jan 1 - 1 2016"
      expect(mainHeaderElements[0].innerText.length).toBeGreaterThan(13);
      done();
    });

    it('the same date in the weekpicker and in the main header', function (done) {
      var mainHeader = xdiv.querySelector('.fc-toolbar h2');
      var mainTitle = mainHeader.innerText;
      var weekPicker = xdiv.querySelector('input');

      //Get date from main header
      //match ["Mar 7 — 13 2016", "Mar ", "13 2016"] in "Mar 7 — 13 2016"
      var titleMatch = mainTitle.match(/(\w+\s)+\w+\s\—\s(\w+\s\w+)$/) || [];
      var titeDateStr = titleMatch[1] + titleMatch[2];
      var titleDate = moment(titeDateStr, 'MMM DD YYYY');
      var titleWeek = titleDate.format('YYYY') + '-W' + titleDate.format('WW');

      var weekPickerWeek = weekPicker.value;
      expect(titleWeek).toEqual(weekPickerWeek);
      done();
    });

    it('the loaded events that happen today', function (done) {
      var calendars = getCalendars(xdiv);

      Array.prototype.forEach.call(calendars, function (cal) {
        var events = cal.querySelectorAll('.fc-event-container');

        //The demostration data has only one event this week.
        expect(events.length).toEqual(1);
        var eventText = events[0].innerText.toLowerCase();
        expect(eventText.indexOf('today')).toBeGreaterThan(-1);
      });

      done();
    });
  });

  function addClickSpies(config) {
    //Create spies and add them to config obj.
    var eventClickSpy = jasmine.createSpy();
    var dayHeaderClickSpy = jasmine.createSpy();
    var titleClickSpy = jasmine.createSpy();

    config.calendars.forEach(function (cal) {
      cal.eventClick = eventClickSpy;
      cal.dayHeaderClick = dayHeaderClickSpy;
      cal.titleClick = titleClickSpy;
    });

    return [eventClickSpy, dayHeaderClickSpy, titleClickSpy];
  }

  describe('fire config click event when clicking on', function () {
    var xdiv;
    var configName = 'xConf3';
    var eventClickSpy;
    var dayHeaderClickSpy;
    var titleClickSpy;
    beforeAll(function (done) {
      var newConfig = clone(demoConf);
      var spies = addClickSpies(newConfig);
      eventClickSpy = spies [0];
      dayHeaderClickSpy = spies[1];
      titleClickSpy = spies[2];

      xdiv = setupCalendar(newConfig, configName);
      xdiv.addEventListener('multiCalendarAllEventsRendered', function () {
        done(); //Make the specs async
      });
    });

    afterAll(function (done) {
      teardownCalendar(xdiv, configName);
      done();
    });

    it('day headers', function (done) {
      var calendars = getCalendars(xdiv);
      var dayHeaders;
      var clickCounter = 0;
      calendars.forEach(function (cal) {
        dayHeaders = cal.querySelectorAll('.fc-day-header');
        dayHeaders = [].slice.call(dayHeaders); //Convert HTMLCollection to array
        dayHeaders.forEach(function (header) {
          header.click();
          clickCounter++;
        });
      });

      expect(dayHeaderClickSpy).toHaveBeenCalledTimes(clickCounter);
      done();
    });

    it('events', function (done) {
      var calendars = getCalendars(xdiv);
      var events;
      var clickCounter = 0;
      calendars.forEach(function (cal) {
        events = cal.querySelectorAll('.fc-title');
        events = [].slice.call(events); //Convert HTMLCollection to array
        events.forEach(function (event) {
          event.click();
          clickCounter++;
        });
      });

      expect(eventClickSpy).toHaveBeenCalledTimes(clickCounter);
      done();
    });

    it('titles', function (done) {
      var calendars = getCalendars(xdiv);
      var title;
      var clickCounter = 0;
      calendars.forEach(function (cal) {
        title = cal.querySelector('.fl-row-title a');
        title.click();
        clickCounter++;
      });

      expect(titleClickSpy).toHaveBeenCalledTimes(clickCounter);
      done();
    });

    it('descriptions', function (done) {
      var calendars = getCalendars(xdiv);
      var description;
      var clickCounter = 0;
      calendars.forEach(function (cal) {
        description = cal.querySelector('.fl-row-title em');
        description.click();
        clickCounter++;
      });

      expect(titleClickSpy).toHaveBeenCalledTimes(clickCounter);
      done();
    });
  });

  describe('not fire a config click event when clicking on', function () {
    //NOTE: Code repetition. gotta be replaced when I have some time.
    var xdiv;
    var configName = 'xConf4';
    var spies;
    beforeAll(function (done) {
      var newConfig = clone(demoConf);
      spies = addClickSpies(newConfig);
      xdiv = setupCalendar(newConfig, configName);
      xdiv.addEventListener('multiCalendarAllEventsRendered', function () {
        done(); //Make the specs async
      });
    });

    afterAll(function (done) {
      teardownCalendar(xdiv, configName);
      done();
    });

    xit('an empty day', function () {
      var days = xdiv.querySelectorAll('.fc-day');
      days = [].slice.call(days);
      days.forEach(function (day) {
        day.click();
      });

      spies.forEach(function (spy) {
        expect(spy).not.toHaveBeenCalled();
      });
    });

    xit('outside of the calendar', function () {
      document.body.click();
      spies.forEach(function (spy) {
        expect(spy).not.toHaveBeenCalled();
      });
    });

    xit('the main calendar title', function () {
      var mainTitle = xdiv.querySelector('.fc-toolbar h2');
      mainTitle.click();

      spies.forEach(function (spy) {
        expect(spy).not.toHaveBeenCalled();
      });
    });

    xit('any of the control buttons', function () {
      var dateControlBtns = xdiv.querySelectorAll('.fc-button-group button');
      var refreshBtns = xdiv.querySelectorAll('.fc-button-group');
      var btns = [].concat.call(dateControlBtns, refreshBtns);

      btns.forEach(function (btn) {
        btn.click();
      });

      spies.forEach(function (spy) {
        expect(spy).not.toHaveBeenCalled();
      });
    });
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
