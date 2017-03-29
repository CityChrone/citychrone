/*
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Mongo }  from 'meteor/mongo';

import { ranking } from '/imports/api/DBs/rankDB.js';

import './rankTooltip.html';


Template.rankTooltip.events({
	  'submit #nameUser'(event, template) {
    // Prevent default browser form submit
    	event.preventDefault();
    	let name = $('#nameInput').val();
    	Meteor.call('insertName', name, Template.body.template.rank.nameInserted.get());
    	Template.body.template.rank.nameInserted.set(null);
   		//Template.body.template.rank.nameInserted..set(true);
	}
});
Template.rankTooltip.helpers({});
Template.rankTooltip.onCreated(function(){
	//console.log('parentData', Template.currentData(), Template.parentData([1]), Template.parentData(2), this);
	//console.log('')
	console.log('rankTooltip template created');

});
Template.rankTooltip.onRendered(function(){

});
*/
