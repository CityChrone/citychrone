import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/selector/socialButtons.html';

Template.socialButtons.helpers({
	shareData: function() {
        let scenario = this;
        let scenarioId = scenario._id;
		let description = "\
    	CityChrone: science of city --> scientific urban public transport studies. \
    	CityChrone: citizen for science --> collective solutions for new public transport scenario.";
    return { 
    	title: 'CityChrone - science of city, citizen for science - @citychrone',
    	url: 'http://citychrone.org',
    	description : description,
    	 text : " @citychrone",
    	thumbnail:'http://map.citychrone.org/images/citychroneSharing.png',
    	image:'http://map.citychrone.org/images/citychroneSharing.png'
    	 }
  }

});

Template.socialButtons.events({});


Template.socialButtons.onCreated(function(){});

Template.socialButtons.onRendered(function(){});

