import { Template } from 'meteor/templating';
//import { zeroTime,timesOfDay, maxDuration , HexArea, getCity } from '/imports/api/parameters.js';
//import { loadNewTime } from '/imports/client/scenario/scenario.js';
//import { unionPoints,  shellify} from '/imports/client/info/hexagons/unionHexs.js'
//import {returnShell, styleHex} from '/imports/client/info/hexagons/colorHex.js';

let countLimit = 0
let countStep = 1000

const workerOnMessage = function(e) {
	//console.log(Template.body.template.scenario.currentScenario)
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
		let moment = Template.body.template.scenario.currentScenario['moments'][Template.body.data.timeOfDay.get()]
		for(let point_i = 0; point_i < e.data.length; point_i++){
			let data = e.data[point_i];
			moment['newVels'][data.point.pos] = data.vAvg
			let accessNew = data.accessNew || {}
			moment['newAccess'][data.point.pos] = accessNew

		}
		if(Template.body.data.countHex > countLimit){
			//console.log('loaded new!! 1000', countStep, countLimit, Template.body.data.countHex,moment )
			loadNewTime(Template.body.data.timeOfDay.get())
			countLimit += countStep;
		}

		Template.body.data.countHex+=e.data.length;
		let time = new Date();
		//console.log(Template.body.data.countHex, Template.body.collection.newVel.find().count());
		if(Template.body.data.countHex == Template.body.collection.points.find().count()){
			Template.body.data.dataLoaded.set(true);
			Template.body.data.newHexsComputed = true;
			//Template.body.template.rank.toInsert.set(true);
			if (Template.body.template.scenario)
				Template.body.template.scenario.toSave.set(true);

			Template.body.data.map.spin(false);
			loadNewTime(Template.body.data.timeOfDay.get())
			//$('#rankModal').modal('show');


			if($('#buttonBuild').hasClass('active')){//WHY?!?!
				Template.body.data.map.eachLayer(function (layer) {
					if('lineName' in layer){
						layer.bringToFront();
					}
				});
			}

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
