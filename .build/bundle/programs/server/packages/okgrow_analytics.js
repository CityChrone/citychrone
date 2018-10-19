(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var meteorBabelHelpers = Package['babel-runtime'].meteorBabelHelpers;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var analytics;

var require = meteorInstall({"node_modules":{"meteor":{"okgrow:analytics":{"server":{"main.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// packages/okgrow_analytics/server/main.js                                 //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
module.watch(require("./browser-policy"));
module.watch(require("./publications"));
//////////////////////////////////////////////////////////////////////////////

},"browser-policy.js":function(){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// packages/okgrow_analytics/server/browser-policy.js                       //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
/* global Package */
if (Package['browser-policy-common']) {
  const content = Package['browser-policy-common'].BrowserPolicy.content;

  if (content) {
    content.allowOriginForAll('https://www.google.com/analytics/');
    content.allowOriginForAll('https://cdn.mxpnl.com');
  }
}
//////////////////////////////////////////////////////////////////////////////

},"publications.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////
//                                                                          //
// packages/okgrow_analytics/server/publications.js                         //
//                                                                          //
//////////////////////////////////////////////////////////////////////////////
                                                                            //
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
let Mongo;
module.watch(require("meteor/mongo"), {
  Mongo(v) {
    Mongo = v;
  }

}, 1);
// eslint-disable-line import/no-extraneous-dependencies, import/extensions
Meteor.publish(null, function analyticsUsersPublish() {
  if (this.userId) {
    const self = this;
    const query = Meteor.users.find({
      _id: this.userId
    }, {
      fields: {
        emails: 1,
        'services.google.email': 1,
        'services.github.email': 1,
        'services.facebook.email': 1
      }
    });

    Mongo.Collection._publishCursor(query, self, 'AnalyticsUsers');

    return self.ready();
  }

  this.ready();
});
//////////////////////////////////////////////////////////////////////////////

}}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
var exports = require("/node_modules/meteor/okgrow:analytics/server/main.js");

/* Exports */
Package._define("okgrow:analytics", exports, {
  analytics: analytics
});

})();

//# sourceURL=meteor://💻app/packages/okgrow_analytics.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2tncm93OmFuYWx5dGljcy9zZXJ2ZXIvbWFpbi5qcyIsIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvb2tncm93OmFuYWx5dGljcy9zZXJ2ZXIvYnJvd3Nlci1wb2xpY3kuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3BhY2thZ2VzL29rZ3JvdzphbmFseXRpY3Mvc2VydmVyL3B1YmxpY2F0aW9ucy5qcyJdLCJuYW1lcyI6WyJtb2R1bGUiLCJ3YXRjaCIsInJlcXVpcmUiLCJQYWNrYWdlIiwiY29udGVudCIsIkJyb3dzZXJQb2xpY3kiLCJhbGxvd09yaWdpbkZvckFsbCIsIk1ldGVvciIsInYiLCJNb25nbyIsInB1Ymxpc2giLCJhbmFseXRpY3NVc2Vyc1B1Ymxpc2giLCJ1c2VySWQiLCJzZWxmIiwicXVlcnkiLCJ1c2VycyIsImZpbmQiLCJfaWQiLCJmaWVsZHMiLCJlbWFpbHMiLCJDb2xsZWN0aW9uIiwiX3B1Ymxpc2hDdXJzb3IiLCJyZWFkeSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBQSxPQUFPQyxLQUFQLENBQWFDLFFBQVEsa0JBQVIsQ0FBYjtBQUEwQ0YsT0FBT0MsS0FBUCxDQUFhQyxRQUFRLGdCQUFSLENBQWIsRTs7Ozs7Ozs7Ozs7QUNBMUM7QUFFQSxJQUFJQyxRQUFRLHVCQUFSLENBQUosRUFBc0M7QUFDcEMsUUFBTUMsVUFBVUQsUUFBUSx1QkFBUixFQUFpQ0UsYUFBakMsQ0FBK0NELE9BQS9EOztBQUNBLE1BQUlBLE9BQUosRUFBYTtBQUNYQSxZQUFRRSxpQkFBUixDQUEwQixtQ0FBMUI7QUFDQUYsWUFBUUUsaUJBQVIsQ0FBMEIsdUJBQTFCO0FBQ0Q7QUFDRixDOzs7Ozs7Ozs7OztBQ1JELElBQUlDLE1BQUo7QUFBV1AsT0FBT0MsS0FBUCxDQUFhQyxRQUFRLGVBQVIsQ0FBYixFQUFzQztBQUFDSyxTQUFPQyxDQUFQLEVBQVM7QUFBQ0QsYUFBT0MsQ0FBUDtBQUFTOztBQUFwQixDQUF0QyxFQUE0RCxDQUE1RDtBQUErRCxJQUFJQyxLQUFKO0FBQVVULE9BQU9DLEtBQVAsQ0FBYUMsUUFBUSxjQUFSLENBQWIsRUFBcUM7QUFBQ08sUUFBTUQsQ0FBTixFQUFRO0FBQUNDLFlBQU1ELENBQU47QUFBUTs7QUFBbEIsQ0FBckMsRUFBeUQsQ0FBekQ7QUFDOUM7QUFFdENELE9BQU9HLE9BQVAsQ0FBZSxJQUFmLEVBQXFCLFNBQVNDLHFCQUFULEdBQWlDO0FBQ3BELE1BQUksS0FBS0MsTUFBVCxFQUFpQjtBQUNmLFVBQU1DLE9BQU8sSUFBYjtBQUNBLFVBQU1DLFFBQVFQLE9BQU9RLEtBQVAsQ0FDWEMsSUFEVyxDQUNOO0FBQ0pDLFdBQUssS0FBS0w7QUFETixLQURNLEVBR1Q7QUFDRE0sY0FBUTtBQUNOQyxnQkFBUSxDQURGO0FBRU4saUNBQXlCLENBRm5CO0FBR04saUNBQXlCLENBSG5CO0FBSU4sbUNBQTJCO0FBSnJCO0FBRFAsS0FIUyxDQUFkOztBQVdBVixVQUFNVyxVQUFOLENBQWlCQyxjQUFqQixDQUFnQ1AsS0FBaEMsRUFBdUNELElBQXZDLEVBQTZDLGdCQUE3Qzs7QUFDQSxXQUFPQSxLQUFLUyxLQUFMLEVBQVA7QUFDRDs7QUFFRCxPQUFLQSxLQUFMO0FBQ0QsQ0FuQkQsRSIsImZpbGUiOiIvcGFja2FnZXMvb2tncm93X2FuYWx5dGljcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAnLi9icm93c2VyLXBvbGljeSc7XG5pbXBvcnQgJy4vcHVibGljYXRpb25zJztcbiIsIi8qIGdsb2JhbCBQYWNrYWdlICovXG5cbmlmIChQYWNrYWdlWydicm93c2VyLXBvbGljeS1jb21tb24nXSkge1xuICBjb25zdCBjb250ZW50ID0gUGFja2FnZVsnYnJvd3Nlci1wb2xpY3ktY29tbW9uJ10uQnJvd3NlclBvbGljeS5jb250ZW50O1xuICBpZiAoY29udGVudCkge1xuICAgIGNvbnRlbnQuYWxsb3dPcmlnaW5Gb3JBbGwoJ2h0dHBzOi8vd3d3Lmdvb2dsZS5jb20vYW5hbHl0aWNzLycpO1xuICAgIGNvbnRlbnQuYWxsb3dPcmlnaW5Gb3JBbGwoJ2h0dHBzOi8vY2RuLm14cG5sLmNvbScpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBNZXRlb3IgfSBmcm9tICdtZXRlb3IvbWV0ZW9yJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBpbXBvcnQvbm8tZXh0cmFuZW91cy1kZXBlbmRlbmNpZXMsIGltcG9ydC9leHRlbnNpb25zXG5pbXBvcnQgeyBNb25nbyB9IGZyb20gJ21ldGVvci9tb25nbyc7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgaW1wb3J0L25vLWV4dHJhbmVvdXMtZGVwZW5kZW5jaWVzLCBpbXBvcnQvZXh0ZW5zaW9uc1xuXG5NZXRlb3IucHVibGlzaChudWxsLCBmdW5jdGlvbiBhbmFseXRpY3NVc2Vyc1B1Ymxpc2goKSB7XG4gIGlmICh0aGlzLnVzZXJJZCkge1xuICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuICAgIGNvbnN0IHF1ZXJ5ID0gTWV0ZW9yLnVzZXJzXG4gICAgICAuZmluZCh7XG4gICAgICAgIF9pZDogdGhpcy51c2VySWQsXG4gICAgICB9LCB7XG4gICAgICAgIGZpZWxkczoge1xuICAgICAgICAgIGVtYWlsczogMSxcbiAgICAgICAgICAnc2VydmljZXMuZ29vZ2xlLmVtYWlsJzogMSxcbiAgICAgICAgICAnc2VydmljZXMuZ2l0aHViLmVtYWlsJzogMSxcbiAgICAgICAgICAnc2VydmljZXMuZmFjZWJvb2suZW1haWwnOiAxLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgTW9uZ28uQ29sbGVjdGlvbi5fcHVibGlzaEN1cnNvcihxdWVyeSwgc2VsZiwgJ0FuYWx5dGljc1VzZXJzJyk7XG4gICAgcmV0dXJuIHNlbGYucmVhZHkoKTtcbiAgfVxuXG4gIHRoaXMucmVhZHkoKTtcbn0pO1xuIl19
