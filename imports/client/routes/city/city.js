import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
// import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';

import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';

import { geoJsonClass } from '/imports/client/map/geojson/hexsGeojson.js';
import { fillPointTree } from '/imports/client/map/geojson/findClosestPoint.js'
//import {} from '/imports/client/'
import { hexagonCity } from '/imports/client/map/geojson/hexagonCity.js'

import { createControl } from '/imports/client/map/legends.js';

import '/imports/client/selector/quantitySelector.js';
import '/imports/client/selector/timeSelector.js';
import '/imports/client/selector/scenarioSelector.js';
import '/imports/client/map/geojson/legendGeojson.js';
import '/imports/client/selector/buttonsChangePage.js';
 
import '/imports/client/routes/city/city.html';

Template.city.helpers({
	'loadGeojsonToMap'(){
		console.log('loadGeojsonToMap',)
			if(Template.city.RV.currentScenario.get()){
				console.log('loadGeojsonToMap after')
				let scenario = Template.city.RV.currentScenario.get();
				let time = Template.timeSelector.timeSelectedRV.get();
				console.log('time',time)				
				if( !Template.quantitySelector.quantityDiffSelectedRV.get() ){
						Template.city.data.geoJson.updateGeojson(
														 scenario, 
														 Template.quantitySelector.quantitySelectedRV.get(),
														 false, 
														 time);
				
				}
				else{
						let scenarioDefaultId =  Template.scenario.data.scenarioDefaultId
						let scenarioDefault =  scenarioDB.findOne({'_id':scenarioDefaultId});
						Template.city.data.geoJson.updateGeojsonDiff(
															 scenario, scenarioNew,
															 Template.quantitySelector.quantitySelectedRV.get(), 
															 Template.quantitySelector.modeSelectedRV.get(),
															 time)

				}
			
			}
		return true;
	}
});

Template.city.onCreated(function(){


// *******  FUNCTION  ***********
 Template.city.function = {};


// *******  COLLECTION  ***********
	Template.city.collection = {};
	Template.city.collection.points  = new Mongo.Collection(null); //Local DB for points
	Template.city.collection.metroLines = new Mongo.Collection(null); //Local DB for metroLines
	Template.city.collection.scenarioDB = new Mongo.Collection(null); //Local DB for metroLines


//*********TEMPLATE***********
  Template.city.template = {};

// *******  DATA  ***********

  Template.city.data = {};
  Template.city.data.dataToLoad = 3;
  Template.city.data.city = '';
	Template.city.data.hexClass = {}
	Template.city.data.geoJson = new geoJsonClass;

  //********. Reactive Var ************ 
  Template.city.RV = {};
  Template.city.RV.dataLoaded = new ReactiveVar(false); //true when finished load data
  Template.city.RV.currentScenarioId = new ReactiveVar(false); 
  Template.city.RV.currentScenario = new ReactiveVar(false); 



}); 

Template.city.onRendered(function() {

	let city = Router.current().params.city;
	Template.city.data.city = city;
	
	Template.city.function.checkDataLoaded = function(num = -1) {
		Template.city.data.dataToLoad  += num
		if (Template.city.data.dataToLoad  > 0){
		Template.map.data.map.spin(true);
			return;
		}
		Template.map.data.map.spin(false);
		Template.city.RV.dataLoaded.set(true);
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
		Template.city.data.geoJson.setPoints(Template.city.collection.points);
		Template.city.function.checkDataLoaded();
 	});

	Meteor.call('giveDataBuildScenario', city,'oneHex', function(err, risp){
		console.log('oneHex', risp, risp.coordinates[0].reverse());
		Template.city.data.hexClass = new hexagonCity(risp.coordinates[0]);
		Template.city.data.geoJson.setHexClass(Template.city.data.hexClass);
		Template.city.function.checkDataLoaded();
 	});

 	Meteor.call('giveDataBuildScenario', city,'centerCity', function(err, risp){
		console.log('centerCity', risp,);
		//Template.city.data.hexClass = new hexagonCity(risp.coordinates[0])
		Template.map.data.map.setView(risp, 12,{animate: true, duration: 5.0});
		Template.map.data.centerCity = risp;
		Template.city.function.checkDataLoaded();
 	});

 	Meteor.subscribe('scenarioDef', city, function() {
		let scenarioDef = scenarioDB.findOne({'default':true, 'city' : city}, {sort:{'creationDate':-1}});
		//console.log('loaded', scenarioDef);
	    Template.city.data.scenarioDefaultId = scenarioDef._id; //scenario contenente i dati senza modifiche
	    if (!Template.city.data.scenarioDefaultId)
	      console.error("Default scenario non trovato!");
	    else {
	        Template.city.RV.currentScenario.set(scenarioDef);
	        let times = Object.keys(scenarioDef.moments);
	        Template.timeSelector.timeSelectedRV.set(times[0]);
	    }
      Template.city.function.checkDataLoaded(-1);
      console.log("Default scenario caricato ", Template.timeSelector.timeSelectedRV.get(),Template.city.RV.currentScenario.get());
      	Template.city.function.checkDataLoaded();
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

  	let controlTL = createControl([Template.quantitySelector, Template.scenarioSelector, Template.buttonsChangePage], "topleft",  Template.map.data.map, 'leftBar', true);
  	let controlTR = createControl([Template.legendGeojson], "topright",  Template.map.data.map,'', true);

	Template.city.data.geoJson = new geoJsonClass;
	console.log(Template.city.data.geoJson);
	Template.city.data.geoJson.geojson.addTo(Template.map.data.map);

	Template.city.data.popup = L.popup();


});



