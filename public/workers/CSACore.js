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

const computeVel = function(timeP,areaHex){
	let areasTime = areaTimeCompute(timeP);
	return VelMean(areasTime, areaHex);
}

const VelMean = function(areasTime, areaHex){
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

const popMean = function(popsTime){
    let popComul = 0.;
    let popMean = 0.;
    for (let time_i = 0; time_i < popsTime.length; time_i++){
        popComul += popsTime[time_i];
        popMean += tDistrN(time_i) * popComul;
    }
    return popMean;
};

const computePop = function(timeP, arrayPop){
	if (timeP.length == arrayPop.length){
		let popsTime = arrayTimeCompute(timeP, arrayPop)
	 	return popMean(popsTime);
	 }
	return 0;
}

const computeAccess = function(Tpoint,pointsVenues,accessNew){
	for (var point_i = 0, len_point = Tpoint.length; point_i < len_point; point_i++) {
		if(Tpoint[point_i] < 15.*60.) addVenues(pointsVenues[point_i], accessNew, 1);
	}
	return accessNew;
};

const addVenues = function(venues, accessNew, mult) {
	if (!venues)
		return;
	for (var n in venues) {
		accessNew[n] = (accessNew[n] || 0) + venues[n] * mult;
	}
};


const tree = function(point, Tpoint, Tstop, arrayN, arrayC, startTime){
	"use strict"

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


	// **** Initialize time for neigh point

	for (var i = 0, lenghtP = P2PPos[posPoint].length; i < lenghtP; i++) {
		//if(posPoint == 2550)
			//console.log('pointN', i, P2PPos[posPoint][i], P2PTime[posPoint][i],typeof P2PTime[posPoint][i])
		Tpoint[P2PPos[posPoint][i]] = P2PTime[posPoint][i] + startTime;
	}

	for (var i = 0, lenghtS = P2SPos[posPoint].length; i < lenghtS; i++) {
		//if(posPoint == 2550)
			//console.log('stopN', i, P2SPos[posPoint][i],P2STime[posPoint][i],  typeof P2STime[posPoint][i])
		Tstop[P2SPos[posPoint][i]] = P2STime[posPoint][i] + startTime;
	}


	//CSA-Algorithm core
	for (var c_i = 0, totC = arrayC.length; c_i < totC; c_i += 4) {
		let posStopStart = arrayC[c_i];
		let timeStartC = arrayC[c_i + 2];
		if(arrayC[c_i + 1] == 2379 && posStopStart==2833 && posPoint == 2550 )
			console.log(c_i, posStopStart, '->', arrayC[c_i + 1], arrayC[c_i + 3], Tstop[2379])

		//if(posPoint == 2550)
			//if(c_i%10000 == 0) console.log(c_i, arrayC.length)
		if (Tstop[posStopStart] <= timeStartC) {

			var posStopArr = arrayC[c_i + 1];
			var timeArr = arrayC[c_i + 3];
			if (Tstop[posStopArr] > timeArr) {
				Tstop[posStopArr] = timeArr;
				if(posPoint == 2550 && posStopArr==2645)
					console.log(c_i, posStopStart, '->', posStopArr, timeArr, S2SPos[2379])
				if(posPoint == 2550 && posStopArr==2833)
					console.log(c_i, posStopStart, '->', posStopArr, timeArr)
				if(posPoint == 2550 && posStopArr==2379)
					console.log(c_i, posStopStart, '->', posStopArr, timeArr)

				if(posStopArr == 2379 && posStopStart==2833 && posPoint == 2550 )
					console.log(c_i, posStopStart, '->', posStopArr, timeArr, S2SPos[2379])

				//if(posStopArr == 8713)
					//console.log(posStopStart, posStopArr, arrayC[c_i])
				var stopNArrayPos = S2SPos[posStopArr];
				for (var stopN_i = 0, lenghtS = stopNArrayPos.length; stopN_i < lenghtS; stopN_i++) {
					//if(posPoint == 2550)
						//console.log('stopNArrayPos', stopNArrayPos.length)
					var posStopArrN = stopNArrayPos[stopN_i];
					var timeArrN = timeArr + S2STime[posStopArr][stopN_i];
					if (Tstop[posStopArrN] > timeArrN) {
						Tstop[posStopArrN] = timeArrN;
						if(posPoint == 2550 && posStopArrN==2645)
							console.log(c_i, 'stopNArrayPos', posStopStart, posStopArr, posStopArrN, timeArrN)

						if(posPoint == 2550 && posStopArrN==2833)
							console.log(c_i, 'stopNArrayPos', posStopStart, posStopArr, posStopArrN, timeArrN)

					}
				}
			}
		}
	}
	//console.log('point after 1/2', posPoint, Tpoint[posPoint])

	for (var point_i = 0, len_point = Tpoint.length; point_i < len_point; point_i++) {
		//if (P2SPos[point_i]) {
			for (var i = 0, lenghtS = P2SPos[point_i].length; i < lenghtS; i++) {
				var StopNPos = P2SPos[point_i][i];
				var newTime = P2STime[point_i][i] + Tstop[StopNPos];
				if (Tpoint[point_i] > newTime) {
					Tpoint[point_i] = newTime;
				}
			}
		//}
	}
	//console.log('point after', posPoint, Tpoint[posPoint])

	return Tpoint;
};

const treeNew = function(point, Tpoint, Tstop, arrayN, arrayC, startTime){
	"use strict"
	const infTime = Math.round(Math.pow(10, 12));
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

	//console.log(posPoint, P2PPos[posPoint], P2SPos[posPoint])

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
				
				/*if(stopNArrayPos == null){
					let count = 0;
						S2SPos.forEach((arr, i)=>{
							if(arr == null) console.log(i)
						})
                        console.log(stopNArrayPos, posStopArr, S2SPos[posStopArr])
                    }*/

					for (var stopN_i = 0, lenghtS = stopNArrayPos.length; stopN_i < lenghtS; stopN_i++) {
						var posStopArrN = stopNArrayPos[stopN_i];
						var timeArrN = timeArr + S2STime[posStopArr][stopN_i];
						if (TstopN[posStopArrN] > timeArrN) {
							TstopN[posStopArrN] = timeArrN;
						}
					}
				}
				//}else{
				//	console.log(posPoint, posStopArr, Tstop.length, S2SPos.length, S2SPos[posStopArr], typeof S2SPos[posStopArr] )
				//	console.log(stopNArrayPos.length )

				//}
			}
		}
	}
	//console.log('point after 1/2', posPoint, Tpoint[posPoint])

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


let CSAPoint = function(point, arrayC, arrayN, startTime, areaHex, pointsVenues, arrayPop ) {
	"use strict"

	arrayPop = arrayPop || [];
	const infTime = Math.round(Math.pow(10, 12));
	//console.log('starting computing');
	var totPoint = arrayN.P2SPos.length;
	var totStop = arrayN.S2SPos.length;
	var Tstop = new Array(totStop).fill(infTime);
	var Tpoint = new Array(totPoint).fill(infTime);

	var countTime = 0;
	var accessNew = {};
	addVenues(point.venues, accessNew, 1);

	Tpoint =  treeNew(point, Tpoint, Tstop, arrayN, arrayC, startTime);

	let countNonReached = 0

	for(let i = 0; i < Tpoint.length; i++) {
		if(Tpoint[i] == infTime) countNonReached++
		Tpoint[i] -= startTime;
	}
	// **** Update point time after computed stop time
	//console.log(computeVel(Tpoint,areaHex))
	//console.log('ending computing', countNonReached, Tpoint.length, startTime, point.pos,Tpoint[point.pos] );
	return {
		'newVels': computeVel(Tpoint,areaHex),
		'NewAccess': computeAccess(Tpoint,pointsVenues,accessNew),
		'newPotPop' : computePop(Tpoint, arrayPop),
		'tPoint' : Tpoint,
		'pointNotReached' : countNonReached,
		'tStop' : Tstop,
	};
};

module.exports.CSAPoint = CSAPoint;