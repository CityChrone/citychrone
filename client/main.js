
import { Meteor } from 'meteor/meteor';
import '/imports/client/routes.js';
import '/imports/client/body.js';

Meteor.startup(function(){
	_ = lodash;
	//L.Icon.Default.imagePath = '/packages/bevanhunt_leaflet/images/';
});