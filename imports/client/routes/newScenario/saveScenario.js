import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/routes/newScenario/saveScenario.html';

Template.saveScenario.helpers({
});

Template.saveScenario.events({});


Template.saveScenario.onCreated(function(){});

Template.saveScenario.onRendered(function(){
	console.log("rendered new scenario!!")
	$('.modal').modal('show')
});

