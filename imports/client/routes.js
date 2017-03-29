import { Router } from 'meteor/iron:router';
import {hexList, CenterHex} from '/imports/api/parameters.js';

Router.route('/city/:city', function () {
  if (!this.params.city || !hexList[this.params.city] || !CenterHex[this.params.city])
    this.redirect('/city/roma');

  console.log("router set city " + this.params.city);
});


Router.route('/:path?', function () {
  console.log("home route");
  this.redirect('/city/roma');
});

Router.route('/node_modules/leaflet/dist/images/', function () {
  console.log("imgLeaflet");
  this.redirect('/node_modules/leaflet/dist/images/');
});
