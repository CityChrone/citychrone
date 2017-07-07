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
import '/imports/client/selector/socialButtons.js';
import '/imports/client/map/metroLines/metroLinesDraw.js';
import '/imports/client/routes/newScenario/newScenarioButtons.js';

import '/imports/client/routes/newScenario/newScenario.html';

Template.newScenario.helpers({
	'loadGeojsonToMap'(){

		if(Template.newScenario.RV.ScenarioGeojsonId.get()){

			//console.log('loadGeojsonToMap!!',Template.newScenario.data.scenarioDefault)
			let scenario = Template.newScenario.RV.ScenarioGeojson.get();
			let time = Template.timeSelector.timeSelectedRV.get();
			let quantitySel = Template.quantitySelector.quantitySelectedRV.get();
			let geoJson = Template.newScenario.data.geoJson;
			geoJson.updateGeojson(scenario, quantitySel, false, time, null, true);
			}
		return '';
	},
	'mapEditedTrue'(){
		//console.log('seted to true',Template.metroLinesDraw.RV.mapEdited.get(), Template.newScenario.data.scenarioDefault); 
		if(Template.metroLinesDraw.RV.mapEdited.get()){
			Template.newScenario.RV.currentScenarioId.set(Template.newScenario.data.scenarioDefaultId);
  			Template.newScenario.RV.currentScenario.set(Template.newScenario.data.scenarioDefault); 
		}
	}
});

Template.newScenario.onCreated(function(){


// *******  FUNCTION  ***********
 Template.newScenario.function = {};


// *******  COLLECTION  ***********
	Template.newScenario.collection = {};
	Template.newScenario.collection.points  = new Mongo.Collection(null); //Local DB for points
	//Template.newScenario.collection.metroLines = new Mongo.Collection(null); //Local DB for metroLines
	Template.newScenario.collection.scenarioDB = new Mongo.Collection(null); //Local DB for metroLines


//*********TEMPLATE***********
  Template.newScenario.template = {};

// *******  DATA  ***********

  Template.newScenario.data = {};
  Template.newScenario.data.city = '';
  Template.newScenario.data.hexClass = {}
  Template.newScenario.data.geoJson = new geoJsonClass('newVels', false, false);
	Template.newScenario.data.scenarioDefaultId = null; //scenario contenente i dati senza modifiche
	Template.newScenario.data.scenarioDefault = null;

  //********. Reactive Var ************ 
  Template.newScenario.RV = {};
  Template.newScenario.RV.dataLoaded = new ReactiveVar(false); //true when finished load data
  Template.newScenario.RV.currentScenarioId = new ReactiveVar(false); 
  Template.newScenario.RV.currentScenario = new ReactiveVar(false); 
  Template.newScenario.RV.ScenarioGeojsonId = new ReactiveVar(false); 
  Template.newScenario.RV.ScenarioGeojson = new ReactiveVar(false); 



}); 

Template.newScenario.onRendered(function() {

	let city = Router.current().params.city;
	Template.newScenario.data.city = city;
	loadScenarioData(city, Template.newScenario.RV);
	Template.newScenario.data.geoJson.enableClick();

	


  	//CREATE CONTROLS

  	let controlTL = createControl([Template.newScenarioButtons,Template.quantitySelector, Template.socialButtons], "topleft",  Template.map.data.map, 'leftBar', true);
  	let controlTR = createControl([Template.legendGeojson], "topright",  Template.map.data.map,'', true);

	//console.log(Template.newScenario.data.geoJson);
	Template.newScenario.data.geoJson.geojson.addTo(Template.map.data.map);

	Template.newScenario.data.popup = L.popup();

});

let loadScenarioData = function(city, RV){
	let dataToLoad = 5;
	//Template.map.data.map.spin(true);
	let checkDataLoaded = function(num = -1) {
		dataToLoad  += num
		if(dataToLoad < 1){
			//Template.map.data.map.spin(false);
			Template.newScenario.RV.dataLoaded.set(true);
		}
		return true;
	};

	let loadScenarioDef = function(){
		let currentScenario = scenarioDB.findOne({'default':true, 'city':Template.newScenario.data.city});
		Template.newScenario.RV.currentScenario.set(currentScenario);
	    let times = Object.keys(currentScenario.moments);
	    Template.timeSelector.timeSelectedRV.set(times[0]);
	    checkDataLoaded()
	}

	let loadScenario = function(){
		if(Router.current().params.query.id){
			let _id = Router.current().params.query.id;
			let MongoID = new Mongo.ObjectID(_id)
			let currentScenario = scenarioDB.findOne({'_id':MongoID, 'city':Template.newScenario.data.city});
			console.log(currentScenario)
			if(currentScenario){
				Template.newScenario.RV.currentScenario.set(currentScenario);
			    let times = Object.keys(currentScenario.moments);
			    Template.timeSelector.timeSelectedRV.set(times[0]);
			    let lines = currentScenario.lines;
			    Template.metroLinesDraw.function.addLines(lines);
			    checkDataLoaded()
			}else{
				loadScenarioDef()
			}
		}else{
			loadScenarioDef();
		}
	}

	Meteor.call('giveDataBuildScenario', city,'listPoints', function(err, risp){

		for(let doc_i = 0; doc_i < risp.length; doc_i++){
		    doc = risp[doc_i]
		    doc.point = {type:'Point', 'coordinates' : risp[doc_i].coor};
		    doc.city = city;
		    doc._id = doc.pos.toString();
		    //console.log(doc._id)
		    Template.newScenario.collection.points.insert(doc);
		}           
		fillPointTree(Template.newScenario.collection.points); 
		Template.newScenario.data.geoJson.setPoints(Template.newScenario.collection.points);
		checkDataLoaded();
 	});

	Meteor.call('giveDataBuildScenario', city,'oneHex', function(err, risp){
		//console.log('oneHex', risp, risp.coordinates[0].reverse());
		Template.newScenario.data.hexClass = new hexagonCity(risp.coordinates[0]);
		Template.newScenario.data.geoJson.setHexClass(Template.newScenario.data.hexClass);
		checkDataLoaded();
 	});

 	Meteor.call('giveDataBuildScenario', city,'centerCity', function(err, risp){
		//console.log('centerCity', risp,);
		//Template.city.data.hexClass = new hexagonCity(risp.coordinates[0])
		Template.map.data.map.setView(risp, 12,{animate: true, duration: 5.0});
		Template.map.data.centerCity = risp;
		checkDataLoaded();
 	});

 	Meteor.subscribe('scenarioDef', city, function() {
		let scenarioDef = scenarioDB.findOne({'default':true, 'city' : city}, {sort:{'creationDate':-1}});
		//console.log('loaded', scenarioDef);
	    Template.newScenario.data.scenarioDefaultId = scenarioDef._id; //scenario contenente i dati senza modifiche
	    Template.newScenario.data.scenarioDefault = scenarioDef;
	    Template.newScenario.RV.ScenarioGeojson.set(scenarioDef);
	    Template.newScenario.RV.ScenarioGeojsonId.set(scenarioDef._id);

     // console.log("Default scenario caricato ", Template.timeSelector.timeSelectedRV.get(),Template.newScenario.RV.currentScenario.get());
 	});
    if(Router.current().params.query.id){
		let _id = Router.current().params.query.id;
		let MongoID = new Mongo.ObjectID(_id)
		//console.log(MongoID, _id, Mongo)
	 	Meteor.subscribe('scenarioID', city, MongoID, function() {
			loadScenario();
			//console.log('scenarioID')
	      	//Template.city.function.checkDataLoaded(-1);
	 	});
 	}else{
 		loadScenario();
 	}



}

