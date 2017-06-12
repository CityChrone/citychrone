import { Template }  from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Mongo } from 'meteor/mongo';
import { Blaze } from 'meteor/blaze';
import '/imports/client/routes/newScenario/computeScenario.html';
import { makeWorkers } from '/imports/client/routes/newScenario/workerCSAUtil.js'
import { scenarioDB, initScenario } from '/imports/api/DBs/scenarioDB.js'
import { maxTimeWalk, maxDistanceWalk, maxDuration} from '/imports/api/parameters.js';
import * as addNewStops from '/imports/client/routes/newScenario/addNewStops.js'
import * as parameters from '/imports/api/parameters.js'
import * as addNewConnections from '/imports/client/routes/newScenario/addNewConnections.js'
import '/imports/client/routes/newScenario/saveScenario.js';
Template.computeScenario.helpers({
	'toSave'(){
		//console.log("toSave !!", Template.computeScenario.RV.toSave.get())
		return Template.computeScenario.RV.toSave.get();
	},
	'saveTemplate'(){
		//console.log('rendered', Template.body, $("body")[0]);
		//Blaze.render(Template.saveScenario, $("body")[0]);
	},
	'dataLoadedGet'(){
		return !Template.computeScenario.RV.dataLoaded.get();
	},
	'toCompute'(){
		return Template.metroLinesDraw.RV.mapEdited.get();
	}
});

Template.computeScenario.events({
	'click #ComputeNewMap'() {
		if(!Template.computeScenario.RV.dataLoaded.get()) //se non ho caricato i dati (o non ho finito il nuovo calcolo) non faccio nulla
			return;
		if(Template.computeScenario.data.newHexsComputed && !Template.computeScenario.data.mapEdited.get()) //se ho iniziato il calcolo o l'ho già finito
			return;

		let newName;

		Template.newScenario.RV.currentScenarioId.set(false);
		Template.newScenario.RV.currentScenario.set(false);

		if(!$('#endMetro').hasClass('hidden')){
			$('#endMetro').trigger('click'); //finisco di aggiungere la linea
		}

		let city = Template.computeScenario.data.city
		let name = "";
		let author = "";
		let time = Template.timeSelector.timeSelectedRV.get();
		let P2S2Add = addNewStops.fill2AddArray(Template.newScenario.collection.points.find().count());
		let S2S2Add = addNewStops.fill2AddArray(Template.computeScenario.collection.stops.find().count())
		let lines = Template.metroLinesDraw.collection.metroLines.find({'temp':true}).fetch();
		let scenario = initScenario(city, name, author, time, lines, P2S2Add, S2S2Add);
		console.log('created scenario', P2S2Add, S2S2Add);
		Template.computeScenario.RV.toSave.set(true);
		//console.log('compute!!',Template.computeScenario.RV.toSave.get());
		Template.newScenario.RV.currentScenario.set(scenario);
		Template.newScenario.RV.currentScenarioId.set(scenario._id);
		Blaze.render(Template.saveScenario, $("body")[0]);

		computeNewScenario()
		$('#ComputeNewMap').removeClass('active');
	}
});


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
  Template.newScenario.data.serverOSRM = "http://localhost:3000";
  Template.newScenario.data.arrayPop = [];


  //********. Reactive Var ************ 
  Template.computeScenario.RV = {};
  Template.computeScenario.RV.dataLoaded = new ReactiveVar(false); //true when finished load data
  Template.computeScenario.RV.toSave = new ReactiveVar(false); //set true when the user have to insert the name and uthor of the scenario

  //******** webWorker *************
  Template.computeScenario.worker = {}
  Template.computeScenario.worker.numCSAWorker = 2
  Template.computeScenario.worker.CSA = makeWorkers(Template.computeScenario.worker.numCSAWorker)
  Template.computeScenario.worker.CSAClusterPoints = 50;
  Template.computeScenario.worker.CSAPointsComputed = 0;
});

Template.computeScenario.onRendered(function(){

	let city = Router.current().params.city;
	Template.computeScenario.data.city = city;

	loadComputeScenarioData(city);
});

let loadComputeScenarioData = function(city, RV){
	let dataToLoad = 5;
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

    Meteor.call("serverOSRM", Template.computeScenario.data.city, function(err, res){
        Template.computeScenario.data.serverOSRM = res['serverOSRM'];
    })

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

    Meteor.call('giveDataBuildScenario', city,'arrayPop', function(err, risp){
	    Template.computeScenario.worker.CSA.forEach((worker)=>{
	          worker.postMessage({'arrayPop' : risp});
	          Template.newScenario.data.arrayPop = risp;

	    });
	    console.log('data arrayPop loaded');
	    checkDataLoaded(-1);
	  });


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
};

const computeNewScenario = function(){

	let city = Template.computeScenario.data.city;
	let stopsCollection = Template.computeScenario.collection.stops;
	let pointsCollection = Template.newScenario.collection.points;
	let scenario = Template.newScenario.RV.currentScenario.get();
	let serverOSRM = Template.computeScenario.data.serverOSRM;
	console.log("start update Arrays", scenario)
	Template.computeScenario.worker.CSAPointsComputed = 0;
	let promiseAddStop = addNewStops.updateArrays(city, stopsCollection, pointsCollection, scenario, serverOSRM);


	Promise.all(promiseAddStop).then(values => {
		console.log("end update Arrays", scenario)

		console.log('BEFORE', _.size(scenario.P2S2Add), _.size(scenario.S2S2Add))
		addNewStops.deleteEmptyItem(scenario.P2S2Add);
		addNewStops.deleteEmptyItem(scenario.S2S2Add);
		console.log('AFTER', _.size(scenario.P2S2Add), _.size(scenario.S2S2Add))

		let startTime = parseFloat(Template.timeSelector.timeSelectedRV.get())
		let wTime = [startTime , startTime + parameters.maxDuration];
 		let arrayC2Add = addNewConnections.addNewLines(scenario.lines, wTime);

 		//console.log('arrayC to add', arrayC2Add)

		for(let w_i = 0; w_i < Template.computeScenario.worker.numCSAWorker; w_i++){
			let worker = Template.computeScenario.worker.CSA[w_i];
			worker.postMessage({'arrayC2Add' : arrayC2Add});
			worker.postMessage({'startTime' : startTime});
			//worker.postMessage({'P2P' : Template.body.data.P2P});
			worker.postMessage({'P2S2Add' : scenario.P2S2Add});
			worker.postMessage({'S2S2Add' : scenario.S2S2Add});

		}

 		let points = [];
 		let totWorkers = Template.computeScenario.worker.numCSAWorker;
		for(let w_i = 0; w_i < totWorkers; w_i++)	{
			let temp = [];
			points.push(temp);
		}
		Meteor.setTimeout(function(){
					let workerCount = 0;
		let totPoint = Template.newScenario.collection.points.find({}).count(); //NB: dTerm = distanza dal centro
		Template.newScenario.collection.points.find({}, {sort : {'dTerm':1}}).forEach(function(point, index){
		 	let cluster = Template.computeScenario.worker.CSAClusterPoints;
		 	if(index % cluster !== 0){ //mollo 50 punti alla volta a ogni worker
		 		points[workerCount].push(point);
		 		workerCount =  (workerCount+1) % totWorkers;
		 		if(totPoint - 1 == index ){ //se è l'ultimo punto da inserire
					for(let w_i = 0; w_i < totWorkers; w_i++)	{
						Template.computeScenario.worker.CSA[w_i].postMessage({points:points[w_i]});
					}
		 		}
		 	}else{
		 		points[workerCount].push(point);
				for(let w_i = 0; w_i < totWorkers; w_i++)	{
					Template.computeScenario.worker.CSA[w_i].postMessage({points:points[w_i]});
				}
		 		points = [];
				for(let w_i = 0; w_i < totWorkers; w_i++)	{
					points.push([]);
				}
		 	}
		 });

		}, 500)
	});
};



