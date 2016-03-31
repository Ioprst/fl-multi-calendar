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
    start: moment().format('YYYY-MM-DD') + ' 09:00:00',
    end: moment().format('YYYY-MM-DD') + ' 18:00:00',
    tooltip: 'LOL'
  }, {
    id: '12345',
    title: 'Following week 1',
    start: moment().add(7, 'days').format('YYYY-MM-DD') + ' 09:00:00',
    end: moment().add(7, 'days').format('YYYY-MM-DD') + ' 18:00:00',
    tooltip: 'LOOOOL'
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
    start: moment().format('YYYY-MM-DD') + ' 09:00:00',
    end: moment().format('YYYY-MM-DD') + ' 18:00:00',
    tooltip: 'LOL'
  }, {
    id: '12345',
    title: 'Following week 2',
    start: moment().add(7, 'days').format('YYYY-MM-DD') + ' 09:00:00',
    end: moment().add(7, 'days').format('YYYY-MM-DD') + ' 18:00:00',
    tooltip: 'LOOOOL'
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
  }, ],
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

//Testing for date changes
function dateChangeMatches(globals) {
  it('have changed the main title', function () {
    var xdiv = globals.xdiv;
    var newCalDate = globals.newCalDate;
    var title = xdiv.querySelector('.fc-toolbar h2').innerText;

    //Check for the year
    var year = newCalDate.format('YYYY');
    expect(title.indexOf(year)).toBeGreaterThan(-1);

    //Check for the day
    var day = newCalDate.format('D');
    expect(title.indexOf(day)).toBeGreaterThan(-1);

    //Check for the month
    var month = newCalDate.format('MMM').toLowerCase();
    expect(title.toLowerCase().indexOf(month)).toBeGreaterThan(-1);
  });

  it('have changed the url hash', function () {
    var newCalDate = globals.newCalDate;
    var newDateStr = newCalDate.format('YYYY-MM-DD');
    expect(location.hash.indexOf(newDateStr)).toBeGreaterThan(-1);
  });

  it('have changed the dates shown in the calendar', function () {
    var xdiv = globals.xdiv;
    var newCalDate = globals.newCalDate;
    var calendars = getCalendars(xdiv);

    var newDateDayStr;
    if (xdiv.querySelector('input[type=week]')) {
      newDateDayStr = newCalDate.format('D');
    } else {
      //We are expecting a weekday to be showing
      newDateDayStr = newCalDate.format('dddd').toLowerCase();
    }

    var dayHeaders;
    var matchingHeaders = 0;
    dayHeaders = xdiv.querySelectorAll('.fc-day-header');
    dayHeaders = [].slice.call(dayHeaders);
    dayHeaders.forEach(function (header) {
      if (header.innerText.toLowerCase().indexOf(newDateDayStr) >= 0) {
        matchingHeaders++;
      }
    });

    expect(matchingHeaders === calendars.length).toBe(true);
  });

  it('have changed the dates of all calendars to the same value', function () {
    var xdiv = globals.xdiv;
    var calendars = getCalendars(xdiv);
    var dayHeaders = xdiv.querySelectorAll('.fc-day-header');
    var daysBeingDisplayed = dayHeaders.length / calendars.length;
    var day;
    var i;
    var j;
    for (i = 0; i < daysBeingDisplayed; i++) {
      day = dayHeaders[i].innerText;
      for (j = 0; j < calendars.length; j++) {
        expect(calendars[j].querySelectorAll('.fc-day-header')[i].innerText).toEqual(day);
      }
    }
  });

  it('show the events happening in the new date', function (done) {
    var xdiv = globals.xdiv;
    var calendars = getCalendars(xdiv);

    calendars.forEach(function (cal) {
      var events = cal.querySelectorAll('.fc-event-container');

      //The demostration data has only one event this week.
      expect(events.length).toEqual(1);
      var eventText = events[0].innerText.toLowerCase();
      expect(eventText.indexOf('following week')).toBeGreaterThan(-1);
    });

    done();
  });
}

function whenChangingDates(globals) {
  describe('when changing the date', function () {
    describe('via the weekpicker', function () {
      beforeAll(function (done) {
        var xdiv = globals.xdiv;
        function listener() {
          done(); //Make the specs async
          xdiv.removeEventListener('multiCalendarAllEventsRendered', listener);
        };

        xdiv.addEventListener('multiCalendarAllEventsRendered', listener);

        jasmine.Ajax.uninstall();
        jasmine.Ajax.install();

        // Change date in weekpicker
        var format;
        var weekpicker = xdiv.querySelector('input[type=date]');
        if (weekpicker) {
          format = 'YYYY-MM-DD';
          globals.oldCalDate = moment(weekpicker.value, format);
          globals.newCalDate = moment(globals.oldCalDate).add(7, 'days');
          weekpicker.value = globals.newCalDate.format(format);
        } else {
          weekpicker = xdiv.querySelector('input[type=week]');
          globals.oldCalDate = moment(weekpicker.value, 'YYYY-W');
          globals.newCalDate = moment(globals.oldCalDate).add(7, 'days');
          weekpicker.value = globals.newCalDate.format('YYYY') + '-W' + globals.newCalDate.format('W');
        }

        // Emmit event saying the date was changed
        var ev = new Event('change');
        weekpicker.dispatchEvent(ev);

        //Respond request
        var request = jasmine.Ajax.requests.mostRecent();
        request.respondWith({
          status: 200,
          responseText: JSON.stringify(demoData),
        });
      });

      afterAll(function () {
        jasmine.Ajax.uninstall();
      });

      dateChangeMatches(globals);
    });

    describe('via the left arrow', function () {
      //TODO: Fix this test and the next one.
      // beforeAll(function (done) {
      //   var xdiv = globals.xdiv;
      //   xdiv.addEventListener('multiCalendarAllEventsRendered', function () {
      //     done(); //Make the specs async
      //   });
      //
      //   jasmine.Ajax.uninstall();
      //   jasmine.Ajax.install();
      //
      //
      //   // Click arrow
      //   var leftArrow = xdiv.querySelector('button.fc-prev-button');
      //   leftArrow.click();
      //
      //   //Respond request
      //   var request = jasmine.Ajax.requests.mostRecent();
      //   request.respondWith({
      //     status: 200,
      //     responseText: JSON.stringify(demoData),
      //   });
      // });
      //
      // afterAll(function () {
      //   jasmine.Ajax.uninstall();
      // });
      dateChangeMatches(globals);
    });

    describe('via the right arrow', function () {
      //TODO: ceck if this is really checking any change.
      dateChangeMatches(globals);
    });
  });

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
      expect(function () {
        xDivTester.callWith(xdiv);
      }).toThrowError(/config/i);
    });

    it('throw if the config file does not exist', function () {
      delete window.xConf;
      expect(function () {
        xDivTester.callWith(xdiv);
      }).toThrowError(/config/i);
    });

    it('throw if there is no loadUrl in the config', function () {
      window.xConf = Object.create(demoConf);
      window.xConf.loadUrl = undefined;
      expect(function () {
        xDivTester.callWith(xdiv);
      }).toThrowError(/url/i);
    });

    it('throw if loadUrl is invalid', function () {
      window.xConf.loadUrl = '```';
      expect(function () {
        xDivTester.callWith(xdiv);
      }).toThrowError(/url/i);
    });

    it('throw if there is no "calendars" field in the config file', function () {
      window.xConf.calendars = undefined;
      expect(function () {
        xDivTester.callWith(xdiv);
      }).toThrowError(/calendars/i);
    });

    it('throw if the "calendars" field is not an array', function () {
      window.xConf.calendars = {};
      expect(function () {
        xDivTester.callWith(xdiv);
      }).toThrowError(/calendars/i);
    });

    it('throw if the "calendars" array is empty', function () {
      window.xConf.calendars = [];
      expect(function () {
        xDivTester.callWith(xdiv);
      }).toThrowError(/calendars/i);
    });

    it('throw if a calendar element doesn\'t have a uid', function () {
      window.xConf.calendars[0].uid = undefined;
      expect(function () {
        xDivTester.callWith(xdiv);
      }).toThrowError(/uid/);
    });

    it('not throw if a calendar element doesn\'t have a name', function () {
      window.xConf.calendars[0].name = undefined;
      expect(function () {
        xDivTester.callWith(xdiv);
      }).not.toThrowError();
    });

    it('not throw if a calendar element doesn\'t have a description', function () {
      window.xConf.calendars[0].description = undefined;
      expect(function () {
        xDivTester.callWith(xdiv);
      }).not.toThrowError();
    });

    it('not throw if a calendar element doesn\'t have click functions', function () {
      window.xConf.calendars[0].titleClick = undefined;
      window.xConf.calendars[0].dayHeaderClick = undefined;
      window.xConf.calendars[0].eventClick = undefined;
      expect(function () {
        xDivTester.callWith(xdiv);
      }).not.toThrowError();
    });

  });

  //Prepares an x-div for setup and teardown within a suite.
  function setupCalendar(config, configName) {
    //Begin to listen for http calls using the XMLHttpRequest function
    jasmine.Ajax.uninstall();
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
      //match ["Mar 28 — Apr 3 2016", "Mar ", "Apr"] in "Mar 28 — Apr 2016"
      var month = mainTitle.match(/[a-zA-Z]{3}/g) || [];

      //match ["Mar 28 — Apr 3 2016", "3 2016"] in "Mar 28 — Apr 2016"
      var dayAndYear = mainTitle.match(/[0-9]+\s[0-9]{2,4}$/) || [];

      var titeDateStr = month.pop() + ' ' + dayAndYear.pop();
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
      eventClickSpy = spies[0];
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

    it('an empty day', function () {
      var days = xdiv.querySelectorAll('.fc-day');
      days = [].slice.call(days);
      days.forEach(function (day) {
        day.click();
      });

      spies.forEach(function (spy) {
        expect(spy).not.toHaveBeenCalled();
      });
    });

    it('outside of the calendar', function () {
      document.body.click();
      spies.forEach(function (spy) {
        expect(spy).not.toHaveBeenCalled();
      });
    });

    it('the main calendar title', function () {
      var mainTitle = xdiv.querySelector('.fc-toolbar h2');
      mainTitle.click();

      spies.forEach(function (spy) {
        expect(spy).not.toHaveBeenCalled();
      });
    });

    it('any of the control buttons', function () {
      var dateControlBtns = xdiv.querySelectorAll('.fc-button-group button');
      var refreshBtns = xdiv.querySelectorAll('.fc-button-group');
      dateControlBtns = [].slice.call(dateControlBtns);
      refreshBtns = [].slice.call(refreshBtns);

      var btns = dateControlBtns.concat(refreshBtns);
      btns.forEach(function (btn) {
        btn.click();
      });

      spies.forEach(function (spy) {
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  describe('in a screen width of 1000px', function () {
    var wrapperObj = {};
    var xdiv;
    var configName = 'xConf5';
    beforeAll(function (done) {
      var newConfig = clone(demoConf);
      window.innerWidth = 1000;
      wrapperObj.xdiv = setupCalendar(newConfig, configName);
      xdiv = wrapperObj.xdiv;
      xdiv.addEventListener('multiCalendarAllEventsRendered', function () {
        done(); //Make the specs async
      });
    });

    afterAll(function (done) {
      teardownCalendar(xdiv, configName);
      done();
    });

    it('show in the week mode', function (done) {
      var calendars = getCalendars(xdiv);
      var daysShowing;
      calendars.forEach(function (cal) {
        daysShowing = cal.querySelectorAll('.fc-day');
        expect(daysShowing.length).toBeGreaterThan(4);
      });

      done();
    });

    it('show weekpicker date by weeks', function (done) {
      var weekpicker = xdiv.querySelector('input[type=week]');
      expect(weekpicker).toBeDefined();
      done();
    });

    it('show title in day range', function (done) {
      var title = xdiv.querySelector('.fc-toolbar h2');
      var titleText = title.innerText;

      //If there is a dash, then there is a date range.
      expect(titleText.indexOf('—') >= 0 || titleText.indexOf('-') >= 0).toBeTruthy();
      done();
    });

    whenChangingDates(wrapperObj);
  });

  describe('in a screen width of 600px', function () {
    var wrapperObj = {};
    var configName = 'xConf5';
    beforeAll(function (done) {
      var newConfig = clone(demoConf);
      window.innerWidth = 600;
      wrapperObj.xdiv = setupCalendar(newConfig, configName);
      wrapperObj.xdiv.addEventListener('multiCalendarAllEventsRendered', function () {
        done(); //Make the specs async
      });
    });

    afterAll(function (done) {
      teardownCalendar(wrapperObj.xdiv, configName);
      done();
    });

    it('show in the day mode', function () {
      var calendars = getCalendars(wrapperObj.xdiv);
      var daysShowing;
      calendars.forEach(function (cal) {
        daysShowing = cal.querySelectorAll('.fc-day');
        expect(daysShowing.length).toEqual(1);
      });
    });

    it('show weekpicker date in days', function () {
      var weekpicker = wrapperObj.xdiv.querySelector('input[type=date]');
      expect(weekpicker).toBeDefined();
    });

    it('show ony one day\'s date in the title', function () {
      var title = wrapperObj.xdiv.querySelector('.fc-toolbar h2');
      var titleText = title.innerText;

      //If there is a dash, then there is a date range.
      expect(titleText.indexOf('—') >= 0 || titleText.indexOf('-') >= 0).toBeFalsy();
    });

    whenChangingDates(wrapperObj);
  });
});
