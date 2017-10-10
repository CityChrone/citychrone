import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

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
import '/imports/client/otherTemplate/modalEnd.js';
import '/imports/client/routes/city/city.html';
import '/imports/client/explanation/titleBar.js';

Template.city.helpers({
	'loadGeojsonToMap'(){
		//console.log('loadGeojsonToMap',)
			if(Template.city.RV.currentScenario.get()){
				//console.log('loadGeojsonToMap after')
				let scenario = Template.city.RV.currentScenario.get();
				let time = Template.timeSelector.timeSelectedRV.get();
				//console.log('time',time)				
				Template.city.data.geoJson.updateGeojson(
														 scenario, 
														 Template.quantitySelector.quantitySelectedRV.get(),
														 false, 
														 time);			
			}
		return true;
	},
	'currentScenario'(){
	},
	'cityCenter'(){
		return Template.city.RV.cityCenter.get();
	},
	'subscriveScenario'(){
		let city = Template.city.data.city;

	 	if(Router.current().params.query.id){
			let _id = Router.current().params.query.id;
			let MongoID = new Mongo.ObjectID(_id)
			//console.log(MongoID, _id, Mongo)
		 	Meteor.subscribe('scenarioID', city, MongoID, function() {
		      	Template.city.function.checkDataLoaded(-1);
		 	});
		}

	 	Meteor.subscribe('scenarioDef', city, function() {
			let scenarioDef = scenarioDB.findOne({'default':true, 'city' : city, 'moments':{'$exists':true}}, {sort:{'creationDate':-1}});
			//console.log('loaded', scenarioDef);
		    Template.city.data.scenarioDefaultId = scenarioDef._id; //scenario contenente i dati senza modifiche
		    Template.city.data.scenarioDefault = scenarioDef;
		    if (!Template.city.data.scenarioDefaultId)
		      console.error("Default scenario non trovato!");
	      Template.city.function.checkDataLoaded(-1);
	      //console.log("Default scenario caricato ", scenarioDef);
	 	});

	},
	'loadScenario'(){

		let city = Template.city.data.city;
	
		let loadScenarioDef = function(){
			let currentScenario = scenarioDB.findOne({'default':true, 'city':Template.city.data.city, 'moments':{'$exists':true}});
			if(currentScenario){
				Template.city.RV.currentScenario.set(currentScenario);
			    let times = Object.keys(currentScenario.moments);
			    Template.timeSelector.timeSelectedRV.set(times[0]);
			}
		}

		if(Router.current().params.query.id){
			let _id = Router.current().params.query.id;
			let MongoID = new Mongo.ObjectID(_id)
			let currentScenario = scenarioDB.findOne({'_id':MongoID, 'city':Template.city.data.city, 'moments':{'$exists':true}});
			console.log("currentScenario", currentScenario)
			if(currentScenario){
				Template.city.RV.currentScenario.set(currentScenario);
			    let times = Object.keys(currentScenario.moments);
			    Template.timeSelector.timeSelectedRV.set(times[0]);
			    let lines = currentScenario.lines;
			    Template.metroLinesDraw.function.addLines(lines);
			}else{
				loadScenarioDef()
			}
		}else{
			loadScenarioDef();
		}
	},
	'addDataToMap'(){
		let city = Template.city.data.city;

		//CREATE CONTROLS

	  	let controlTL = createControl([Template.titleBar, Template.quantitySelector, Template.scenarioSelector, Template.buttonsChangePage, Template.socialButtons], "topleft",  Template.map.data.map, 'leftBar', true);
	  	let controlTR = createControl([Template.legendGeojson], "topright",  Template.map.data.map,'', true);

		Template.city.data.geoJson = new geoJsonClass;
		//console.log(Template.city.data.geoJson);
		Template.city.data.geoJson.geojson.addTo(Template.map.data.map);

		Template.city.data.popup = L.popup();


	},
	'mapLoaded'(){
		let mapLoaded = Template.map.RV.mapLoaded.get() || false;
		return mapLoaded;
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
	Template.city.data.dataToLoad = 2;
	Template.city.data.city = '';
	Template.city.data.hexClass = {}
	Template.city.data.geoJson = new geoJsonClass;
	Template.city.data.scenarioDefault = {};


	//********. Reactive Var ************ 
	Template.city.RV = {};
	Template.city.RV.dataLoaded = new ReactiveVar(false); //true when finished load data
	Template.city.RV.currentScenarioId = new ReactiveVar(false); 
	Template.city.RV.currentScenario = new ReactiveVar(false); 
	Template.city.RV.cityCenter = new ReactiveVar(false); 

	Template.city.function.checkDataLoaded = function(num = -1) {
		Template.city.data.dataToLoad  += num;
		if(Template.map.RV.mapLoaded.get()){
			if (Template.city.data.dataToLoad  > 0){
			Template.map.data.map.spin(true);
				return;
			}
			Template.map.data.map.spin(false);
			Template.city.RV.dataLoaded.set(true);
		}
	};

}); 

Template.city.onRendered(function() {

	let city = Router.current().params.city;
	//console.log('params', Router.current().params.query.id)
	Template.city.data.city = city;

	Meteor.call('giveDataBuildScenario', city,['centerCity'], function(err, data){
		//center City
		Template.city.RV.cityCenter.set({'centerCity' : data['centerCity'], 'zoom': 12});
		
	});

	Meteor.call('giveDataBuildScenario', city,['listPoints','oneHex'] , function(err, data){

		//listPoints
		let listPoints = data['listPoints']
		for(let doc_i = 0; doc_i < listPoints.length; doc_i++){
		    doc = listPoints[doc_i]
		    doc.point = {type:'Point', 'coordinates' : listPoints[doc_i].coor};
		    doc.city = city;
		    doc._id = doc.pos.toString();
		    Template.city.collection.points.insert(doc);
		}           
		fillPointTree(Template.city.collection.points); 
		Template.city.data.geoJson.setPoints(Template.city.collection.points);
		
		//oneHex
		let oneHex = data['oneHex']
		Template.city.data.hexClass = new hexagonCity(oneHex.coordinates[0]);
		Template.city.data.geoJson.setHexClass(Template.city.data.hexClass);
		
		Template.city.function.checkDataLoaded();

 	});

});



