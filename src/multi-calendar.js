/* globals moment, $ */

//Module objects:
/*globals  debounce, loading, dateController, eventLoader, autoReload*/

function MultiCalendar(configurationObj) { //jshint ignore:line
  'use strict';

  if (!(this instanceof MultiCalendar)) {
    return new MultiCalendar(arguments[0]);
  }

  //GLOBALS
  var CALENDARCLASS = 'fl-multi-calendar';
  var _this = this;

  /**
   * Substitute an element by a copy with all of its attributes. Possibly
   * a copy with a different tag name.
   * @function replaceByEmptyCopy
   * @param  {HTMLElement} el         Element to be substituted
   * @param  {[String]} newTagName Optional new tagName.
   * @return {HTMLElement}            The new element or null.
   */
  function replaceByEmptyCopy(el, newTagName) {
    if (!el || !el.parentNode) {
      return null;
    }

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

  // var bool = false;
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
    var $header = $('.fc-toolbar');
    var width = $header.innerWidth();

    window.addEventListener('scroll', throttle(100, function () {
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
    var eventTitleEl = el.querySelector('.fc-title');
    var newEventTitleEl = replaceByEmptyCopy(eventTitleEl, 'div');
    newEventTitleEl.innerHTML = event.title;

    if (event.tooltip) {
      el.classList.add('fc-tooltip');
      var tooltip = document.createElement('span');
      tooltip.classList.add('fc-tooltiptext');
      tooltip.innerText = event.tooltip;
      el.appendChild(tooltip);
    }

    return el;
  }

  /**
   * Set weekpicker's date.
   * (this function is only assigned to the controller calendar)
   * @function viewRenderHandler
   * @param  {Object} view
   * @return {void}
   */
  function viewRenderHandler(view) {
    dateController.setDate(view.start);
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

    // Listen to view changes.
    document.addEventListener('multiCalendarViewChange', function (e) {
      var viewType = e.detail;
      $calendar.fullCalendar('changeView', viewType);
    });

    // init fullCalendar obj
    $calendar.fullCalendar({
      weekends: $.cookie('show-weekends') === 'true',
      header: (controllerCalendar) ? controlBtns : false,
      defaultView: dateController.getViewType(),
      contentHeight: 'auto',
      editable: false,
      droppable: false,
      firstDay: 1,
      timeFormat: '',
      titleFormat: {
        week: 'MMM D YYYY'
      },
      columnFormat: {
        week: 'ddd, MMM D'
      },
      year: defaultDate ? defaultDate[1] : new Date().getFullYear(),
      month: defaultDate ? defaultDate[2] - 1 : new Date().getMonth(),
      date: defaultDate ? defaultDate[3] : new Date().getDate(),

      //Callbacks
      eventClick: eventClick,

      // eventAfterAllRender: createAdjustCalendarHeightFunction(calendarEl),
      eventRender: setEventTitle,
      viewRender: (controllerCalendar) ? viewRenderHandler : undefined,

      //Called by "fullCalendar( 'refetchEvents' )"
      events: function (start, end, timezone, callback) {
        loadServerDataIntoCalendar(start, end, uid, callback);
      }
    });
  }

  // ===============================================
  //      Calendar event listener functions
  // ===============================================
  /**
   * Change view type according to the element's width;
   * @function beResponsive
   * @return {[void]}
   */
  var beResponsive = function () {
    var smallViewType = 'basicDay';

    function adjustSize() {
      var currentViewType = dateController.getViewType();
      var windowWidth = window.innerWidth;
      var changeWidth = 750;
      if (windowWidth <= changeWidth && currentViewType !== smallViewType) {
        dateController.setViewType(smallViewType);
      } else if (windowWidth > changeWidth && currentViewType === smallViewType) {
        dateController.setViewType('basicWeek');
      }
    }

    window.addEventListener('resize', debounce(adjustSize, 300));
    adjustSize();

    //Make sure it will not be called again.
    beResponsive = function () {};
  };

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
    var refreshBtn = document.createElement('button');
    var refreshIcon = document.createElement('i'); //global

    refreshBtn.classList.add('fc-button');
    refreshBtn.classList.add('fc-button-refresh');
    refreshBtn.classList.add('fc-state-default');
    refreshBtn.classList.add('fl-refresh-btn');
    refreshBtn.classList.add('btn');
    refreshBtn.setAttribute('unselectable', 'on');

    refreshIcon.classList.add('icon');
    refreshIcon.classList.add('icon-refresh');
    loading.setLoadingElement(refreshIcon);

    refreshBtn.appendChild(refreshIcon);
    refreshBtn.addEventListener('click', function () {
      _this.reload();
    });

    calendarEl.querySelector('.fc-left').appendChild(refreshBtn);

    // Create 'Show/Hide Weekends' button
    var toggleWeekendBtn = document.createElement('button');
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

    calendarEl.querySelector('.fc-right').appendChild(toggleWeekendBtn);
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
    wrappingRow.classList.add('row-container');
    boxContent.appendChild(wrappingRow);

    var wrappingCol = document.createElement('div');
    wrappingCol.classList.add('col-md-12');
    wrappingCol.classList.add('calendars');
    wrappingRow.appendChild(wrappingCol);

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
      rowTitle.classList.add('fl-row-title');

      //Put weekpicker within first title div.
      if (i === 0) {
        var rowTitleContainer = document.createElement('div');
        rowTitleContainer.classList.add('col-md-2');

        var weekPickerContainer = document.createElement('div');
        weekPickerContainer.classList.add('row');
        weekPickerContainer.classList.add('week');
        rowTitleContainer.appendChild(weekPickerContainer);

        var weekPicker = document.createElement('input'); // global
        weekPicker.classList.add('form-control');
        weekPicker.setAttribute('type', 'week');
        weekPicker.classList.add('fl-weekpicker');
        dateController.setWeekPicker(weekPicker);
        weekPickerContainer.appendChild(weekPicker);

        rowTitle.classList.add('row');
        rowTitleContainer.appendChild(rowTitle);

        wrappingUserRow.appendChild(rowTitleContainer);
      } else {
        rowTitle.classList.add('col-md-2');
        wrappingUserRow.appendChild(rowTitle);
      }

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
          // titleSpan.appendChild(document.createElement('br'));
          spanEm = document.createElement('em');
          spanEm.innerText = cal.description;
          titleSpan.appendChild(spanEm);
        }
      }

      spanLink.innerHTML += cal.name;

      //Calendar part
      var rowCalendar = document.createElement('div');
      rowCalendar.classList.add('col-md-10');
      wrappingUserRow.appendChild(rowCalendar);

      var calendarEl = document.createElement('div');
      calendarEl.classList.add(CALENDARCLASS);
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
    _this.reload = function () {
      eventLoader.load().then(function () {
        for (var i = 0; i < calendarEls.length; i++) {
          $(calendarEls[i]).fullCalendar('refetchEvents');
        }
      });
    };
  }

  function init(configurationObj) {

    //validate config object
    if (typeof configurationObj !== 'object') {
      throw new Error('init(): Unable to create calendar. Config is not an object');
    } else if (!configurationObj.targetEl) {
      throw new Error('init(): No target element provided in config file.');
    } else {
      try {
        decodeURI(configurationObj.loadUrl);
      } catch (e) {
        throw new Error('init(): Invalid URL in config file.');
      }
    }

    var targetEl = configurationObj.targetEl;
    if (typeof targetEl === 'string') {
      targetEl = document.querySelector(targetEl);
      if (!targetEl) {
        throw new Error('init(): targetEl string selector did not return an HTMLElement.');
      }
    }

    var config = configurationObj;
    var i;

    loading.on('show', configurationObj.loadingAnimationStart);
    loading.on('hide', configurationObj.loadingAnimationStop);

    //Create all HTML and set titleClick listener.
    var calendarEls = createCalendarsHTML(targetEl, config.calendars);

    if (!calendarEls) {
      throw new Error('Error creating calendars.');
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
    autoReload(_this, 'reload', 60000);
    beResponsive();
    $('.show-all-staff').click(toggleStaff);
  }

  init(configurationObj);
  this.init = init;
}
