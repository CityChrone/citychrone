import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { styleHex } from '/imports/client/info/hexagons/colorHex.js';
import { findClosestPoint } from '/imports/client/info/hexagons/findClosestPoint.js'
import { computeIsochrone } from '/imports/client/modify/updateArrays.js';

//If in section INFO click on Hex open PopUp Isochrone, in section Build  click on map.
const hexOnClick = function(e){
		if($('#buttonInfo').hasClass('active')){
       		let latlng = [parseFloat(e.latlng.lng),parseFloat(e.latlng.lat)]
       		let NearestPos = findClosestPoint(latlng)[0].pos
			let feature = e.target.feature;
			let time = Template.body.data.timeOfDay.get();
			
			if (Template.body.data.defaultScenario){
				let scenario = Template.body.data.defaultScenario;
				let moment = _.get(scenario, ["moments", time],[])
				feature['properties']['vAvg'] = moment['newVels'][NearestPos];
				feature['properties']['accessOld'] = moment['newAccess'][NearestPos];
			}
			if (Template.body.template.scenario.currentScenario.moments){
				console.log(Template.body.template.scenario.currentScenario)
				let scenario = Template.body.template.scenario.currentScenario;
				let moment = _.get(scenario, ["moments", time],[])
				feature['properties']['vAvgNew'] = moment['newVels'][NearestPos];
				feature['properties']['accessNew'] = moment['newAccess'][NearestPos];
    		}

    		if($('#btnIsochrones').hasClass('active')){

    			let point = Template.body.collection.points.findOne({'_id':NearestPos.toString()})
				let scenario = {}
				console.log('COMPUTING ISOCHRONES ', NearestPos, point);
				switch(Template.body.data.buttonsHex) {
					case 'velHex':
						scenario = Template.body.data.defaultScenario;
						break;
					case 'velNewHex':
						scenario = Template.body.data.defaultScenario;
						break;
				}
				computeIsochrone(point, scenario)
    		}

			if(Template.body.data.blazePopUp != -1){
				Blaze.remove(Template.body.data.blazePopUp);
			}
			const container = L.DomUtil.create('div', 'pippo');
		    L.DomEvent.disableClickPropagation(container);
	    	Template.body.data.blazePopUp = Blaze.renderWithData(Template.popUp, feature, container);
	    	Template.body.data.popup.setContent(container);
			Template.body.data.popup.setLatLng(e.latlng);
			Template.body.data.popup.openOn(Template.body.data.map);
		}else{
			Template.body.data.map.fireEvent('click', e);
		}
};

const makeGeoJsonHexs = function(){
	return L.geoJson(null, {
 		'style' : styleHex,
 		'onEachFeature' : function(feature, layer){
 				//Template.body.data.listHex[feature.properties.pos] = {'layer' :  layer, 'hex' :feature};
 				//console.log(feature);

 				//layer.bindPopup(container);
 				layer.on('click', hexOnClick);
 			}
 		});
}

export {hexOnClick, makeGeoJsonHexs}