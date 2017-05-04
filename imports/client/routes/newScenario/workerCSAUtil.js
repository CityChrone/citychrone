import { Template } from 'meteor/templating';
import { computeScoreNewScenario } from '/imports/api/DBs/scenarioDB.js';
//import { zeroTime,timesOfDay, maxDuration , HexArea, getCity } from '/imports/api/parameters.js';
//import { loadNewTime } from '/imports/client/scenario/scenario.js';
//import { unionPoints,  shellify} from '/imports/client/info/hexagons/unionHexs.js'
//import {returnShell, styleHex} from '/imports/client/info/hexagons/colorHex.js';

let countLimit = 0
let countStep = 1000

const workerOnMessage = function(e) {
	
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
		for(let point_i = 0; point_i < e.data.length; point_i++){
			let data = e.data[point_i];
			moment['newVels'][data.point.pos] = data.newVels
			moment['newPotPop'][data.point.pos] = data.newPotPop
			let newAccess = data.newAccess || {}
			moment['newAccess'][data.point.pos] = newAccess

			moment['newVelsDiff'][data.point.pos] = data.newVels - momentDef['newVels'][data.point.pos]
			moment['newPotPopDiff'][data.point.pos] = data.newPotPop - momentDef['newPotPop'][data.point.pos]
			moment['newAccessDiff'][data.point.pos] = moment['newAccess'][data.point.pos]  - momentDef['newAccess'][data.point.pos]
		}
		if(Template.computeScenario.worker.CSAPointsComputed > countLimit){
			//console.log('loaded new!! ', countStep, countLimit, Template.computeScenario.worker.CSAPointsComputed,moment )
			//loadNewTime(Template.body.data.timeOfDay.get());
			Template.newScenario.RV.currentScenario.set(scenario);
			//Template.newScenario.data.geoJson.updateGeojson(scenario, Template.quantitySelector.quantitySelectedRV.get())
			countLimit += countStep;
		}

		Template.computeScenario.worker.CSAPointsComputed += e.data.length;

		//console.log(Template.body.data.countHex, Template.body.collection.newVel.find().count());
		if(Template.computeScenario.worker.CSAPointsComputed == Template.newScenario.collection.points.find().count()){
			console.log("ended")
			Template.map.data.map.spin(false);
			scenario['arrayPop'] = Template.newScenario.data.arrayPop
			scenario['scores'] = computeScoreNewScenario(scenario, time);
			scenario['budget'] = Template.budget.function.cost();
			console.log('scenario after scores',scenario)

			Template.newScenario.RV.currentScenario.set(scenario);
			Meteor.call('insertNewScenario', scenario);
			$(".scenarioButton").trigger('click');
			Template.metroLinesDraw.RV.mapEdited.set(false);

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
