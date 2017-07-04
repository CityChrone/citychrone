import { Template } from 'meteor/templating';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import {Blaze} from 'meteor/blaze';
import '/imports/client/selector/scenarioSelector.html';
import '/imports/client/otherTemplate/scenarioList.js';
import '/imports/client/selector/createNewScenarioButton.js';



Template.scenarioSelector.onCreated(function(){
	let city = Router.current().params.city;
	Meteor.subscribe('scenario', city, function(){});

});

Template.scenarioSelector.events({
	'click .scenarioButton'(e){
		//console.log(e);
		//Blaze.render(Template.scenarioList, $("body")[0]);

		$('#scenarioModal').modal('show');

	}

})


Template.scenarioSelector.helpers({
	'isSelected'(){
	    let templateRV = {}
	    if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV
	    }
		return templateRV.currentScenario.get()
	},
	'title'(){
		//let returned = scenarioDB.findOne({'_id':Template.city.RV.currentScenario.get()})
		//console.log(returned, Template.city.RV.currentScenarioId.get())
	    let templateRV = {}
	    if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV
	    }
		return templateRV.currentScenario.get().name;
	},
	'author'(){
		//let returned = scenarioDB.findOne({'_id':Template.city.RV.currentScenario.get()})
		//console.log(returned, Template.city.RV.currentScenarioId.get())
	    let templateRV = {}
	    if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV
	    }
		return templateRV.currentScenario.get().author;
	}

});