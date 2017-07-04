ShareIt.configure({
  sites: {                // nested object for extra configurations
      'facebook': {
          'appId': "1685036935090228"	// use sharer.php when it's null, otherwise use share dialog
      },
      'twitter': {},
      'googleplus' : null,
      'pinterest':null
  },
  classes: " large btn", // string (default: 'large btn')
                        // The classes that will be placed on the sharing buttons, bootstrap by default.
  iconOnly: true,      // boolean (default: false)
                        // Don't put text on the sharing buttons
  applyColors: true,     // boolean (default: true)
                        // apply classes to inherit each social networks background color
  faSize: 'fa-lg fa fa-fw',            // font awesome size
  faClass: ''		  // font awesome classes like square
});
