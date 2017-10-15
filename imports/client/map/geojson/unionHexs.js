import  math from 'mathjs';

const round = function(num, fix){
    mult =  Math.pow(10.,fix)
    return Math.round(num*mult)/mult
};
 
const seg2str = function(seg,rev=false){
    let limNum = 10
    seg = [[round(seg[0][0],limNum),round(seg[0][1],limNum)],[round(seg[1][0],limNum),round(seg[1][1],limNum)]]
    if  (seg[0][0]+seg[0][1] < seg[1][0]+seg[1][1]){
        if (rev){
            seg = [seg[1],seg[0]]
        }
    }
    else{
        if (!rev){
            seg = [seg[1],seg[0]]
        }
    }
    return seg.join()
};

const p2str = function(seg){
    let limNum = 10
    seg = [round(seg[0],limNum),round(seg[1],limNum)]
    return seg.join()
};

const segRound = function(seg){
    let limNum = 10
    seg = [[round(seg[0][0],limNum),round(seg[0][1],limNum)],[round(seg[1][0],limNum),round(seg[1][1],limNum)]]
    return seg
};

const MultyPolLabel = function(listCluster){
    let geoJsonMultiPol = {'type':'MultiPolygon', 'coordinates' : []}
    //console.log(listCluster)
    for (let label in listCluster){
        let listPol = []
        //console.log(label)
        while (Object.keys(listCluster[label]).length != 0){
            //console.log('l',Object.keys(listCluster[label]).length)
            let pol = []
            let cluster = listCluster[label]
            let startPoint = Object.keys(cluster)[0]
            let iterOverP = cluster[startPoint][Object.keys(cluster[startPoint])[0]]
            let pointFrom = iterOverP[0]
            let pointTo = iterOverP[1]
            pol.push(pointFrom)
            //#print 'while 1', cluster.keys()
            //#del listCluster[label][startPoint]
            while(true){
                if (! _.isEqual(pointTo, pol[0])){
                    pol.push(pointTo)
                    startPoint = p2str(pointTo)
                    //console.log('\n from -> to', pointFrom, pointTo,startPoint, startPoint in listCluster[label])//listCluster[label], Object.keys(listCluster[label]).length)
                    //console.log('',startPoint, Object.keys(cluster), startPoint ==  Object.keys(cluster)[1])
                    //#print 'pol',pol
                    for (let keyStr in cluster[startPoint]){      
                        if (keyStr != p2str(pointFrom)){
                            if (! _.isEqual(cluster[startPoint][keyStr][0], pointTo)){
                                pointFrom = pointTo
                                pointTo = cluster[startPoint][keyStr][0] 
                            }
                            else{
                                pointFrom = pointTo
                                pointTo = cluster[startPoint][keyStr][1]
                            }
                            //console.log('\n after from -> to', pointFrom, typeof pointTo, cluster[startPoint][keyStr])
                            break
                        }
                    }
                    delete listCluster[label][startPoint]
                }
                else{
                    //#print listCluster[label]
                    //console.log('deleting Last one!!')
                    delete listCluster[label][p2str(pointTo)]
                    listPol.push(pol)
                    break
                }
            }
            //console.log("while ended")
        }
        let maxLen = 0
        let maxIndex = 0
        for (let i=0; i < listPol.length; i++){
            if (maxLen < listPol[i].length){
                maxLen = listPol[i].length
                maxIndex = i
            }
        }
        listPol.unshift(listPol.pop(maxIndex))
        geoJsonMultiPol['coordinates'].push(listPol)
    }
    return geoJsonMultiPol
};

const addEdge2Lists = function(seg, label, listSeg,listLabel){
    let keySeg =seg2str(seg) 
   
    if (keySeg in listSeg) {
        let newLabel = listSeg[keySeg]['label']
        //console.log("newlabel ", newLabel, ' label removed',label)
        if(newLabel != label){
            //console.log("newlabel ", newLabel, ' label removed',label)
            for (let subCluster in listLabel[label]){
                //console.log(subCluster)
                listLabel[newLabel].push(listLabel[label][subCluster])

                for (let segInClusterKey in listLabel[label][subCluster]){
                    segInCluster = listLabel[label][subCluster][segInClusterKey]
                //console.log(segInCluster, listLabel[label][segInCluster])
                    if (segInCluster['keySeg'] in listSeg){
                        listSeg[segInCluster['keySeg']]['label'] = newLabel
                    //console.log(newLabel)
                    }
                }
            }
            delete listLabel[label]
            label = newLabel
        }
        delete listSeg[keySeg]
        //console.log(listLabel, "\n listSeg",listSeg)
    }
    else{
        //console.log(label)
        listSeg[keySeg] = {'label':label,'latlng':segRound(seg)}
        if (label in listLabel){
            listLabel[label][0].push({'keySeg':keySeg,'latlng':segRound(seg)})
        } else {
            listLabel[label] = [[{'keySeg':keySeg,'latlng':segRound(seg)}]]
        }
    }
    return [listSeg,listLabel, label]
};

const clusterEdges = function(listSeg){
    let listCluster = {};
    for (let keySeg in listSeg){
        let seg = listSeg[keySeg]
        let segKey = seg2str(seg['latlng'])
        let latlng = seg['latlng']
        let key0 = p2str(latlng[0])
        let key1 = p2str(latlng[1])
        let label = seg['label']

        if(label in listCluster == false){
            listCluster[label] = {}
        }
        if (key0 in listCluster[label]){
            listCluster[label][key0][key1] = latlng
        }else{
            listCluster[label][key0] = {}
            listCluster[label][key0][key1] = latlng
        }
        if (key1 in listCluster[label]){
            /*if(key0 in listCluster[label][key1]){
                listCluster[label][key1][key0] = latlng
            }else{*/
                //listCluster[label][key1] = {}
            listCluster[label][key1][key0] = latlng

            //}
        }else{
            listCluster[label][key1] = {}
            listCluster[label][key1][key0] = latlng
        }
        //console.log(label, listCluster)

    }
    return listCluster;
};

const unionHexs = function(hexs){
    let listSeg = {} 
    let listLabel = {}
    console.log('start erasing...')
    hexs.forEach(function(p, index){
        let label = p['pos']
        let hexagon = p['hex']['coordinates'][0]
        for(let i = 0; i < 6; i++){
            let seg = [hexagon[i],hexagon[i+1]]
            let res = addEdge2Lists(seg,label, listSeg,listLabel)
            listSeg = res[0]
            listLabel = res[1] 
            label = res[2] 

        }
    });
    
    console.log('end erasing... start clustering')

    let listCluster = clusterEdges(listSeg);
    
    console.log('end clustering... start polygonizing')
    
   //return {}
    return MultyPolLabel(listCluster)
}


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
        //console.log((shell[i-1] + shell[i])/2, val,  i, shell, shell[i-1])

        return (shell[i-1] + shell[i])/2;
    }
    let pointShellify = _.groupBy(points,shellFunc);
    //console.log(points, pointShellify, shell)
    return pointShellify
}


export {unionPoints, shellify}