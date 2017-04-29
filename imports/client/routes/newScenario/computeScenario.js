import { Template }  from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import '/imports/client/routes/newScenario/computeScenario.html';
import { makeWorkers } from '/imports/client/routes/newScenario/workerCSAUtil.js'


Template.computeScenario.helpers({});

Template.computeScenario.events({});


Template.computeScenario.onCreated(function(){
	// *******  FUNCTION  ***********
 Template.computeScenario.function = {};


// *******  COLLECTION  ***********
Template.computeScenario.collection = {};
Template.computeScenario.collection.stops = new Mongo.Collection(null)

//*********TEMPLATE***********
  Template.computeScenario.template = {};

// *******  DATA  ***********

  Template.computeScenario.data = {};
  Template.newScenario.data.dataToLoad = 3;

  //********. Reactive Var ************ 
  Template.computeScenario.RV = {};
  Template.computeScenario.RV.dataLoaded = new ReactiveVar(false); //true when finished load data

  //******** webWorker *************
  Template.computeScenario.worker = {}
  Template.computeScenario.worker.numCSAWorker = 2
  Template.computeScenario.worker.CSA = makeWorkers(Template.computeScenario.worker.numCSAWorker)

});

Template.computeScenario.onRendered(function(){
	let city = Router.current().params.city;
	Template.computeScenario.data.city = city;
	loadComputeScenarioData(city);
});

let loadComputeScenarioData = function(city, RV){
	let dataToLoad = 4;
	Template.map.data.map.spin(true);
	checkDataLoaded = function(num = -1) {
		dataToLoad  += num
		if(num < 1){
			Template.map.data.map.spin(false);
			Template.computeScenario.RV.dataLoaded.set(true);
		}
		return true;
	};

//FOR NEW SCENARIO ONLY -- VERY LARGE

 	Meteor.call('giveDataBuildScenario', city,'arrayC', function(err, res){
	    //console.log(res)
	      Template.computeScenario.worker.CSA.forEach((worker)=>{
	                  worker.postMessage({'arrayCDef' : res});
	      });
	      console.log('data ArrayC loaded');
	      checkDataLoaded(-1);
	  });

	  Meteor.call('giveDataBuildScenario', city,'arrayN', function(err, risp){
	      let P2PDef = {pos : risp.P2PPos, time : risp.P2PTime};
	      let P2SDef = {pos : risp.P2SPos, time : risp.P2STime};
	      let S2SDef = {pos : risp.S2SPos, time : risp.S2STime};
	      Template.computeScenario.worker.CSA.forEach((worker)=>{
	            worker.postMessage({'P2PDef' : P2PDef});
	            worker.postMessage({'P2SDef' : P2SDef});
	            worker.postMessage({'S2SDef' : S2SDef});
	      });      
	      console.log('data arrayN loaded');
	      checkDataLoaded(-1);
	  });

	  /*Meteor.call('giveDataBuildScenario', city,'pointsVenues', function(err, risp){
	    Template.body.data.allWorker.forEach((worker)=>{
	          worker.postMessage({'pointsVenues' : risp});
	    });
	    console.log('data pointsVenues loaded');
	    Template.body.function.checkDataLoaded(-1);
	  });*/

	Meteor.call('giveDataBuildScenario', city,'stops', function(err, risp){
	    risp.forEach(function(stop){
	      stop.temp = false;
	      Template.computeScenario.collection.stops.insert(stop);
	    });
	    console.log('data stops loaded');
	    checkDataLoaded(-1);
	  });

 	Meteor.call('giveDataBuildScenario', city,'areaHex', function(err, res){
	    //console.log(res)
	      Template.computeScenario.worker.CSA.forEach((worker)=>{
	                  worker.postMessage({'areaHex' : res});
	      });
	      console.log('data areaHex loaded');
	      checkDataLoaded(-1);
	  });
 	
 	/*Meteor.call('giveDataBuildScenario', city,'maxDuration', function(err, res){
	    //console.log(res)
	      Template.computeScenario.worker.CSA.forEach((worker)=>{
	                  worker.postMessage({'maxDuration' : res});
	      });
	      console.log('data areaHex loaded');
	      checkDataLoaded(-1);
	  });*/




}

