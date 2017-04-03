import {
	Template
} from 'meteor/templating';
import {
	Meteor
} from 'meteor/meteor';
import '/imports/client/modify/makeNewScenario.html';


Template.makeNewScenario.onCreated(function() {
	Template.body.data.scenarioComputed = new ReactiveVar(true);
	Template.body.data.mapEdited = new ReactiveVar(false); //se è stata modificata dall'utente dall'ultimo salvataggio
	Template.body.data.listNameLines = ['MEA','MEB','MEC','MED','MEE','MEF','MEG','MEH','MEI','MEL','MEM', 'MEN', 'MEO','MEP','MEQ','MER','MES','MET','MEU','MEV','MEZ'];
	Template.body.data.listNameColors = ['#CD3C00','#0A09FC','#5CBA4B','#984ea3','#ffff33','#a65628','#f781bf','#999999', '#e41a1c'];
	Template.body.data.listNumLines = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //number of metros.. (to reset when ranking?)
	Template.body.data.listNumLinesDef = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]; //FIXME: impostare il numero di linee al caricamento dello scenario e all'inizio
	Template.body.data.nameLine = null; //Name lined selected .. (to reset when ranking?)
	//Color New Metro
 	Template.body.function.colorNewMetro = function(num){
 		let color = ['#CD3C00','#0A09FC','#5CBA4B','#984ea3','#ffff33','#a65628','#f781bf','#999999', '#e41a1c'];
 		return Template.body.data.listNameColors[num % Template.body.data.listNameColors.length];
 	};


	Template.body.data.StopsMarker = {}; //List of marker key-id
	Template.body.data.newHexsComputed = false;//check in we have to recompute the new Hex

	Template.body.data.budget = budget;

	//*********** WORKER  ************

//worker parameter section
	Template.body.data.cluster = 50;
 	Template.body.data.totWorker = 2;
	Template.body.data.allWorker = makeWorkers(Template.body.data.totWorker);
 	//useful to count the number of new velocity from worker and check finished parallel work
 	Template.body.data.countHex = 0;


}

Template.makeNewScenario.onRendered(function() {

	createLegends('legendBudget');
	createLegends('legendAddLines', false);
	createLegends('metroSpeed', false);

}