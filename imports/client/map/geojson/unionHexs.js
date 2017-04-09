import {addEdge2Lists,clusterEdges,MultyPolLabel,unionHexs} from "/imports/api/CSA-algorithm/isochrone.js";


const unionPoints = function(listPoints, hexClass){
    let listSeg = {} 
    let listLabel = {}
    
    //console.log('start erasing...', listPoints)

    listPoints.forEach(function(p, index){
        let hexagon = hexClass.hexagon(p.point.coordinates).geometry.coordinates[0]
  //first and last vertex must be the same
        //console.log(hexagon, hexClass, hexClass.hexagon(p.point.coordinates), p.point.coordinates)
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


export {unionPoints, shellify}