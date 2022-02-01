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

// FIREBASE 

const firebase = require('firebase-admin');
require("firebase/storage");

const serviceAccount = require("./service-key.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    apiKey: "AIzaSyDmRmAEccwcgxz5SUmwEuqklfypdM0qC3k",
    authDomain: "shiny-pogo.firebaseapp.com",
    databaseURL: "https://shiny-pogo.firebaseio.com",
    projectId: "shiny-pogo",
    storageBucket: "shiny-pogo.appspot.com",
    messagingSenderId: "608457625867",
    appId: "1:608457625867:web:686af4fa599f39a906d20e",
})

let db = firebase.firestore();
var storage = firebase.storage();


app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

//put static files (js, css, images) into /dist directory
app.use(express.static(path.join(__dirname, 'dist')));
app.use(cookieParser());


// ROUTES


// CONTROLLERS

// home page 
app.get('/', function(req, res) {

    const eventsDB = db.collection('events');

    var events_list = [];

    let eventsDoc = eventsDB.get().then(snapshot => {
        snapshot.forEach(doc => {
            var event = doc.data();

            event["startDateLabel"] = parseSchedule(event["startDate"].seconds * 1000);
            event["endDateLabel"] = parseSchedule(event["endDate"].seconds * 1000);

            now = new Date();

            if (new Date(event["startDate"].seconds * 1000) > now) {
                events_list.push(event);
            } else if (new Date(event["endDate"].seconds * 1000) >= now) {
                events_list.push(event);
            }
        });

        res.render(path.join(__dirname + '/templates/index.html'), { events: events_list });

    }).catch(err => {
        console.log('Error getting documents', err);
    });
});


app.get('/app-data', function(req, res) {
    db.collection('app').doc("web").get().then(snapshot => {
        var data = snapshot.data();
        res.send({ version: data.versionWeb });
    });
});

// get all pokemon without config file
app.get('/pokemon-list', function(req, res) {
    var pokemon_list = [];

    const pokemon = db.collection('pokemon_v2');

    let pokemonDoc = pokemon.get().then(snapshot => {
            snapshot.forEach(doc => {
                var data = doc.data();

                // REMOVE ALL LANGUAGES THAT WE'RE NOT USE TO REDUCE THE DATA SIZE
                var description = data.description.descriptionMale ? data.description.descriptionMale.description_en : data.description.descriptionGeneric.description_en;
                delete data.description;
                data.description = { description_en: description };

                var category = data.category.category_en;
                delete data.category;
                data.category = { category_en: category };

                var listToRemove = [];
                Object.entries(data.pokemonMoves).forEach(([key, value]) => {
                    if (Object.keys(value).length == 0) {
                        listToRemove.push(key);
                    }
                });

                data.startDates.pokemonStartDate = data.startDates.pokemonStartDate.toDate().toString();
                data.startDates.shinyStartDate = data.startDates.shinyStartDate.toDate().toString();

                pokemon_list.push(data);
            });


            pokemon_list = pokemon_list.sort((a, b) => (a.idNumeric > b.idNumeric) ? 1 : -1)


            res.send({ pokemon_list: pokemon_list });

        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
});


// get all pokemon with config file
app.get('/pokemon-list/:config', function(req, res) {
    var pokemon_list = [];
    var config = req.params.config;

    const pokemon = db.collection('pokemon_v2');

    let pokemonDoc = pokemon.get().then(snapshot => {
            snapshot.forEach(doc => {
                var data = doc.data();
                // REMOVE ALL LANGUAGES THAT WE'RE NOT USE TO REDUCE THE DATA SIZE
                var description = data.description.descriptionMale ? data.description.descriptionMale.description_en : data.description.descriptionGeneric.description_en;
                delete data.description;
                data.description = { description_en: description };

                var category = data.category.category_en;
                delete data.category;
                data.category = { category_en: category };

                var listToRemove = [];
                Object.entries(data.pokemonMoves).forEach(([key, value]) => {
                    if (Object.keys(value).length == 0) {
                        listToRemove.push(key);
                    }
                });

                data.startDates.pokemonStartDate = data.startDates.pokemonStartDate.toDate().toString();
                data.startDates.shinyStartDate = data.startDates.shinyStartDate.toDate().toString();

                pokemon_list.push(data);
            });


            pokemon_list = pokemon_list.sort((a, b) => (a.idNumeric > b.idNumeric) ? 1 : -1)

            var fileName = "dist/json/config/pokedex_actions.json";

            // make if for other config files
            if (config && config != "") {
                fileName = "dist/json/config/" + config + "_actions.json";
            }

            fs.readFile(path.join(__dirname, fileName), (err, data) => {
                if (err) throw err;
                let loaded_data = JSON.parse(data);

                res.send({ pokemon_list: pokemon_list, isTemporary: false, actions: loaded_data })
            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
});

app.get('/pokedex', function(req, res) {
    res.render(path.join(__dirname + '/templates/list.html'), { page: "pokedex" });
});

app.get('/config/:config', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var config = req.params.config;

    if (user_id == null) {
        res.send({ error: 'error', message: 'not logged in' });
        return;
    }

    var fileName = "dist/json/config/pokedex_actions.json";

    // make if for other config files
    if (config && config != "") {
        fileName = "dist/json/config/" + config + "_actions.json";
    }

    fs.readFile(path.join(__dirname, fileName), (err, data) => {
        if (err) throw err;
        let loaded_data = JSON.parse(data);

        res.send({ actions: loaded_data })
    });
});

// move list to test only
app.get('/pokemon-list-test', function(req, res) {
    var pokemon_list = [];

    fs.readFile(path.join(__dirname, 'dist/json/pokemon_list.json'), (err, data) => {
        if (err) throw err;
        let loaded_data = JSON.parse(data);
        for (var key in loaded_data.pokemon_list) {
            if (loaded_data.pokemon_list.hasOwnProperty(key)) {
                var data = loaded_data.pokemon_list[key];
                pokemon_list.push(data);

                if (pokemon_list.length > 100)
                    break;

            }
        }

        pokemon_list = pokemon_list.sort((a, b) => (a.idNumeric > b.idNumeric) ? 1 : -1);

        var fileName = "dist/json/config/pokedex_actions.json";

        // make if for other config files

        fs.readFile(path.join(__dirname, fileName), (err, data) => {
            if (err) throw err;
            let loaded_data = JSON.parse(data);

            res.send({ pokemon_list: pokemon_list, isTemporary: false, actions: loaded_data })
        });
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

app.get('/shiny-list', function(req, res) {
    var user_id = req.cookies['user']; // user ID

    if (user_id == null) {
        res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
        return;
    }

    res.render(path.join(__dirname + '/templates/list.html'), { page: "shiny-list" });
});

app.get('/shiny-list-temp', function(req, res) {
    var user_id = req.cookies['user']; // user ID

    if (user_id == null) {
        res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
        return;
    }

    res.render(path.join(__dirname + '/templates/list.html'), { page: "shiny-list-temp" });
});

app.get('/shiny-list-config', function(req, res) {
    var user_id = req.cookies['user']; // user ID

    if (user_id == null) {
        res.send({ error: 'error', message: 'not logged in' });
        return;
    }

    fs.readFile(path.join(__dirname, 'dist/json/config/shinylist_actions.json'), (err, data) => {
        if (err) throw err;
        let loaded_data = JSON.parse(data);

        res.send({ actions: loaded_data })
    });
});


// shiny list data 
app.post('/shiny-list-data/:user_id', function(req, res) {
    var user_id = req.params.user_id; // user ID
    var light = req.body.light;
    var user_pokemon_data = {};
    var pokemon_data = [];

    if (user_id == null) {
        res.send({ error: 'error', message: 'not logged in' });
        return;
    }

    const user = db.collection('users').doc(user_id);

    fs.readFile(path.join(__dirname, 'dist/json/config/shinylist_actions.json'), (err, fileData) => {
        if (err) throw err;
        let loaded_data = JSON.parse(fileData);

        // GET USER SHINYLIST DATA
        user.collection("pokemon").get().then(snapshot => {
            snapshot.forEach(doc => {
                user_pokemon_data[doc.id] = doc.data();
                if (user_pokemon_data[doc.id].quantity) {
                    user_pokemon_data[doc.id].quantity = user_pokemon_data[doc.id].quantity;
                } else {
                    user_pokemon_data[doc.id].quantity = 0;
                }

                if (user_pokemon_data[doc.id].lastModified != undefined) {
                    user_pokemon_data[doc.id]["lastModified"] = user_pokemon_data[doc.id]["lastModified"].toDate().toString();
                } else {
                    user_pokemon_data[doc.id]["lastModified"] = new Date(0).toString();
                }

                if (user_pokemon_data[doc.id].startSeen != undefined) {
                    user_pokemon_data[doc.id]["startSeen"] = user_pokemon_data[doc.id].startSeen;
                } else {
                    user_pokemon_data[doc.id]["startSeen"] = 0;
                }

                if (user_pokemon_data[doc.id].currentSeen != undefined) {
                    user_pokemon_data[doc.id]["currentSeen"] = user_pokemon_data[doc.id].currentSeen;
                } else {
                    user_pokemon_data[doc.id]["currentSeen"] = 0;
                }
            });

            // GET USER MEGA SHINYLIST DATA
            user.collection("tempPokemon").get().then(tempSnap => {
                tempSnap.forEach(tempDoc => {
                    user_pokemon_data[tempDoc.id] = tempDoc.data();
                    if (user_pokemon_data[tempDoc.id].quantity) {
                        user_pokemon_data[tempDoc.id].quantity = user_pokemon_data[tempDoc.id].quantity;
                    } else {
                        user_pokemon_data[tempDoc.id].quantity = 0;
                    }

                    if (user_pokemon_data[tempDoc.id].lastModified != undefined) {
                        user_pokemon_data[tempDoc.id]["lastModified"] = user_pokemon_data[tempDoc.id]["lastModified"].toDate().toString();
                    } else {
                        user_pokemon_data[tempDoc.id]["lastModified"] = new Date(0).toString();
                    }

                    if (user_pokemon_data[tempDoc.id].startSeen != undefined) {
                        user_pokemon_data[tempDoc.id]["startSeen"] = user_pokemon_data[tempDoc.id].startSeen;
                    } else {
                        user_pokemon_data[tempDoc.id]["startSeen"] = 0;
                    }

                    if (user_pokemon_data[tempDoc.id].currentSeen != undefined) {
                        user_pokemon_data[tempDoc.id]["currentSeen"] = user_pokemon_data[tempDoc.id].currentSeen;
                    } else {
                        user_pokemon_data[tempDoc.id]["currentSeen"] = 0;
                    }
                });

                // IF IT'S THE LIGHT VERSION, ONLY RETURNS THE USER DATA AND THE CONFIG FILE
                if (light) {
                    res.send({ user_data: user_pokemon_data, actions: loaded_data });
                    // OTHERSIDE, ALSO RETURNS THE POKEMON DATA
                } else {
                    db.collection('pokemon_v2').get().then(snapshot => {
                        snapshot.forEach(doc => {
                            var data = doc.data();

                            // REMOVE ALL LANGUAGES THAT WE'RE NOT USE TO REDUCE THE DATA SIZE
                            var description = data.description.descriptionMale ? data.description.descriptionMale.description_en : data.description.descriptionGeneric.description_en;
                            delete data.description;
                            data.description = { description_en: description };

                            var category = data.category.category_en;
                            delete data.category;
                            data.category = { category_en: category };

                            var listToRemove = [];
                            Object.entries(data.pokemonMoves).forEach(([key, value]) => {
                                if (Object.keys(value).length == 0) {
                                    listToRemove.push(key);
                                }
                            });

                            listToRemove.forEach((key) => delete data.pokemonMoves[key]);

                            if (user_pokemon_data[doc.id] != undefined) {
                                data["quantity"] = user_pokemon_data[doc.id].quantity;
                            } else {
                                data["quantity"] = 0;
                            }

                            if (user_pokemon_data[doc.id] != undefined && user_pokemon_data[doc.id].lastModified != undefined) {
                                data["lastModified"] = user_pokemon_data[doc.id].lastModified;
                            } else {
                                data["lastModified"] = new Date(0).toString();
                            }

                            if (user_pokemon_data[doc.id] != undefined && user_pokemon_data[doc.id].startSeen != undefined) {
                                data["startSeen"] = user_pokemon_data[doc.id].startSeen;
                            } else {
                                data["startSeen"] = 0;
                            }

                            if (user_pokemon_data[doc.id] != undefined && user_pokemon_data[doc.id].currentSeen != undefined) {
                                data["currentSeen"] = user_pokemon_data[doc.id].currentSeen;
                            } else {
                                data["currentSeen"] = 0;
                            }

                            data.startDates.pokemonStartDate = data.startDates.pokemonStartDate.toDate().toString();
                            data.startDates.shinyStartDate = data.startDates.shinyStartDate.toDate().toString();

                            if (data.availability.isPokemonAvailable) {
                                pokemon_data.push(data);
                            }
                        });

                        pokemon_data = pokemon_data.sort((a, b) => (a.idNumeric > b.idNumeric) ? 1 : -1);
                        res.send({ pokemon_list: pokemon_data, actions: loaded_data });
                    }).catch(err => {
                        console.log('Error getting documents', err);
                    });
                }
            }).catch(err => {
                console.log('Error getting documents', err);
            });
        }).catch(err => {
            console.log('Error getting documents', err);
        });
    });
});

// future shiny list page 
app.get('/future-list/', function(req, res) {
    if (req.query.type == "pokemon" || req.query.type == "shiny") {
        res.render(path.join(__dirname + '/templates/list.html'), { page: "future-list" });
    } else {
        res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
    }
});

app.get('/future-list-2/', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var isDeveloper = req.cookies['isDeveloper']; // user ID

    if (user_id == null || !isDeveloper || (req.query.type != "pokemon" && req.query.type != "shiny")) {
        res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
        return;
    } else {
        res.render(path.join(__dirname + '/templates/list.html'), { page: "future-list-2" });
    }
});


// shiny list page 
app.get('/shiny-list-test', function(req, res) {

    // sort and filter list: 
    // ver https://www.codeply.com/go/KvTSAFv2bv/bootstrap-filter-and-sort-cards-with-jquery

    var user_id = req.cookies['user']; // user ID
    var user_pokemon_data = {};
    var pokemon_data = [];

    fs.readFile(path.join(__dirname, 'dist/json/shiny_firestore_v2_mega.json'), (err, data) => {
        if (err) throw err;
        let loaded_data = JSON.parse(data);
        for (var key in loaded_data.pokemon_v2) {
            if (loaded_data.pokemon_v2.hasOwnProperty(key)) {
                var data = loaded_data.pokemon_v2[key];
                data["quantity"] = Math.floor(Math.random() * 10);

                data.startDateLabel = "16-07-2021 23:00";

                pokemon_data.push(data);

                if (pokemon_data.length > 10)
                    break;

            }
        }

        pokemon_data = pokemon_data.sort((a, b) => (a.idNumeric > b.idNumeric) ? 1 : -1)

        fs.readFile(path.join(__dirname, 'dist/json/config/shinylist_actions.json'), (err, data) => {
            if (err) throw err;
            let loaded_data = JSON.parse(data);

            res.send({ pokemon_list: pokemon_data, isTemporary: false, actions: loaded_data })

        });
    });

});



// LUCKY LIST FEATURE
app.get('/request-lucky-list', function(req, res) {
    var user_id = req.cookies['user']; // user ID

    res.contentType('json');

    if (user_id == null) {
        res.send({ error: "error" });
    } else {
        res.send({ success: "success" });
    }
});


app.get('/lucky-list', function(req, res) {
    var user_id = req.cookies['user']; // user ID

    if (user_id == null) {
        res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
        return;
    }

    res.render(path.join(__dirname + '/templates/list.html'), { page: "lucky-list" });
});

app.get('/lucky-list-config', function(req, res) {
    var user_id = req.cookies['user']; // user ID

    if (user_id == null) {
        res.send({ error: 'error', message: 'not logged in' });
        return;
    }

    fs.readFile(path.join(__dirname, 'dist/json/config/luckylist_actions.json'), (err, data) => {
        if (err) throw err;
        let loaded_data = JSON.parse(data);

        res.send({ actions: loaded_data })
    });
});


// lucky list data 
app.post('/lucky-list-data/:user_id', function(req, res) {
    var user_id = req.params.user_id; // user ID
    var light = req.body.light;
    var user_pokemon_data = {};
    var pokemon_data = [];

    if (user_id == null) {
        res.send({ error: 'error', message: 'not logged in' });
        return;
    }

    const user = db.collection('users').doc(user_id);

    fs.readFile(path.join(__dirname, 'dist/json/config/luckylist_actions.json'), (err, fileData) => {
        if (err) throw err;
        let loaded_data = JSON.parse(fileData);

        // GET USER LUCKYLIST DATA
        user.collection("luckyPokemon").get().then(snapshot => {
            snapshot.forEach(luckyDoc => {
                user_pokemon_data[luckyDoc.id] = luckyDoc.data();
            });

            // IF IT'S THE LIGHT VERSION, ONLY RETURNS THE USER DATA AND THE CONFIG FILE
            if (light) {
                res.send({ user_data: user_pokemon_data, actions: loaded_data });
                // OTHERSIDE, ALSO RETURNS THE POKEMON DATA
            } else {
                db.collection('pokemon_v2').get().then(snapshot => {
                    snapshot.forEach(doc => {
                        var data = doc.data();

                        // REMOVE ALL LANGUAGES THAT WE'RE NOT USE TO REDUCE THE DATA SIZE
                        var description = data.description.descriptionMale ? data.description.descriptionMale.description_en : data.description.descriptionGeneric.description_en;
                        delete data.description;
                        data.description = { description_en: description };

                        var category = data.category.category_en;
                        delete data.category;
                        data.category = { category_en: category };

                        var listToRemove = [];
                        Object.entries(data.pokemonMoves).forEach(([key, value]) => {
                            if (Object.keys(value).length == 0) {
                                listToRemove.push(key);
                            }
                        });

                        if (user_pokemon_data[doc.id] != undefined) {
                            data["hasLucky"] = true;
                        } else if (data.isMainLucky) {
                            data["hasLucky"] = false;
                        }

                        data.startDates.pokemonStartDate = data.startDates.pokemonStartDate.toDate().toString();
                        data.startDates.shinyStartDate = data.startDates.shinyStartDate.toDate().toString();

                        if (data.availability.isPokemonAvailable) {
                            pokemon_data.push(data);
                        }

                    });

                    pokemon_data = pokemon_data.sort((a, b) => (a.idNumeric > b.idNumeric) ? 1 : -1);
                    res.send({ pokemon_list: pokemon_data, actions: loaded_data });
                }).catch(err => {
                    console.log('Error getting documents', err);
                });
            }
        }).catch(err => {
            console.log('Error getting documents', err);
        });
    });
});


// update lucky dex
app.post('/update-lucky', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var pokemon_id = req.body.pokemon;
    var hasLucky = req.body.hasLucky ? req.body.hasLucky == "true" : false;
    var lastModified = firebase.firestore.Timestamp.now();
    var quantity = parseInt(req.body.quantity);

    const pokemonDoc = db.collection('users').doc(user_id).collection("luckyPokemon").doc(pokemon_id);

    let setData = pokemonDoc.get().then(doc => {
        if (!doc.exists && hasLucky) {
            pokemonDoc.set({
                id: pokemon_id,
                quantity: quantity,
                lastModified: lastModified
            });
        } else if (doc.exists && !hasLucky) {
            pokemonDoc.delete();
        }
    });

    console.log("Updating the lucky dex of " + pokemon_id + " to :" + hasLucky);
    res.contentType('json');
    res.send({ pokemon_id: pokemon_id, lastModified: lastModified.toDate().toString() });

});




// MOVES FEATURE
app.get('/moves', function(req, res) {
    res.render(path.join(__dirname + '/templates/list.html'), { page: "moves" });
});


app.get('/moves-list', function(req, res) {
    var moves_list = [];

    const moves = db.collection('moves');

    let movesDoc = moves.get().then(snapshot => {
            snapshot.forEach(doc => {
                var data = doc.data();
                moves_list.push(data);
            });


            moves_list = moves_list.sort((a, b) => (a.name > b.name) ? 1 : -1);

            res.send({ moves_list: moves_list });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
});

app.get('/moves-list/config', function(req, res) {
    var moves_list = [];

    const moves = db.collection('moves');

    let movesDoc = moves.get().then(snapshot => {
            snapshot.forEach(doc => {
                var data = doc.data();
                moves_list.push(data);
            });


            moves_list = moves_list.sort((a, b) => (a.name > b.name) ? 1 : -1);


            fs.readFile(path.join(__dirname, "dist/json/config/moves_actions.json"), (err, data) => {
                if (err) throw err;
                let loaded_data = JSON.parse(data);

                res.send({ moves_list: moves_list, actions: loaded_data });
            });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
});

// move list to test only
app.get('/moves-list-test', function(req, res) {
    var moves_list = [];

    fs.readFile(path.join(__dirname, 'dist/json/moves_list.json'), (err, data) => {
        if (err) throw err;
        let loaded_data = JSON.parse(data);
        for (var key in loaded_data.moves_list) {
            if (loaded_data.moves_list.hasOwnProperty(key)) {
                var data = loaded_data.moves_list[key];
                moves_list.push(data);

            }
        }

        moves_list = moves_list.sort((a, b) => (a.name > b.name) ? 1 : -1);

        res.send({ moves_list: moves_list });
    });

});




app.get('/shiny-simulator', function(req, res) {

    res.render(path.join(__dirname + '/templates/shiny-simulator-home.html'), {});
});

app.get('/event-list', function(req, res) {

    const eventsDB = db.collection('events');

    var events_list = [];

    let eventsDoc = eventsDB.get().then(snapshot => {
        snapshot.forEach(doc => {
            var event = doc.data();

            var event_pokemon_list = [];
            for (var key in event.pokemon) {
                event_pokemon_list.push(event.pokemon[key]);
            }

            event["pokemon"] = event_pokemon_list;
            event["startDate_label"] = parseSchedule(event.startDate.seconds * 1000);
            event["endDate_label"] = parseSchedule(event.endDate.seconds * 1000);


            event.startDate = event.startDate.toDate().toString();
            event.endDate = event.endDate.toDate().toString();

            var collator = new Intl.Collator([], { numeric: true });
            event.pokemon.sort((a, b) => collator.compare(a.id, b.id));

            events_list.push(event);
        });

        fs.readFile(path.join(__dirname, "dist/json/config/events_actions.json"), (err, data) => {
            if (err) throw err;
            let loaded_data = JSON.parse(data);

            res.contentType('json');
            res.send({ event_list: events_list, actions: loaded_data });
        });


    }).catch(err => {
        console.log('Error getting documents', err);
    });
});


// test event list request
app.get('/event-list-test', function(req, res) {
    var events_list = [];

    fs.readFile(path.join(__dirname, 'dist/json/events.json'), (err, data) => {
        if (err) throw err;
        let loaded_data = JSON.parse(data);
        for (var key in loaded_data.event_list) {
            if (loaded_data.event_list.hasOwnProperty(key)) {
                var event = loaded_data.event_list[key];

                var collator = new Intl.Collator([], { numeric: true });
                event.pokemon.sort((a, b) => collator.compare(a.id, b.id));


                events_list.push(event);
            }
        }

        fs.readFile(path.join(__dirname, "dist/json/config/events_actions.json"), (err, data) => {
            if (err) throw err;
            let loaded_data = JSON.parse(data);

            res.contentType('json');
            res.send({ event_list: events_list, actions: loaded_data });
        });
    });
});


app.post('/shiny-simulator', function(req, res) {

    var pokemon_list = [];
    var pokemon_data = [];

    var eventID = req.body.eventID;
    var isPremium = req.body.isPremium === "true";

    if (eventID != undefined) {
        const eventsDB = db.collection('events');

        let eventsDoc = eventsDB.doc(eventID).get().then(doc => {
                if (!doc.exists) {
                    res.send({ error: 'error', message: 'event not found' });
                } else {
                    eventData = doc.data();

                    for (var key in eventData.pokemon) {
                        if (isPremium || !eventData.pokemon[key].isPremium) {
                            pokemon_list.push(eventData.pokemon[key].id);
                        }
                    }

                    let eventsPokemonDocData = db.collection('pokemon_v2').get().then(snapshot2 => {
                        snapshot2.forEach(doc2 => {
                            if (pokemon_list.includes(doc2.data().id)) {
                                var data = doc2.data();
                                delete data.description;
                                pokemon_data.push(data);
                            }
                        });

                        res.render(path.join(__dirname + '/templates/shiny-simulator.html'), { event: eventData, pokemon_data: pokemon_data, isPremium: isPremium });
                    });
                }
            })
            .catch(err => {
                console.log('Error getting document', err);
                res.send({ error: 'error', message: 'event not found' });
            });
    } else {
        const pokemonQuery = db.collection('pokemon_v2');
        pokemon_list_tmp = req.body.pokemonList.split(",");
        let eventsPokemonDocData = pokemonQuery.get().then(snapshot2 => {
            snapshot2.forEach(doc => {
                if (pokemon_list_tmp.includes(doc.data().id)) {
                    var data = doc.data();
                    delete data.description;
                    pokemon_data.push(data);
                    pokemon_list.push(data.id);
                }
            });

            res.render(path.join(__dirname + '/templates/shiny-simulator.html'), { event: [], pokemon_data: pokemon_data, pokemon_list: pokemon_list });
        });
    }

});


app.get('/profile-info', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var levels = {};

    const user = db.collection('users').doc(user_id);

    res.contentType('json');

    let levelsDoc = db.collection('levels').get().then(snapshot => {
            snapshot.forEach(doc => {
                levels[doc.id] = doc.data();
            });

            let userDoc = user.get().then(doc2 => {
                    if (!doc2.exists) {
                        res.send({ error: 'error', message: 'user not found' });
                    } else {

                        level = 0;
                        Object.entries(levels).forEach((value, key) => {
                            if (doc2.data().stats && parseInt(doc2.data().stats.playerXP) >= parseInt(value[1].totalXp) && !value[1].extraRequirements) {
                                level = parseInt(value[1].number)
                            }
                        });

                        if (doc2.data().stats && doc2.data().stats.playerLevel > level) {
                            level = doc2.data().stats.playerLevel;
                        }

                        res.send({
                            user_id: doc2.data().id,
                            name: doc2.data().name,
                            nickname: doc2.data().nickname,
                            startDate: parseSchedule(doc2.data().startDate.seconds * 1000),
                            picture: doc2.data().image,
                            level: level,
                            xp: doc2.data().stats ? doc2.data().stats.playerXP : "",
                        });
                    }
                })
                .catch(err => {
                    console.log('Error getting document', err);
                    res.send({ error: 'error', message: 'user not found' });
                });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
});


app.get('/profile-info/:property', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var property = req.params.property;

    if (user_id == null) {
        res.send({ error: 'error', message: 'not logged in' });
        return;
    }

    if (property == null) {
        res.send({ error: 'error', message: 'undefined property' });
        return;
    }

    res.contentType('json');

    db.collection('users').doc(user_id).get().then(doc => {
            if (!doc.exists) {
                res.send({ error: 'error', message: 'user not found' });
            } else {
                if (doc.data()[property]) {
                    var returnObj = {};
                    returnObj[property] = doc.data()[property];
                    res.send(returnObj);
                } else {
                    res.send({ error: 'error', message: 'property ' + property + " not exists" });
                }
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
    var level = parseInt(req.body.level);
    var xp = parseInt(req.body.xp);
    var levels = {};

    const userDoc = db.collection('users').doc(user_id);

    let levelsDoc = db.collection('levels').get().then(snapshot => {
        snapshot.forEach(doc => {
            levels[doc.id] = doc.data();
        });

        computedLevel = 0;
        Object.entries(levels).forEach((value, key) => {
            if (parseInt(xp) >= parseInt(value[1].totalXp) && !value[1].extraRequirements) {
                computedLevel = parseInt(value[1].number)
            }
        });


        if (level && level > computedLevel) {
            levelStr = level < 10 ? "0" + level : level.toString();
            levelXP = levels["PLAYER_LEVEL_" + levelStr].totalXp;
            if (parseInt(xp) >= parseInt(levelXP)) {
                computedLevel = level;
            }
        }

        let setData = userDoc.update({
            nickname: nickname,
            stats: {
                playerLevel: computedLevel,
                playerXP: xp
            },
            lastDates: {
                lastModifiedStats: firebase.firestore.Timestamp.now()
            }
        })

        console.log("User " + user_id + " updated the nickname to " + nickname + " and/or the level to " + computedLevel + " and/or the XP to " + xp);

        res.contentType('json');
        res.send({ success: "success", playerLevel: computedLevel });
    });

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
                db.collection('app').doc("web").get().then(snapshot => {
                    var data = snapshot.data();
                    var isDeveloper = data.developerUserIds.includes(doc.data().id);
                    user.update({
                        lastDates: {
                            lastWebAccessDate: firebase.firestore.Timestamp.now(),
                        },
                    });
                    res.send({ user_id: doc.data().id, picture: doc.data().image, username: doc.data().nickname, version: data.versionWeb, isDeveloper: isDeveloper });
                });
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });

});

// register
app.post('/register', function(req, res) {
    var levels = {};

    var id = req.body.id;
    var name = req.body.name;
    var nickname = req.body.nickname;
    var level = isNaN(req.body.level) ? "" : parseInt(req.body.level);
    var xp = isNaN(req.body.xp) ? "" : parseInt(req.body.xp);

    db.collection('levels').get().then(snapshot => {
        snapshot.forEach(levelDoc => {
            levels[levelDoc.id] = levelDoc.data();
        });

        computedLevel = 0;
        if (xp != "") {
            Object.entries(levels).forEach((value, key) => {
                if (parseInt(xp) >= parseInt(value[1].totalXp) && !value[1].extraRequirements) {
                    computedLevel = parseInt(value[1].number)
                }
            });
        }

        if (level != "" && level > computedLevel) {
            levelStr = level < 10 ? "0" + level : level.toString();
            levelXP = levels["PLAYER_LEVEL_" + levelStr].totalXp;
            if (parseInt(xp) >= parseInt(levelXP)) {
                computedLevel = level;
            }
        }


        const usersRef = db.collection('users').doc(id);

        usersRef.set({
            id: id,
            name: name,
            nickname: nickname,
            stats: {
                playerLevel: computedLevel,
                playerXP: xp
            },
            lastDates: {
                lastModifiedStats: firebase.firestore.Timestamp.now(),
                lastWebAccessDate: firebase.firestore.Timestamp.now(),
            },
            errorCode: 0,
        });

        res.contentType('json');
        let userDoc = usersRef.get().then(doc => {
                if (!doc.exists) {
                    // TODO !!!!
                    res.send({ error: 0, msg: "REGISTER_ERROR" });
                } else {
                    db.collection('app').doc("web").get().then(snapshot => {
                        var data = snapshot.data();
                        var isDeveloper = data.developerUserIds.includes(doc.data().id);
                        user.update({ lastWebAccessDate: firebase.firestore.Timestamp.now() });
                        res.send({ success: "success", user_id: doc.data().id, picture: doc.data().image, username: doc.data().username, version: data.versionWeb, isDeveloper: isDeveloper });
                    });
                }
            })
            .catch(err => {
                console.log('Error getting document', err);
            });
    });

});


app.post('/update-last-access', function(req, res) {
    var uid = req.body.uid;

    if (uid == null) {
        res.send({ error: 'error', message: 'not logged in' });
        return;
    }

    const user = db.collection('users').doc(uid);

    res.contentType('json');
    user.get().then(doc => {
            if (!doc.exists) {
                res.send({ error: true });
            } else {
                user.update({
                    lastDates: {
                        lastWebAccessDate: firebase.firestore.Timestamp.now(),
                    },
                });
                res.send({ success: true });
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
            res.send({ error: true });
        });
});


app.post('/update-profile-photo', function(req, res) {
    var uid = req.body.user_id;
    var photo = req.body.photo;

    if (uid == null) {
        res.send({ error: 'error', message: 'not logged in' });
        return;
    }

    if (photo == null) {
        res.send({ error: 'error', message: 'undefined photo' });
        return;
    }

    const user = db.collection('users').doc(uid);

    res.contentType('json');
    user.get().then(doc => {
            if (!doc.exists) {
                res.send({ error: 'error', message: 'error updating photo' });
            } else {
                user.update({ image: photo });
                res.send({ success: true });
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
            res.send({ error: 'error', message: 'error updating photo' });
        });
});


// MEDALS

app.get('/medals', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var user_medals_list = {};
    var medals_list = [];
    var target = "0";

    res.contentType('json');

    const user = db.collection('users').doc(user_id);
    const medals = db.collection('medals');

    let userDoc = user.collection("medals").get().then(snapshot => {
            snapshot.forEach(doc => {
                user_medals_list[doc.id] = doc.data();
            });

            let medalsDoc = medals.get().then(snapshot2 => {
                    snapshot2.forEach(doc2 => {
                        var data = doc2.data();
                        if (user_medals_list[doc2.id] != undefined) {
                            data["total"] = user_medals_list[doc2.id].total;
                        } else {
                            data["total"] = 0;
                        }

                        medals_list.push(data);
                    });


                    res.contentType('json');
                    res.send({ medals_list: medals_list });

                })
                .catch(err => {
                    console.log('Error getting documents', err);
                });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
});

// update medal total
app.post('/update-medal', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var medal_id = req.body.medal;
    var total = parseInt(req.body.total);
    var lastModified = firebase.firestore.Timestamp.now();

    const medalDoc = db.collection('users').doc(user_id).collection("medals").doc(medal_id);

    let setData = medalDoc.get().then(doc => {
        if (!doc.exists && total > 0) {
            medalDoc.set({
                id: medal_id,
                total: total,
                lastModified: lastModified
            });
        } else if (total > 0) {
            medalDoc.update({
                total: total,
                lastModified: lastModified
            });
        } else if (doc.exists && total == 0) {
            medalDoc.delete();
        }
    });

    console.log("Updating the total of " + medal_id + " to " + total);
    res.contentType('json');
    res.send({ medal_id: medal_id, total: total });

});



// update shiny amount
app.post('/update-shiny', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var pokemon_id = req.body.pokemon;
    var quantity = parseInt(req.body.quantity);
    var isTemporary = req.body.isTemporary ? req.body.isTemporary == "true" : false;
    var collection = isTemporary ? "tempPokemon" : "pokemon";
    var lastModified = firebase.firestore.Timestamp.now();

    console.log(req.body);

    const pokemonDoc = db.collection('users').doc(user_id).collection(collection).doc(pokemon_id);

    let setData = pokemonDoc.get().then(doc => {
        if (!doc.exists && quantity > 0) {
            pokemonDoc.set({
                id: pokemon_id,
                quantity: quantity,
                lastModified: lastModified
            });
        } else if (quantity > 0) {
            pokemonDoc.update({
                quantity: quantity,
                lastModified: lastModified
            });
        } else if (doc.exists && quantity == 0) {
            pokemonDoc.delete();
        }
    });

    console.log("Updating the quantity of shinies of " + pokemon_id + " to " + quantity);
    res.contentType('json');
    res.send({ pokemon_id: pokemon_id, quantity: quantity, lastModified: lastModified.toDate().toString() });

});

app.post('/update-checks', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var pokemon_id = req.body.pokemon;
    var startSeen = parseInt(req.body.startSeen);
    var currentSeen = parseInt(req.body.currentSeen);

    console.log(req.body);

    const pokemonDoc = db.collection('users').doc(user_id).collection("pokemon").doc(pokemon_id);

    let setData = pokemonDoc.get().then(doc => {
        if (!doc.exists) {
            pokemonDoc.set({
                id: pokemon_id,
                quantity: 0,
                startSeen: startSeen,
                currentSeen: currentSeen,
            });
        } else {
            pokemonDoc.update({
                startSeen: startSeen,
                currentSeen: currentSeen
            });
        }
    });

    res.contentType('json');
    res.send({ pokemon_id: pokemon_id, startSeen: startSeen, currentSeen: currentSeen });

});

// FRIENDS FEATURE

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
    res.render(path.join(__dirname + '/templates/under-construct.html'), {});
});


app.get('/friends/:id', function(req, res) {
    var user_id = req.params.id;

    const friendsDB = db.collection('users').doc(user_id).collection('friends');

    var friends_list = {};

    let friendsDoc = friendsDB.get().then(snapshot => {
        var friends_id_list = [];
        snapshot.forEach(doc => {
            var friend = doc.data();
            friends_id_list.push(friend.id);
            friends_list[friend.id] = friend;
        });

        let friendsDataDoc = db.collection('users').where('id', 'in', friends_id_list).get().then(snapshot2 => {
            snapshot2.forEach(doc2 => {
                var friendData = doc2.data();
                friends_list[friendData.id].name = friendData.name;
                friends_list[friendData.id].nickname = friendData.nickname;
                friends_list[friendData.id].image = friendData.image;
                friends_list[friendData.id].lastAccess = friendData.lastAccessDate;
            });

            res.contentType('json');
            res.send({ friends_list: friends_list });

        }).catch(err => {
            console.log('Error getting documents', err);
        });

    }).catch(err => {
        console.log('Error getting documents', err);
    });
});

app.post('/friends/shiny-compare', function(req, res) {
    var userA = req.body.userA;
    var userB = req.body.userB;
    var userC = req.body.userC;

    console.log(req.body);

    const user = db.collection('users');
    const pokemon = db.collection('pokemon_v2');
    const baseQuery = pokemon.where("availability.hasShinyAvailable", "==", true)
        .where("startDates.shinyStartDate", "<=", firebase.firestore.Timestamp.now());

    var pokemon_data = {};

    let pokemonDoc = baseQuery.get().then(snapshot => {
        snapshot.forEach(doc => {
            var data = {};

            data.id = doc.data().id;
            data.name = doc.data().name;
            data.image = doc.data().image;
            data.shinyStartDate = doc.data().startDates.shinyStartDate.toDate().toString();
            data.pokemon_id = doc.data().idNumeric;

            data.userAQuantity = 0;
            data.userBQuantity = 0;
            data.userCQuantity = 0;

            pokemon_data[data.id] = data;
        });

        let userDocA = user.doc(userA).collection("pokemon").get().then(snapshot => {
            snapshot.forEach(doc => {
                pokemon_data[doc.data().id].userAQuantity = doc.data().quantity;
            });

            let userDocB = user.doc(userB).collection("pokemon").get().then(snapshot => {
                snapshot.forEach(doc => {
                    pokemon_data[doc.data().id].userBQuantity = doc.data().quantity;
                });

                let userDocC = user.doc(userC).collection("pokemon").get().then(snapshot => {
                    snapshot.forEach(doc => {
                        pokemon_data[doc.data().id].userCQuantity = doc.data().quantity;
                    });

                    res.contentType('json');
                    res.send({ pokemon_data: pokemon_data });

                }).catch(err => {
                    console.log('Error getting documents', err);
                });

            }).catch(err => {
                console.log('Error getting documents', err);
            });

        }).catch(err => {
            console.log('Error getting documents', err);
        });

    }).catch(err => {
        console.log('Error getting documents', err);
    });
});


app.get('*', function(req, res) {
    res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
});


app.listen(process.env.PORT || 8080);


//open('http://localhost:8080');
console.log("Running at Port 8080");




function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

function parseSchedule(date) {
    date = new Date(date);

    return (date.getDate() < 10 ? '0' : '') + date.getDate() + "-" + ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1) + "-" + date.getFullYear() +
        " " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

}