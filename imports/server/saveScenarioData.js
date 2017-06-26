import fs from "fs";
import JSZip from "JSZip";
import { scenarioDB} from '/imports/api/DBs/scenarioDB.js';
import {computeScenario} from '/imports/server/startup/scenarioDef.js'

let path = process.env['METEOR_SHELL_DIR'] + '/../../../public/cities/';

export let citiesData = {}

export let createZipCity= function(data, city){
	var zip = new JSZip();
	// zip.file("file", content);
	// ... and other manipulations
	//console.log(data, name);
	let dataToIns = JSON.stringify(data)
	zip.file(city + ".txt", dataToIns)

	zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
	.pipe(fs.createWriteStream(path + city+'.zip'))
	.on('finish', function () {
	    // JSZip generates a readable stream with a "end" event,
	    // but is piped here in a writable stream which emits a "finish" event.
	    console.log("out.zip written.", );

	    console.log(__dirname, process.env.PWD);
	});
};

export let addDataFromZip = function(city, citiesData){

fs.readFile(path + city + ".zip", function(err, data) {
	//console.log(data)
    if (err) throw err;
    JSZip.loadAsync(data).then(function (zip) {

        zip.file(city+".txt").async("string").then(function (data){
        	console.log("loaded", city+".zip", 'scenario def',scenarioDB.find({'city':city, 'default':true}).count()==0)
        	citiesData[city] = JSON.parse(data);
        	if(scenarioDB.find({'city':city, 'default':true}).count()==0){
        		computeScenario(city, citiesData[city])
        	}
        })
    });
});};

export let loadCity = function(){
	
	fs.readdirSync(path).forEach(file => {
	  //console.log(file.slice(-3));
		 if(file.slice(-3) =="zip"){
		  console.log(file.slice(0,-4))
		  let city = file.slice(0,-4)
		  addDataFromZip(city, citiesData);
		}
	});

}