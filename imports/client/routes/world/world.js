import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
// import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { scenarioDB } from '/imports/DBs/scenarioDB.js';
import {cityMarker, radiusCircle} from '/imports/client/map/markers/cityMarker.js'

import { createControl } from '/imports/client/map/legends.js';
import '/imports/client/explanation/citychroneDescription.js';

import '/imports/client/routes/world/world.html';
import '/imports/client/routes/world/startingModal.js';


Template.world.helpers({

});

Template.world.events({});

Template.world.onCreated(function(){
	Template.world.data = {};
	Template.world.data.citiesMarkers = []

	Template.world.var = {}
	Template.world.var.firstTime = true;
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
        Meteor.call('giveListCitiesScenarioNum', function(err, num_scenario_cities){
        	console.log(num_scenario_cities)
        	for (city in num_scenario_cities){
        		let num = num_scenario_cities[city]
        	}
        	for (m in group._layers){
        		let city = group._layers[m].city.city
        		let new_s = group._layers[m]._popup._content
        		new_s = new_s.slice(0, new_s.length - 6 )
        		group._layers[m]._popup._content = new_s + num_scenario_cities[city] + "</div>"
        		console.log(city, group._layers[m]._popup._content )
        	}
        	console.log(group)
		});

	});



	let controlTL = createControl([Template.citychroneDescription],"topleft",  Template.map.data.map, 'leftBar', true);
  	//let controlTR = createControl([], "topright", Template.map.data.map, true);

  	if (!("firstTime" in Template.body)){
  		$("#startingModal").modal();
  		Template.body.firstTime = false;
  	}


});

