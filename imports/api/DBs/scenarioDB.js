import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';

export const scenarioDB = new Mongo.Collection('scenario');

export const initScenario = function(city, name, author, time, metroLinesFetched, P2S2Add, S2S2Add){
		time  = time || 8*3600;
		metroLinesFetched = metroLinesFetched || {};
		P2S2Add = P2S2Add || {};
		S2S2Add = S2S2Add || {};
		let moments = { }
		moments[time] = {
			'velocity' : 0,
			'score' : 0,
			'budget' : 0,
			'efficency' : 0,
			'newVels' : [],
			'newAccess' : [],
			'newPotPop' : [],
		}
	

	let scenario = {
		'author' : author,
		'name' : name,
		'creationDate'  : new Date(),
		'lines' : metroLinesFetched,
		'P2S2Add' : P2S2Add,
		'S2S2Add': S2S2Add,
		'city' : city,
		'_id' : new Mongo.ObjectID(),
		'moments' : moments,
		'default' : false,
		'author' : author
	};
	return scenario;
}; 

export const computeScoreNewScenario = function(scenario, time){
	let scores = {};
	let moment = scenario['moments'][time]
	let totPop = scenario.arrayPop.reduce((a, b)=>{ return a + b; }, 0);
	scores['scoreVelocity'] = moment['newVels'].reduce((a, b) => a + b, 0);
	scores['scorePotPop'] = moment['newPotPop'].reduce((a, b) => (a + b), 0) / totPop;
	return scores;

};

Meteor.methods({
	'insertNewScenario' : function(obj){
		//console.log('insert scenario', obj);
		scenarioDB.insert(obj, function(err, id) {
				if (err) {
					console.log(err);
					return;
				}
				//console.log('insert scenario new id', id);
				//if (Meteor.isClient)
					//Template.body.template.scenario.currentScenarioId = id;
		});
	},
	'updateScenario' : function(obj, _id){
		//console.log("update scenario", _id);
		scenarioDB.update({'_id':_id}, obj);
	},
	'updateNameAuthorScenario' : function(title, author, _id){
		let res = scenarioDB.update({'_id':_id}, {"$set":{'name':title, 'author':author}},
			(err, numModified)=>{
				//console.log("scenario updated", title, author, _id, numModified, err);
			});
		//console.log("scenario updated", title, author, _id, res);
	},
	 'scenarioDef' : function(city){
	 	let res = scenarioDB.findOne({'default':true, 'city' : city}, {sort:{'creationDate':-1}, reactive: false} );
	 	//console.log('return scenario def', res);
    	return res
  },
  'giveScenario': function(_id){
  	//console.log(_id, scenarioDB.findOne({'_id':new Mongo.ObjectID(_id)}))
  	return scenarioDB.findOne({'_id':new Mongo.ObjectID(_id)});
  }

});
