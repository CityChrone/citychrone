import fs from "fs";
import JSZip from "jszip";
import { scenarioDB} from '/imports/api/DBs/scenarioDB.js';
import {computeScenario} from '/imports/server/startup/scenarioDef.js'
import { metroLines } from '/imports/api/DBs/metroLinesDB.js';

//let path = process.env['METEOR_SHELL_DIR'] + '/../../../public/cities/';
//let path = Assets.absoluteFilePath('cities/')
var meteorRoot = fs.realpathSync( process.cwd() + '/../' );
var publicPath = meteorRoot + '/web.browser/app/';
let path = publicPath + '/cities/';

//console.log(path, meteorRoot, publicPath)
export let citiesData = {}


export let createZipCity= function(data, city, resolve = false){
	var zip = new JSZip();
	// zip.file("file", content);
	// ... and other manipulations
	//console.log(data, name); 
	let dataToIns = JSON.stringify(data)
	zip.file(city + ".txt", dataToIns)
	let path = process.env.PWD + '/public/cities/';
	console.log(path)
	zip.generateNodeStream({type:'nodebuffer',streamFiles:false})
	.pipe(fs.createWriteStream(path + city+'.zip'))
	.on('finish', function () {
	    // JSZip generates a readable stream with a "end" event,
	    // but is piped here in a writable stream which emits a "finish" event.
	    console.log("out.zip written.", );
	    if(resolve) resolve(true);
	    console.log(__dirname, process.env.PWD);
	});
};

export let addDataFromZip = function(city, citiesData){

fs.readFile(path + city + ".zip", function(err, data) {
	//console.log(data)
    if (err) throw err;
    JSZip.loadAsync(data).then(function (zip) {

        zip.file(city+".txt").async("string").then(function (data){
        	citiesData[city] = JSON.parse(data);
        	let newScenario = metroLines.findOne({'city' : city}, {fields :{'newScenario':1}})['newScenario'] || false;
        	citiesData[city]['newScenario'] = newScenario;
        	//console.log("loaded", city+".zip", 'scenario def',scenarioDB.find({'city':city, 'default':true}).count(), ' newScenario', newScenario, citiesData[city]['centerCity'])
        	/*if(scenarioDB.find({'city':city, 'default':true}).count()==0){
        		computeScenario(city, citiesData[city])
        	}*/
        })
    });
});};

export let loadCity = function(){
	
	fs.readdirSync(path).forEach(file => {
	  //console.log(file.slice(-3));
		 if(file.slice(-3) =="zip"){
		  //console.log(file.slice(0,-4))
		  let city = file.slice(0,-4)
		  addDataFromZip(city, citiesData);
		}
	});

}