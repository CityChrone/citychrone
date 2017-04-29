import { Router } from 'meteor/iron:router';
import { hexList, CenterHex } from '/imports/api/parameters.js';
import '/imports/client/map/map.js';
import '/imports/client/routes/city/city.js';
import '/imports/client/routes/world/world.js';
import '/imports/client/routes/newScenario/newScenario.js';
import '/imports/client/initClient.js';

Router.route('/city/:city', function () {
  //if (!this.params.city || !hexList[this.params.city] || !CenterHex[this.params.city])
    //this.redirect('/city/roma');

  console.log("router set city " + this.params.city);
  let data = {'city': this.params.city}  
  this.render('city',{
  	data: function(){
  		return {'data':data};
  	}
  });
});

Router.route('/newScenario/:city', function () {
  this.render('newScenario');
});


Router.route('/world', function () {
  //if (!this.params.city || !hexList[this.params.city] || !CenterHex[this.params.city])
    //this.redirect('/city/roma');

  this.render('world',{
    data: function(){
      return {'data':'data'};
    }
  });
});


Router.route('/map', function () {
  //if (!this.params.city || !hexList[this.params.city] || !CenterHex[this.params.city])
    //this.redirect('/city/roma');

  this.render('map',{
    data: function(){
      return {'data':'data'};
    }
  });
});

Router.route('/', function () {
  //if (!this.params.city || !hexList[this.params.city] || !CenterHex[this.params.city])
    this.redirect('/world');

});


Router.route('/node_modules/leaflet/dist/images/', function () {
  console.log("imgLeaflet");
  this.redirect('/node_modules/leaflet/dist/images/');
});
/*
Router.route('/:path?', function () {
  console.log("home route");
  this.redirect('/city/roma');
});*/
