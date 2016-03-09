# fl-multi-calendar

Visualise multiple people's schedules in one page


## Configuration
The component is initialised with a configuration object which will contain the
all the main callbacks and calendar subjects.

Here is how it could look like:
``` javascript
var calendarTarget = document.querySelector('.my-calendar-container');

var calendarConfiguration = {
  targetEl: calendarTarget, //Element or selector string
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
