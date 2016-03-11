# fl-multi-calendar
[![Build Status](https://travis-ci.org/fourlabsldn/fl-multi-calendar.svg?branch=master)](https://travis-ci.org/fourlabsldn/fl-multi-calendar)

Visualise multiple people's schedules in one page


## Configuration
The component is initialised with a configuration object which will contain the
all the main callbacks and calendar subjects. The configuration object should
be in the global namespace. Tell [x-div](https://github.com/fourlabsldn/x-div)
to use it with the `data-config` attribute.

Here is how it could look like:

**html**
``` html
<x-div data-controller="/path/to/multi-calendar" data-config="myConfig"></x-div>
```

**JavaScript**
``` javascript
var myConfig = {
  loadUrl: 'http://localhost:5000',

  loadingAnimationStart: function () {},
  loadingAnimationStop: function () {},

  calendars: [{
    name: 'Karl Marx',
    uid: '12345',
    description: 'Software Developer', //optional
    titleClick: function () {},
    dayHeaderClick: function () {},
    eventClick: function () {},
  }, {
    name: 'Friedrich Hegel',
    uid: '7899',
    description: 'HR Manager', //optional
    titleClick: function () {},
    dayHeaderClick: function () {},
    eventClick: function () {},
  }, {
    name: 'Immanuel Kant',
    uid: '23456',
    description: 'Research and Revelopement', //optional
    titleClick: function () {},
    dayHeaderClick: function () {},
    eventClick: function () {},
  }, ],
};

```

## Events
 - `multiCalendarAllEventsRendered` - Triggered when all calendars finished
 loading and displaying their events. It is also triggered on calendar reload.

The calendars also emit all events from `fullCalendar`.

## Tasks

### Demo
Will run a server and open the demo page in the browser
```
npm run demo
```

### Build
```
npm run build
```
### Dev
Runs build, demo and watches changes to build again.
```
npm run dev
```

### Test
```
npm run test
```
