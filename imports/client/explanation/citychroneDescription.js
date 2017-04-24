import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/explanation/citychroneDescription.html';

Template.citychroneDescription.helpers({
	shareData: function() {
    return { 
    	title: 'CityChrone - visualizing city kwonledge.',
    	url: 'http://citychrone.org',
    	description : "sharing information"
    	 }
  }

});

Template.citychroneDescription.events({});


Template.citychroneDescription.onCreated(function(){});

Template.citychroneDescription.onRendered(function(){});

