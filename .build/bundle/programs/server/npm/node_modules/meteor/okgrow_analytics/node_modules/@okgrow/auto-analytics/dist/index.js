'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.identifyWhenReady = exports.trackPageWhenReady = exports.trackEventWhenReady = exports.analytics = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* globals window, location, document */

exports.default = function (settings) {
  // Doing this because some weird things happen when we just pass this to
  // the functions above.
  SETTINGS = settings;
  // Set everything up...
  bootstrapAnalytics();
};

var _helpers = require('./helpers');

var _analytics = require('../vendor/analytics.min');

var _analytics2 = _interopRequireDefault(_analytics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Make anayltics available globally in the console
window.analytics = _analytics2.default;

// Doing this because some weird things happen when we just pass settings as an
// argument to the functions below.
var SETTINGS = false;

// This is where analytics gets called...
var logPageLoad = function logPageLoad(_ref) {
  var referrer = _ref.referrer,
      delay = _ref.delay;

  // Use setTimeout so it uses the location from after the route change
  // A 50ms delay is used to allow document.title to be updated before capturing the event.
  setTimeout(function () {
    var page = {
      title: document.title,
      referrer: referrer,
      path: window.location.pathname,
      search: window.location.search,
      url: window.location.href
    };
    // Track page on analytics
    (0, _helpers.trackPageWhenReady)(page.title, page);
  }, delay || 0);
};

// A simple wrapper to be explicit about doing the first page load...
var logFirstPageLoad = function logFirstPageLoad() {
  // Ensure we copy over existing state (when it's an object/array) when we use replaceState 
  var currentState = _typeof(window.history.state) === 'object' ? window.history.state : null;
  // Store the referrer incase a user uses their browsers back button.
  // NOTE: We only wish to update the state, so we don't pass a 3rd param the URL.
  window.history.replaceState(_extends({}, currentState, { referrer: document.referrer }), '');
  logPageLoad({ referrer: document.referrer });
};

// What we're doing here is Monkey Patching(tm) the window.history.pushState()
// function because, currently, the History API provides the 'popstate' event
// but this event only gets fired when history.back(), history.go() are called
// or the user uses the browser buttons, but NOT when history.pushState() is
// called.
var configurePageLoadTracking = function configurePageLoadTracking() {
  // Save reference to original pushState.
  var originalPushState = window.history.pushState;

  // Wrap original pushState to call new push state function
  // NOTE: this can't be an arrow function!
  window.history.pushState = function okgrowAnalyticsMonkeyPatchedPushState() {
    // NOTE: We do not use window.location.href as it may contain a fragment identifier.
    var referrer = window.location.origin + window.location.pathname + window.location.search;

    // Modify the params passed to pushState by adding referrer to history.state
    // so we have the correct referrer when browser's back/fwd buttons are used
    var newArgs = [_extends({}, arguments.length <= 0 ? undefined : arguments[0], { referrer: referrer }), arguments.length <= 1 ? undefined : arguments[1], arguments.length <= 2 ? undefined : arguments[2]];

    // Make sure we catch any exception here so that we're
    // sure to call the originalPushState function (below)
    try {
      logPageLoad({ referrer: referrer });
    } catch (e) {
      console.error(e); // eslint-disable-line no-console
    }

    // Call original pushState with incoming arguments
    return originalPushState.apply(window.history, newArgs);
  };

  window.addEventListener('popstate', function () {
    // If the history is manipulated, by setting a hash for example,
    // the state property may be absent when a popstate is triggered
    var _ref2 = window.history.state || {},
        _ref2$referrer = _ref2.referrer,
        referrer = _ref2$referrer === undefined ? '' : _ref2$referrer;

    // NOTE: A delay is added as document.title wont be updated yet if packages
    // like react-helmet or react-document-title, etc... are used.


    logPageLoad({ referrer: referrer || '', delay: 50 });
  }, false);
};

var analyticsStartup = function analyticsStartup() {
  if (SETTINGS) {
    // Pass a new object based on settings in case analytics wants or tries to
    // modify the settings object being passed.
    _analytics2.default.initialize(Object.assign({}, SETTINGS));

    if (SETTINGS.autorun !== false) {
      logFirstPageLoad();
      configurePageLoadTracking();
    }
  } else {
    console.error('Missing analyticsSettings in Meteor.settings.public'); // eslint-disable-line no-console
  }
};

//
// What we're doing here is hooking into the window.onload event to:
//
// a) log the first page load, and
// b) setup logging for subsequent page/history changes
//
// NOTE: One concern here is the following scenario:
//
//       1. This code loads
//       2. Some other code loads and replaces window.onload kicking us out
//          BEFORE our function can execute.
//
// Possible solution is that we make analyticsStartup() (above) a public API
// a developer can call to manually set this all up.
//

var bootstrapAnalytics = function bootstrapAnalytics() {
  var originalWindowOnLoad = window.onload;

  if (typeof originalWindowOnLoad === 'function') {
    window.onload = function okgrowAnalyticsMonkeyPatchedOnLoad() {
      analyticsStartup(SETTINGS);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      originalWindowOnLoad.apply(this, args);
    };
  } else {
    window.onload = analyticsStartup;
  }
};

// Make analytics available as an export
exports.analytics = _analytics2.default; // eslint-disable-line import/prefer-default-export

// Make our helpers available

exports.trackEventWhenReady = _helpers.trackEventWhenReady;
exports.trackPageWhenReady = _helpers.trackPageWhenReady;
exports.identifyWhenReady = _helpers.identifyWhenReady;