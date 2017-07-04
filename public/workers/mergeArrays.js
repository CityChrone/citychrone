"use strict"


const mergeSortedCOld = function(left, right){
    var result  = new Uint32Array(left.length + right.length),
        il      = 0,
        ir      = 0;

    while (il < left.length && ir < right.length){
        if (left[il+2] < right[ir+2]){
            result.set([left[il],left[il+1],left[il+2],left[il+3]], il+ir);
            il+=4;
        } else {
        	result.set([right[il],right[il+1],right[il+2],right[il+3]], il+ir);
            //result.push(right[ir],right[ir+1],right[ir+2],right[ir+3]);
            ir+=4;
        }
    }

    result.set(left.slice(il), il+ir)
    result.set(right.slice(ir), il+ir)


    return result;
};

const mergeSortedC = function(left, right){
    var result  = [],
        il      = 0,
        ir      = 0;

    while (il < left.length && ir < right.length){
        if (left[il+2] < right[ir+2]){
            result.push(left[il],left[il+1],left[il+2],left[il+3]);
            il+=4;
        } else {
            result.push(right[ir],right[ir+1],right[ir+2],right[ir+3]);
            ir+=4;
        }
    }

    return result.concat(left.slice(il)).concat(right.slice(ir));
};

const mergeArrayN = function(arrayNDef, arrayN2Add, field){
    let arrayNResult = []
    arrayNResult = arrayNDef.map((originArray, pos)=>{
        let isToAdd = pos in arrayN2Add;
        if(isToAdd){
            let toAdd = []
            toAdd = arrayN2Add[pos][field]
            let newLength = originArray.length + toAdd.length;
            let newArray = new Uint32Array(newLength);
            newArray.set(originArray);
            newArray.set(toAdd, originArray.length);
            if(field == "pos" && pos==2550)
                console.log(originArray,pos, arrayN2Add[pos][field], newArray, originArray.length)

            return newArray}
        else{
            return originArray;
        }
    });

    for (let pos in arrayN2Add){
        let array2Add = arrayN2Add[pos];
        if(!(pos in  arrayNDef)){
            arrayNResult[pos] = new Uint32Array(array2Add[field])
        }
    }
    return arrayNResult;
}

module.exports.mergeArrayN = mergeArrayN;
module.exports.mergeSortedC = mergeSortedC;