
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/selector/toWorldSelector.html'

Template.toWorldSelector.helpers({
	/*'isCreateScenario'(){
		return Template.toWorldSelector.RV.isCreateScenario.get();
	}*/
});

Template.toWorldSelector.events({
	'click #toWorld'(e){
		Router.go('/world');
	}
});


Template.toWorldSelector.onCreated(function(){
	Template.toWorldSelector.RV = {}
	//Template.toWorldSelector.RV.isCreateScenario = new ReactiveVar(false);
	Template.toWorldSelector.data = {};

});


Template.toWorldSelector.onRendered(function(){
	Template.toWorldSelector.data.city = Router.current().params.city;
	/*Meteor.call('isCreateScenario', Template.toWorldSelector.data.city, function(err, risp){
		Template.toWorldSelector.RV.isCreateScenario.set(risp)
	})*/	
});

