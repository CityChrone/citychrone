import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/explanation/titleBar.html';

Template.titleBar.helpers({
	'city'(){
		let city = Router.current().params.city;
		return city;
	}
});

Template.titleBar.events({});


Template.titleBar.onCreated(function(){});

Template.titleBar.onRendered(function(){});

