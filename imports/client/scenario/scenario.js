import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import { Tracker } from 'meteor/tracker';

import { scenarioDB, initScenario} from '/imports/api/DBs/scenarioDB.js';
import {getCity, budget} from '/imports/api/parameters.js';

import {computeScore} from '/imports/client/budget/computeScore.js';
import { costLines } from '/imports/client/budget/metroCost.js';
import { addMarkerStop, addSubLine, addLine2DB } from '/imports/client/modify/addStop.js';
import { styleHex } from '/imports/client/info/hexagons/colorHex.js';
import { unionPoints, updateGeojson,updateGeojsonDiff, findFieldtoUpdate} from "/imports/client/info/hexagons/unionHexs.js";

import './scenario.html';
const deleteEmptyItem = function(array2Add){
	for(let key in array2Add){
		if(array2Add[key].pos.length == 0)
			delete array2Add[key];
	}
};

const fill2AddArray = function(num){
	let array2Add = {}
	for(let i = 0; i < num; i++){
		array2Add[i] = {
        	'pos' : [],
            'time' : []
        };
	}
	return array2Add;
}


const createScenario = function(newName) {

	const city = getCity();
	let time = Template.body.data.timeOfDay.get();
	let metroLinesFetched = Template.body.collection.metroLines.find({'city':city, 'temp':true}).fetch();
	let P2S2Add = fill2AddArray(Template.body.collection.points.find().count());
	let S2S2Add = fill2AddArray(Template.body.collection.stops.find().count())
	let scenario = initScenario(city, newName, time, metroLinesFetched, P2S2Add, S2S2Add);
	Template.body.template.scenario.currentScenario = scenario;

	Meteor.call('insertNewScenario', Template.body.template.scenario.currentScenario );

	Template.body.data.newAccessMax = {};
	Template.body.data.mapEdited.set(false);
	return true;
};

const updateScenario = function() {
	if (!Template.body.template.scenario.currentScenarioId || !Template.body.template.scenario.currentScenario)
		return;

	let selScenario = Template.body.template.scenario.currentScenario;
	let moments = selScenario.moments[Template.body.data.timeOfDay.get()]
	let city = getCity();

	let momentDefault = Template.body.data.defaultScenario['moments'][Template.body.data.timeOfDay.get()]

	let velocity = computeScore(moments['newVels']);
	console.log();

	let budgetTemp = budget - costLines(Template.body.collection.metroLines);
	let sumVTot = velocity * moments['newVels'].length;
	

	moments['velocity'] = velocity;
	moments['score'] = sumVTot - momentDefault.score;
	moments['budget'] = budgetTemp;
	moments['efficency'] = ((sumVTot - momentDefault.score) / (costLines(Template.body.collection.metroLines)));
	
	//  console.log('insert result',velocity, moments['newVels'].length, sumVTot,  moments,momentDefault);

	let stats = {
		'velocity' : 0,
		'score' : 0,
		'budget' : 0,
		'efficency' : 0
	};

	var cm = 0;
	for (var moment in selScenario.moments) {
		cm++;
		stats.velocity += selScenario.moments[moment].velocity;
		stats.score += selScenario.moments[moment].score;
		stats.budget += selScenario.moments[moment].budget;
		stats.efficency += selScenario.moments[moment].efficency;
	}

	stats.velocity /= cm;
	stats.score /= cm;
	stats.budget /= cm;
	stats.efficency /= cm;

	selScenario.stats = stats;
	//selScenario.newAccessMax = Template.body.data.newAccessMax;

	Meteor.call('updateScenario',selScenario, selScenario._id );
};

const setScenarioDefault = function() {
	if (!Template.body.template.scenario.currentScenarioId || !Template.body.template.scenario.currentScenario)
		return;

	var selScenario = Template.body.template.scenario.currentScenario;
	selScenario.default = true;

	Meteor.call('updateScenario',selScenario, selScenario._id );
};


export const loadNewTime = function(time) {

	const city = getCity();
	let scenario = {}
	switch(Template.body.data.buttonsHex) {
		case 'velHex':
			scenario = Template.body.data.defaultScenario
			Template.body.data.geoJson = updateGeojson(Template.body.data.geoJson,
											 scenario, 
											 Template.body.data.buttonsFeature, 
											 Template.body.data.buttonsHex,
											 time)
			break;
		case 'velNewHex':
			scenario = Template.body.template.scenario.currentScenario
			Template.body.data.geoJson = updateGeojson(Template.body.data.geoJson,
											 scenario, 
											 Template.body.data.buttonsFeature, 
											 Template.body.data.buttonsHex,
											 time)
			break;
		case 'diffHex':
			scenario = Template.body.data.defaultScenario
			scenarioNew = Template.body.template.scenario.currentScenario
			Template.body.data.geoJson = updateGeojsonDiff(Template.body.data.geoJson,
												 scenario, scenarioNew,
												 Template.body.data.buttonsFeature, 
												 Template.body.data.buttonsHex,
												 time)

			break;
	}

	if($('#buttonBuild').hasClass('active')){
		Template.body.data.map.eachLayer(function (layer) {
			if('lineName' in layer){
				layer.bringToFront();
			}
		});
	}
};

const loadScenario = function(id) {
	let selScenario = scenarioDB.findOne({'_id':id}, {sort:{'_id':1}} );
	if (!selScenario)
		return;

	Template.body.template.scenario.currentScenario = selScenario;
	Template.body.template.scenario.currentScenarioId = selScenario._id;
	Template.body.data.newAccessMax = selScenario.newAccessMax || {};

	console.log("carico scenario " + selScenario.name, Template.body.template.scenario.currentScenario);
	//REmove temp marker
	let MarkerDel = [];
	for(var nameMarker in Template.body.data.StopsMarker){
		let marker = Template.body.data.StopsMarker[nameMarker];
		if(marker.temp){
			Template.body.data.map.removeLayer(marker);
			MarkerDel.push(nameMarker);
		}
	}
	MarkerDel.forEach((markerId)=>{
		delete Template.body.data.StopsMarker[markerId];
	});
	let MarkerDelInfo = [];
	for(var nameMarkerInfo in Template.body.data.StopsMarkerInfo){
		let markerInfo = Template.body.data.StopsMarkerInfo[nameMarkerInfo];
		if(markerInfo.temp){
			Template.body.data.map.removeLayer(markerInfo);
			MarkerDelInfo.push(markerInfo);
		}
	}
	MarkerDelInfo.forEach((markerId)=>{
		delete Template.body.data.StopsMarkerInfo[markerId];
	});
	//end remove marker

	//reset number Line
	Template.body.data.listNumLines = Template.body.data.listNumLinesDef.slice();
	Template.body.data.nameLine = null;
	//Remove metro Line temp

	var city = getCity();
	Template.body.collection.metroLines.remove({city:city,temp:true},(err,num)=>{
		selScenario.lines.forEach((line)=>{
			console.log('line', line, num);
			if(line.temp){
				delete line.bezier_id;
				addLinesFromScenario(line);
			} else {
				Template.body.collection.metroLines.update(
							{'lineName'  : line.lineName},
							{'$set':{
								'frequencyName' :  line.frequencyName || "Med",
								'speedName' :  line.speedName || "Med"
							}
						}, function (err, doc) {
						});
			}
		});
		$("#buttonBuild").trigger('click');
		$('#scenarioModal').modal('hide');

		Template.body.data.mapEdited.set(false);
	});


};

Template.scenario.events({});

Template.scenario.helpers({
	'toUpdate'(){
		return Template.body.template.scenario.toSave.get() && Template.body.data.newHexsComputed ;
	},
	'updateScenario'(){ //è un helper così viene eseguito ogni volta che cambiano i valori delle variabili
		if(!Template.body.template.scenario.toSave.get()) //controllo se va aggiornato
			return '';

		Template.body.template.scenario.toSave.set(false);
		updateScenario();

		return '';
	},
	'computationFinished'(){
		//console.log('comp finished', Template.body.data.newHexsComputed);
		return Template.body.data.newHexsComputed;// && Template.body.template.scenario.nameInserted.get() !== null;
	},
	'getScoreList'(){

		var city = getCity();
		let listScenario = scenarioDB.find({city:city, default: false}, {sort:{order:-1, creationDate: -1}}).fetch();
		// for(let i = 0; i < listScenario.length; i++){
		// 	listScenario[i].position = i + 1;
		// }
		//console.log(listScenario)
		return listScenario;
	},
	'loadToMap'(){
		if(Template.body.data.timeOfDay && Template.body.data.buttonsHexRV){
			let scenarioId = Template.body.template.scenario.currentScenarioIdRV.get();
			console.log('load to map', scenarioId)
			let scenario = scenarioDB.findOne({'_id':scenarioId, 'moments':{'$exists':true}});
			let time = Template.body.data.timeOfDay.get();
			console.log('load to map', scenarioId)
			switch(Template.body.data.buttonsHexRV.get()) {
				case 'selected':
					Template.body.data.geoJson = updateGeojson(Template.body.data.geoJson,
													 scenario, 
													 Template.body.data.buttonsQuantityRV.get(), 
													 Template.body.data.buttonsModeRV.get(),
													 time)
					break;
				case 'diff':
					let scenarioDefaultId =  Template.body.template.scenario.scenarioDefaultIdRV.get()
					let scenarioDefault =  scenarioDB.findOne({'_id':scenarioDefaultId});
					Template.body.data.geoJson = updateGeojsonDiff(Template.body.data.geoJson,
														 scenario, scenarioNew,
														 Template.body.data.buttonsQuantityRV.get, 
														 Template.body.data.buttonsModeRV.get(),
														 time)

					break;
			}

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

Template.scenario.onCreated(function(){
	console.log('SCENARIO CREATED');


	Template.body.template.scenario = {};
	Template.body.template.scenario.toSave = new ReactiveVar(false); //se è stato ricalcolato e deve essere salvato
	Template.body.template.scenario.currentScenarioIdRV = new ReactiveVar(-1);	
	Template.body.template.scenario.scenarioDefaultId = new ReactiveVar(-1);
	
	Template.body.template.scenario.createScenario = createScenario;
	Template.body.template.scenario.updateScenario = updateScenario;
	Template.body.template.scenario.loadScenario = loadScenario;
	Template.body.template.scenario.deleteEmptyItem = deleteEmptyItem;
	//Template.body.template.scenario.loadScenarioVel = loadScenarioVel;
	Template.body.template.scenario.setScenarioDefault = setScenarioDefault;

});
Template.scenario.onRendered(function(){
	const city = getCity();

	Meteor.subscribe('scenario', city);

	Meteor.subscribe('scenarioDef', city, function() {
	    Template.body.template.scenario.scenarioDefaultId = scenarioDB.findOne({'default':true, 'city' : city}, {sort:{'creationDate':-1}})._id; //scenario contenente i dati senza modifiche
	    if (!Template.body.template.scenario.scenarioDefaultId)
	      console.error("Default scenario non trovato!");
	    else {
	        Template.body.template.scenario.currentScenarioIdRV.set(Template.body.template.scenario.scenarioDefaultId);
	    }
      Template.body.function.checkDataLoaded(-1);
      //Template.body.data.timeOfDay.set(timesOfDay[0]);
      console.log("Default scenario caricato ");
 	});

});

 let addLinesFromScenario = function(line, ext = false){
	//$('#buttonBuild').trigger('click');

	let stopsStops = line.stops.slice();
	//console.log('line Stop list ', line, stopsStops);
	line.stops=[];
	line.shape=[];

	if(line.subline || line.lineName.length > 3){
		let indexLine = line.indexLine;
		console.log('subline Scenario', line.indexLine, line);
		let firstStopLine = Template.body.collection.metroLines.findOne({'stops.latlng' : stopsStops[0].latlng});
		if(!firstStopLine){ console.log('error stop not found');}
		let firstStop = {};
		firstStopLine.stops.forEach(function(stop){
			//console.log(stop.latlng, stopsStops[0].latlng)
			if(stop.latlng[0] == stopsStops[0].latlng[0] && stop.latlng[1] == stopsStops[0].latlng[1]){
				//console.log('setted Firsr Stop', stop, stopsStops[0].latlng);
				firstStop = {'latlng': stopsStops[0].latlng, '_leaflet_id':stop._leaflet_id};
			}
		});
		let nameLine = addSubLine(firstStop.latlng, firstStop._leaflet_id, indexLine, line.city, line.speedName, line.frequencyName);

		line.stops = [{'latlng': firstStop.latlng, '_leaflet_id':firstStop._leaflet_id}];
		//console.log('firstStop', firstStopLine, line['stops'], firstStop);

		stopsStops.slice(1).forEach((stop,index)=>{
			//console.log(stop);
			addMarkerStop(stop.latlng, nameLine);
		});
	}else{
		let indexLine = line.indexLine;
		Template.body.data.listNumLines[indexLine]++;
		let nameLine = Template.body.data.listNameLines[indexLine];
		console.log(line);
		addLine2DB(line.city, nameLine, indexLine, [], line.speedName, line.frequencyName);

		//console.log('insertLine2', line);
		stopsStops.forEach((stop,index)=>{
			addMarkerStop(stop.latlng, line.lineName);
		});
	}
};



Template.scenarioList.events({
	'click .seeResultScenario'(e){

		let _id = $(e.target).parent().parent().attr('id');
		let objId = new Mongo.ObjectID(_id);
		loadScenario(objId);
	}
});


Template.scenarioList.helpers({
	'niceDate'(date){
		if (!date)
			return '---';
		//console.log(date);
		var monthNames = [
		  "January", "February", "March",
		  "April", "May", "June", "July",
		  "August", "September", "October",
		  "November", "December"
		];

		var day = date.getDate();
		var monthIndex = date.getMonth();
		var year = date.getFullYear();
		return day + ' ' + monthNames[monthIndex] + ' ' + year;
	},
	'toFixed'(val, fix){
		if (val === undefined || fix === undefined)
			return '---';
		return val.toFixed(fix);
	},
	'MtoEuro'(val){
		if (val === undefined)
			return '---';
		return (val*1000000).toFixed(0);
	},
	'success'(_id){
		//console.log(_id, Template.body.template.scenario.nameInserted.get() );
		// if(EJSON.equals(Template.body.template.scenario.nameInserted.get(), _id) ){
		// 	return "success";
		// }
	},
	'giveID'(id){
		if (id === undefined)
			return '---';
		//console.log(id, eval(id), id.toString(), eval(id).valueOf());
		return eval(id).valueOf();
	},
	'checkID'(_id){
		// if(Template.body.template.scenario.nameInserted.get()){
		// let newId = Template.body.template.scenario.nameInserted.get();
		// //console.log(_id.valueOf(), newId.valueOf(),EJSON.equals(Template.body.template.scenario.nameInserted.get(), _id))
		// return EJSON.equals(Template.body.template.scenario.nameInserted.get(), _id);
		// 	}
		},
	'scoreOncost'(score, cost, fixed){
		if (score === undefined || cost === undefined || fixed === undefined)
			return '---';
		return  (score/cost).toFixed(fixed);
	}
});
