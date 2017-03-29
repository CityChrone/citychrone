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




const isochrone = function(point, arrayC, arrayN, startTime, areaHex, windTime = [7*3600,9*3600], zeroTime = 3*60){
	
	let P2PPos = arrayN.P2PPos;
	let P2SPos = arrayN.P2SPos;
	let S2SPos = arrayN.S2SPos;
	let P2PTime = arrayN.P2PTime;
	let P2STime = arrayN.P2STime;
	let S2STime = arrayN.S2STime;

	const infTime = Math.pow(10,12);

	let totPoint = P2SPos.length;
	let totStop = S2SPos.length;
	let Tstop = new Array(totStop).fill(infTime);
	let Tpoint = new Array(totPoint).fill(infTime);

	let posPoint = point['pos'];
	let countTime = 0;
	
	// **** Initialize time for starting point 
	Tpoint[posPoint] = startTime;

	// **** Initialize time for neigh point

	for(let i = 0, lenghtP = P2PPos[posPoint].length; i < lenghtP; i++ ){
		Tpoint[P2PPos[posPoint][i]] = P2PTime[posPoint][i] + startTime;
	}

	for(let i = 0, lenghtS = P2SPos[posPoint].length; i < lenghtS; i++ ){
		Tstop[P2SPos[posPoint][i]] = P2STime[posPoint][i] + startTime;
	}

	
	//CSA-Algorithm core
	for (let c_i = 0, totC = arrayC.length; c_i < totC; c_i+=4){
		let posStopStart = arrayC[c_i];
		let timeStartC = arrayC[c_i + 2];
		if(Tstop[posStopStart] <= timeStartC){
			let posStopArr = arrayC[c_i + 1];
			let timeArr = arrayC[c_i + 3];
			if(Tstop[posStopArr] > timeArr){
				Tstop[posStopArr]  = timeArr;				
				let stopNArrayPos = S2SPos[posStopArr];
				for(let stopN_i = 0, lenghtS = stopNArrayPos.length; stopN_i < lenghtS; stopN_i++ ){
					let posStopArrN = stopNArrayPos[stopN_i];
					let timeArrN = timeArr + S2STime[posStopArr][stopN_i];
					if(Tstop[posStopArrN] > timeArrN){
							Tstop[posStopArrN] = timeArrN;
					}
				}
			}
		}
	}

	// **** Update point time after computed stop time
	let CountNoInf = 0;
	let totTime =  0;
	let totAreaLess1h = 0;
	let areasTime = new Array(windTime[1]-windTime[0]).fill(0);
	for(let point_i = 0, len_point = Tpoint.length; point_i < len_point; point_i++){
		for(let i = 0, lenghtS = P2SPos[point_i].length; i < lenghtS; i++ ){
			let StopNPos = P2SPos[point_i][i];
			let newTime = P2STime[point_i][i] + Tstop[StopNPos];
			if(Tpoint[point_i] > newTime){
				Tpoint[point_i] = newTime;
			}
		}
		if(Tpoint[point_i] < infTime){
			areasTime[Tpoint[point_i] - startTime] += 1;
			let value = Tpoint[point_i] - startTime;
			CountNoInf++;
			totTime += value;
			if(value < 3600){
				totAreaLess1h++;
			}
		}
	}
	//console.log(areaHex, point,  startTime, totAreaLess1h);
	let area_new = 0;
	let area_old = 0;
	let vAvg = 0;
	let vAvg2 = 0;
	let integralWindTime = 0;
	let integralWindTime2 = 0;

	for(let time_i = zeroTime; time_i < windTime[1] - windTime[0]; time_i++){
		area_new += areasTime[time_i]*areaHex;
		vAvg += (Math.sqrt(area_new/Math.PI) - Math.sqrt(area_old/Math.PI)) / (time_i);
		vAvg2 += (Math.sqrt(area_new/Math.PI) - Math.sqrt(area_old/Math.PI)) / (time_i*time_i);
		//console.log(time_i, areasTime[time_i], areaHex, area_new, area_old, avgV);
		area_old = area_new;
		integralWindTime += 1./(time_i);
		integralWindTime2 += 1./(time_i * time_i);

	}

	vAvg /= integralWindTime;
	vAvg *= 3600;
	vAvg2 /= integralWindTime2;
	vAvg2 *= 3600;

	totAreaLess1h *= areaHex;
	let VelocityLess1h = Math.sqrt(totAreaLess1h / Math.PI);

	return {'vel3600':VelocityLess1h, 'p3600':totAreaLess1h, 'vAvg':vAvg, 'vAvg2':vAvg2, 'Tpoint':Tpoint};
}

export {isochrone, unionHexs, addEdge2Lists,clusterEdges,MultyPolLabel};
