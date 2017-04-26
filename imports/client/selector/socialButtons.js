import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/selector/socialButtons.html';

Template.socialButtons.helpers({
	shareData: function() {
    return { 
    	title: 'CityChrone - visualizing city kwonledge.',
    	url: 'http://citychrone.org',
    	description : "sharing information",
    	thumbnail:'/images/layers-2x.png'
    	 }
  }

});

Template.socialButtons.events({});


Template.socialButtons.onCreated(function(){});

Template.socialButtons.onRendered(function(){});

