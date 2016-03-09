/*globals moment*/

// Control dates in the calendars, URL and datepicker
var dateController = (function () {
  'use strict';

  var views = [
    {
      name: 'basicDay',
      type: 'day',
      weekPickerType: 'date',
      format: 'YYYY-MM-DD',
    },
    {
      name: 'basicWeek',
      type: 'week',
      weekPickerType: 'week',
      format: 'YYYY-[W]WW',
    },
  ];
  var viewTypeIndex = 1;
  var currentStartDate = moment().format(views[viewTypeIndex].format); //String
  var weekPicker;

  /**
   * @function setWeekPickerDate
   * @param {String or MomentJS} newDate
   */
  function setWeekPickerDate(newDate) {
    weekPicker.value = moment(newDate).format(views[viewTypeIndex].format);
  }

  /**
   * @function setWeekPickerType
   * @param {String} type
   */
  function setWeekPickerType(type) {
    weekPicker.setAttribute('type', type);
  }

  /**
   * @function setURLDate
   * @param {String or MomentJS} date
   */
  function setURLDate(date) {
    // deep linking - set hash
    location.hash = 'start=' + moment(date).format('YYYY-MM-DD');
  }

  /**
   * @function setAllCalendarsDate
   * @param {String or MomentJS} date
   */
  function setAllCalendarsDate(date) {
    date = moment(date);

    //Tell all calendars about date change.
    var domEvent = new CustomEvent('fullCalendarViewRender', {
      detail: date
    });
    document.dispatchEvent(domEvent);
  }

  /**
   * @function setAllCalendarsView
   * @param {String} type
   */
  function setAllCalendarsView(type) {
    //Tell all calendars about date change.
    var domEvent = new CustomEvent('multiCalendarViewChange', {
      detail: type
    });
    document.dispatchEvent(domEvent);
  }

  //---------------------------
  //  Returned functions
  //--------------------------
  function getDate() {
    return moment(currentStartDate);
  }

  //Sets the date for all calendars, weeekpicker and URL.
  function setDate(newDate) {
    newDate = moment(newDate);
    var current = moment(currentStartDate);
    if (current.diff(newDate, views[viewTypeIndex].type) !== 0) {
      currentStartDate = newDate.format(views[viewTypeIndex].format);
      setWeekPickerDate(currentStartDate);
      setAllCalendarsDate(currentStartDate);
      setURLDate(newDate);
    }
  }

  function setWeekPicker(el) {
    if (!el) {
      throw new Error('setWeekPicker(): Invalid element as weekpicker.');
    }

    weekPicker = el;
    setWeekPickerDate(currentStartDate);
    el.addEventListener('change', function () {
      setDate(el.value);
    });
  }

  //Set calendars view type.
  function setViewType(type) {
    //See if is one of the acceptable types
    var idx = -1;
    for (var i = 0; i < views.length; i++) {
      if (views[i].name === type) {
        idx = i;
        break;
      }
    }

    if (idx < 0) {
      console.error('setViewType(): Invalid view type.');
    } else if (idx !== viewTypeIndex) {
      viewTypeIndex = idx;

      //Change currentStartDate notation;
      currentStartDate = moment(currentStartDate).format(views[viewTypeIndex].format);
      setAllCalendarsView(views[viewTypeIndex].name);
      setWeekPickerType(views[viewTypeIndex].weekPickerType);
      setWeekPickerDate(currentStartDate);
    }
  }

  function getViewType() {
    return views[viewTypeIndex].name;
  }

  return {
    getDate: getDate,
    setDate: setDate,
    setWeekPicker: setWeekPicker,
    setViewType: setViewType,
    getViewType: getViewType,
  };
}());
