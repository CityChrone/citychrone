import {addEdge2Lists,clusterEdges,MultyPolLabel,unionHexs} from "/imports/api/CSA-algorithm/isochrone.js";
import {rx, ry, cosines, sines} from '/imports/client/info/hexagons/hex.js';
import {returnShell, styleHex, computeAvgAccessibility} from '/imports/client/info/hexagons/colorHex.js';

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


const unionPoints = function(listPoints){
    let listSeg = {} 
    let listLabel = {}
    
    //console.log('start erasing...', listPoints)
    listPoints.forEach(function(p, index){
        
        let hexagon = [];
        for (let i = 0; i < 6; i++) {
            let x = p.point.coordinates[0] + rx * cosines[i];
            let y = p.point.coordinates[1] + ry * sines[i];
            hexagon.push([x,y]);
        }
    
  //first and last vertex must be the same
        hexagon.push(hexagon[0]);

        let label = index
        for(let i = 0; i < 6; i++){
            let seg = [hexagon[i],hexagon[i+1]]
            let res = addEdge2Lists(seg,label, listSeg,listLabel)
            listSeg = res[0]
            listLabel = res[1] 
            label = res[2] 

        }
    });
    
    //console.log('end erasing... start clustering')

    let listCluster = clusterEdges(listSeg);
    
    //console.log('end clustering... start polygonizing')
    
   //return {}
    return MultyPolLabel(listCluster)

}

/*
const addGeojson = function(){
    let field2Update = findFieldtoUpdate(Template.body.data.buttonsFeature, Template.body.data.buttonsHex)
    Template.body.data.geoJson = updateGeojson(Template.body.data.geoJson, 
                                            Template.body.data.defaultScenario, 
                                            Template.body.data.buttonsFeature,
                                            Template.body.data.buttonsHex,
                                            Template.body.data.timeOfDay.get()
                                            )
    if ($('#buttonBuild').hasClass('active')) {
        for (let _id in Template.body.data.StopsMarker) {
            let layer = Template.body.data.StopsMarker[_id];
            layer.bringToFront();
        }
    }

}
*/

const shellify = function(points, field, shell){
    //let points = _.get(Template.body.data.defaultScenario, ["moments", time, field], []);
    //points.map(function(function(x,index)){
    //    return {'pos':index, 'value':x}
    //});

    let shellFunc = function(x){
        let val = x[field]
        let  i = 0;
        if (val < shell[0]){
            //console.log(shell[shell.length-1] + 1)
            return shell[0] - 1;
        }
        if (val >= shell[shell.length-1]){
            //console.log(shell[shell.length-1] + 1)
            return shell[shell.length-1] + 1;
        }  

        for (i = 0; i < shell.length; i++) {
            //console.log(val, i, shell[i], val < shell[i])
            if (val < shell[i]) break;
        }
        //console.log((shell[i-1] + shell[i])/2,val,  i, shell, shell[i-1])

        return (shell[i-1] + shell[i])/2;
    }
    let pointShellify = _.groupBy(points,shellFunc);
    //console.log(points, pointShellify, shell)
    return pointShellify
}

const updateGeojson = function(geoJson, scenario, buttonsFeature,buttonsHex , time, shell=null){
    let field = findFieldtoUpdate(buttonsFeature, buttonsHex)
    let feature = findFeature2Update(buttonsFeature)
    
    geoJson.clearLayers();
    Template.body.data.geoJson.setStyle(styleHex);
    shell = shell || returnShell(field);
    let values = _.get(scenario, ["moments", time, feature], []);
    let points = {}
    //console.log('shell', shell, field,buttonsFeature,buttonsHex)

    switch(feature) {
        case 'newVels':       
            Template.body.collection.points.find({}).forEach(function(p, index){
                //console.log(p, values)
                p[feature] = parseFloat(values[p.pos])
                points[p._id] = p
            });
            break;
        case 'newAccess':
            Template.body.collection.points.find({}).forEach(function(p, index){
                p[feature] = parseFloat(computeAvgAccessibility(values[p.pos]))
                points[p._id] = p
            });
            break;
    }

    //console.log('update Scenario', time, feature, scenario, values, Template.body.template.scenario.currentScenario)


    let pointShellify = shellify(points, feature, shell)

    //console.log('shellify',pointShellify, geoJson)
    for (let low in pointShellify) {
        geoJsonUnion = unionPoints(pointShellify[low]);
        //console.log('union', low, geoJsonUnion)
        geoJsonUnion['properties'] = {}
        geoJsonUnion['properties'][field] = low;
        geoJson.addData(geoJsonUnion)
    }

    return geoJson

};

const updateGeojsonDiff = function(geoJson, scenario,scenarioNew, buttonsFeature,buttonsHex , time,  color = null, shell=null){
    let field = findFieldtoUpdate(buttonsFeature, buttonsHex)
    let feature = findFeature2Update(buttonsFeature)
    
    geoJson.clearLayers();
    //Template.body.data.geoJson.setStyle(styleHex);
    shell = shell || returnShell(field);
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


export {unionPoints,updateGeojson, addGeojson, updateGeojsonDiff, shellify}