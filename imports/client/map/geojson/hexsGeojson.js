import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Router } from 'meteor/iron:router';
import { styleHex, returnShell, computeAvgAccessibility } from '/imports/client/map/geojson/colorHex.js';
import { findClosestPoint } from '/imports/client/map/geojson/findClosestPoint.js'
import { shellify, unionPoints, findFieldtoUpdate} from '/imports/client/map/geojson/unionHexs.js';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import '/imports/client/map/popUps/popUpGeojson.js';

//If in section INFO click on Hex open PopUp Isochrone, in section Build  click on map.

export const clickGeojsonIso = function(latlng){
    let NearestPos = findClosestPoint([latlng[1], latlng[0]])[0].pos
    let startTime = Template.timeSelector.timeSelectedRV.get();
    let templateRV = Template.city.RV || Template.newScenario.RV;
    let scenario = templateRV.currentScenario.get();
    let templateCollection = Template.city.collection || Template.newScenario.collection;
    let point = templateCollection.points.findOne({'_id':NearestPos.toString()})

    analytics.track("Click Map", {
        'eventName': "click geojson",
        'city': scenario.city,
        'pos':NearestPos,
        'latlng':latlng,
        'isIsochrone': $('#quantityPicker').val() == 'Isochrones',
    });


    Meteor.apply('isochrone', [point, scenario._id, startTime], noRetry = false, onResultReceived = (error, result) => {
        //console.log(result, scenario)
        let modifier = 'moments.'+ startTime.toString() + '.t'
        let toSet = {}
        toSet[modifier] = result
        //console.log('called method isochrone');
        scenario.moments[startTime.toString()].t = result;
        templateRV.currentScenario.set(scenario);
        if(Router.current().route.getName() == "newScenario.:city") templateRV.ScenarioGeojson.set(scenario)
        Template.quantitySelector.quantitySelectedRV.set('t');     
        return true;
    });
};

export const onlyIso = function(e){
    let latlng = [parseFloat(e.latlng.lat), parseFloat(e.latlng.lng)];
    if($('#quantityPicker').val() == 'Isochrones'){
        clickGeojsonIso(latlng)
    }
}

export const clickGeojson = function(latlng){
    if(Template.metroLinesDraw){
            if(Template.metroLinesDraw.RV){
                if (Template.metroLinesDraw.RV.mapEdited.get()){
                return;
            }
     }
    }

    let NearestPos = findClosestPoint([latlng[1], latlng[0]])[0].pos
    let time = Template.timeSelector.timeSelectedRV.get();
    let templateRV = Template.city.RV || Template.newScenario.RV;
    let scenario = templateRV.currentScenario.get();
    let moment = _.get(scenario, ["moments", time], []);
    let point = {};
    point['newVels'] = moment['newVels'][NearestPos];
    point['newAccess'] = moment['newAccess'][NearestPos];
    point['newPotPop'] = moment['newPotPop'][NearestPos];
    
    analytics.track("Click Map", {
        'eventName': "click geojson",
        'city': scenario.city,
        'pos':NearestPos,
        'latlng':latlng,
        'isIsochrone': $('#quantityPicker').val() == 'Isochrones',
    });

    if($('#quantityPicker').val() == 'Isochrones'){
        clickGeojsonIso(latlng)
    }else{
        analytics.track("Click Map", {
        'eventName': "click geojson",
        'city': scenario.city,
        'pos':NearestPos,
        'latlng':latlng,
        'isIsochrone': $('#quantityPicker').val() == 'Isochrones',
        });


    }

    const container = L.DomUtil.create('div', 'popUp');
    Blaze.renderWithData(Template.popUpGeojson, point, container);
    L.DomEvent.disableClickPropagation(container);
    let popUp = L.popup();
    popUp.setContent(container);
    popUp.setLatLng(latlng);
    popUp.openOn(Template.map.data.map);

}

const hexOnClick = function(e){ 
	let latlng = [parseFloat(e.latlng.lat), parseFloat(e.latlng.lng)];
    clickGeojson(latlng);
};

class geoJsonClass{
    constructor(quantity = 'newVels', diff = false, click = true) {
        this.quantity = quantity;
        this.diff = diff;
        this.geojson = L.geoJson(null, {
        'style' : styleHex(quantity, diff),
        'onEachFeature' : function(feature, layer){
               //if(click) 
                layer.on('click', hexOnClick);
               //else layer.on('click', onlyIso);
            }
        });
        //this.geojson.on('click', hexOnClick)
        //console.log('createGeoJson', this);
        
    }
    hexOnClick(e){ hexOnClick(e);}
    clickGeojson(latlng) {clickGeojson(latlng);}
    enableClick(){
        this.geojson.eachLayer(function (layer) {
            layer.on('click', hexOnClick);
        })
    }
    disableClick(){
        this.geojson.eachLayer(function (layer) {
            layer.off('click', hexOnClick);
        })

    }
    updateGeojson(scenario, quantity, diff = false, time, shell=null, back=false){
        this.quantity = quantity;
        this.diff = diff;
        this.scenario = scenario;
        this.time = time;
        this.back = back;
        this.shell = shell || returnShell(this.quantity, this.diff);
        this.showGeojson()
    }
    showGeojson(){
        this.geojson.clearLayers();
        this.geojson.setStyle(styleHex(this.quantity, this.diff));
        let values = _.get(this.scenario, ["moments", this.time, this.quantity],  new Array(this.points.find({}).count()).fill(-1));
        let points = {}
        let quantity = this.quantity;
        //console.log(this.scenario,this.time, this.quantity, 'class!!')

        this.points.find({}).forEach(function(p, index){
            //console.log(p, values)
            let pos = p.pos
            if(quantity == 'newAccess'){
                p[quantity] = parseFloat(computeAvgAccessibility(values[pos]))
            }if(quantity == 'noLayer'){
                p[quantity] = 0
            }
            else{
                p[quantity] = parseFloat(values[pos])
            }   
            points[p.pos] = p
        });
        let pointShellify = shellify(points, this.quantity, this.shell)

        //console.log('shellify',this.shell, pointShellify, points)
        for (let low in pointShellify) {
            geoJsonUnion = unionPoints(pointShellify[low],  this.hexClass);
            //console.log('union', low, geoJsonUnion, this.shell)
            geoJsonUnion['properties'] = {}
            geoJsonUnion['properties'][this.quantity] = low;
            this.geojson.addData(geoJsonUnion)
        }
        this.geojson.setStyle(styleHex(this.quantity));
        
        if(this.back) this.geojson.bringToBack()

        return this.geojson

    }
    setPoints(points){
        this.points = points;
    }
    setHexClass(hexClass){
        this.hexClass = hexClass;
    }
    showPopUp(){

    }


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

   // console.log('update Scenario Diff', time, feature, scenario, values, valuesNew, points)


    let pointShellify = shellify(points, feature, shell)

   // console.log(pointShellify)
    for (let low in pointShellify) {

        geoJsonUnion = unionPoints(pointShellify[low]);
        geoJsonUnion['properties'] = {}
        geoJsonUnion['properties'][field] = low;
        geoJson.addData(geoJsonUnion)
        //console.log('union', low,geoJsonUnion)
    }

    return geoJson

};
export {hexOnClick, makeGeoJsonHexs, updateGeojson, updateGeojsonDiff, geoJsonClass}