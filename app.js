var express = require("express");
var app     = express();
var path    = require("path");
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var mysql = require('mysql');
var http = require('http');
var https = require('https');
var request = require('request');
var cookieParser = require('cookie-parser');
var url = require('url');
var md5 = require('md5');
var multer = require('multer');
var fs = require('fs');
var promise = require('promise-mysql');
const mkdirp = require('mkdirp');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var open = require('open');


/*const admin = require('firebase-admin');

const serviceAccount = require("./service-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://shiny-pogo.firebaseio.com"
});

let db = admin.firestore();*/


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//put static files (js, css, images) into /dist directory
app.use(express.static(path.join(__dirname, 'dist')));
app.use(cookieParser());


// home page 
app.get('/', function(req, res){

	fs.readFile(path.join(__dirname, 'dist/json/latest/mypogotool.json'), (err, data) => {
		if (err) throw err;
		let loaded_data = JSON.parse(data);
		
		var active_events = [];
		var past_events = [];
		var future_events = [];

		var pokemon_list = [];

		for (var key in loaded_data.pokemon) {
			if (loaded_data.pokemon.hasOwnProperty(key)) {
				pokemon_list.push(loaded_data.pokemon[key]);
			}
		}

		for (var key in loaded_data.event) {
			if (loaded_data.event.hasOwnProperty(key)) {
				if(loaded_data.event[key]["pokemon"] && Object.keys(loaded_data.event[key]["pokemon"]).length > 0){
					event = loaded_data.event[key];

					now = new Date();
				
					if(new Date(event["start_date"]) > now){
						future_events.push(event);
					} else if(new Date(event["end_date"]) < now){
						past_events.push(event);
					} else{
						active_events.push(event);
					}

					event["start_date"] = parseSchedule(event["start_date"]);
					event["end_date"] = parseSchedule(event["end_date"]);

				}
			}
		}

		res.render(path.join(__dirname+'/templates/shiny-simulator-home.html'), {pokemon_list: pokemon_list, active_events: active_events, past_events: past_events, future_events: future_events});
	});

});


app.post('/shiny-simulator', function(req, res){

	var pokemon_list = [];
	var pokemon_data = [];

	var eventID = req.body.eventID;
	
	if(eventID != undefined){
		fs.readFile(path.join(__dirname, 'dist/json/latest/mypogotool.json'), (err, data) => {
			if (err) throw err;
			let loaded_data = JSON.parse(data);
			if(eventID in loaded_data.event){
				event = loaded_data.event[eventID];
				for (var key in event["pokemon"]){
					if(event["pokemon"].hasOwnProperty(key)){
						pokemon_list.push(event["pokemon"][key]["id"]);
						pokemon_data.push(loaded_data.pokemon[event["pokemon"][key]["id"]])
					}
				}
			}
		
			res.render(path.join(__dirname+'/templates/shiny-simulator.html'), {event: event, pokemon_data: pokemon_data, pokemon_list: pokemon_list});
		});
	} else {
		var pokemon_list = req.body.pokemonList.split(",");
		fs.readFile(path.join(__dirname, 'dist/json/latest/mypogotool.json'), (err, data) => {
			if (err) throw err;
			let loaded_data = JSON.parse(data);
			for (var key in loaded_data["pokemon"]){
				if(loaded_data["pokemon"].hasOwnProperty(key) && pokemon_list.includes(loaded_data["pokemon"][key].id)){
					pokemon_list.push(loaded_data["pokemon"][key].id);
					pokemon_data.push(loaded_data["pokemon"][key])
				}
			}

			res.render(path.join(__dirname+'/templates/shiny-simulator.html'), {event: [], pokemon_data: pokemon_data, pokemon_list: pokemon_list});
		});
	}

});



app.listen(8080);


open('http://localhost:8080');
console.log("Running at Port 8080");




function sleep (time) {
	  return new Promise((resolve) => setTimeout(resolve, time));
}

function parseSchedule(date){
	date = new Date(date);

	return (date.getDate()<10?'0':'') + date.getDate() +  "/" + (date.getMonth()<10?'0':'') + date.getMonth() + "/" + date.getFullYear() 
	+ " " + (date.getHours()<10?'0':'') + date.getHours() + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes();

}


