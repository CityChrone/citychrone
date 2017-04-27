import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/selector/socialButtons.html';

Template.socialButtons.helpers({
	shareData: function() {
		let description = "\
    	CityChrone is a project where knowledge about cities can be shared\
    	and visualized. The starting point is the study of public transport systems,\
    	 measuring its efficency, allowing easy comparison between different areas and even different cities.";
    return { 
    	title: 'CityChrone - visualizing city knowledge - @citychrone',
    	url: 'http://citychrone.org',
    	description : description,
    	 text : " @citychrone",
    	thumbnail:'/images/citychroneSharing.png',
    	image:'/images/citychroneSharing.png'
    	 }
  }

});

Template.socialButtons.events({});


Template.socialButtons.onCreated(function(){});

Template.socialButtons.onRendered(function(){});

