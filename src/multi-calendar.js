/*globals moment, alert*/

//NOTE: Refactoring plan of action:
// - Make as many functions as possible use nothing but their own parameters (DONE)
// - Separate modal design from javascript (DONE)
// - Separate popup design from javascript (DONE)
// - Separate general calendar code from Hive-specific code.
// - Couple script more loosely to HTML.
// - Create tests.

function DJDCalendar(targetEl, configurationObj) { //jshint ignore:line
  'use strict';

  if (!(this instanceof DJDCalendar)) {
    return new DJDCalendar(arguments[0], arguments[1]);
  }

  //GLOBALS
  var calendarClass = 'js-cal-calendar';
  var _this = this;
  var eventLoader;
  var weekPicker; //HTMLElement

  // eventLoader takes care of loading stuff from the server.
  eventLoader = (function eventLoader() {
    //Private vars
    var initialised = false;
    var loadURL;
    var uids;
    var lastPromise;
    var lastStartDate;
    var lastEndDate;
    var isFetching = false;

    function init(pUids, pLoadURL) {
      initialised = true;
      loadURL = pLoadURL;
      uids = pUids;
    }

    /**
    * @method load: loads calendar events from server from start date to end
    *         	 date and returns a promise which will be resolved with the data
    * 							from the server.
    * @param  {Date}   start          [optional]
    * @param  {Date}   end            [optional]
    * @param  {boolean}   forceReload
    * @return {Promise}               The promise will be resolved with
    *                                     the data that was loaded or
    *                                     will be rejected.
    */
    function load(start, end) {
      if (!initialised || (!start && !lastStartDate)) {
        return Promise.reject();
      }

      start = start || lastStartDate;
      end = end || lastEndDate;

      // If it is loading just return the promise that is loading already
      // If data is in cache and is not a forceReload return the last promise
      // as it will already be resolved and contain the result.
      if (isFetching) {
        return Promise.resolve(lastPromise);
      }

      //Register that we are loading
      $('#loading').show();
      isFetching = true;

      lastPromise = new Promise(function (resolve, reject) {
        $.ajax({
          type: 'post',
          url: loadURL,
          dataType: 'json',
          cache: false,
          data: {
            uid: uids,
            start: moment(start).format('X'),
            end: moment(end).format('X'),
          },
          success: function (data) {
            $('#loading').hide();
            if (data === null) {
              alert('Error fetching events. Please refresh.');
              reject(false);
              return;
            }

            //Set the new presets
            lastStartDate = start;
            lastEndDate = end;
            isFetching = false;
            resolve(data);
          },
        });
      });

      return lastPromise;
    }

    /**
    * Immediately returns events in cache and triggers a reload of data from
    * the server. If there is nothing in the cache then it returns a promise
    * from load(), which will only be fulfilled when the server answer.
    * @function getEvents
    * @param  {Date} start
    * @param  {Date} end
    * @return {Promise}       A promise that will be resolved with the server data.
    */
    function getEvents(start, end) {
      var returnObj;

      if (!start || !start.valueOf || !end || !end.valueOf) {
        return Promise.reject();
      }

      var isInCache;
      if (lastStartDate && lastEndDate) {
        isInCache = (lastStartDate.valueOf() === start.valueOf() &&
            lastEndDate.valueOf() === end.valueOf());
      }

      if (isInCache) {
        returnObj = Promise.resolve(lastPromise);
      } else if (lastPromise) {
        returnObj = Promise.resolve(lastPromise);
        load(start, end);
      } else {
        returnObj = load(start, end);
      }

      return returnObj;
    }

    return {
      init: init,
      load: load,
      getEvents: getEvents,
    };
  }());

  /**
  * @method autoReload : Calls reload() every couple seconds.
  * @param  {boolean}   activate    Turn autoreload on or off.
  * @return {void}
  */
  var autoReload = (function () {
    //Private variables
    var timer;
    function autoReloader() {
      _this.reload();
    }

    //Real function
    return function (activate) {
      if (activate) {
        //TODO: set this interval back to 60 seconds
        timer = setInterval(autoReloader, 60000);
      } else {
        clearInterval(timer);
      }
    };
  }());

  /**
   * Substitute an element by a copy with all of its attributes. Possibly
   * a copy with a different tag name.
   * @function replaceByEmptyCopy
   * @param  {HTMLElement} el         Element to be substituted
   * @param  {[String]} newTagName Optional new tagName.
   * @return {HTMLElement}            The new element or null.
   */
  function replaceByEmptyCopy(el, newTagName) {
    if (!el || !el.parentNode) return null;
    var newEl = document.createElement(newTagName || el.tagName);
    var elAttributes = el.attributes;
    var attrName;
    var attrValue;
    var i;

    //Copy all attributes
    for (i = 0; i < elAttributes.length; i++) {
      attrName = elAttributes[i].nodeName;
      attrValue = el.getAttribute(attrName);
      newEl.setAttribute(attrName, attrValue);
    }

    //Switch original for new one
    el.parentNode.insertBefore(newEl, el);
    el.remove();
    return newEl;
  }

  function getToggleWeekendText() {
    if ($.cookie('show-weekends') === 'true') {
      return 'Hide weekends';
    } else {
      return 'Show weekends';
    }
  }

  /**
   * Reload page with different show_weekends cookie value, which will make
   * Saturday and Sunday be displayed in all calendars.
   * @function toggleWeekend
   * @return {void}
   */
  function toggleWeekend() {
    var showWeekends = $.cookie('show-weekends') === 'true';
    $.cookie('show-weekends', !showWeekends);
    location.reload();
  }

  /**
   * Reload page with different value for show-staff cookie
   * @function toggleStaff
   * @return {void}
   */
  var toggleStaff = function () {
    var showStaff = $.cookie('show-staff') === 'true';
    $.cookie('show-staff', !showStaff);
    location.reload();
  };

  /**
   * Will make the header that is already there be sticky.
   * @function setupStickyHeader
   * @return {void}
   */
  var setupStickyHeader = function () {
    var $visible = $('.box-title');
    var $header = $('.fc-header:eq(0)');
    var width = $header.innerWidth();

    window.addEventListener('scroll', $.throttle(100, function () {
      if ($visible.visible(true)) {
        $header
          .removeClass('sticky')
          .css('width', '100%');
      } else if ($header.css('position') === 'static') {
        $header
          .addClass('sticky')
          .css('width', width + 'px');
      }
    }));
  };

  function setWeekPickerDate(newDate) {
    var $weekpicker = $('#calendar-week');
    var oldDateStr = $weekpicker.val();

    //Get current weekpicker value format
    var format = 'YYYY-[W]WW';
    if (oldDateStr.match(/\d{2}\/\d{2}\/\d{4}/)) {
      format = 'DD/MM/YYYY';
    }

    //Update it with the new one
    var newDateStr = moment(newDate).format(format);
    $weekpicker.val(newDateStr);
  }

  function setURLDate(date) {
    // deep linking - set hash
    location.hash = 'start=' + moment(date).format('YYYY-MM-DD');
  }

  function setAllCalendarsDate(date) {
    //Tell all calendars about date change.
    var domEvent = new CustomEvent('fullCalendarViewRender', {
      detail: date
    });
    document.dispatchEvent(domEvent);
  }

  /**
   * Sets a start date for all calendars and makes all necessary changes
   * in the page and URL corresponding to this date change.
   * @function setStartDate
   * @param {Date} date
   */
  function setStartDate(date) {
    //TODO: this line should be in a 'calendarReloaded' event.
    // Popover.destroy();

    setWeekPickerDate(date);
    setAllCalendarsDate(date);
    setURLDate(date);
  }

  // ===============================
  //  fullCalendar Callbacks and initialisation
  // ===============================

  /**
   * fullCalendar.js will call this function for all the calendars more or less
   * at the same time. They will all receive the same promise form eventLoade.load
   * and each will execute their own '.then' function on completion, which will
   * call the corresponding callback function on the corresponding data for this
   * element.
   * @function loadServerDataIntoCalendar
   * @param  {String}  uid
   * @param  {Date}   start
   * @param  {Date}   end
   * @param  {Function} callback   fullCalendar.js specific function that must
   *                               	be called on loaded data.
   * @return {void}
   */
  function loadServerDataIntoCalendar(start, end, uid, callback) {
    //Get events from server and call 'callback' on the corresponding
    //response array element for this calendar's uid.
    eventLoader.getEvents(start, end)
      .then(function (loadedData) {
        callback(loadedData[uid]);
      })
      .catch(function () {});
  }

  /**
   * Prepares an HTMLElement to display an event whose information is in
   * the 'event' parameter
   * @function setEventTitle
   * @param {Object} event Object containing information about a specific
   *                       				calendar event.
   * @param {HTMLElement} el    Element to be edited.
   */
  function setEventTitle(event, el) {
    //Get DOM element
    if (el[0]) {
      el = el[0];
    }

    el.setAttribute('id', 'event-' + event.id);
    el.event = event;

    //The standard eventTitleEl is a <span> element. Let's substitute it
    //for a <div> with the title content we want.
    var eventTitleEl = el.querySelector('.fc-event-title');
    var newEventTitleEl = replaceByEmptyCopy(eventTitleEl, 'div');
    newEventTitleEl.innerHTML = event.title;

    if (event.tooltip) {
      el.setAttribute('title', event.tooltip);
    }

    return el;
  }

  /**
   * Creates a function that will take care of adjusting the height of a
   * specific calendar element.
   * @function createAdjustCalendarHeightFunction
   * @param  {HTMLElement} calendarEl         Element to which a fullCalendar
   *                                          	object has been assigned
   * @return {function} adjustCalendarHeight  A function that will take care of
   *                                          	adjusting the calendar
   *                                          	element's height
   */
  function createAdjustCalendarHeightFunction(calendarEl) {
    return (function () {
      //Private variables
      var blockNextExecution = false;

      //Real function
      return function adjustCalendarHeight() {
        //NOTE: this function is called by fullCalendar's eventAfterAllRender
        //but it also triggers a re-rendering, thus triggering
        //eventAfterAllRender and then another call to itself. To avoid an
        //infinite loop it will only be executed every other time it is called.
        blockNextExecution = !blockNextExecution;
        if (!blockNextExecution) {
          return;
        }

        //Calculate the appropriate height
        var minimumBottomPadding = 80;
        var eventElement = calendarEl.querySelector('.fc-day-content');
        var eventElementHeight = eventElement.clientHeight;
        var calculatedHeight = eventElementHeight + minimumBottomPadding;
        var height = Math.max(calculatedHeight, 120);

        //Set the height
        $(calendarEl).fullCalendar('option', 'contentHeight', height);

        // deduct margins for left col
        $(calendarEl).parent().prev().css('height', height);

        //Destroy something. Only Jonny knows what.
        $('.fc-event')
          .not(':data(original-title),[data-original-title]')
          .tooltip({ container: 'body', placement: 'left' })
          .on('show.bs.tooltip', function () {
            $('a[aria-describedby^=tooltip]').tooltip('destroy');
          });
      };
    }());
  }

  /**
   * Set weekpicker's date.
   * (this function is only assigned to the controller calendar)
   * @function viewRenderHandler
   * @param  {Object} view
   * @return {void}
   */
  function viewRenderHandler(view) {
    setStartDate(view.start);
  }

  /**
   * Initiate a fullCalendar object in the element provided.
   * @function initFullCalendar
   * @param  {HTMLElement} calendarEl
   * @param  {boolean} controllerCalendar Whether this is the calendar that
   *                                      	will control all others.
   * @return {void}
   */
  function initFullCalendar(calendarEl, eventClick, controllerCalendar) {
    var defaultDate = location.hash.match(/(\d{4})-(\d{2})-(\d{2})/);
    var uid = calendarEl.dataset.uid;
    var $calendar = $(calendarEl);
    var controlBtns = {
      left: 'prev,next,today',
      center: 'title',
      right: ''
    };

    // Listen to date changes.
    document.addEventListener('fullCalendarViewRender', function (e) {
      var newDate = e.detail;
      $calendar.fullCalendar('gotoDate', newDate);
    });

    // init fullCalendar obj
    $calendar.fullCalendar({
      weekends: $.cookie('show-weekends') === 'true',
      header: (controllerCalendar) ? controlBtns : false,
      defaultView: 'basicWeek',
      editable: false,
      droppable: false,
      firstDay: 1,
      titleFormat: { week: 'MMMM d[, yyyy] \'&ndash;\'[ MMMM] d, yyyy' },
      columnFormat: { week: 'ddd, MMM d' },
      year: defaultDate ? defaultDate[1] : new Date().getFullYear(),
      month: defaultDate ? defaultDate[2] - 1 : new Date().getMonth(),
      date: defaultDate ? defaultDate[3] : new Date().getDate(),

      //Callbacks
      eventClick: eventClick,
      eventAfterAllRender: createAdjustCalendarHeightFunction(calendarEl),
      eventRender: setEventTitle,
      viewRender: (controllerCalendar) ? viewRenderHandler : undefined,

      //Called by "fullCalendar( 'refetchEvents' )"
      events: function (start, end, callback) {
        loadServerDataIntoCalendar(start, end, uid, callback);
      }
    });
  }

  // ===============================================
  //      Calendar event listener functions
  // ===============================================

  function listenToWeekpickerChanges() {
    var weekpicker = document.querySelector('#calendar-week');

    weekpicker.addEventListener('change', function weekPickerListener() {
      var format = 'YYYY-[W]WW';
      if (weekpicker.value.match(/\d{2}\/\d{2}\/\d{4}/)) {
        format = 'DD/MM/YYYY';
      }

      var date = moment(weekpicker.value, format).weekday(1);
      var newDateString = date.valueOf();

      setStartDate(new Date(newDateString));
    });
  }

  /**
   * Assigns a function to be called when the user clicks on the day header in
   * 	a specific calendar.
   * @function setDayHeaderClickListener
   * @param {HTMLElement}   calendarEl
   * @param {String}  uid
   * @param {Function} callback
   */
  function setDayHeaderClickListener(calendarEl, uid, callback) {
    var weekDayHeaderClass = 'fc-day-header';
    if (typeof callback !== 'function') {
      return;
    }

    calendarEl.addEventListener('click', function (e) {

      //Check if click was in the day header.
      if (!e.target || !e.target.classList ||
        !e.target.classList.contains(weekDayHeaderClass)) {
        return;
      }

      //TODO: handle errors here.
      //Get index of header clicked in relation to other headers.
      var nodeList = Array.prototype.slice.call(e.target.parentNode.children);
      var index = nodeList.indexOf(e.target);

      var view = $(calendarEl).fullCalendar('getView');
      var date = moment(view.start).add(index, 'days').toDate();
      callback(date, uid, e, view);
    }, false);
  }

  /**
   * @function callbackCreator creates event listener callbacks for titleClick.
   * @param  {Function} callback        The function to be called
   * @param  {HTMLElement}   calendarEl Element containing a fullCalendar
   * @param  {Array}   parameters       Parameters to be given to callback
   * @return {Function}                 The function to be attatched to an event
   *                                     	listener.
   */

  //TODO: This function must give the right date to the callbacks.
  function callbackCreator(callback, calendarEl, parameters) {

    if (typeof callback !== 'function' || !calendarEl ||
        !Array.isArray(parameters)) {
      return undefined;
    }

    return function (e) {
      var $calendar = $(calendarEl);
      if (typeof $calendar.fullCalendar !== 'function') {
        return;
      }

      e.preventDefault();
      var view = $calendar.fullCalendar('getView');
      var weekStart = view.start;
      var viewEnd = view.end;
      parameters.push(weekStart);
      parameters.push(viewEnd);
      callback.apply(e.target, parameters);
    };
  }

  // ===============================================
  //      HTML functions
  // ===============================================

  /**
   * Create control buttons in the first calendar (controller calendar)
   * @function createCalendarControlBtns
   * @param  {HTMLElement} calendarEl
   * @return {void}
   */
  function createCalendarControlBtns(calendarEl) {
    // Replace buttons style
    $('.fc-button').addClass('btn');

    // Create refresh button
    var refreshBtn = document.createElement('span');
    var refreshIcon = document.createElement('i');

    refreshBtn.classList.add('fc-button');
    refreshBtn.classList.add('fc-button-refresh');
    refreshBtn.classList.add('fc-state-default');
    refreshBtn.classList.add('btn');
    refreshBtn.setAttribute('unselectable', 'on');

    refreshIcon.classList.add('fa');
    refreshIcon.classList.add('fa-refresh');

    refreshBtn.appendChild(refreshIcon);
    refreshBtn.addEventListener('click', function () {
      _this.reload();
    });

    calendarEl.querySelector('.fc-header-left').appendChild(refreshBtn);

    // Create 'Show/Hide Weekends' button
    var toggleWeekendBtn = document.createElement('span');
    toggleWeekendBtn.classList.add('fc-button');
    toggleWeekendBtn.classList.add('fc-button-show-weekends');
    toggleWeekendBtn.classList.add('fc-state-default');
    toggleWeekendBtn.classList.add('fc-corner-right');
    toggleWeekendBtn.classList.add('btn');
    toggleWeekendBtn.setAttribute('unselectable', 'on');
    toggleWeekendBtn.innerText = getToggleWeekendText();

    toggleWeekendBtn.addEventListener('click', function () {
      toggleWeekend();
    });

    calendarEl.querySelector('.fc-header-right').appendChild(toggleWeekendBtn);
  }

  /**
   * Creates all the HTML for all the calendars and attaches a listener to each
   * calendar's title.
   * @function createCalendarsHTML
   * @param  {HTMLElement} targetElement    Element inside which the HTML will
   *                                        	be added
   * @param  {Array} calendarConfig Array of calendar configuration objects
   * @return  {Array} calendarsArray  Array of HTMLElements
   */
  function createCalendarsHTML(targetElement, calendarConfig) {
    var calendarsArray = [];
    var frag = document.createDocumentFragment();

    //-------------------------------
    //Create wrapping structure
    var container = document.createElement('div');
    container.classList.add('box');
    frag.appendChild(container);

    var boxTitle = document.createElement('div');
    boxTitle.classList.add('box-title');
    container.appendChild(boxTitle);

    var boxContent = document.createElement('div');
    boxContent.classList.add('box-content');
    container.appendChild(boxContent);

    //wrappingRow and wrappingCol seem to be unnecessary
    var wrappingRow = document.createElement('div');
    wrappingRow.classList.add('row');
    boxContent.appendChild(wrappingRow);

    var wrappingCol = document.createElement('div');
    wrappingCol.classList.add('col-md-12');
    wrappingCol.classList.add('calendars');
    wrappingRow.appendChild(wrappingCol);

    var weekPickerRow = document.createElement('div');
    weekPickerRow.classList.add('row');
    weekPickerRow.classList.add('week');
    wrappingCol.appendChild(weekPickerRow);

    var weekPickerCol = document.createElement('div');
    weekPickerCol.classList.add('col-md-2');
    weekPickerRow.appendChild(weekPickerCol);

    weekPicker = document.createElement('input');
    weekPicker.classList.add('form-control');
    weekPicker.setAttribute('type', 'week');
    weekPicker.setAttribute('id', 'calendar-week'); //TODO: remove this id when possible.
    weekPicker.value = moment(new Date()).format('YYYY-[W]WW').valueOf();
    weekPickerCol.appendChild(weekPicker);

    //-------------------------------
    //Now create each calendar row.
    var cal;
    var wrappingUserRow;
    var rowTitle;
    var titleSpan;
    var spanLink;
    var linkIcon;
    var spanEm;
    var i;
    for (i = 0; i < calendarConfig.length; i++) {
      cal = calendarConfig[i];

      wrappingUserRow = document.createElement('div');
      wrappingUserRow.classList.add('row');
      wrappingCol.appendChild(wrappingUserRow);

      //Title part
      rowTitle = document.createElement('div');
      rowTitle.classList.add('col-md-2');
      wrappingUserRow.appendChild(rowTitle);

      titleSpan = document.createElement('span');
      rowTitle.appendChild(titleSpan);

      spanLink = document.createElement('a');
      titleSpan.appendChild(spanLink);

      if (typeof cal.uid === 'string') {
        linkIcon = document.createElement('i');
        linkIcon.classList.add('fa');
        linkIcon.classList.add('fa-map-marker');
        spanLink.appendChild(linkIcon);

        if (cal.description) {
          spanLink.appendChild(document.createElement('br'));
          spanEm = document.createElement('em');
          spanEm.innerText = cal.description;
          spanLink.appendChild(spanEm);
        }
      }

      spanLink.innerText += cal.name;

      //Calendar part
      var rowCalendar = document.createElement('div');
      rowCalendar.classList.add('col-md-10');
      wrappingUserRow.appendChild(rowCalendar);

      var calendarEl = document.createElement('div');
      calendarEl.classList.add(calendarClass);
      calendarEl.dataset.uid = cal.uid;
      rowCalendar.appendChild(calendarEl);
      calendarConfig[i].element = calendarEl;

      //Attach callback for calendar title click.
      if (typeof cal.titleClick === 'function') {
        spanLink.setAttribute('href', '#');
        spanLink.addEventListener('click',
          callbackCreator(cal.titleClick, calendarEl, [cal.uid]));
      }

      //Keep track of all calendars
      calendarsArray[i] = calendarEl;
    }

    targetElement.appendChild(frag);
    return calendarsArray;
  }

  // ===============================================
  //      Public methods
  // ===============================================

  /**
   * Create a function to reload all given calendars
   * @function createReloadFunction
   * @param  {Array} calendarEls  Array of HTMLElements
   * @return {void}
   */
  function createReloadFunction(calendarEls) {
    _this.reload =  function () {
      eventLoader.load().then(function () {
        for (var i = 0; i < calendarEls.length; i++) {
          $(calendarEls[i]).fullCalendar('refetchEvents');
        }
      });
    };
  }

  function init(targetEl, configurationObj) {
    if (!targetEl || typeof configurationObj !== 'object') {
      throw new Error('Unable to create calendar. Invalid parameters');
    }

    if (typeof targetEl === 'string') {
      targetEl = document.querySelector(targetEl);
    }

    var config = configurationObj;
    var i;

    //Create all HTML and set titleClick listener.
    var calendarEls = createCalendarsHTML(targetEl, config.calendars);

    if (!calendarEls) {
      console.error('Error creating calendars.');
      return;
    }

    createReloadFunction(calendarEls);

    var uids = [];
    for (i = 0; i < config.calendars.length; i++) {
      uids.push(config.calendars[i].uid);
    }

    //Create Function that will fetch data from the server;
    eventLoader.init(uids, config.loadUrl);

    var calendarEl;
    var calendarConfig;
    for (i = 0; i < calendarEls.length; i++) {
      calendarEl = calendarEls[i];
      calendarConfig = config.calendars[i];

      //First calendar is the one to control the others.
      initFullCalendar(calendarEl, calendarConfig.eventClick, i === 0);

      if (typeof calendarConfig.dayHeaderClick === 'function') {
        setDayHeaderClickListener(calendarEl, calendarConfig.uid, calendarConfig.dayHeaderClick);
      }

      //For the first calendar
      if (i === 0) {
        createCalendarControlBtns(calendarEl);
      }
    }

    //Make top bar sticky
    setupStickyHeader();
    listenToWeekpickerChanges();
    autoReload(true);

    $('.show-all-staff').click(toggleStaff);
  }

  init(targetEl, configurationObj);
  this.init = init;
}
