import { Template } from 'meteor/templating';
import '/imports/client/map/popUps/popUpMarker.html'
import {stopOnDblclick} from '/imports/client/map/markers/stopMarker.js'
import { addNewSubLine, removeStop } from '/imports/client/map/metroLines/metroLinesDraw.js'

Template.popUpMarker.events({
	'click #expMetro'(e) {
		let marker = this.marker;
		addNewSubLine(marker);
		L.DomEvent.stopPropagation(e);
		if(!Template.metroLinesDraw.RV.mapEdited.get()){
			Template.metroLinesDraw.RV.mapEdited.set(true);
		}

	},
	'click #remMetro'(e) {
		let marker = this.marker;
		removeStop(marker);
		L.DomEvent.stopPropagation(e);
		if(!Template.metroLinesDraw.RV.mapEdited.get()){
			Template.metroLinesDraw.RV.mapEdited.set(true);
		}
	},
});

Template.popUpMarker.onCreated(()=>{
});


Template.popUpMarker.helpers({
	'temp'(){
		let marker = this.marker;
		//console.log(marker.temp, marker)
		return marker.temp;
	},
});
