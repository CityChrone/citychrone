import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
//import '/font-awesome-animation';
import '/imports/client/explanation/citychroneDescription.html';
import '/imports/client/selector/socialButtons.js';
import '/imports/client/explanation/logos.html';

Template.citychroneDescription.helpers({
});

Template.citychroneDescription.events({
	'click .more_info'(e){
		console.log("more info");
		$("#startingModal").modal();
	} 
});


Template.citychroneDescription.onCreated(function(){});

Template.citychroneDescription.onRendered(function(){});

