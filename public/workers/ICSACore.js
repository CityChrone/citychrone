//import '/public/workers/libAccessibility.js';

"use strict"

var a = 0.2;
var b = 0.7;
var N = 2.5;
var TBus = 67.0;
let windowTime = 10000;

const tDistr = function(t) {
	if (t == 0) return 0.;
	t /= 30.;
	return N * Math.exp(-((a * TBus) / t) - t / (b * TBus));
};

let normTDistr = 0.;

for(let i = 0.; i < windowTime; i++){
	normTDistr += tDistr(i);
};

const tDistrN = function(t){
	return tDistr(t) / normTDistr;
};

const areaTimeCompute = function(timeP){
    let aTime = new Array(windowTime).fill(0);
    timeP.forEach( (t)=>{
    	t = parseInt(t)
    	if (t < windowTime) aTime[t] += 1
    }); 
    return aTime
};

const arrayTimeCompute = function(timeP, arrayW){
    let aTime = new Array(windowTime).fill(0);
    timeP.forEach((t,i)=>{
    	t = parseInt(t)
        if (t < windowTime) aTime[t] += arrayW[i]           
    });
    return aTime
};

const computeVelocityScore = function(timeP,areaHex){
	let areasTime = areaTimeCompute(timeP);
	return velocityScore(areasTime, areaHex);
}

const velocityScore = function(areasTime, areaHex){
    let area_new = 0.;
    let vAvg = 0.;
    let integralWindTime = 0.
    for (let time_i = 0.; time_i < areasTime.length; time_i++){
        area_new += areasTime[time_i]*areaHex;
        //console.log(area_new, vAvg,time_i, tDistrN(time_i) ,Math.PI)
        if(time_i==0){
        	 vAvg += tDistrN(1) * (Math.sqrt(area_new/Math.PI));
        	 integralWindTime += tDistrN(time_i);
     	}
        if (time_i > 0){
            vAvg += tDistrN(time_i) * (1./time_i)*(Math.sqrt(area_new/Math.PI));
            integralWindTime += tDistrN(time_i);
        }
    }
    //console.log(area_new, vAvg, integralWindTime,tDistrN(4600.))
    //vAvg /= integralWindTime;
    vAvg *= 3600.;
    return vAvg;
}

const socialityScore = function(popsTime){
    let popComul = 0.;
    let popMean = 0.;
    for (let time_i = 0; time_i < popsTime.length; time_i++){
        popComul += popsTime[time_i];
        popMean += tDistrN(time_i) * popComul;
    }
    return popMean;
};

const computeSocialityScore = function(timeP, arrayPop){
	if (timeP.length == arrayPop.length){
		let popsTime = arrayTimeCompute(timeP, arrayPop)
	 	return socialityScore(popsTime);
	 }
	return 0;
}

const ICSA = function(point, Tpoint, Tstop, arrayN, arrayC, startTime){
	"use strict"

	let TstopN = Tstop.slice();

	var P2PPos = arrayN.P2PPos;
	var P2SPos = arrayN.P2SPos;
	var S2SPos = arrayN.S2SPos;
	var P2PTime = arrayN.P2PTime;
	var P2STime = arrayN.P2STime;
	var S2STime = arrayN.S2STime;
	startTime = Math.round(startTime);
	var posPoint = point.pos;
	//console.log('point', posPoint, Tpoint[posPoint], typeof startTime)
	Tpoint[posPoint] = startTime;

	//console.log(posPoint, P2PPos[posPoint], P2SPos[posPoint], arrayC)

	// **** Initialize time for neigh point

	for (var i = 0, lenghtP = P2PPos[posPoint].length; i < lenghtP; i++) {
		//if(posPoint == 2550)
			//console.log('pointN', i, P2PPos[posPoint][i], P2PTime[posPoint][i],typeof P2PTime[posPoint][i])
		Tpoint[P2PPos[posPoint][i]] = P2PTime[posPoint][i] + startTime;
	}

	for (var i = 0, lenghtS = P2SPos[posPoint].length; i < lenghtS; i++) {
		//if(posPoint == 2550)
			//console.log('stopN', i, P2SPos[posPoint][i],P2STime[posPoint][i],  typeof P2STime[posPoint][i])
		TstopN[P2SPos[posPoint][i]] = P2STime[posPoint][i] + startTime;
	}

	//console.log(arrayC[3], arrayC[arrayC.length-2]);
	//CSA-Algorithm core
	for (var c_i = 0, totC = arrayC.length; c_i < totC; c_i += 4) {
		let posStopStart = arrayC[c_i];
		let timeStartC = arrayC[c_i + 2];
		if (Tstop[posStopStart] <= timeStartC || TstopN[posStopStart] <= timeStartC) {

			var posStopArr = arrayC[c_i + 1];
			var timeArr = arrayC[c_i + 3];
			
			if (Tstop[posStopArr] > timeArr) {
				Tstop[posStopArr] = timeArr;
				let stopNArrayPos = S2SPos[posStopArr];
				if(stopNArrayPos != null){
				

					for (var stopN_i = 0, lenghtS = stopNArrayPos.length; stopN_i < lenghtS; stopN_i++) {
						var posStopArrN = stopNArrayPos[stopN_i];
						var timeArrN = timeArr + S2STime[posStopArr][stopN_i];
						if (TstopN[posStopArrN] > timeArrN) {
							TstopN[posStopArrN] = timeArrN;
						}
					}
				}
			}
		}
	}

	for (var point_i = 0, len_point = Tpoint.length; point_i < len_point; point_i++) {
		//if (P2SPos[point_i]) {
			for (var i = 0, lenghtS = P2SPos[point_i].length; i < lenghtS; i++) {
				var StopNPos = P2SPos[point_i][i];
				let timeStop = Tstop[StopNPos] < TstopN[StopNPos] ? Tstop[StopNPos] : TstopN[StopNPos];
				var newTime = P2STime[point_i][i] + timeStop;
				if (Tpoint[point_i] > newTime) {
					Tpoint[point_i] = newTime;
				}
			}
		//}
	}
	//if(posPoint < 10)
	//	console.log('point after', posPoint, Tpoint[posPoint],Tstop, TstopN)

	return Tpoint;
};


let ICSAPoint = function(point, arrayC, arrayN, startTime, areaHex, arrayPop ) {
	"use strict"

	arrayPop = arrayPop || [];
	const infTime = Math.round(Math.pow(10, 12));
	//console.log('starting computing');
	var totPoint = arrayN.P2SPos.length;
	var totStop = arrayN.S2SPos.length;
	var Tstop = new Array(totStop).fill(infTime);
	var Tpoint = new Array(totPoint).fill(infTime);

	var countTime = 0;
	//console.log('before treeNew');

	Tpoint =  ICSA(point, Tpoint, Tstop, arrayN, arrayC, startTime);

	let countNonReached = 0

	for(let i = 0; i < Tpoint.length; i++) {
		if(Tpoint[i] == infTime) countNonReached++
		Tpoint[i] -= startTime;
	}
	// **** Update point time after computed stop time
	//console.log(computeVel(Tpoint,areaHex))
	//console.log('ending computing', countNonReached, Tpoint.length, startTime, point.pos,Tpoint[point.pos] );
	return {
		'velocityScore': computeVelocityScore(Tpoint,areaHex),
		'socialityScore' : computeSocialityScore(Tpoint, arrayPop),
		'tPoint' : Tpoint,
		'pointNotReached' : countNonReached,
		'tStop' : Tstop,
	};
};

module.exports.ICSAPoint = ICSAPoint;