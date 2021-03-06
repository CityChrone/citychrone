import { Template } from 'meteor/templating';
import { scenarioDB } from '/imports/DBs/scenarioDB.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import {Blaze} from 'meteor/blaze';
import '/imports/client/selector/scenarioSelector.html';
import '/imports/client/otherTemplate/scenarioList.js';



Template.scenarioSelector.onCreated(function(){
	let city = Router.current().params.city;
	Template.scenarioSelector.data = {}
	Template.scenarioSelector.data.city = Router.current().params.city;
	
	Template.scenarioSelector.RV = {}
	Template.scenarioSelector.RV.isCreateScenario = new ReactiveVar(false);
	Template.scenarioSelector.RV.scenarioLoaded = new ReactiveVar(false);

	
	Meteor.call('giveDataBuildScenario', city,['newScenario'], function(err, risp){
		//console.log("newScenario", city, risp)
		Template.scenarioSelector.RV.isCreateScenario.set(risp.newScenario)
	});	

});

Template.scenarioSelector.onRendered(function(){

	$('[data-toggle="tooltip"]').tooltip({"html":true})
	console.log($('[data-toggle="tooltip"]'), $('[data-toggle="tooltip"]'))
	//$('[data-toggle="tooltip"]').tooltip({"html":true})


});


Template.scenarioSelector.events({
	'click #createNewScenarioButton'(e){
		let idScenario = Template.city.RV.currentScenario.get()._id;
		Router.go('/newScenario/'+ Template.scenarioSelector.data.city + '?id=' +  idScenario);
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
	'tooltip' () {
		$('[data-toggle="tooltip"]').tooltip({"html":true})
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
	},
	'rankPosition'(){
		let templateRV = {}
	    if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV; 
	    }else{
	        templateRV = Template.city.RV
	    }
		let scenario = templateRV.currentScenario.get();
		let pos = scenarioDB.find({'city':scenario.city,'scores.avgVelocityScore':{'$gt':scenario.scores.avgVelocityScore}}).count() + 1;

		return pos;
	},
	'isCreateScenario'(){
		return Template.scenarioSelector.RV.isCreateScenario.get();
	},
	'scenarioLoaded'(){
		return Template.scenarioSelector.RV.scenarioLoaded.get();
	}


});