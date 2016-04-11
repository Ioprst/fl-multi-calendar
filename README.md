# fl-multi-calendar
[![Build Status](https://travis-ci.org/fourlabsldn/fl-multi-calendar.svg?branch=master)](https://travis-ci.org/fourlabsldn/fl-multi-calendar)

Multiple instances of [FullCalendar](https://github.com/fullcalendar/fullcalendar), with one menu and kept in sync.

## Demo

To view the demo, follow the instructions in the section [build tools](#build-tools).

## Usage

fl-multi-calendar depends on [x-div](https://github.com/fourlabsldn/x-div) which is a Web Component. Check the [browser support](http://caniuse.com/#search=Custom%20Elements) if you are taking it to production. You may need to use a [polyfill](http://webcomponents.org/polyfills/).

The following example loads fl-multi-calendar from `/build/multi-calendar.js` and initialises with the configuration object `myConfig`. The referenced configuration object must be in the global namespace.

#### HTML
``` html
<x-div data-controller="/build/multi-calendar" data-config="myConfig"></x-div>
```

#### JavaScript
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

## Installation
**Bower**

```bash
bower install fl-multi-calendar --save
```

**NPM**

```bash
npm install fl-multi-calendar --save
```

## Build tools

Before you can use the demo or buildfl-multi-calendar from source, install the build tools by running:

```bash
npm install
bower install
```

#### Build
Builds from source
```
npm run build
```

#### Demo
Runs a server and opens the demo page in your browser.
```
npm run demo
```

#### Dev
Runs build, demo and watches changes to build again.
```
npm run dev
```

#### Test
Runs test suite.
```
npm run test
```
