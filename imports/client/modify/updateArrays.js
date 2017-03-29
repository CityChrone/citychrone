import {Template} from 'meteor/templating';
import { addNewLines } from '/imports/api/CSA-algorithm/addNewLines.js';
import { mergeSortedC, copyArrayN } from '/imports/lib/utils.js';
import { computeNeigh } from '/imports/api/CSA-algorithm/computeNeigh.js';
import {getCity , maxDuration } from '/imports/api/parameters.js';

const updateArrays = function(){
	//make copy of default arrays
	var city = getCity();
		//Template.body.data.cArrayTimes[Template.body.data.timeOfDay.get()].slice();


	//Adding the stops added by the user to the arrays and collections of stops
	Template.body.collection.stops.remove({temp:true});
	
	let scenario = Template.body.template.scenario.currentScenario;
	let metroLinesFetched = scenario.lines;

	metroLinesFetched.forEach(function(line, indexLine){
		line.stops.forEach(function(stop, indexStop){
 			let posStop = _.size(scenario.S2S2Add);
 			console.log(posStop, line, stop)
			metroLinesFetched[indexLine].stops[indexStop].pos = posStop;
			Template.body.collection.stops.insert({
				'line' : line.lineName,
				'pos' : posStop,
				'latlng' : stop.latlng,
				'coor' : [stop.latlng[1], stop.latlng[0]],
				'timeCreation' : new Date().getTime(),
				'point' : {'type' : 'Point', 'coordinates' : [stop.latlng[1], stop.latlng[0]]},
				'temp' : true,
				'city' : city,
			});
			scenario.S2S2Add[posStop] = {
	        	'pos' : [],
	            'time' : []
        	};
		});
	});

	let newStops = Template.body.collection.stops.find({temp:true}, {sort : {'timeCreation':1} });

	let promiseAddStop = [];

 	if(newStops.count()){
	 	newStops.forEach(function(stop) {

	 		promiseAddStop.push(computeNeigh(stop,Template.body.collection.stops, scenario.P2S2Add ,scenario.S2S2Add,Template.body.collection.points));
	 	});
	}

 	return promiseAddStop;

};

const computeNewHex = function(){
	Template.body.data.countHex = 0;	
	Template.body.data.newHexsComputed = true;

	//let wTime = [Template.body.data.timeOfDay.get() , Template.body.data.timeOfDay.get() + maxDuration];
	let promiseAddStop = updateArrays();


	Promise.all(promiseAddStop).then(values => {


		let scenario = Template.body.template.scenario.currentScenario;
		console.log('BEFORE', _.size(scenario.P2S2Add), _.size(scenario.S2S2Add))
		Template.body.template.scenario.deleteEmptyItem(scenario.P2S2Add);
		Template.body.template.scenario.deleteEmptyItem(scenario.S2S2Add);
		console.log('AFTER', _.size(scenario.P2S2Add), _.size(scenario.S2S2Add))

		let wTime = [Template.body.data.timeOfDay.get() , Template.body.data.timeOfDay.get() + maxDuration];
 		let arrayC2Add = addNewLines(scenario.lines, wTime);


		for(let w_i = 0; w_i < Template.body.data.totWorker; w_i++){
			let worker = Template.body.data.allWorker[w_i];
			worker.postMessage({'arrayC2Add' : arrayC2Add});
			worker.postMessage({'startTime' : Template.body.data.timeOfDay.get()});
			//worker.postMessage({'P2P' : Template.body.data.P2P});
			worker.postMessage({'P2S2Add' : scenario.P2S2Add});
			worker.postMessage({'S2S2Add' : scenario.S2S2Add});

		}

 		let points = [];
		for(let w_i = 0; w_i < Template.body.data.totWorker; w_i++)	{
			let temp = [];
			points.push(temp);
		}

		let workerCount = 0;
		let totPoint = Template.body.collection.points.find({}).count(); //NB: dTerm = distanza dal centro
		Template.body.collection.points.find({}, {sort : {'dTerm':1}}).forEach(function(point, index){
		 	let cluster = Template.body.data.cluster;
		 	if(index % cluster !== 0){ //mollo 50 punti alla volta a ogni worker
		 		points[workerCount].push(point);
		 		workerCount =  (workerCount+1) % Template.body.data.totWorker;
		 		if(totPoint - 1 == index ){ //se è l'ultimo punto da inserire
					for(let w_i = 0; w_i < Template.body.data.totWorker; w_i++)	{
						Template.body.data.allWorker[w_i].postMessage({points:points[w_i]});
					}
		 		}
		 	}else{
		 		points[workerCount].push(point);
				for(let w_i = 0; w_i < Template.body.data.totWorker; w_i++)	{
					Template.body.data.allWorker[w_i].postMessage({points:points[w_i]});
				}
		 		points = [];
				for(let w_i = 0; w_i < Template.body.data.totWorker; w_i++)	{
					points.push([]);
				}
		 	}
		 });
	});


};
const computeIsochrone = function(point, scenario){
	console.log(point, scenario);

	let wTime = [Template.body.data.timeOfDay.get() , Template.body.data.timeOfDay.get() + maxDuration];
 	let arrayC2Add = addNewLines(scenario.lines, wTime) || [];
	let worker = Template.body.data.allWorker[0];
	let P2S2Add = scenario.P2S2Add || {};
	let S2S2Add = scenario.S2S2Add || {};
	worker.postMessage({'arrayC2Add' : arrayC2Add});
	worker.postMessage({'startTime' : Template.body.data.timeOfDay.get()});
	worker.postMessage({'P2S2Add' : P2S2Add});
	worker.postMessage({'S2S2Add' : S2S2Add});
	setTimeout(() =>{
		worker.postMessage({'isochrone':{'point' : point}});
	},200);

}

export { updateArrays, computeNewHex, computeIsochrone };
