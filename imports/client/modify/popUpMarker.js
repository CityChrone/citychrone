import { Template } from 'meteor/templating';
import './popUpMarker.html'
import {stopOnClick, stopOnDblclick} from './addStop.js'

Template.popUpMarker.events({
	'click #expMetro'(e) {
		let marker = Template.body.data.blazePopUpMarker[0];
		let event = {'target':marker}
		let city = Template.body.collection.metroLines.findOne({'lineName':marker.lineName}).city;
		stopOnClick(event,city);
		Template.body.data.map.removeLayer(Template.body.data.popupMarker)	
	},
	'click #remMetro'(e) {
		let marker = Template.body.data.blazePopUpMarker[0];
		let event = {'target':marker}
		stopOnDblclick(event);
		Template.body.data.map.removeLayer(Template.body.data.popupMarker)	
	},
});

Template.popUpMarker.onCreated(()=>{
});


Template.popUpMarker.helpers({
	'temp'(){
		console.log(Template.body.data.blazePopUpMarker[0]);
		let marker = Template.body.data.blazePopUpMarker[0];
		let lineName = Template.body.data.listNameLines[marker.indexLine];
		//let stopsLine = Template.body.collection.metroLines.findOne({'lineName':lineName}).stops;
		//if(marker)
		//let latLng = new L.latLng(stopsLine[stopsLine.length-1]);
		//console.log(marker, marker._latlng, stopsLine,lineName)
		//console.log(marker._latlng.equals(latLng) );
		return marker.temp;
	},
	'expand'(){
		let marker = Template.body.data.blazePopUpMarker[0];
		let lineName = Template.body.data.listNameLines[marker.indexLine];
		let stopsLine = Template.body.collection.metroLines.findOne({'lineName':lineName}).stops;
		let latLngMaker = [marker._latlng.lat,marker._latlng.lng];
		let last = stopsLine[stopsLine.length-1];
		let first = stopsLine[0];
		//console.log(marker, marker._latlng, stopsLine,lineName, latLng, stopsLine[stopsLine.length-1])
		let res = false;

		console.log(latLngMaker, last, first)

		if(latLngMaker == last || latLngMaker == first || !marker.temp ){
			res = true;
		}
	return res;
	}
});
