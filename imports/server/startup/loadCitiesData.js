import fs from "fs";
import JSZip from "jszip";
import { scenarioDB} from '/imports/DBs/scenarioDB.js';
import { computeScenario } from '/imports/server/startup/scenarioDef.js'

//let path = process.env['METEOR_SHELL_DIR'] + '/../../../public/cities/';
//let path = Assets.absoluteFilePath('cities/')
var meteorRoot = fs.realpathSync( process.cwd() + '/../' );
var publicPath = meteorRoot + '/web.browser/app/';
let path = publicPath + '/cities/';

export let citiesData = {};
export let listCities = [];


export let addDataFromZip = function(nameFile){
	console.log("reading", nameFile, Meteor.settings.public)

	fs.readFile(nameFile, function(err, data) {
	    if (err) throw err;
	    JSZip.loadAsync(data).then(function (zip) {
	    	zip.file("cityData.txt").async("string").then(function (data2){
	    		let cityData = JSON.parse(data2)
	    		let city = cityData['city']
	    		citiesData[city] = {}
				citiesData[city]['city'] = city
				citiesData[city]['nameFile'] = nameFile.split("/").pop();
				citiesData[city]['oneHex'] = cityData['hex'];
				citiesData[city]['areaHex'] = cityData['areaHex'];
				citiesData[city]['newScenario'] = cityData['newScenario'];
				citiesData[city]['budget'] = cityData['budget'];
				citiesData[city]['metroLines'] = cityData['metroLines'];
				citiesData[city]['serverOSRM'] = Meteor.settings.public.OSRM_SERVER || cityData['serverOSRM'] + "/" ;
				console.log(citiesData[city]['serverOSRM'])
				citiesData[city]['centerCity'] = cityData['centerCity'];
				citiesData[city]['arrayN'] = {};
				citiesData[city]['arrayPop'] = [];
	    		//console.log(citiesData[city], nameFile, nameFile.split("/").pop())

	        	zip.file("connections.txt").async("string").then(function (data3){
	        		console.log(city, 'parsing, arrayC')
		        	citiesData[city]['arrayC'] = JSON.parse(data3);//data3.split(",").map(Number); //JSON.parse(data3);
		        	console.log(city, 'arrayC')
			        zip.file("listPoints.txt").async("string").then(function (data3){
			        	citiesData[city]['listPoints'] = JSON.parse(data3);
			        	citiesData[city]['listPoints'].forEach((p)=>{
			        		citiesData[city]['arrayPop'].push(p.pop)
			        	})
			        	zip.file("listStops.txt").async("string").then(function (data3){
				        	citiesData[city]['stops'] = JSON.parse(data3);
	        		        zip.file("P2PPos.txt").async("string").then(function (data3){
					        	citiesData[city]['arrayN']['P2PPos'] = JSON.parse(data3);
					        	zip.file("P2PTime.txt").async("string").then(function (data3){
					        		citiesData[city]['arrayN']['P2PTime'] = JSON.parse(data3);
					        		zip.file("P2SPos.txt").async("string").then(function (data3){
					        			citiesData[city]['arrayN']['P2SPos'] = JSON.parse(data3);
					        		    zip.file("P2STime.txt").async("string").then(function (data3){
					        				citiesData[city]['arrayN']['P2STime'] = JSON.parse(data3);
					        				zip.file("S2SPos.txt").async("string").then(function (data3){
					        					citiesData[city]['arrayN']['S2SPos'] = JSON.parse(data3);
					        					zip.file("S2STime.txt").async("string").then(function (data3){
					        						citiesData[city]['arrayN']['S2STime'] = JSON.parse(data3);
											      	let latlng = citiesData[city]['centerCity'];
											      	let newScenario = citiesData[city]['newScenario']
											        listCities.push({'city':city, 'latlng': latlng.reverse(), 'newScenario':newScenario});
											        console.log('readed', nameFile)
										        	//console.log("loaded", city+".zip", 'scenario def',scenarioDB.find({'city':city, 'default':true}).count(), ' newScenario', newScenario, citiesData[city]['centerCity'])
										        	if(scenarioDB.find({'city':city, 'default':true}).count()==0){
														//computeScenario(city, citiesData[city]);
										  
										        		console.log("computeScenario", city)
										        	}
				        						});
        									});
        								});
	        						});
	        					});
	        		        });
			        	});
	        		});
	    		});
			});
	    });
	});
};

export let loadCity = function(){
	
	fs.readdirSync(path).forEach(nameFile => {
	  //console.log(file.slice(-3));
		 if(nameFile.slice(-3) =="zip"){
		  //console.log(file.slice(0,-4))
		  addDataFromZip(path + nameFile);
		}
	});

}