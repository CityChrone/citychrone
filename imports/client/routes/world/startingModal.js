import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { ReactiveDict } from 'meteor/reactive-dict';
import '/imports/client/explanation/citychroneDescription.js';
import "/imports/client/routes/world/startingModal.html";


Template.startingModal.helpers({

});

Template.startingModal.events({});

Template.startingModal.onCreated(function(){
	Template.startingModal.data = {};
});

Template.startingModal.onRendered(function(){});
