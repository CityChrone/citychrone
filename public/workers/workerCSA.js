//importScripts('/workers/libAccessibility.js');
let module = {exports:{}};
importScripts('/workers/ICSACore.js');
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
let arrayPop = [];
let totPop = 1;

onmessage = function(e) {
	if (e.data.arrayCDef) {
		arrayCDef = e.data.arrayCDef.slice();
		arrayC = e.data.arrayCDef.slice();
	} else if (e.data.arrayC2Add) {
		arrayC = mergeSortedC(arrayCDef, e.data.arrayC2Add);
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
	}
	else if (e.data.P2S2Add) {
		let P2S2Add = e.data.P2S2Add
		arrayN.P2SPos = mergeArrayN(arrayNDef.P2SPos, P2S2Add, 'pos')
		arrayN.P2STime = mergeArrayN(arrayNDef.P2STime, P2S2Add, 'time')
	}
	else if (e.data.S2S2Add) {

		let S2S2Add = e.data.S2S2Add
		arrayN.S2SPos = mergeArrayN(arrayNDef.S2SPos, S2S2Add, 'pos')
		arrayN.S2STime = mergeArrayN(arrayNDef.S2STime, S2S2Add, 'time')
		e.data.S2S2Add = {};
	}
	else if (e.data.points) {
		let points = e.data.points;
		let results = [];

		for (var point_i = 0; point_i < points.length; point_i++) {
			var point = points[point_i];
			var returned = ICSAPoint(point, arrayC, arrayN, startTime, areaHex, arrayPop);
			results.push({
				'point': point,
				'velocityScore': returned.velocityScore,
				'socialityScore' : returned.socialityScore,
			});
		}
		//console.log('computed point', point);
		postMessage(results);

	}
	else if (e.data.isochrone) {
		let point = e.data.isochrone.point;
		let returned = ICSAPoint(point, arrayC, arrayN, startTime, areaHex, arrayPop);
			//console.log(point, points.length);
		let result = {
			'point': point,
			'velocityScore': returned.velocityScore,
			'socialityScore' : returned.socialityScore,
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
		for (var c_i = 0; c_i < arrayC.length; c_i += 4) {
			if(arrayC[c_i + 2] >= startTime && arrayC[c_i + 3] <=  startTime + maxDuration){
				arrayCut.push(arrayC[c_i]);
				arrayCut.push(arrayC[c_i + 1]);
				arrayCut.push(arrayC[c_i + 2]);
				arrayCut.push(arrayC[c_i + 3]);
			}
		}
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
