import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/explanation/quantityDescription.html';

Template.quantityDescription.helpers({
	'quantity'(val){
		//console.log(val, Template.quantitySelector.quantitySelectedRV.get())
		return val == Template.quantitySelector.quantitySelectedRV.get();
	}
});

Template.quantityDescription.events({});


Template.quantityDescription.onCreated(function(){});

Template.quantityDescription.onRendered(function(){});

