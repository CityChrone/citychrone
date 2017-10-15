import { Template } from 'meteor/templating';
import { computeScoreNewScenario } from '/imports/DBs/scenarioDB.js';
//import { zeroTime,timesOfDay, maxDuration , HexArea, getCity } from '/imports/parameters.js';
//import { loadNewTime } from '/imports/client/scenario/scenario.js';
//import { unionPoints,  shellify} from '/imports/client/info/hexagons/unionHexs.js'
//import {returnShell, styleHex} from '/imports/client/info/hexagons/colorHex.js';


const workerOnMessage = function(e) {
	let countLimit = Template.computeScenario.data.countLimit;
	let countStep = Template.computeScenario.data.countStep;

	//console.log('work on message', e)
	let scenario = Template.newScenario.RV.currentScenario.get();
	let scenarioDef = Template.newScenario.data.scenarioDefault;

	if(e.data.tPoint) {
		//console.log('isochrone!!', e.data);
		let field = 't'
		let geoJson = Template.body.data.geoJson;
		geoJson.clearLayers();
		let shell = returnShell(field);
		let points = Template.body.collection.points.find().fetch()
		points.forEach((p,i)=>{
			let t = e.data.tPoint[p.pos]
			points[i]['t'] = t;
			});
    	let pointShellify = shellify(points, 't', shell);
    	for (let low in pointShellify) {
	        geoJsonUnion = unionPoints(pointShellify[low]);
	        //console.log('union', low, geoJsonUnion, shell, points, pointShellify)
	        geoJsonUnion['properties'] = {}
	        geoJsonUnion['properties'][field] = low;
	        geoJson.addData(geoJsonUnion)
    	}
	}else{
		let time = Template.timeSelector.timeSelectedRV.get()
		let moment = scenario['moments'][time]
		let momentDef = scenarioDef['moments'][time]
		//console.log(moment, momentDef)
		for(let point_i = 0; point_i < e.data.length; point_i++){
			let data = e.data[point_i];
			moment['velocityScore'][data.point.pos] = data.velocityScore
			moment['socialityScore'][data.point.pos] = data.socialityScore

			moment['velocityScoreDiff'][data.point.pos] = data.velocityScore - momentDef['velocityScore'][data.point.pos]
			moment['socialityScoreDiff'][data.point.pos] = data.socialityScore - momentDef['socialityScore'][data.point.pos]
		}
		if(Template.computeScenario.worker.CSAPointsComputed > countLimit){
			//console.log('loaded new!! ', countStep, countLimit, Template.newScenario.RV.ScenarioGeojson.get())
			//loadNewTime(Template.body.data.timeOfDay.get());
			Template.newScenario.RV.ScenarioGeojson.set(scenario);
			Template.computeScenario.data.countLimit += Template.computeScenario.data.countStep;
		}

		Template.computeScenario.worker.CSAPointsComputed += e.data.length;

		//console.log(Template.body.data.countHex, Template.body.collection.newVel.find().count());
		if(Template.computeScenario.worker.CSAPointsComputed == Template.newScenario.collection.points.find().count()){
			//console.log("ended")
			Template.map.data.map.spin(false);
			Template.computeScenario.function.loading(false)
			scenario['arrayPop'] = Template.newScenario.data.arrayPop
			scenario['scores'] = computeScoreNewScenario(scenario, time);
			scenario['budget'] = Template.budget.function.cost();
			//console.log('scenario after scores',scenario)

			Template.newScenario.RV.currentScenario.set(scenario);
			Meteor.call('insertNewScenario', scenario, (data)=>{
				Template.metroLinesDraw.RV.mapEdited.set(false);
				Template.computeScenario.data.ended.set(true);
			});
			//$(".scenarioButton").trigger('click');
		}
		//console.log('added ', Template.body.data.countHex, 1.*Math.floor(time.getTime()/ 100)/10. );
	}
};

const makeWorkers = function(totWorker){
	var allWorkers = [];
	//const areaHex = HexArea[getCity()];
	for(let w_i = 0; w_i < totWorker; w_i++){
		let worker = new Worker("/workers/workerCSA.js");

 		//worker.postMessage({'areaHex' : areaHexareaHex});
 		//worker.postMessage({'maxDuration' : maxDuration});

 
		worker.onmessage = workerOnMessage;
		allWorkers.push(worker);
	}
	return allWorkers;
};

export {makeWorkers};
