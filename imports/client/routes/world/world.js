import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
// import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import {cityMarker, radiusCircle} from '/imports/client/map/markers/cityMarker.js'

import { createControl } from '/imports/client/map/legends.js';
import '/imports/client/explanation/citychroneDescription.js';

import '/imports/client/routes/world/world.html';


Template.world.helpers({

});

Template.world.events({});

Template.world.onCreated(function(){
	Template.world.data = {};
	Template.world.data.citiesMarkers = []
});

Template.world.onRendered(function(){
	Template.map.data.map.removeLayer(Template.map.data.baseMaps['Default'])
	Template.map.data.map.addLayer(Template.map.data.baseMaps['B&WLite'])
	
	Meteor.call('giveListCitiesScenario', function(err, risp){
		//console.log(risp)
		let markerArray = []
		risp.forEach((city)=>{
			//console.log(city)
			let marker = new cityMarker(city);
			//console.log(marker)
			markerArray.push(marker)
			marker.addTo(Template.map.data.map);
		});
		var group = L.featureGroup(markerArray); //add markers array to featureGroup
		group.eachLayer(function (layer) {
    		//layer.bindPopup('Hello');
    		Template.map.data.map.on('zoomend',function(e){
				let zoom = Template.map.data.map.getZoom();
				let radius = radiusCircle(zoom);
				layer.setRadius(radius);
			});
    	});
        Template.map.data.map.fitBounds(group.getBounds(), {'padding' : [150,10]}); 
        Template.map.data.map.spin(false);
	});



	let controlTL = createControl([Template.citychroneDescription],"topleft",  Template.map.data.map, 'leftBar', true);
  	//let controlTR = createControl([], "topright", Template.map.data.map, true);

});

