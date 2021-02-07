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
const { data } = require("jquery");

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
    const baseQuery = pokemon.where("hasShinyAvailable", "==", true).where("isTemporary", "==", false)
        .where("startDate", "<=", admin.firestore.Timestamp.now());

    let userDoc = user.collection("pokemon").get().then(snapshot => {
            snapshot.forEach(doc => {
                user_pokemon_data[doc.id] = doc.data();
            });

            let pokemonDoc = baseQuery.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        var data = doc.data();
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

// shiny list temp page 
app.get('/shiny-list-temp', function(req, res) {

    var user_id = req.cookies['user']; // user ID
    var user_pokemon_data = {};
    var pokemon_data = [];

    if (user_id == null) {
        res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
        return;
    }

    const user = db.collection('users').doc(user_id);
    const pokemon = db.collection('pokemon');
    const baseQuery = pokemon.where("hasShinyAvailable", "==", true).where("isTemporary", "==", true)
        .where("startDate", "<=", admin.firestore.Timestamp.now());

    let userDoc = user.collection("tempPokemon").get().then(snapshot => {
            snapshot.forEach(doc => {
                user_pokemon_data[doc.id] = doc.data();
            });

            let pokemonDoc = baseQuery.get().then(snapshot => {
                    snapshot.forEach(doc => {
                        var data = doc.data();
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
                var data = doc.data();
                data.startDateLabel = parseSchedule(data.startDate.seconds * 1000);
                data.startDate = data.startDate.toDate().toString();
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
                var data = doc.data();
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

    res.render(path.join(__dirname + '/templates/shiny-simulator-home.html'), {});
});


app.get('/pokemon-list', function(req, res) {

    const pokemon = db.collection('pokemon');

    var pokemon_list = [];

    let pokemonDoc = pokemon.where("filters.shadow", "==", false).where("filters.purified", "==", false).get().then(snapshot => {
        snapshot.forEach(doc => {
            var data = doc.data();
            pokemon_list.push(data);
        });

        res.contentType('json');
        res.send({ pokemon_list: pokemon_list });

    }).catch(err => {
        console.log('Error getting documents', err);
    });
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

            events_list.push(event);
        });

        res.contentType('json');
        res.send({ event_list: events_list });

    }).catch(err => {
        console.log('Error getting documents', err);
    });
});


app.post('/shiny-simulator', function(req, res) {

    var pokemon_list = [];
    var pokemon_data = [];

    var eventID = req.body.eventID;

    if (eventID != undefined) {
        const eventsDB = db.collection('events');

        let eventsDoc = eventsDB.doc(eventID).get().then(doc => {
                if (!doc.exists) {
                    res.send({ error: 'error', message: 'event not found' });
                } else {
                    eventData = doc.data();

                    for (var key in eventData.pokemon) {
                        pokemon_list.push(eventData.pokemon[key].id);
                    }

                    let eventsPokemonDocData = db.collection('pokemon').where('id', 'in', pokemon_list).get().then(snapshot2 => {
                        snapshot2.forEach(doc2 => {
                            if (pokemon_list.includes(doc2.data().id)) {
                                var data = doc2.data();
                                delete data.description;
                                pokemon_data.push(data);
                            }
                        });

                        res.render(path.join(__dirname + '/templates/shiny-simulator.html'), { event: eventData, pokemon_data: pokemon_data, pokemon_list: pokemon_list });
                    });
                }
            })
            .catch(err => {
                console.log('Error getting document', err);
                res.send({ error: 'error', message: 'event not found' });
            });
    } else {
        const pokemonQuery = db.collection('pokemon');
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
    var isTemporary = req.body.isTemporary ? req.body.isTemporary == "true" : false;
    var collection = isTemporary ? "tempPokemon" : "pokemon";
    var lastModified = admin.firestore.Timestamp.now();

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
    const pokemon = db.collection('pokemon');
    const baseQuery = pokemon.where("hasShinyAvailable", "==", true)
        .where("startDate", "<=", admin.firestore.Timestamp.now());

    var pokemon_data = {};

    let pokemonDoc = baseQuery.get().then(snapshot => {
        snapshot.forEach(doc => {
            var data = {};

            data.id = doc.data().id;
            data.name = doc.data().name;
            data.image = doc.data().image;
            data.startDate = doc.data().startDate.toDate().toString();
            data.pokemon_id = doc.data().id_numeric;

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

// STATS FEATURE

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
                        var data = doc.data();
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


// LUCKY DEX FEATURE
app.get('/request-lucky-dex', function(req, res) {
    var user_id = req.cookies['user']; // user ID

    res.contentType('json');

    if (user_id == null) {
        res.send({ error: "error" });
    } else {
        res.send({ success: "success" });
    }
});


app.get('/lucky-dex', function(req, res) {
    res.render(path.join(__dirname + '/templates/lucky-dex.html'), );
});


app.get('/lucky-dex-list/:user_id', function(req, res) {
    var user_id = req.params.user_id; // user ID
    var user_pokemon_data = {};
    var pokemon_data = [];

    if (user_id == null) {
        res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
        return;
    }

    const user = db.collection('users').doc(user_id);
    const pokemon = db.collection('pokemon');
    const baseQuery = pokemon.where("isMainLucky", "==", true)
        .where("isTemporary", "==", false).where("isPokemonAvailable", "==", true);

    let userDoc = user.collection("luckyPokemon").get().then(snapshot => {
            snapshot.forEach(doc => {
                user_pokemon_data[doc.id] = doc.data();
            });

            let pokemonDoc = baseQuery.get().then(snapshot2 => {
                    snapshot2.forEach(doc2 => {
                        var data = {};
                        data["id"] = doc2.data().id;
                        data["name"] = doc2.data().name;
                        data["image"] = doc2.data().image;
                        if (user_pokemon_data[doc2.id] != undefined) {
                            data["hasLucky"] = true;
                        } else {
                            data["hasLucky"] = false;
                        }
                        pokemon_data.push(data);
                    });


                    res.contentType('json');
                    res.send({ pokemon_list: pokemon_data });

                })
                .catch(err => {
                    console.log('Error getting documents', err);
                });
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
});

// update lucky dex
app.post('/update-lucky', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var pokemon_id = req.body.pokemon;
    var hasLucky = req.body.hasLucky ? req.body.hasLucky == "true" : false;
    var lastModified = admin.firestore.Timestamp.now();

    const pokemonDoc = db.collection('users').doc(user_id).collection("luckyPokemon").doc(pokemon_id);

    let setData = pokemonDoc.get().then(doc => {
        if (!doc.exists && hasLucky) {
            pokemonDoc.set({
                id: pokemon_id,
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