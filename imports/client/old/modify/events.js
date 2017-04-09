import {Template} from 'meteor/templating';
import {stopOnCLickPopUp,stopOnDragend,stopOnDblclick, mapClickAddStop } from './addStop.js';
import {stopMarker} from './style.js';

export const markerEvent = function(mode='on',events = [Template.body.data.clickE,'bring']){
	if(mode == 'on'){
		for(let _id in Template.body.data.StopsMarker){
			let layer = Template.body.data.StopsMarker[_id];
			if(_.includes(events,Template.body.data.clickE)) layer.on(Template.body.data.clickE, stopOnCLickPopUp);
			if(_.includes(events, 'bring')) layer.bringToFront();
		}
	}else{
		for(let _id in Template.body.data.StopsMarker){
			let layer = Template.body.data.StopsMarker[_id];
			if(_.includes(events,Template.body.data.clickE)) layer.off(Template.body.data.clickE, stopOnCLickPopUp);
			if(_.includes(events, 'bring')) layer.bringToBack();
		}
	}
};

export const mapClickAddStopEvent = function(active = 'on'){
	if(active == 'on'){
		Template.body.data.map.on('click', mapClickAddStop);
	}else{
		Template.body.data.map.off('click', mapClickAddStop);
	}
};

export const markerBuild = function(mode = 'on'){
	if(mode == 'on'){
	 	for(let _id in Template.body.data.StopsMarkerInfo){
			let layer = Template.body.data.StopsMarkerInfo[_id];
	 		if(layer.temp){
	 			layer.remove();
	 		}
	 	}
	 	for(let _id in Template.body.data.StopsMarker){
			let layer = Template.body.data.StopsMarker[_id];
			if(layer.temp) layer.addTo(Template.body.data.map);
		}
		Template.body.data.StopsMarkerInfo = {};
	}
	if(mode=='off'){
		Template.body.data.StopsMarkerInfo = {};
		for(let _id in Template.body.data.StopsMarker){
			let layer = Template.body.data.StopsMarker[_id];
			if(layer.temp){
				layer.remove();
				delete layer.options.draggable;
				layer = stopMarker(layer._latlng,layer.colorLine, false);
				layer.addTo(Template.body.data.map);
				layer.temp = true;
				Template.body.data.StopsMarkerInfo[layer._leaflet_id] = layer;
			}
			layer.bringToBack();
		}
	}
};
