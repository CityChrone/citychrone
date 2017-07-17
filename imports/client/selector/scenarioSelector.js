import { Template } from 'meteor/templating';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Router } from 'meteor/iron:router';
import {Blaze} from 'meteor/blaze';
import '/imports/client/selector/scenarioSelector.html';
import '/imports/client/otherTemplate/scenarioList.js';



Template.scenarioSelector.onCreated(function(){
	let city = Router.current().params.city;
	
	Meteor.subscribe('scenario', city, function(){});

	Template.scenarioSelector.data = {}
	Template.scenarioSelector.data.city = Router.current().params.city;
	
	Template.scenarioSelector.RV = {}
	Template.scenarioSelector.RV.isCreateScenario = new ReactiveVar(false);
	Meteor.call('isCreateScenario', city, function(err, risp){
		Template.scenarioSelector.RV.isCreateScenario.set(risp)
	});	

});

Template.scenarioSelector.onRendered(function(){
});


Template.scenarioSelector.events({
	'click .scenarioButton'(e){
		//console.log(e);
		//Blaze.render(Template.scenarioList, $("body")[0]);

		$('#scenarioModal').modal('show');

	},
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
		let pos = scenarioDB.find({'city':scenario.city,'scores.scoreVelocity':{'$gt':scenario.scores.scoreVelocity}}).count() + 1;
	    console.log(scenario, pos, scenarioDB.find({'scores.scoreVelocity':{'$gt':scenario.scores.scoreVelocity}}).fetch())

		return pos;
	},
	'isCreateScenario'(){
		return Template.scenarioSelector.RV.isCreateScenario.get();
	}


});