import {connections} from '/imports/api/DBs/connectionsDB.js';
import {metroLines} from '/imports/api/DBs/metroLinesDB.js';

connections._ensureIndex({'tStart':1, 'tEnd':1, 'city':1});

const initArrayC = function(city, startTime, endTime) {
	console.log('initArrayC per ' + city + " " + startTime + " => " + endTime);
	var arrayC = [];
	var conns = connections.find({
		'tStart':{'$gte':startTime},
		'tEnd':{'$lte':endTime},
		'city':city
	}, {sort : {'tStart':1}, fields:{'pStart':1, 'pEnd':1, 'tStart':1, 'tEnd':1, '_id':0}}).fetch();

	console.log("trovati " + conns.length);

	for (var doc of conns) {
		if(doc.tStart <= doc.tEnd)
			arrayC.push(doc.pStart, doc.pEnd,  doc.tStart,  doc.tEnd); //TODO: si può ottimizzare sottraendo l'orario di partenza
	}

	console.log('End initArrayC -- dim of c array', arrayC.length*8/(1024*1024) , 'Mb', ' length : ', arrayC.length / 4);
	return arrayC;
};

const initArrayCOld = function(city, startTime, endTime) {
	console.log('initArrayC per ' + city + " " + startTime + " => " + endTime);
	var arrayC = [];
	var old = {};
	var metros = metroLines.find({city: city, type: 'metro'}).fetch();
	var metronames = [];
	for(var metro of metros) {
		metronames.push(metro.lineName);
		metronames.push(metro.lineName + "\r\n");
	}
 
	console.log("connections scartate metro",connections.find({
		'tStart':{'$gte':startTime},
		'tEnd':{'$lte':endTime},
		'route_id':{'$in':metronames},
		'city':city
	}, {sort : {'tStart':1}}).count()  );

	var conns = connections.find({
		'tStart':{'$gte':startTime},
		'tEnd':{'$lte':endTime},
		'route_id':{'$nin':metronames},
		'city':city
	}, {sort : {'tStart':1}}).fetch();

	console.log("trovati " + conns.length);

	for (var doc of conns) {
		arrayC.push(doc.pStart, doc.pEnd,  doc.tStart,  doc.tEnd); //TODO: si può ottimizzare sottraendo l'orario di partenza
		if(doc.tStart < old.tStart && old.tStart !== undefined)
			console.log(doc, old);

		old = doc;
	}

	console.log('End initArrayC -- dim of c array', arrayC.length*4*8/(1024*1024) , 'Mb', ' length : ', arrayC.length / 4);
	return arrayC;
};


/*

connectionsInit.find({'Tstart':{$gte:8*3600}}, sort = {'Tstart':1}).forEach(function(doc, index) {
	arrayCTimeStartTemp[index] = doc['Tstart'];
	arrayCNameStartTemp[index] = name2IntStop[doc['Pstart']];
	arrayCTimeArrTemp[index] = doc['Tarr'];
	arrayCNameArrTemp[index] = name2IntStop[doc['Parr']];
});
*/

//export const connections = connectionsTemp.find().fetch();

export {initArrayC};
