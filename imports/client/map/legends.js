import L from 'leaflet';
import {Blaze} from 'meteor/blaze';
import {
	Template
} from 'meteor/templating';

let createControl = function(templates, position, map, toAdd = true) {
	let Co = L.Control.extend({
		options: {
			position: position
		},

		onAdd: function(map) {
			const container = L.DomUtil.create('div', '');
			L.DomEvent.disableClickPropagation(container);
			templates.forEach((template)=>{
				console.log(template)
				Blaze.renderWithData(template, this, container);
			})
			return container;
		}
	});
	var t = new Co();
	if (toAdd)
		map.addControl(t);
	return t;
};

export {createControl}