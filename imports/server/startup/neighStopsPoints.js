import { points, stops } from '/imports/api/DBs/stopsAndPointsDB.js';
import { cities } from '/imports/api/DBs/citiesDB.js';

const toKey = function(keyName){
	return function(obj){
		return Math.round(obj[keyName]);
	};
};

const toKey2 = function(myArr, keyName){
	var temp = [];
	if(keyName == 'time'){
		for(let i = 0; i < myArr.length; i++){
			temp.push(Math.round(myArr[i][keyName]));
		}
	}
	else{
		for(let i = 0; i < myArr.length; i++){
			temp.push(myArr[i][keyName]);
		}
	}
	return temp;
};

const initNeighStopAndPoint = function(city) {


	// if (city == 'roma')
	// 	throw new Exception("non rigenerare roma!");

	var S2SPos = [];
	var S2STime = [];
	var S2PPos = [];
	var S2PTime = [];
	var P2PPos = [];
	var P2PTime = [];
	var P2SPos = [];
	var P2STime = [];

	console.log('initNStopANdpoint : ', points.find({'city':city}).count());

	let oldPos = -1;
	stops.find({'city':city}, {sort:{'pos':1}}).forEach(function(stop, index){
		if (isNaN(stop.pos)) {
			console.log("Stop pos non numerica: " + stop.pos);
			return;
		}

		var pos = lodash.toInteger(stop.pos);
		if (oldPos + 1 != pos) {
			console.log("Stop pos non contigua: " + pos);
		}
		oldPos = pos;

		if (!stop.stopN) {
			//console.log("Stop stopN non esiste: " + stop.pos);
			return;
		}

		if (!stop.pointN) {
			//console.log("Stop pointN non esiste: " + stop.pos);
			return;
		}

		S2SPos[pos] = toKey2(stop.stopN,'pos');
		S2STime[pos] = toKey2(stop.stopN,'time');
		S2PPos[pos] = toKey2(stop.pointN,'pos');
		S2PTime[pos] = toKey2(stop.pointN,'time');
	});

	oldPos = -1;
	let cond = {'city':city};
	// if (city == 'roma')
	// 	cond.inCity = true;

	points.find(cond, {sort:{'pos':1}}).forEach(function(point, index){
		if (isNaN(point.pos)) {
			console.log("Point pos non numerica: " + point.pos);
			return;
		}

		var pos = lodash.toInteger(point.pos);
		if (oldPos + 1 != pos) {
			console.log("Point pos non contigua: " + pos);
		}
		oldPos = pos;

		if (!point.stopN) {
			//console.log("Stop stopN non esiste: " + point.pos);
			return;
		}

		if (!point.pointN) {
			//console.log("Stop pointN non esiste: " + point.pos);
			return;
		}

		P2SPos[pos] = toKey2(point.stopN,'pos');
		P2STime[pos] = toKey2(point.stopN,'time');
		P2PPos[pos] = toKey2(point.pointN,'pos');
		P2PTime[pos] = toKey2(point.pointN,'time');
	});

	console.log('stopsAndPoints ended array generation');
	console.log('points ', P2SPos.length, P2STime.length, S2SPos.length, S2STime.length);
//
//	totS2S = 0.;
//	countS2S = 0;
//	S2SPos.forEach(function(stops, index){
//		totS2S += 2.*stops.length*8;
//		countS2S+=1;
//	});
//	totP2S=0.;
//	countP2S = 0;
//	P2SPos.forEach(function(stops, index){
//		totP2S += 2.*stops.length*8;
//		countP2S++;
//	});
//	totP2P=0.;
//	countP2P = 0;
//	P2PPos.forEach(function(stops, index){
//		totP2P += 2.*stops.length*8;
//		countP2P++;
//	});

	// console.log('dimension S2S, P2S, P2P', totS2S /(1024*1024), totP2S
	// /(1024*1024), totP2P /(1024*1024) , 'Mb');
	// console.log('dimension Average array S2S, P2S, P2P', totS2S /(countS2S *
	// 16), totP2S /(16*countP2S), totP2P /(countP2P*16) , ' average neigh');

	return {
			'P2PPos' : P2PPos,
			'P2PTime' : P2PTime,
			'P2SPos' : P2SPos,
			'P2STime' : P2STime,
			'S2SPos' : S2SPos,
			'S2STime' : S2STime,
			'S2PPos' : S2PPos,
			'S2PTime' : S2PTime,
	};

};


export {initNeighStopAndPoint};
