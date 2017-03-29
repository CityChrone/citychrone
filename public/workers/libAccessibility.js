
var a = 0.2;
var b = 0.7;
var N = 2.5;
var TBus = 67.0;
let windowTime = 10000;

const tDistr = function(t) {
	if (t == 0) return 0.;
	t /= 30.;
	return N * Math.exp(-((a * TBus) / t) - t / (b * TBus));
};

let normTDistr = 0.;

for(let i = 0.; i < windowTime; i++){
	normTDistr += tDistr(i);
};

const tDistrN = function(t){
	return tDistr(t) / normTDistr;
};

const areaTimeCompute = function(timeP){
    let aTime = new Array(windowTime).fill(0);
    timeP.forEach( (t)=>{
    	if (t < windowTime) aTime[t] += 1
    }); 
    return aTime
};

const arrayTimeCompute = function(timeP, arrayW){
    let aTime = new Array(windowTime).fill(0);
    timeP.forEach((t,i)=>{
        if (t < windowTime) aTime[t] += arrayW[i]           
    });
    return aTime
};

const computeVel = function(timeP,areaHex){
	let areasTime = areaTimeCompute(timeP);
	return VelMean(areasTime, areaHex);
}

const VelMean = function(areasTime, areaHex){
    let area_new = 0.;
    let vAvg = 0.;
    let integralWindTime = 0.
    for (let time_i = 0.; time_i < areasTime.length; time_i++){
        area_new += areasTime[time_i]*areaHex;
        //console.log(vAvg,time_i, tDistrN(time_i) ,Math.PI)
        if (time_i > 0){
            vAvg += tDistrN(time_i) * (1./time_i)*(Math.sqrt(area_new/Math.PI));
            integralWindTime += tDistrN(time_i);
        }
    }
    //console.log(area_new, vAvg, integralWindTime,tDistrN(4600.))
    vAvg /= integralWindTime;
    vAvg *= 3600.;
    return vAvg;
}

const popMean = function(popsTime){
    let popComul = 0.;
    let popMean = 0.;
    for (let time_i = 0; time_i < popsTime.length; time_i++){
        popComul += popsTime[time_i];
        popMean += tDistrN(time_i) * popComul;
    }
    return popMean;
};

const computePop = function(timeP, arrayPop){
	if (timeP.length == arrayPop.length){
		let popsTime = arrayTimeCompute(timeP, arrayPop)
	 	return popMean(popsTime);
	 }
	return 0;
}

const computeAccess = function(Tpoint,pointsVenues,accessNew){
	for (var point_i = 0, len_point = Tpoint.length; point_i < len_point; point_i++) {
		if(Tpoint[point_i] < 15.*60.) addVenues(pointsVenues[point_i], accessNew, 1);
	}
	return accessNew;
};

const addVenues = function(venues, accessNew, mult) {
	if (!venues)
		return;
	for (var n in venues) {
		accessNew[n] = (accessNew[n] || 0) + venues[n] * mult;
	}
};
