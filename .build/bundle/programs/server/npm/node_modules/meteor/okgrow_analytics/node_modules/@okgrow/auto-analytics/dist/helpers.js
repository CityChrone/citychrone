'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.identifyWhenReady = exports.trackPageWhenReady = exports.trackEventWhenReady = undefined;

var _analytics = require('../vendor/analytics.min');

var _analytics2 = _interopRequireDefault(_analytics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//
// analytics.js may not have loaded it's integrations by the time we start
// tracking events, page views and identifies. So we can use these *WhenReady()
// functions to defer the action until all the intgrations are ready.
//
// TODO: Consider whether to export something like this, maybe provide our own
//       API instead of just using analytics.js API.
//

var trackEventWhenReady = function trackEventWhenReady() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return _analytics2.default.ready(function () {
    return _analytics2.default.track.apply(undefined, args);
  });
};

var trackPageWhenReady = function trackPageWhenReady() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return _analytics2.default.ready(function () {
    return _analytics2.default.page.apply(undefined, args);
  });
};

var identifyWhenReady = function identifyWhenReady() {
  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  return _analytics2.default.ready(function () {
    return _analytics2.default.identify.apply(undefined, args);
  });
};

exports.trackEventWhenReady = trackEventWhenReady;
exports.trackPageWhenReady = trackPageWhenReady;
exports.identifyWhenReady = identifyWhenReady;