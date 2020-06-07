var express = require("express");
var app = express();
var path = require("path");
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
var storage = require('@google-cloud/storage')

// FIREBASE 

const admin = require('firebase-admin');
const firebase = require('firebase');

const serviceAccount = require("./service-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://shiny-pogo.firebaseio.com"
});

let db = admin.firestore();


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//put static files (js, css, images) into /dist directory
app.use(express.static(path.join(__dirname, 'dist')));
app.use(cookieParser());


// ROUTES


// CONTROLLERS
var statsController = require('./controllers/statsController');

// home page 
app.get('/', function(req, res) {

    fs.readFile(path.join(__dirname, 'dist/json/latest/mypogotool.json'), (err, data) => {
        if (err) throw err;
        let loaded_data = JSON.parse(data);

        var events = [];

        for (var key in loaded_data.event) {
            if (loaded_data.event.hasOwnProperty(key)) {
                if (loaded_data.event[key]["pokemon"]) {
                    event = loaded_data.event[key];

                    now = new Date();

                    if (new Date(event["start_date"]) > now) {
                        events.push(event);
                    } else if (new Date(event["end_date"]) < now) {
                        continue;
                    } else {
                        events.push(event);
                    }

                    event["start_date"] = parseSchedule(event["start_date"]);
                    event["end_date"] = parseSchedule(event["end_date"]);

                }
            }
        }

        res.render(path.join(__dirname + '/templates/index.html'), { events: events });
    });

});


app.get('/request-shiny-list', function(req, res) {
    var user_id = req.cookies['user']; // user ID

    res.contentType('json');

    if (user_id == null) {
        res.send({ error: "error" });
    } else {
        res.send({ success: "success" });
    }
});

// shiny list page 
app.get('/shiny-list', function(req, res) {

    var user_id = req.cookies['user']; // user ID
    var user_pokemon_data = {};
    var pokemon_data = [];

    if (user_id == null) {
        res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
        return;
    }

    const user = db.collection('users').doc(user_id);
    const pokemon = db.collection('pokemon');
    const baseQuery = pokemon.where("hasShinyAvailable", "==", true)
        .where("startDate", "<=", admin.firestore.Timestamp.now());

    let userDoc = user.collection("pokemon").get().then(snapshot => {
            snapshot.forEach(doc => {
                user_pokemon_data[doc.id] = doc.data();
            });

            let pokemonDoc = baseQuery.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        data = doc.data();
                        if (user_pokemon_data[doc.id] != undefined) {
                            data["quantity"] = user_pokemon_data[doc.id].quantity;
                        } else {
                            data["quantity"] = 0;
                        }

                        if (user_pokemon_data[doc.id] != undefined && user_pokemon_data[doc.id].lastModified != undefined) {
                            data["lastModified"] = user_pokemon_data[doc.id].lastModified.toDate().toString();
                        } else {
                            data["lastModified"] = new Date(0).toString();
                        }

                        data.startDate = data.startDate.toDate().toString();

                        pokemon_data.push(data);
                    });


                    res.render(path.join(__dirname + '/templates/shiny-list.html'), { pokemon_data: pokemon_data });


                })
                .catch(err => {
                    console.log('Error getting documents', err);
                });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
});


// future shiny list page 
app.get('/future-shiny-list', function(req, res) {

    var user_id = req.cookies['user']; // user ID
    var user_pokemon_data = {};
    var pokemon_data = [];

    const pokemon = db.collection('pokemon');
    const baseQuery = pokemon.where("hasShinyAvailable", "==", true)
        .where("startDate", ">", admin.firestore.Timestamp.fromDate(new Date()))
        //.where("startDate", "<=", admin.firestore.Timestamp.fromDate(new Date()));

    let pokemonDoc = baseQuery.get().then(snapshot => {
            snapshot.forEach(doc => {
                data = doc.data();
                data["startDate"] = parseSchedule(data.startDate.seconds * 1000);

                pokemon_data.push(data);
            });


            res.render(path.join(__dirname + '/templates/future-list.html'), { pokemon_data: pokemon_data });


        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
});


// future shiny list page  
app.get('/future-shiny-list-2', function(req, res) {

    var user_id = req.cookies['user']; // user ID
    var user_pokemon_data = {};
    var pokemon_data = [];

    const pokemon = db.collection('pokemon');
    const baseQuery = pokemon.where("hasShinyAvailable", "==", false);
    //.where("startDate", "<=", admin.firestore.Timestamp.fromDate(new Date()));

    let pokemonDoc = baseQuery.get().then(snapshot => {
            snapshot.forEach(doc => {
                data = doc.data();
                data["startDate"] = "TBA";

                pokemon_data.push(data);
            });


            res.render(path.join(__dirname + '/templates/future-list.html'), { pokemon_data: pokemon_data });


        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
});



// shiny list page 
app.get('/shiny-list-2', function(req, res) {

    // sort and filter list: 
    // ver https://www.codeply.com/go/KvTSAFv2bv/bootstrap-filter-and-sort-cards-with-jquery

    var user_id = req.cookies['user']; // user ID
    var user_pokemon_data = {};
    var pokemon_data = [];

    fs.readFile(path.join(__dirname, 'dist/json/shiny_firestore.json'), (err, data) => {
        if (err) throw err;
        let loaded_data = JSON.parse(data);
        for (var key in loaded_data.pokemon) {
            if (loaded_data.pokemon.hasOwnProperty(key)) {
                var data = loaded_data.pokemon[key];
                data["quantity"] = 2;
                pokemon_data.push(data);

                //if(pokemon_data.length > 10)
                //	break;

            }
        }

        res.render(path.join(__dirname + '/templates/shiny-list.html'), { pokemon_data: pokemon_data });
    });

});




app.get('/shiny-simulator', function(req, res) {

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
                if (loaded_data.event[key]["pokemon"]) {
                    event = loaded_data.event[key];

                    now = new Date();

                    if (new Date(event["start_date"]) > now) {
                        future_events.push(event);
                    } else if (new Date(event["end_date"]) < now) {
                        past_events.push(event);
                    } else {
                        active_events.push(event);
                    }

                    var event_pokemon_list = [];
                    for (var key2 in event.pokemon) {
                        event_pokemon_list.push(event.pokemon[key2]);
                    }

                    event["pokemon"] = event_pokemon_list;


                    event["start_date"] = parseSchedule(event["start_date"]);
                    event["end_date"] = parseSchedule(event["end_date"]);

                }
            }
        }

        res.render(path.join(__dirname + '/templates/shiny-simulator-home.html'), { pokemon_list: pokemon_list, active_events: active_events, past_events: past_events, future_events: future_events });
    });

});


app.post('/shiny-simulator', function(req, res) {

    var pokemon_list = [];
    var pokemon_data = [];

    var eventID = req.body.eventID;

    if (eventID != undefined) {
        fs.readFile(path.join(__dirname, 'dist/json/latest/mypogotool.json'), (err, data) => {
            if (err) throw err;
            let loaded_data = JSON.parse(data);
            if (eventID in loaded_data.event) {
                event = loaded_data.event[eventID];
                for (var key in event["pokemon"]) {
                    if (event["pokemon"].hasOwnProperty(key)) {
                        pokemon_list.push(event["pokemon"][key]["id"]);
                        pokemon_data.push(loaded_data.pokemon[event["pokemon"][key]["id"]])
                    }
                }
            }

            res.render(path.join(__dirname + '/templates/shiny-simulator.html'), { event: event, pokemon_data: pokemon_data, pokemon_list: pokemon_list });
        });
    } else {
        var pokemon_list = req.body.pokemonList.split(",");
        fs.readFile(path.join(__dirname, 'dist/json/latest/mypogotool.json'), (err, data) => {
            if (err) throw err;
            let loaded_data = JSON.parse(data);
            for (var key in loaded_data["pokemon"]) {
                if (loaded_data["pokemon"].hasOwnProperty(key) && pokemon_list.includes(loaded_data["pokemon"][key].id)) {
                    pokemon_list.push(loaded_data["pokemon"][key].id);
                    pokemon_data.push(loaded_data["pokemon"][key])
                }
            }

            res.render(path.join(__dirname + '/templates/shiny-simulator.html'), { event: [], pokemon_data: pokemon_data, pokemon_list: pokemon_list });
        });
    }

});

app.get('/profile-info', function(req, res) {
    var user_id = req.cookies['user']; // user ID

    const user = db.collection('users').doc(user_id);

    res.contentType('json');

    let userDoc = user.get().then(doc => {
            if (!doc.exists) {
                res.send({ error: 'error', message: 'user not found' });
            } else {
                res.send({
                    user_id: doc.data().id,
                    name: doc.data().name,
                    nickname: doc.data().nickname,
                    startDate: parseSchedule(doc.data().startDate.seconds * 1000),
                    picture: doc.data().image,
                    pokemonCaught: doc.data().totalCaught
                });
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
            res.send({ error: 'error', message: 'user not found' });
        });
});

app.post('/update-profile', function(req, res) {

    var user_id = req.cookies['user']; // user ID
    var nickname = req.body.nickname;
    var pokemon_caught = parseInt(req.body.pokemon_caught);

    const userDoc = db.collection('users').doc(user_id);

    let setData = userDoc.update({
        nickname: nickname,
        totalCaught: pokemon_caught
    });

    console.log("User " + user_id + " updated the nickname to " + nickname + " and/or the pokemon caught to " + pokemon_caught);

    res.contentType('json');
    res.send({ success: "success" });

});


// login using GOOGLE
app.post('/google-signin', function(req, res) {

    var uid = req.body.uid;
    var name = req.body.name;
    var picture = req.body.picture;

    const user = db.collection('users').doc(uid);

    res.contentType('json');
    let userDoc = user.get().then(doc => {
            if (!doc.exists) {
                // TODO !!!!
                res.send({ error: 1, msg: "NEED_REGISTER", id: uid, name: name });
            } else {
                res.send({ user_id: doc.data().id, picture: doc.data().image, username: doc.data().username });
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });

});

// register
app.post('/register', function(req, res) {

    var id = req.body.id;
    var name = req.body.name;
    var nickname = req.body.nickname;
    var pokemonCaught = parseInt(req.body.pokemon_caught);

    const usersRef = db.collection('users').doc(id);

    usersRef.set({
        id: id,
        name: name,
        nickname: nickname,
        pokemonCaught: pokemonCaught,
        startDate: admin.firestore.Timestamp.now(),
        lastAccessDate: admin.firestore.Timestamp.now(),
        errorCode: 0,
        version: "1.3.7"
    });

    res.contentType('json');
    let userDoc = usersRef.get().then(doc => {
            if (!doc.exists) {
                // TODO !!!!
                res.send({ error: 0, msg: "REGISTER_ERROR" });
            } else {
                res.send({ success: "success", user_id: doc.data().id, picture: doc.data().image, username: doc.data().username });
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });

});




// update shiny amount
app.post('/update-shiny', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var pokemon_id = req.body.pokemon;
    var quantity = parseInt(req.body.quantity);

    const pokemonDoc = db.collection('users').doc(user_id).collection("pokemon").doc(pokemon_id);

    let setData = pokemonDoc.get().then(doc => {
        if (!doc.exists && quantity > 0) {
            pokemonDoc.set({
                id: pokemon_id,
                quantity: quantity,
                lastModified: admin.firestore.Timestamp.now()
            });
        } else if (quantity > 0) {
            pokemonDoc.update({
                quantity: quantity,
                lastModified: admin.firestore.Timestamp.now()
            });
        } else if (doc.exists && quantity == 0) {
            pokemonDoc.delete();
        }

    });

    console.log("Updating the quantity of shinies of " + pokemon_id + " to " + quantity);
    res.contentType('json');
    res.send({ pokemon_id: pokemon_id, quantity: quantity });

});

app.get('/request-friends', function(req, res) {
    var user_id = req.cookies['user']; // user ID

    res.contentType('json');

    if (user_id == null) {
        res.send({ error: "error" });
    } else {
        res.send({ success: "success" });
    }
});


app.get('/friends', function(req, res) {
    res.status(404).render(path.join(__dirname + '/templates/under-construct.html'), );
});

app.get('/request-stats', function(req, res) {
    var user_id = req.cookies['user']; // user ID

    res.contentType('json');

    if (user_id == null) {
        res.send({ error: "error" });
    } else {
        res.send({ success: "success" });
    }
});

app.get('/stats', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var user_pokemon_data = {};
    var pokemon_data = [];

    if (user_id == null) {
        res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
        return;
    }

    statsController.initializeStatsController();

    const user = db.collection('users').doc(user_id);
    const pokemon = db.collection('pokemon');
    const baseQuery = pokemon.where("hasShinyAvailable", "==", true)
        .where("startDate", "<=", admin.firestore.Timestamp.now());

    let userData = user.get().then(doc => {
        if (doc.exists) {
            statsController.setPokemonCaught(doc.data().totalCaught);
        }
    });

    let userDoc = user.collection("pokemon").get().then(snapshot => {
            snapshot.forEach(doc => {
                user_pokemon_data[doc.id] = doc.data();
            });

            let pokemonDoc = baseQuery.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        data = doc.data();
                        if (user_pokemon_data[doc.id] != undefined) {
                            data["quantity"] = user_pokemon_data[doc.id].quantity;
                        } else {
                            data["quantity"] = 0;
                        }

                        statsController.setPokemon(data);
                    });

                    res.render(path.join(__dirname + '/templates/stats.html'), { data: statsController.getData(), pokemon_caught_percentage: statsController.getShinyPokemonCaughtPercentage() });
                })
                .catch(err => {
                    console.log('Error getting documents', err);
                });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });

});

app.get('/request-stats', function(req, res) {
    var user_id = req.cookies['user']; // user ID

    res.contentType('json');

    if (user_id == null) {
        res.send({ error: "error" });
    } else {
        res.send({ success: "success" });
    }
});

app.get('/teste-stats', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var user_pokemon_data = {};
    var pokemon_data = [];

    if (user_id == null) {
        res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
        return;
    }

    statsController.initializeStatsController();

    res.render(path.join(__dirname + '/templates/stats.html'), { data: statsController.getData() });

});

app.get('*', function(req, res) {
    res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
});


app.listen(process.env.PORT || 8080);



function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function parseSchedule(date) {
    date = new Date(date);

    return (date.getDate() < 10 ? '0' : '') + date.getDate() + "-" + ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1) + "-" + date.getFullYear() +
        " " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

}