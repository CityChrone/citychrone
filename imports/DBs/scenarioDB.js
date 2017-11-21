import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Template } from 'meteor/templating';

export const scenarioDB = new Mongo.Collection('scenario');

if(Meteor.isServer){
	scenarioDB._ensureIndex({ "scores.scoreVelocity": -1, "creationDate":-1});
	scenarioDB._ensureIndex({ "city":1, "scores.avgVelocityScore": 1, "creationDate":-1});
	scenarioDB._ensureIndex({ "city":1});
	scenarioDB._ensureIndex({ "city":1, "scores.avgSocialityScore": 1});

}
export const initScenario = function(city, name, author, times, metroLinesFetched, P2S2Add, S2S2Add){
	metroLinesFetched = metroLinesFetched || [];
	P2S2Add = P2S2Add || {};
	S2S2Add = S2S2Add || {};
	let moments = { }
	times.forEach((time)=>{
		moments[time] = {
			'velocity' : 0,
			'score' : 0,
			'budget' : 0,
			'efficency' : 0,
			'velocityScore' : [],
			'socialityScore' : [],
			'velocityScoreDiff' : [],
			'socialityScoreDiff' : [],

		}
	})
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
	let moment = scenario['moments'][time];
	let popArray = scenario['arrayPop'];
	let totPop = scenario.arrayPop.reduce((a, b)=>{ return a + b; }, 0);
	scores['avgVelocityScore'] = 0;
	moment['velocityScore'].forEach((vel, i)=>{
		scores['avgVelocityScore'] += popArray[i] * vel
	});
	scores['avgVelocityScore'] /= totPop;
	
	scores['avgSocialityScore'] = 0;
	moment['socialityScore'].forEach((soc, i)=>{
		scores['avgSocialityScore'] += popArray[i] * soc
	});
	scores['avgSocialityScore'] /= totPop;

	return scores;

};

Meteor.methods({
	'insertNewScenario' : function(obj){
		//console.log('insert scenario', obj);
		if('_id' in obj){
					console.log('updating scenario', obj.city);

			scenarioDB.update({'_id':obj['_id']}, obj,{'upsert':true}, function(err, id) {
					if (err) {
						console.log(err);
						return;
					}
					//console.log('insert scenario new id', id);
					//if (Meteor.isClient)
						//Template.body.template.scenario.currentScenarioId = id;
			});
		}else{
			scenarioDB.insert(obj, function(err, id) {
				if (err) {
						console.log(err);
						return;
					}
					//console.log('insert scenario new id', id);
					//if (Meteor.isClient)
						//Template.body.template.scenario.currentScenarioId = id;
			});

		}
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
  },
  'findOne':function(search){
  	return scenarioDB.findOne(search);
  }

});
