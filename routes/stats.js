var express = require('express');
var router = express.Router();
var path = require("path");

router.get('/', function(req, res) {
    var user_id = req.cookies['user']; // user ID
    var user_pokemon_data = {};
    var pokemon_data = [];

    if (user_id == null) {
        res.status(404).render(path.join(__dirname + '/templates/404page.html'), );
        return;
    }

    /*const user = db.collection('users').doc(user_id);
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
            });*/

    res.render(path.join(__dirname + '/templates/stats.html'), {});
});

module.exports = router;