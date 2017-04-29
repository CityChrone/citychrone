import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import '/imports/client/routes/newScenario/budget.html';
import turf from 'turf';
//import { budget,costMetroStop,costTubeKm } from '../../api/parameters.js';

export const computeBadget =  function(numStop, totLength){
    let budget = Template.budget.RV.budget.get()
 //   console.log(budget)
    return budget.budget - (numStop) * budget.costMetroStop - totLength * budget.costTubeKm;
};
export const metroLength = function(stopList){
    //console.log(stopList);
    let lineStop = stopList.map(function(stop){return stop.latlng;});
    return turf.lineDistance(turf.lineString(lineStop), 'kilometers');
};
export const costLines = function(linesDb){
    var city = Template.budget.data.city;
    let lines = linesDb.find({city:city,temp:true});
    let totTempStop = 0;
    let totTubeLength = 0;
    lines.forEach(function(line){
        if(line.stops.length > 0){
            //console.log(line.stops.length, 0.5*(line.stops.length > 0), 0.5*(line.stops.length > 1));
            totTempStop += (line.stops.length - 0.5*(line.stops.length > 0) - 0.5*(line.stops.length > 1));
            let tempLineLength = metroLength(line.stops);
            totTubeLength += tempLineLength;
        }
    });
 //   console.log("computeCost", linesDb.find({city:city,temp:true}).fetch(), totTempStop, totTubeLength);
    return computeBadget(totTempStop, totTubeLength);
};
export const CheckCostAddStop = function(linesDb, stop, lineNameStop){
    var city = Template.budget.data.city;
    let lines = linesDb.find({city:city,temp:true});
    let newLines = new Mongo.Collection(null);
    let totTempStop = 0;
    let totTubeLength = 0;
    lines.forEach(function(line){
        if(line.lineName != lineNameStop){
            newLines.insert(line);
        }
        else{
            line.stops.push(stop);
            newLines.insert(line);
        }
    });
    if(costLines(newLines) < 0) allertNoBadget();

    return costLines(newLines) > 0;
};
export const CheckCostDragStop = function(linesDb, marker){
    let lines = linesDb.find({temp:true});
    let newLines = new Mongo.Collection(null);
    let stopTemp = {
        'latlng':[marker._latlng.lat, marker._latlng.lng],
        '_leaflet_id':marker._leaflet_id
    };

    lines.forEach(function(line){
        let positionToChange = _.findIndex(line.stops, function(stop){ return stop._leaflet_id == marker._leaflet_id;});
        if(positionToChange == -1){
            newLines.insert(line);
        }
        else{
            line.stops.splice(positionToChange,1, stopTemp);
            newLines.insert(line);
        }
    });
    if(costLines(newLines) < 0) allertNoBadget();

    return costLines(newLines) > 0;
};
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


export const allertNoBadget = function() {
    var bootstrap_alert = function() {};
    bootstrap_alert.warning = function(message) {
        if (message == '') {
            $('#alertBudget').html('');
        } else {
            $('#alertBudget').html('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><span>' + message + '</span></div>');
        }
    };
    bootstrap_alert.warning('Not enough budget!');
    window.setTimeout(function() {
        bootstrap_alert.warning('');
    }, 1000);
};


Template.budget.helpers({   
    'budget' () {
        return costLines(Template.metroLinesDraw.collection.metroLines).toFixed(0);
    },
    'costMetroStop'(){
        let budget = Template.budget.RV.budget.get()
        return budget.costMetroStop;
    },
    'costTubeKm'(){
        let budget = Template.budget.RV.budget.get()
        return budget.costTubeKm;
    },
    'notBudget' () {
        allertNoBadget();
    }
});

Template.budget.events({});


Template.budget.onCreated(function(){
    Template.budget.data = {};

    Template.budget.data.city = Router.current().params.city;

    Template.budget.RV = {}
    Template.budget.RV.budget = new ReactiveVar({})


    Meteor.call("budget", Template.budget.data.city, function(err, res){
        //console.log("Budget!!", res);
        Template.budget.RV.budget.set(res['budget']);
    })
});

Template.budget.onRendered(function(){

});

