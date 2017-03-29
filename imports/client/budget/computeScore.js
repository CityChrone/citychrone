export const computeScore = function(vel){
	let totVel = 0;
	let count = 0;
	vel.forEach(function(doc){
		if (isNaN(doc))
			return;
		totVel += doc;
		count +=1;
	});
	if(count>0){
		return totVel / count;
	}else{
		return 0;
	}
};
