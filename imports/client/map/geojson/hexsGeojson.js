import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { styleHex, returnShell, computeAvgAccessibility } from '/imports/client/map/geojson/colorHex.js';
import { findClosestPoint } from '/imports/client/map/geojson/findClosestPoint.js'
import { shellify, unionPoints, findFieldtoUpdate} from '/imports/client/map/geojson/unionHexs.js';
import { scenarioDB } from '/imports/api/DBs/scenarioDB.js';
import '/imports/client/map/popUps/popUpGeojson.js';

//If in section INFO click on Hex open PopUp Isochrone, in section Build  click on map.

export const clickGeojson = function(latlng){
    let NearestPos = findClosestPoint([latlng[1], latlng[0]])[0].pos
    let time = Template.timeSelector.timeSelectedRV.get();
    let templateRV = Template.city.RV || Template.newScenario.RV;
    let scenarioID = templateRV.currentScenario.get()._id;
    let scenario = scenarioDB.findOne({'_id':scenarioID});
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
        let templateCollection = Template.city.collection || Template.newScenario.collection;
        let point = templateCollection.points.findOne({'_id':NearestPos.toString()})
        let startTime = time;
        Meteor.apply('isochrone', [point, scenarioID, startTime], noRetry = false, onResultReceived = (error, result) => {
            console.log(result, error)
            let modifier = 'moments.'+ startTime.toString() + '.t'
            let toSet = {}
            toSet[modifier] = result
            console.log('called method isochrone');
            scenario.moments[startTime.toString()].t = result;
            templateRV.currentScenario.set(scenario)
            Template.quantitySelector.quantitySelectedRV.set('t');     
            /*scenarioDB.update({'_id':scenarioID}, {'$set':toSet}, (err)=>{
                if(err){ console.log(err)
                }
                else{
                    let scenarioUpdated = scenarioDB.findOne({'_id':scenarioID})
                    //console.log('return isochrone server side', result, scenarioID, scenarioUpdated, err);
                    Template.quantitySelector.quantitySelectedRV.set('t');
                }
                return true;
            });*/
            return true;
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
               if(click) layer.on('click', hexOnClick);
            }
        });
        //this.geojson.on('click', hexOnClick)
        //console.log('createGeoJson', this);
        
    }
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
        //console.log(scenario,time, quantity, 'class!!')
        this.geojson.clearLayers();
        this.geojson.setStyle(styleHex(quantity, diff));
        shell = shell || returnShell(quantity, diff);
        let values = _.get(scenario, ["moments", time, quantity], []);
        let points = {}

        this.points.find({}).forEach(function(p, index){
            //console.log(p, values)
            let pos = p.pos
            if(quantity == 'newAccess'){
                p[quantity] = parseFloat(computeAvgAccessibility(values[pos]))
            }else{
                p[quantity] = parseFloat(values[pos])
            }   
            points[p.pos] = p
        });
        let pointShellify = shellify(points, quantity, shell)

       // console.log('shellify',shell, pointShellify, points)
        for (let low in pointShellify) {
            geoJsonUnion = unionPoints(pointShellify[low],  this.hexClass);
            //console.log('union', low, geoJsonUnion)
            geoJsonUnion['properties'] = {}
            geoJsonUnion['properties'][quantity] = low;
            this.geojson.addData(geoJsonUnion)
        }
        this.geojson.setStyle(styleHex(quantity, diff));
        
        if(back) this.geojson.bringToBack()


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