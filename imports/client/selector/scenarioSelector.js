import { Template } from 'meteor/templating';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import '/imports/client/selector/scenarioSelector.html';


Template.scenarioSelector.onCreated(function(){
});

Template.scenarioSelector.helpers({
	'isSelected'(){
		let templateRV = Template.city.RV || Template.newScenario.RV;
		return templateRV.currentScenario.get()
	},
	'title'(){
		//let returned = scenarioDB.findOne({'_id':Template.city.RV.currentScenario.get()})
		//console.log(returned, Template.city.RV.currentScenarioId.get())
		let templateRV = Template.city.RV || Template.newScenario.RV;
		return templateRV.currentScenario.get().name;
	}
});