// Make date into DD/MM/YYYY format
function convertDate(inputFormat) {
  function pad(s) {
    return (s < 10) ? '0' + s : s;
  }

  var d = new Date(inputFormat);
  return [pad(d.getFullYear()), pad(d.getMonth() + 1), d.getDate()].join('-');
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function toTwoDigits(num) {
  return ("0" + num).slice(-2);
}

function addDays(num, date) {
  return new Date(date.valueOf() + (num * 86400000));
}

function daysDiff(fromDate, toDate) {
  return Math.floor((toDate.valueOf() - fromDate.valueOf()) / 86400000);
}

function User(uid, name) {
  this.uid = uid;
  this.name = name;
}

User.prototype.createDemoEvent = function createDemoEvent(uid, date) {
  var dateString = convertDate(date);
  var startHour = getRandomInt(0, 22);
  var startMins = getRandomInt(0, 59);
  var endHour = getRandomInt(startHour, 23);
  var endMins = getRandomInt(0, 59);
  return {
    'id': Math.floor(Math.random() * 1000), //Unique event id.
    'title': 'Simple title - ' + convertDate(date),
    'start': dateString + ' ' + toTwoDigits(startHour) + ':' + toTwoDigits(startMins) + ':00',
    'end': dateString + ' ' + toTwoDigits(endHour) + ':' + toTwoDigits(endMins) + ':00',
    'tooltip': 'LOL'
  };
}

User.prototype.createServerResponse = function createServerResponse(fromDate, toDate) {
  var eventsNo = getRandomInt(0, 10);
  var diff = daysDiff(fromDate, toDate);
  var events = [];
  var daysMore = 0;

  for (var i = 0; i < eventsNo; i++) {
    daysMore = getRandomInt(0, diff);
    newEvent = this.createDemoEvent(uid, addDays(daysMore, fromDate));
    events.push(newEvent);
  }

  return events;
}

User.prototype.createConfig(titleClick, dayHeaderClick, eventClick) {
  return {
    name: this.name,
    uid: this.uid,
    description: this.description, //optional
    titleClick: titleClick, //optional
    dayHeaderClick: dayHeaderClick,
    eventClick: eventClick,
  }
}

User.prototype.getUid() {
  return this.uid;
}

User.prototype.getName() {
  return this.name;
}


function createDemoConfigData() {

}

function createServerResponse() {

}
