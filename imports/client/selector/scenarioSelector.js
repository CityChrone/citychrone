import { Template } from 'meteor/templating';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import '/imports/client/selector/scenarioSelector.html';


Template.scenarioSelector.onCreated(function(){
});

Template.scenarioSelector.helpers({
	'isSelected'(){
		return Template.city.RV.currentScenarioId.get()
	},
	'title'(){
		let returned = scenarioDB.findOne({'_id':Template.city.RV.currentScenarioId.get()})
		console.log(returned)
		return returned.name;
	}
});