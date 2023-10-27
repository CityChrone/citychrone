ShareIt.configure({
  sites: {                // nested object for extra configurations
    'twitter': {},
    'googleplus': null,
    'pinterest': null
  },
  classes: "btn btn-outline-light btn-sm small", // string (default: 'large btn')
  // The classes that will be placed on the sharing buttons, bootstrap by default.
  iconOnly: true,      // boolean (default: false)
  // Don't put text on the sharing buttons
  applyColors: false,     // boolean (default: true)
  // apply classes to inherit each social networks background color
  faSize: 'fa-sm fa fa-fw',            // font awesome size
  faClass: ''		  // font awesome classes like square
});
