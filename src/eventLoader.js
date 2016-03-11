/*globals $, Promise, Headers, moment*/

//Module globals
/*globals loading*/

// eventLoader takes care of loading stuff from the server.
var eventLoader = (function eventLoader() {
  'use strict';

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
    loading.show();
    isFetching = true;

    var requestConfig = {
      method: 'POST',
      cache: 'no-cache',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: {
        uid: uids,
        start: moment(start).format('X'),
        end: moment(end).format('X'),
      },
    };

    //NOTE: the fetch object is not working properly, se let's use ajax
    lastPromise = new Promise(function (resolve, reject) {
      $.ajax({
        type: 'post',
        url: loadURL,
        dataType: 'json',
        cache: false,
        data: requestConfig.body,
        success: resolve,
        failure: reject,
      });
    }) //---- Replace up to here for fetch.
      .then(function (data) {
        loading.hide();
        if (data === null) {
          alert('Error fetching events. Please refresh.');
          return null;
        }

        //Set the new presets
        lastStartDate = start;
        lastEndDate = end;
        isFetching = false;
        return data;
      })
      .catch(function (err) {
        console.error(err);
        lastPromise = Promise.resolve([]);
        return lastPromise;
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
