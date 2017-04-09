import { Template } from 'meteor/templating';

import '/imports/client/selector/scenarioSelector.html';


Template.scenarioSelector.onCreated(function(){
});

Template.scenarioSelector.helpers({
	'isSelected'(){
		return Template.city.RV.currentScenarioId.get()
	},
	'title'(){
		return Template.city.RV.currentScenarioId.get()
	}
});