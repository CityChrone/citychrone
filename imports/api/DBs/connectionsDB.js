import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import {points, stops} from '/imports/api/DBs/stopsAndPointsDB.js';


const connections = new Mongo.Collection('connections');
/*const connections = new Mongo.Collection('connections_' + city + 'Temp');

function initConnections(full = false, city){
	console.log(city);

	connections.remove({'temp' : true});

	//connectionsTemp.remove({});

	if(full){
		connections.remove({});
		//KeyToPos = {}
		//stops.find({},{fields : {'key':1, 'pos':1}}).forEach(function(stop, index){
		//	KeyToPos[stop['key']] = stop['pos'];
		//});
		connectionsInit.find({'tStart':{$gte:windTime[0]}, 'tEnd':{$lte:windTime[1]}, 'city':city}).forEach(function(doc, index) {
			let pStart = doc['pStart'];//stops.findOne({'key' : doc['Pstart']}, fields = {'pos':1})['pos'];
			let pArr = doc['pEnd'];//stops.findOne({'key' : doc['Parr']}, fields = {'pos':1})['pos'];
			newDoc = {
				'array' : [pStart,pArr,  doc['tStart'],  doc['tEnd']],
				'temp' : false
			}
			connections.insert(newDoc);
			if(index %10000 == 0){
				console.log(index);
			}
		});
	}

	connections.rawDatabase().ensureIndex('connections_' + city + 'Temp', {'array.2':1});

	console.log('connections ->  ', connections.find().count(),connectionsInit.find().count());
}*/
export { connections};
