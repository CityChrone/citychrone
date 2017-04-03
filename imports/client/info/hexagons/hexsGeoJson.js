import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { styleHex, returnShell, computeAvgAccessibility } from '/imports/client/info/hexagons/colorHex.js';
import { findClosestPoint } from '/imports/client/info/hexagons/findClosestPoint.js'
import { computeIsochrone } from '/imports/client/modify/updateArrays.js';
import {shellify, unionPoints, findFieldtoUpdate} from '/imports/client/info/hexagons/unionHexs.js';
import { scenarioDB} from '/imports/api/DBs/scenarioDB.js';

//If in section INFO click on Hex open PopUp Isochrone, in section Build  click on map.
const hexOnClick = function(e){ 
		if($('#buttonInfo').hasClass('active')){
       		let latlng = [parseFloat(e.latlng.lng),parseFloat(e.latlng.lat)]
       		let NearestPos = findClosestPoint(latlng)[0].pos
			let feature = e.target.feature;
			let time = Template.body.data.timeOfDay.get();
			let scenarioID = Template.scenario.RV.currentScenarioIdRV.get();
			let scenario = scenarioDB.findOne({'_id':scenarioID});
			let moment = _.get(scenario, ["moments", time], [])
			feature['properties']['newVels'] = moment['newVels'][NearestPos];
			feature['properties']['newAccess'] = moment['newAccess'][NearestPos];
			feature['properties']['newPotPop'] = moment['newPotPop'][NearestPos];
			
    		if($('#t').hasClass('active')){

    			let point = Template.body.collection.points.findOne({'_id':NearestPos.toString()})
    			let startTime = Template.body.data.timeOfDay.get();
    			Meteor.call('isochrone', [point, scenarioID, startTime], (error, result) => {
					let modifier = 'moments.'+ startTime.toString() + '.t'
					let toSet = {}
					toSet[modifier] = result
					scenarioDB.update({'_id':scenarioID}, {'$set':toSet}, (err)=>{
						if(err){ console.log(err)
						}
						else{
							let scenarioUpdated = scenarioDB.findOne({'_id':scenarioID})
							//console.log('return isochrone server side', result, scenarioID, scenarioUpdated, err);
							Template.quantityButtons.quantitySelectedRV.set('t');
						}
						return true;
					});
				});
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

const makeGeoJsonHexs = function(quantity = 'newVels', mode = 'btnCurrent'){
	return L.geoJson(null, {
 		'style' : styleHex(quantity, mode),
 		'onEachFeature' : function(feature, layer){
 				//Template.body.data.listHex[feature.properties.pos] = {'layer' :  layer, 'hex' :feature};
 				//console.log(feature);

 				//layer.bindPopup(container);
 				layer.on('click', hexOnClick);
 			}
 		});
}

const updateGeojson = function(scenario, quantitySelected, time, shell=null){
    let feature = quantitySelected;
    let mode = 'btnCurrent';
    let geoJson = makeGeoJsonHexs(quantitySelected, mode);
    shell = shell || returnShell(feature, mode);
    let values = _.get(scenario, ["moments", time, feature], []);
    let points = {}

    Template.body.collection.points.find({}).forEach(function(p, index){
        //console.log(p, values)
        if(feature == 'newAccess'){
        	p[feature] = parseFloat(computeAvgAccessibility(values[p.pos]))
        }else{
        	p[feature] = parseFloat(values[p.pos])
    	}	
        points[p._id] = p
    });



    let pointShellify = shellify(points, feature, shell)

   // console.log('shellify',shell, pointShellify, geoJson)
    for (let low in pointShellify) {
        geoJsonUnion = unionPoints(pointShellify[low]);
        //console.log('union', low, geoJsonUnion)
        geoJsonUnion['properties'] = {}
        geoJsonUnion['properties'][feature] = low;
        geoJson.addData(geoJsonUnion)
    }

    //console.log('update Scenario', time, feature, pointShellify, geoJson, points)

    return geoJson

};

const updateGeojsonDiff = function(scenario,scenarioNew, buttonsFeature,buttonsHex , time,  color = null, shell=null){
    let feature = quantitySelected;
    
    let geoJson = makeGeoJsonHexs(quantitySelected, mode);

    //Template.body.data.geoJson.setStyle(styleHex);
    shell = shell || returnShell(feture, mode);
    let values = _.get(scenario, ["moments", time, feature], []);
    let valuesNew = _.get(scenarioNew, ["moments", time, feature], []);
    let points = {}

    switch(feature) {
        case 'newVels':       
            Template.body.collection.points.find({}).forEach(function(p, index){
                p[feature] = (parseFloat(valuesNew[p.pos]) - parseFloat(values[p.pos]))
                points[p._id] = p
            });
            break;
        case 'newAccess':
            Template.body.collection.points.find({}).forEach(function(p, index){
                p[feature] = (parseFloat(computeAvgAccessibility(valuesNew[p.pos])) - parseFloat(computeAvgAccessibility(values[p.pos])))   
                points[p._id] = p
            });
            break;
    }

    console.log('update Scenario Diff', time, feature, scenario, values, valuesNew, points)


    let pointShellify = shellify(points, feature, shell)

    console.log(pointShellify)
    for (let low in pointShellify) {

        geoJsonUnion = unionPoints(pointShellify[low]);
        geoJsonUnion['properties'] = {}
        geoJsonUnion['properties'][field] = low;
        geoJson.addData(geoJsonUnion)
        //console.log('union', low,geoJsonUnion)
    }

    return geoJson

};
 /*
export const findFieldtoUpdate = function(buttonsFeature, buttonsHex){
    switch (buttonsFeature) {
        case 'btnVelocity':
            switch (buttonsHex) {
                case 'velHex':
                    return 'vAvg';
                case 'velNewHex':
                    return 'vAvgNew';
                case 'diffHex':
                    return 'vAvgDiff' ;
            }
            break;

        case 'btnAccessibility':
            switch (buttonsHex) {
                case 'velHex':
                    return 'accessOldVal';
                case 'velNewHex':
                    return 'accessNewVal';
                case 'diffHex':
                    return 'accessDiff' ;
            }
            break;
    }
    return '';

};

export const findFeature2Update = function(buttonsFeature){
    switch (buttonsFeature) {
        case 'btnVelocity':
            return 'newVels';

        case 'btnAccessibility':
            return 'newAccess'
        }
    return '';
};
*/


export {hexOnClick, makeGeoJsonHexs, updateGeojson, updateGeojsonDiff}