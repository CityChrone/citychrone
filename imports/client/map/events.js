import {Template} from 'meteor/templating';
import {stopOnCLickPopUp, mapClickAddStop} from '/imports/client/map/markers/stopMarker.js';
//import {stopMarker} from './style.js';


export const markerEvent = function(idListLayer, mode='on',events = ['click dblclick','bring']){
	if(mode == 'on'){
		for(let _id in idListLayer){
			let layer = idListLayer[_id];
			if(_.includes(events,'click dblclick')) layer.on('click dblclick', stopOnCLickPopUp);
			if(_.includes(events, 'bring')) layer.bringToFront();
			if(layer.dragging)
				layer.dragging.enable();
		}
	}else{
		for(let _id in idListLayer){
			let layer = idListLayer[_id];
			if(_.includes(events,'click dblclick')) layer.off('click dblclick', stopOnCLickPopUp);
			if(_.includes(events, 'bring')) layer.bringToBack();
			if(layer.dragging)
				layer.dragging.disable()

		}
	}
};

export const mapClickAddStopEvent = function(map, active = 'on'){
	//console.log(map)
	if(active == 'on'){
		map.on('click', mapClickAddStop);
	}else{
		map.off('click', mapClickAddStop);
	}
};

