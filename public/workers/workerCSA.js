//importScripts('/workers/libAccessibility.js');
let module = {exports:{}};
importScripts('/workers/CSACore.js');
importScripts('/workers/mergeArrays.js');

var values = function(obj) {
	//console.log(obj);
	var tmp = new Uint32Array(Object.keys(obj).length);
	for (var index in obj)
		tmp[index] = obj[index];
	return tmp;
};

var castTo32 = function(arrayArray) {
	var count = 0;
	for (var a in arrayArray) {
		//var totElem = Object.keys(a).length;
		//tempNPos = new Uint32Array(_.values(a));
		arrayArray[a] = values(arrayArray[a]);
	}
};

let arrayC = [];
let arrayCDef = [];
let arrayCut = [];
let arrayN = {};
let arrayNDef = {}
let startTime = 0;
let areaHex = 1;
let maxDuration = 0;
let pointsVenues = [];
let arrayPop = [];
let totPop = 1;

onmessage = function(e) {
	if (e.data.arrayCDef) {
		arrayCDef = e.data.arrayCDef.slice();
		arrayC = e.data.arrayCDef.slice();
	} else if (e.data.arrayC2Add) {
		arrayC = mergeSortedC(arrayCDef, e.data.arrayC2Add);
		//console.log('arrayC2Add loaded', arrayC, arrayCDef, e.data.arrayC2Add);
	}
	else if (e.data.P2PDef) {
		arrayN.P2PPos = e.data.P2PDef.pos.map(function(arr) {
			return new Uint32Array(arr);
		});
		arrayN.P2PTime = e.data.P2PDef.time.map(function(arr) {
			return new Uint32Array(arr);
		});
		arrayNDef.P2PPos = e.data.P2PDef.pos.map(function(arr) {
			return new Uint32Array(arr);
		});
		arrayNDef.P2PTime = e.data.P2PDef.time.map(function(arr) {
			return new Uint32Array(arr);
		});

		e.data.P2PDef = {};
	}
	else if (e.data.P2SDef) {
		arrayN.P2SPos = e.data.P2SDef.pos.map(function(arr) {
			return new Uint32Array(arr);
		});
		arrayN.P2STime = e.data.P2SDef.time.map(function(arr) {
			return new Uint32Array(arr);
		});
		arrayNDef.P2SPos = e.data.P2SDef.pos.map(function(arr) {
			return new Uint32Array(arr);
		});
		arrayNDef.P2STime = e.data.P2SDef.time.map(function(arr) {
			return new Uint32Array(arr);
		});

		e.data.P2SDef = {};
	}
	else if (e.data.S2SDef) {
		arrayN.S2SPos = e.data.S2SDef.pos.map(function(arr) {
			return new Uint32Array(arr);
		});
		arrayN.S2STime = e.data.S2SDef.time.map(function(arr) {
			return new Uint32Array(arr);
		});
		arrayNDef.S2SPos = e.data.S2SDef.pos.map(function(arr) {
			return new Uint32Array(arr);
		});
		arrayNDef.S2STime = e.data.S2SDef.time.map(function(arr) {
			return new Uint32Array(arr);
		});

		e.data.S2SDef = {};
		//console.log('S2SDEf workers loaded', arrayN);
	}
	else if (e.data.P2S2Add) {
		let P2S2Add = e.data.P2S2Add
		arrayN.P2SPos = mergeArrayN(arrayNDef.P2SPos, P2S2Add, 'pos')
		arrayN.P2STime = mergeArrayN(arrayNDef.P2STime, P2S2Add, 'time')
		//console.log('P2S2Add loaded', arrayN.P2SPos)
	}
	else if (e.data.S2S2Add) {

		let S2S2Add = e.data.S2S2Add
		arrayN.S2SPos = mergeArrayN(arrayNDef.S2SPos, S2S2Add, 'pos')
		arrayN.S2STime = mergeArrayN(arrayNDef.S2STime, S2S2Add, 'time')
		//console.log(S2S2Add, arrayNDef.S2SPos,arrayN.S2SPos, arrayNDef.S2STime, arrayN.S2STime)
		e.data.S2S2Add = {};
		/*arrayN.S2SPos.forEach((elem, i)=>{
			elem.forEach((ee,ii)=>{
				if(i < arrayNDef.S2SPos.length){
					if(ee != arrayNDef.S2SPos[i][ii]){
						console.log(i, elem, arrayNDef.S2SPos[i])
					}
				}
			})
		})*/
		//console.log('S2S2Add loaded',S2S2Add, arrayNDef, arrayN)
		//console.log('load S2S2Add', arrayN, arrayNDef)
	}
	else if (e.data.points) {
		let points = e.data.points;
		let results = [];

		for (var point_i = 0; point_i < points.length; point_i++) {
			var point = points[point_i];
			//arrayN.S2SPos = arrayNDef.S2SPos;
			//arrayN.S2STime = arrayNDef.S2STime;
			//arrayN.P2SPos = arrayNDefx.P2SPos;
			//arrayN.P2STime = arrayNDef.P2STime;
			var returnedDef = CSAPoint(point, arrayCDef, arrayNDef, startTime, areaHex, pointsVenues, arrayPop);
			var returned = CSAPoint(point, arrayC, arrayN, startTime, areaHex, pointsVenues, arrayPop);
			let countT = 0
			let countTDef = 0
			let countTErr = 0
			let countTLess = 0
			returned.tPoint.forEach((t, i)=>{
				tDef = returnedDef.tPoint[i]
				if( tDef <  t){ 
					countTErr += 1
					console.log(point.pos, '--POINT-->',i,t-tDef, t, tDef, 'ArrayN -> (P2PTime, P2PPos, P2SPos, P2STime)',
					arrayN.P2PTime[i], arrayN.P2PPos[i],arrayN.P2SPos[i],arrayN.P2STime[i],
					'\n ArrayNDef ->',
					arrayNDef.P2PTime[i], arrayNDef.P2PPos[i],arrayNDef.P2SPos[i],arrayNDef.P2STime[i],
					returned, returnedDef)}
				//if( t == 0) console.log(point.pos, '->',i, t, tDef)
				if( tDef > t) 
					countTLess += 1

				if( t > 10000) countT +=1
					//console.log(point.pos, '->',i, t, tDef, arrayPop[i])
				if( tDef > 10000) countTDef += 1
					//console.log(point.pos, '->',i, t, tDef, arrayPop[i])

			});

			let countTS = 0
			let countTDefS = 0
			let countTErrS = 0
			let countTLessS = 0
			returned.tStop.forEach((t, i)=>{
				tDef = returnedDef.tStop[i]
				if( tDef <  t){ 
					countTErrS += 1
					console.log(point.pos, '--STOP-->',i, t-tDef, t - startTime, tDef - startTime, 
					'ArrayN -> (P2PTime, P2PPos, P2SPos, P2SPos)',
					arrayN.S2STime[i], arrayN.S2SPos[i],
					'\n ArrayNDef ->',
					arrayNDef.S2STime[i], arrayNDef.S2SPos[i])
					console.log(countTLessS)}
				if( tDef > t) 
					countTLessS += 1

				if( t > 10000) countTS +=1
					//console.log(point.pos, '->',i, t, tDef, arrayPop[i])
				if( tDef > 10000) countTDefS += 1
					//console.log(point.pos, '->',i, t, tDef, arrayPop[i])

			});


			if(returned.newVels < returnedDef.newVels || returned.newPotPop < returnedDef.newPotPop ){
				console.log(point, returned, returnedDef, countTErr, countTLess,returned.newVels - returnedDef.newVels,
				 returned.newPotPop - returnedDef.newPotPop, countT, countTDef);
			}

			results.push({
				'point': point,
				'newVels': returned.newVels,
				'NewAccess' : returned.NewAccess,
				'newPotPop' : returned.newPotPop
			});
		}
		//console.log('computed point', point);
		postMessage(results);

	}
	else if (e.data.isochrone) {
		let point = e.data.isochrone.point;
		let returned = CSAPoint(point, arrayC, arrayN, startTime, areaHex, pointsVenues, arrayPop);
			//console.log(point, points.length);
		let result = {
			'point': point,
			'newVels': returned.newVels,
			'NewAccess' : returned.NewAccess,
			'newPotPop' : returned.newPotPop,
			'tPoint' : returned.tPoint
		}
		//console.log('computed point', point);
		postMessage(result);

	}

	else if (e.data.areaHex) {
		areaHex = e.data.areaHex;
	} 

	else if (e.data.startTime) { //MANDATORY load startTime after ArrayC loaded.
		startTime = e.data.startTime;	
		arrayCut = []
		//onsole.log(arrayC)
		for (var c_i = 0; c_i < arrayC.length; c_i += 4) {
			if(arrayC[c_i + 2] >= startTime && arrayC[c_i + 3] <=  startTime + maxDuration){
				arrayCut.push(arrayC[c_i]);
				arrayCut.push(arrayC[c_i + 1]);
				arrayCut.push(arrayC[c_i + 2]);
				arrayCut.push(arrayC[c_i + 3]);
			}
		}
		//console.log('startTime workers loaded', startTime, startTime + maxDuration, arrayCut.length, arrayC.length);
	} 

	else if (e.data.pointsVenues) {
		//console.log('points venues loaded', Object.keys(e.data.pointsVenues).length);
		pointsVenues = e.data.pointsVenues;
		//console.log('windTime workers loaded', windTime);
	} 
	else if(e.data.arrayPop){
		arrayPop = e.data.arrayPop;
		totPop = arrayPop.reduce((a, b)=>{ return a + b; }, 0);
	}
	else if (e.data.maxDuration) {
		maxDuration = e.data.maxDuration;
		//console.log('zeroTime workers loaded', zeroTime);
	} 

	else {
		console.log('error message recevied', e.data.areaHex, e.data.arrayN, e.data);
	}
};
