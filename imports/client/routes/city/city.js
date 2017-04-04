import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
// import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { makeGeoJsonHexs } from '/imports/client/map/lib/hexsGeojson.js';
import { fillPointTree } from '/imports/client/map/lib/findClosestPoint.js'
//import {} from '/imports/client/'
import { hexagonCity } from '/imports/client/map/lib/hexagonCity.js'

import { createControl } from '/imports/client/map/legends.js';

import '/imports/client/selector/quantitySelector.js';

import '/imports/client/selector/timeSelector.js';

import '/imports/client/routes/city/city.html';

Template.city.helpers({
	'loadGeojsonToMap'(){
		if(/*Template.timeButtons.data.timeOfDay &&*/ Template.quantitySelector.quantitySelectedRV){
			let scenarioId = Template.city.RV.currentScenarioId.get();
			//console.log('load to map', scenarioId, Template.quantityButtons.modeSelectedRV.get())
			let scenario = scenarioDB.findOne({'_id':scenarioId, 'moments':{'$exists':true}});
			let time = Template.city.data.timeOfDay.get();
			//console.log('scenario found', scenario, Template.quantityButtons.quantitySelectedRV.get(), time)
			Template.city.data.geoJson.remove(Template.body.data.map);
			switch(Template.quantityButtons.modeSelectedRV.get()) {
				case 'btnCurrent':

					Template.body.data.geoJson = updateGeojson(
													 scenario, 
													 Template.quantityButtons.quantitySelectedRV.get(), 
													 time)
					break;
				case 'btnDiff':
					let scenarioDefaultId =  Template.scenario.data.scenarioDefaultId
					let scenarioDefault =  scenarioDB.findOne({'_id':scenarioDefaultId});
					Template.body.data.geoJson = updateGeojsonDiff(
														 scenario, scenarioNew,
														 Template.quantityButtons.quantitySelectedRV.get(), 
														 Template.quantityButtons.modeSelectedRV.get(),
														 time)

					break;
			}
			Template.body.data.geoJson.addTo(Template.body.data.map);
			if($('#buttonBuild').hasClass('active')){
				Template.body.data.map.eachLayer(function (layer) {
					if('lineName' in layer){
						layer.bringToFront();
					}
				});
			}
		}
	}
});

Template.city.onCreated(function(){


// *******  FUNCTION  ***********
 Template.city.function = {};


// *******  COLLECTION  ***********
	Template.city.collection = {};
	Template.city.collection.points  = new Mongo.Collection(null); //Local DB for points
	Template.city.collection.metroLines = new Mongo.Collection(null); //Local DB for metroLines


//*********TEMPLATE***********
  Template.city.template = {};

// *******  DATA  ***********

  Template.city.data = {};
  Template.city.data.dataToLoad = 2;

  Template.city.data.blazePopUp = -1; //REmove popUp template from blaze afther closing popUp
  Template.city.data.blazePopUpMarker = -1; //REmove popUp template from blaze afther closing popUpMArker

  //********. Reactive Var ************ 
  Template.city.RV = {};
  Template.city.RV.dataLoaded = new ReactiveVar(false); //true when finished load data
  Template.city.RV.currentScenarioId  = new ReactiveVar(false); 


}); 

Template.city.onRendered(function() {
	console.log( Router.current().params)

	let city = Router.current().params.city;
	Template.city.data.city = city;

	Template.city.data.dataToLoad = 2;
	Template.city.data.hexClass = {}
	
	Template.city.function.checkDataLoaded = function(num) {
		Template.city.data.dataToLoad  += num
		if (Template.city.data.dataToLoad  > 0){
		Template.map.data.map.spin(true);
			return;
		}
		Template.map.data.map.spin(false);
		Template.body.data.dataLoaded.set(true);
	};

	Meteor.call('giveDataBuildScenario', city,'listPoints', function(err, risp){

		for(let doc_i = 0; doc_i < risp.length; doc_i++){
		    doc = risp[doc_i]
		    doc.point = {type:'Point', 'coordinates' : risp[doc_i].coor};
		    doc.city = city;
		    doc._id = doc.pos.toString();
		    Template.city.collection.points.insert(doc);
		}           
		fillPointTree(Template.city.collection.points); 

		Template.city.function.checkDataLoaded(-1);
 	});



	Meteor.call('giveDataBuildScenario', city,'oneHex', function(err, risp){
		console.log('oneHex', risp, risp.coordinates[0].reverse());
		Template.city.data.hexClass = new hexagonCity(risp.coordinates[0])
 	});

 	Meteor.call('giveDataBuildScenario', city,'centerCity', function(err, risp){
		console.log('centerCity', risp,);
		//Template.city.data.hexClass = new hexagonCity(risp.coordinates[0])
		Template.map.data.map.setView(risp.reverse(), 12,{animate: true, duration: 5.0})
 	});

	/*
	Meteor.call('metroLines', city, function(err, res){
	    console.log('metrolines',res, err);
	    observeNewLineChanges(); //observe add new lines when new lines added
	    res.forEach(function(line, index){
	      line.stops = _.values(line.stops).map(function(stop){
	        return {'latlng':stop};
	      });
	      line.temp = false;
	      line.name = line.name || line.lineName;
	      line.speedName = line.speedName || "Med";
	      line.frequencyName = line.frequencyName || "Med";
	      if (line.type == 'metro') {
	              console.log(line)
	        line.indexLine = line.indexLine || _.indexOf(Template.body.data.listNumLinesDef, 0);
	      }
	      Template.body.collection.metroLines.insert(line);
	    });
  	});*/

  	//CREATE CONTROLS
  	let control = createControl([Template.quantitySelector, Template.timeSelector], "topright", Template.map.data.map, true)
  	console.log('control', control)

	Template.city.data.geoJson = makeGeoJsonHexs();
	Template.city.data.geoJson.addTo(Template.map.data.map);

	Template.city.data.popup = L.popup();


});



