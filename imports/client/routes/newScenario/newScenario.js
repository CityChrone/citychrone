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
		if(Template.newScenario.RV.currentScenario.get()){
			//console.log('loadGeojsonToMap!!', Template.newScenario.RV.currentScenario.get())
			let scenario = Template.newScenario.RV.currentScenario.get();
			let time = Template.timeSelector.timeSelectedRV.get();
			let quantitySel = Template.quantitySelector.quantitySelectedRV.get()
			if( !Template.quantitySelector.quantityDiffSelectedRV.get() ){
				let geoJson = Template.newScenario.data.geoJson
				geoJson.updateGeojson(scenario, quantitySel, false, time, null, true);
			}
			else{
				let scenarioDefaultId =  Template.scenario.data.scenarioDefaultId.get()
				let scenarioDefault =  scenarioDB.findOne({'_id':scenarioDefaultId});
				let mode = Template.quantitySelector.modeSelectedRV.get();
				let geoJson = Template.newScenario.data.geoJson
				geoJson.updateGeoDiff( scenario, scenarioNew,quantitySel,mode ,time)
				}
			
			}
		return true;
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

  //********. Reactive Var ************ 
  Template.newScenario.RV = {};
  Template.newScenario.RV.dataLoaded = new ReactiveVar(false); //true when finished load data
  Template.newScenario.RV.currentScenarioId = new ReactiveVar(false); 
  Template.newScenario.RV.currentScenario = new ReactiveVar(false); 



}); 

Template.newScenario.onRendered(function() {

	let city = Router.current().params.city;
	Template.newScenario.data.city = city;
	loadScenarioData(city, Template.newScenario.RV);
	Template.newScenario.data.geoJson.enableClick();


  	//CREATE CONTROLS

  	let controlTL = createControl([Template.newScenarioButtons,Template.quantitySelector,  Template.buttonsChangePage, Template.socialButtons], "topleft",  Template.map.data.map, 'leftBar', true);
  	let controlTR = createControl([Template.legendGeojson], "topright",  Template.map.data.map,'', true);

	//console.log(Template.newScenario.data.geoJson);
	Template.newScenario.data.geoJson.geojson.addTo(Template.map.data.map);

	Template.newScenario.data.popup = L.popup();

});

let loadScenarioData = function(city, RV){
	let dataToLoad = 4;
	Template.map.data.map.spin(true);
	checkDataLoaded = function(num = -1) {
		dataToLoad  += num
		if(num < 1){
			Template.map.data.map.spin(false);
			Template.newScenario.RV.dataLoaded.set(true);
		}
		return true;
	};

	Meteor.call('giveDataBuildScenario', city,'listPoints', function(err, risp){

		for(let doc_i = 0; doc_i < risp.length; doc_i++){
		    doc = risp[doc_i]
		    doc.point = {type:'Point', 'coordinates' : risp[doc_i].coor};
		    doc.city = city;
		    doc._id = doc.pos.toString();
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
	    if (!Template.newScenario.data.scenarioDefaultId)
	      console.error("Default scenario non trovato!");
	    else {
	        Template.newScenario.RV.currentScenario.set(scenarioDef);
	        let times = Object.keys(scenarioDef.moments);
	        Template.timeSelector.timeSelectedRV.set(times[0]);
	    }
     // console.log("Default scenario caricato ", Template.timeSelector.timeSelectedRV.get(),Template.newScenario.RV.currentScenario.get());
      	checkDataLoaded();
 	});


//FOR NEW SCENARIO ONLY VERY LARGE
/*
 	Meteor.call('giveDataBuildScenario', city,'arrayC', function(err, res){
	    console.log(res)
	      Template.body.data.allWorker.forEach((worker)=>{
	                  worker.postMessage({'arrayCDef' : res});
	      });
	      console.log('data ArrayC loaded');
	      Template.body.function.checkDataLoaded(-1);
	  });

	  Meteor.call('giveDataBuildScenario', city,'arrayN', function(err, risp){
	      let P2PDef = {pos : risp.P2PPos, time : risp.P2PTime};
	      let P2SDef = {pos : risp.P2SPos, time : risp.P2STime};
	      let S2SDef = {pos : risp.S2SPos, time : risp.S2STime};
	      Template.body.data.allWorker.forEach((worker)=>{
	            worker.postMessage({'P2PDef' : P2PDef});
	            worker.postMessage({'P2SDef' : P2SDef});
	            worker.postMessage({'S2SDef' : S2SDef});
	      });      
	      console.log('data arrayN loaded');
	      Template.body.function.checkDataLoaded(-1);
	  });

	  Meteor.call('giveDataBuildScenario', city,'pointsVenues', function(err, risp){
	    Template.body.data.allWorker.forEach((worker)=>{
	          worker.postMessage({'pointsVenues' : risp});
	    });
	    console.log('data pointsVenues loaded');
	    Template.body.function.checkDataLoaded(-1);
	  });

	Meteor.call('giveDataBuildScenario', city,'stops', function(err, risp){
	    risp.forEach(function(stop){
	      stop.temp = false;
	      Template.body.collection.stops.insert(stop);
	    });
	    console.log('data stops loaded', dataToLoad);
	    Template.body.function.checkDataLoaded(-1);
	  });
*/

}

