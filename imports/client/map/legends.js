import L from 'leaflet';
import {Blaze} from 'meteor/blaze';
import {
	Template
} from 'meteor/templating';

import '/imports/client/map/legends.html';

let createControl = function(templates, position, map, classToStyle="", toAdd = true, close=true) {
	let Co = L.Control.extend({
		options: {
			position: position
		},

		onAdd: function(map) {
			const container = L.DomUtil.create('div', 'panel panel-default '+ classToStyle);
			L.DomEvent.disableClickPropagation(container);
			let legendsCurrent = Blaze.renderWithData(Template.legends, this, container);
			//console.log(Template.legends, legendsCurrent, legendsCurrent.lastNode())
			templates.forEach((template)=>{
				//console.log($(legendsCurrent.lastNode()).children().last())
				let find = $('.toggleContent')
				Blaze.renderWithData(template, this, $(legendsCurrent.lastNode()).children().last()[0]);
			})
			return container;
		}
	});
	var t = new Co();
	if (toAdd){
			map.addControl(t);
		    //console.log($(".panel-body"), $(".leaflet-control-container"),$(".leaflet-top").find("*"))
		  $(".leaflet-top").mouseover((e)=>{
		    //console.log("enter!!", e)
		    Template.map.data.map.scrollWheelZoom.disable();
		    Template.map.data.map.touchZoom.disable();
		  });
		  $(".leaflet-top").mouseout((e)=>{
		    //console.log("out!!")

		    Template.map.data.map.scrollWheelZoom.enable();
		    Template.map.data.map.touchZoom.enable();
		  })
	}

	return t;
};

Template.legends.helpers({
});

Template.legends.events({
	'click .toggleButton'(e){

		//console.log(closed, Template.instance().$('.toggleContent').hasClass('hidden'))
		//console.log(Template.instance().$('.toggleContent').parent(2), Template.instance().$('.toggleContent').attr('class'))
					//console.log(Template.instance().$('.toggleContent').parents().eq(0), Template.instance().$('.toggleContent').parents().eq(1))

		if(Template.instance().$('.toggleContent').parents().eq(1).hasClass('leftBar')){
			console.log(Template.instance().$('.toggleContent').parents().eq(0), Template.instance().$('.toggleContent').parents().eq(1))
			Template.instance().$('.toggleContent').parents().eq(1).toggleClass('leftBar')
			Template.instance().$('.toggleContent').parents().eq(1).toggleClass('ToleftBar')
		}else if(Template.instance().$('.toggleContent').parents().eq(1).hasClass('ToleftBar')){
			Template.instance().$('.toggleContent').parents().eq(1).toggleClass('leftBar')
			Template.instance().$('.toggleContent').parents().eq(1).toggleClass('ToleftBar')
		}

		Template.instance().$('.toggleContent').toggleClass('hidden')
		//Template.instance().$('.toggleContent').Class('panel-body')
		//console.log(Template.instance().$('.leaflet-control').attr('class'))
		
	},
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