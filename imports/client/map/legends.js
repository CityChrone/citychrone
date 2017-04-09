import L from 'leaflet';
import {Blaze} from 'meteor/blaze';
import {
	Template
} from 'meteor/templating';

import '/imports/client/map/legends.html';

let createControl = function(templates, position, map, toAdd = true, close=true) {
	let Co = L.Control.extend({
		options: {
			position: position
		},

		onAdd: function(map) {
			const container = L.DomUtil.create('div', 'alert alert-info info legend '+'position');
			L.DomEvent.disableClickPropagation(container);
			let legendsCurrent = Blaze.renderWithData(Template.legends, this, container);
			//console.log(Template.legends, legendsCurrent, legendsCurrent.lastNode())
			templates.forEach((template)=>{
				console.log(template)
				Blaze.renderWithData(template, this, legendsCurrent.lastNode());
			})
			return container;
		}
	});
	var t = new Co();
	if (toAdd)
		map.addControl(t);
	return t;
};

Template.legends.helpers({
});

Template.legends.events({
	'click .closeButton'(e){
		//console.log(closed, Template.instance())
		Template.instance().$('.toggleContent').toggleClass('hidden')
	},
		'click .infoButton'(e){
		//console.log(closed, Template.instance())
		Template.instance().$('.toggleContent').toggleClass('hidden')
	}
});


Template.legends.onCreated(function(){
	//console.log('onCreated', this);
	this.data.RV = {};
	//this.data.RV.closed = new ReactiveVar(false);


});

Template.legends.onRendered(function(){
	//console.log(this)
		//console.log('div', this.$('.closeButton'), )
		//this.$('.infoButton').hide()
});


export {createControl}