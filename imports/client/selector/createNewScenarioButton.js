
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/selector/createNewScenarioButton.html'

Template.createNewScenarioButton.helpers({
	'isCreateScenario'(){
		return Template.createNewScenarioButton.RV.isCreateScenario.get();
	}
});

Template.createNewScenarioButton.events({
	'click #createNewScenarioButton'(e){
	    let templateRV = {}
	    if(Router.current().route.getName() == "newScenario.:city"){
	        templateRV = Template.newScenario.RV;
	    }else{
	        templateRV = Template.city.RV
	    }
		let idScenario = templateRV.currentScenario.get()._id;
		Router.go('/newScenario/'+ Template.createNewScenarioButton.data.city + '?id=' +  idScenario);
	}
});


Template.createNewScenarioButton.onCreated(function(){
	Template.createNewScenarioButton.RV = {}
	Template.createNewScenarioButton.RV.isCreateScenario = new ReactiveVar(false);
	Template.createNewScenarioButton.data = {};
	
});


Template.createNewScenarioButton.onRendered(function(){
	Template.createNewScenarioButton.data.city = Router.current().params.city;
	Meteor.call('isCreateScenario', Template.createNewScenarioButton.data.city, function(err, risp){
		Template.createNewScenarioButton.RV.isCreateScenario.set(risp)
	})	
});

