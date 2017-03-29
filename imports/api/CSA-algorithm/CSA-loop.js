import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import  math from 'mathjs';
import turf from 'turf';

//import { P2P, P2S, S2S} from '/imports/server/startup/neighStopsPoints.js';
import { getCity, zeroTime, HexArea } from '/imports/api/parameters.js';
//import { points } from 'imports/api/DBs/stopsAndPointsDB.js'

var a = 0.0;
var b = 0.7;
var N= 2.5;
var TBus = 67.0*60;
var Ebar = 675.0;

const displDistr = function(t){
	//t /= 60.;
	if(t == 0) return Math.exp(- t/(b*TBus));
	return Math.exp(-((a*TBus)/t) - t/(b*TBus));
};



var CSAPoint = function(point, arrayC, arrayN, startTime, areaHex, windTime, zeroTime){

	var P2PPos = arrayN.P2PPos;
	var P2SPos = arrayN.P2SPos;
	var S2SPos = arrayN.S2SPos;
	var P2PTime = arrayN.P2PTime;
	var P2STime = arrayN.P2STime;
	var S2STime = arrayN.S2STime;

	const infTime = Math.pow(10,12);

	var totPoint = P2SPos.length;
	var totStop = S2SPos.length;
	var Tstop = new Array(totStop).fill(infTime);
	var Tpoint = new Array(totPoint).fill(infTime);

	var posPoint = point.pos;
	var countTime = 0;
	var i, lenghtP, lenghtS;
	// **** Initialize time for starting point
	Tpoint[posPoint] = startTime;

	// **** Initialize time for neigh point
	for(i = 0, lenghtP = P2PPos[posPoint].length; i < lenghtP; i++ ){
		//console.log('P2P', P2PPos[posPoint], i);
		Tpoint[P2PPos[posPoint][i]] = P2PTime[posPoint][i] + startTime;
	}

	for(i = 0, lenghtS = P2SPos[posPoint].length; i < lenghtS; i++ ){
		//console.log( P2STime[posPoint][i] + startTime)
		Tstop[P2SPos[posPoint][i]] = P2STime[posPoint][i] + startTime;
	}


	//CSA-Algorithm core
	for (var c_i = 0, totC = arrayC.length; c_i < totC; c_i+=4){
		var posStopStart = arrayC[c_i];
		var timeStartC = arrayC[c_i + 2];
		if(Tstop[posStopStart] <= timeStartC){
			var posStopArr = arrayC[c_i + 1];
			var timeArr = arrayC[c_i + 3];
			if(Tstop[posStopArr] > timeArr){
				Tstop[posStopArr]  = timeArr;
				var stopNArrayPos = S2SPos[posStopArr];
				for(var stopN_i = 0, lenghtS = stopNArrayPos.length; stopN_i < lenghtS; stopN_i++ ){
					var posStopArrN = stopNArrayPos[stopN_i];
					var timeArrN = timeArr + S2STime[posStopArr][stopN_i];
					if(Tstop[posStopArrN] > timeArrN){
							Tstop[posStopArrN] = timeArrN;
					}
				}
			}
		}
	}

	// **** Update point time after computed stop time
	var CountNoInf = 0;
	var totTime =  0;
	var totAreaLess1h = 0;
	var leigthTimeArray = (windTime[1] - windTime[0])+7200;
	var areasTime = new Array(leigthTimeArray).fill(0);
	for(var point_i = 0, len_point = Tpoint.length; point_i < len_point; point_i++){
		for(i = 0, lenghtS = P2SPos[point_i].length; i < lenghtS; i++ ){
			var StopNPos = P2SPos[point_i][i];
			var newTime = P2STime[point_i][i] + Tstop[StopNPos];
			if(Tpoint[point_i] > newTime){
				Tpoint[point_i] = newTime;
			}
		}
		if(Tpoint[point_i] < infTime){
			var value = Tpoint[point_i] - startTime;
			areasTime[value] += 1;
			CountNoInf++;
			totTime += value;
			if(value < 3600){
				totAreaLess1h++;
			}
		}
	}
		//console.log(Tstop.slice(0,100),' stop ')

	//console.log(areaHex, point,  startTime, totAreaLess1h);
	var area_new = 0;
	var area_old = 0;
	var vAvg = 0;
	var integralWindTime = 0;

	for(var time_i = zeroTime; time_i < leigthTimeArray; time_i++){
		area_new += areasTime[time_i]*areaHex;
		vAvg += (Math.sqrt(area_new/Math.PI) - Math.sqrt(area_old/Math.PI)) / (time_i);
		//console.log(time_i, areasTime[time_i], areaHex, area_new, area_old, vAvg);
		area_old = area_new;
		//freqVel[Math.floor(float(time_i)/step)] += 1;
		integralWindTime += 1.0/(time_i);

	}

	var vAvg2 = 0;
	var integralWindTime2 = 0;
	area_new = 0;
	area_old = 0;
	for(var time_i = 0; time_i < leigthTimeArray; time_i++){
		area_new += areasTime[time_i]*areaHex;
		vAvg2 += displDistr(time_i) * (Math.sqrt(area_new/Math.PI) - Math.sqrt(area_old/Math.PI));
		area_old = area_new;
		integralWindTime2 += displDistr(time_i);
	}

	//console.log(vAvg, vAvg2, integralWindTime, integralWindTime2, zeroTime);

	vAvg /= integralWindTime;
	vAvg *= 3600;
	vAvg2 /= integralWindTime2;
	vAvg2 *= 3600;

	//totAreaLess1h *= areaHex;
	var VelocityLess1h = Math.sqrt(totAreaLess1h / Math.PI);
	//console.log(Tpoint.slice(0,100),' point ', point)
	return {'vel3600':VelocityLess1h, 'p3600':totAreaLess1h, 'vAvg':vAvg2, 'vAvg2':vAvg, 'Tpoint':Tpoint};

};
//
// const runCSA = function(firstTime = false, city, arrayC, arrayN, points,  vel, startTime = 7.0*3600) {
//
// 	//if(firstTime) vel.remove({});
//
// 	if (!city)
// 		city = getCity();
//
// 	console.log('Start CSA-loop -- first time =', firstTime);
// 	//initNeighStopAndPoint();
// 	//initArrayC();
// 	console.log('arrays connections');
// 	var pointsArray = vel.find({'city':city}, {sort:{'dTerm':1},field:{'stopN':0, 'pointN':0}});
// 	console.log('pointsArray created ' , pointsArray.count());
// 	var totPoint = pointsArray.count();
//
// 	pointsArray.forEach(function(point, index){
// 		var values = CSAPoint(point, arrayC, arrayN, startTime, HexArea[city], windTime, zeroTime);
// 		//console.log(point)
// 		vel.update({'_id':point['_id']},{$set:{'vel3600' : values.vel3600, 'p3600' : values.p3600, 'vAvg':values.vAvg, 'vAvg2':values.vAvg2}});
//
// 		if(index % 100 == 0) console.log("points " + (100.*index /totPoint).toFixed(1) + "%", ' dTerm', point['dTerm'], values.vAvg, values.vAvg2, values.p3600);
// 	});
// 	console.log('\n EndPoints');
//
// }

export {CSAPoint};
