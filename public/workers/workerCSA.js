//importScripts('/workers/libAccessibility.js');
let module = {exports:{}};
importScripts('/workers/CSACore.js');

const mergeSortedCOld = function(left, right){
    var result  = new Uint32Array(left.length + right.length),
        il      = 0,
        ir      = 0;

    while (il < left.length && ir < right.length){
        if (left[il+2] < right[ir+2]){
            result.set([left[il],left[il+1],left[il+2],left[il+3]], il+ir);
            il+=4;
        } else {
        	result.set([right[il],right[il+1],right[il+2],right[il+3]], il+ir);
            //result.push(right[ir],right[ir+1],right[ir+2],right[ir+3]);
            ir+=4;
        }
    }

    result.set(left.slice(il), il+ir)
    result.set(right.slice(ir), il+ir)


    return result;
};

const mergeSortedC = function(left, right){
    var result  = [],
        il      = 0,
        ir      = 0;

    while (il < left.length && ir < right.length){
        if (left[il+2] < right[ir+2]){
            result.push(left[il],left[il+1],left[il+2],left[il+3]);
            il+=4;
        } else {
            result.push(right[ir],right[ir+1],right[ir+2],right[ir+3]);
            ir+=4;
        }
    }

    return result.concat(left.slice(il)).concat(right.slice(ir));
};




var values = function(obj) {
	//console.log(obj);
	var tmp = new Uint16Array(Object.keys(obj).length);
	for (var index in obj)
		tmp[index] = obj[index];
	return tmp;
};

var castTo16 = function(arrayArray) {
	var count = 0;
	for (var a in arrayArray) {
		//var totElem = Object.keys(a).length;
		//tempNPos = new Uint16Array(_.values(a));
		arrayArray[a] = values(arrayArray[a]);
	}
};

var arrayC = [];
var arrayCDef = [];
let arrayCut = [];
var arrayN = {};
let arrayNDef = {}
var city = 'roma';
var startTime = 0;
var areaHex = 1;
var maxDuration = 0;
var pointsVenues = [];

onmessage = function(e) {
	if (e.data.arrayCDef) {
		arrayCDef = e.data.arrayCDef.slice();
		arrayC = e.data.arrayCDef.slice();
		/*for (var c_i = 0; c_i < e.data.arrayCDef.length; c_i += 4) {
			arrayCDef[c_i] = e.data.arrayCDef[c_i];
			arrayCDef[c_i + 1] = e.data.arrayCDef[c_i + 1];
			arrayCDef[c_i + 2] = e.data.arrayCDef[c_i + 2];
			arrayCDef[c_i + 3] = e.data.arrayCDef[c_i + 3];
		}
		e.data.arrayCDef = {};*/
		//console.log('arrayCDef workers loaded', e.data.arrayCDef, arrayCDef, arrayC);
	} else if (e.data.arrayC2Add) {
		arrayC = mergeSortedC(arrayCDef, e.data.arrayC2Add);
		/*arrayC = new Uint32Array(arrayCTemp);
		for (var c_i = 0; c_i < e.data.arrayCDef.length; c_i += 4) {
			arrayCDef[c_i] = e.data.arrayCDef[c_i];
			arrayCDef[c_i + 1] = e.data.arrayCDef[c_i + 1];
			arrayCDef[c_i + 2] = e.data.arrayCDef[c_i + 2];
			arrayCDef[c_i + 3] = e.data.arrayCDef[c_i + 3];
		}
		e.data.arrayCDef = {};*/
		//console.log('arrayC merged', arrayC, arrayCDef, e.data.arrayC2Add);
	}
	else if (e.data.P2PDef) {
		arrayN.P2PPos = e.data.P2PDef.pos.map(function(arr) {
			return new Uint16Array(arr);
		});
		arrayN.P2PTime = e.data.P2PDef.time.map(function(arr) {
			return new Uint16Array(arr);
		});
		arrayNDef.P2PPos = e.data.P2PDef.pos.map(function(arr) {
			return new Uint16Array(arr);
		});
		arrayNDef.P2PTime = e.data.P2PDef.time.map(function(arr) {
			return new Uint16Array(arr);
		});

		e.data.P2PDef = {};
		//console.log('P2PDef workers loaded', arrayN);
	}
	else if (e.data.P2SDef) {
		arrayN.P2SPos = e.data.P2SDef.pos.map(function(arr) {
			return new Uint16Array(arr);
		});
		arrayN.P2STime = e.data.P2SDef.time.map(function(arr) {
			return new Uint16Array(arr);
		});
		arrayNDef.P2SPos = e.data.P2SDef.pos.map(function(arr) {
			return new Uint16Array(arr);
		});
		arrayNDef.P2STime = e.data.P2SDef.time.map(function(arr) {
			return new Uint16Array(arr);
		});

		e.data.P2SDef = {};
		//console.log('P2SDef workers loaded', arrayN);
	}
	else if (e.data.S2SDef) {
		arrayN.S2SPos = e.data.S2SDef.pos.map(function(arr) {
			return new Uint16Array(arr);
		});
		arrayN.S2STime = e.data.S2SDef.time.map(function(arr) {
			return new Uint16Array(arr);
		});
		arrayNDef.S2SPos = e.data.S2SDef.pos.map(function(arr) {
			return new Uint16Array(arr);
		});
		arrayNDef.S2STime = e.data.S2SDef.time.map(function(arr) {
			return new Uint16Array(arr);
		});

		e.data.S2SDef = {};
		//console.log('S2SDEf workers loaded', arrayN);
	}
	else if (e.data.P2S2Add) {
		let P2S2Add = e.data.P2S2Add
		arrayN.P2SPos = arrayNDef.P2SPos.map((originArray, pos)=>{
			let isToAdd = pos in P2S2Add;
			if(isToAdd){
				let toAdd = [];
				toAdd = P2S2Add[pos].pos
				let newLength = originArray.length + toAdd.length;
				let newArray = new Uint16Array(newLength);
				newArray.set(originArray);
				newArray.set(toAdd, originArray.length);
				return newArray;
			}else{
				return originArray;
			}
		});
		arrayN.P2STime = arrayNDef.P2STime.map((originArray, pos)=>{
			let isToAdd = pos in P2S2Add;
			if(isToAdd){
				let toAdd = []
				toAdd = P2S2Add[pos].time
				let newLength = originArray.length + toAdd.length;
				let newArray = new Uint16Array(newLength);
				newArray.set(originArray);
				newArray.set(toAdd, originArray.length);
				return newArray}
			else{
				return originArray;
			}
		});
		e.data.P2S2Add = {};
		//console.log('load P2S2Add', arrayN, arrayNDef)
	}
	else if (e.data.S2S2Add) {
		let S2S2Add = e.data.S2S2Add
		//console.log('S2SAdd', S2S2Add);
		arrayN.S2SPos = arrayNDef.S2SPos.map((originArray, pos)=>{
			let isToAdd = pos in S2S2Add;
			if(isToAdd){
				let toAdd = [];
				toAdd = S2S2Add[pos].pos
				let newLength = originArray.length + toAdd.length;
				let newArray = new Uint16Array(newLength);
				newArray.set(originArray);
				newArray.set(toAdd, originArray.length);
				return newArray;
			}else{
				return originArray;
			}
		});
		arrayN.S2STime = arrayNDef.S2STime.map((originArray, pos)=>{
			let isToAdd = pos in S2S2Add;
			if(isToAdd){
				let toAdd = []
				toAdd = S2S2Add[pos].time
				let newLength = originArray.length + toAdd.length;
				let newArray = new Uint16Array(newLength);
				newArray.set(originArray);
				newArray.set(toAdd, originArray.length);
				return newArray}
			else{
				return originArray;
			}
		});

		for (let pos in S2S2Add){
			let array2Add = S2S2Add[pos];
			if(!(pos in  arrayN.S2SPos)){
				arrayN.S2SPos[pos] = new Uint16Array(array2Add.pos)
				arrayN.S2STime[pos] = new Uint16Array(array2Add.time)
			}
		}
		e.data.S2S2Add = {};
		//console.log('load S2S2Add', arrayN, arrayNDef)
	}
	else if (e.data.points) {
		let points = e.data.points;
		let results = [];

		for (var point_i = 0; point_i < points.length; point_i++) {
			var point = points[point_i];
			var returned = CSAPoint(point, arrayC, arrayN, startTime, areaHex, pointsVenues);
			//console.log(point, returned);
			results.push({
				'point': point,
				'vAvg': returned.vAvg,
				'accessNew' : returned.accessNew,
				'popMean' : returned.popMean
			});
		}
		//console.log('computed point', point);
		postMessage(results);

	}
	else if (e.data.isochrone) {
		let point = e.data.isochrone.point;
		let returned = CSAPoint(point, arrayC, arrayN, startTime, areaHex, pointsVenues);
			//console.log(point, points.length);
		let result = {
			'point': point,
			'vAvg': returned.vAvg,
			'accessNew' : returned.accessNew,
			'popMean' : returned.popMean,
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

	else if (e.data.maxDuration) {
		maxDuration = e.data.maxDuration;
		//console.log('zeroTime workers loaded', zeroTime);
	} 

	else {
		console.log('error message recevied', e.data.areaHex, e.data.arrayN, e.data);
	}
};
