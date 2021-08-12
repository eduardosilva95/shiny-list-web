var pokemon_data = {};
var move_data = {};
var list_pokemon_id = [];
var openedPage = null;

var cardOnChangeQuantity = null;
var currentCard = null;
var previousCard = null;
var nextCard = null;
var bioContext = "normal";
var bioGenderContext = "male";
var stackOpenModals = [];

var IMAGE_CACHE_IGNORE_KEYWORDS = ["SHADOW", "PURIFIED"];

/*-------------------------------------- LOAD DATA ------------------------------------------------------------------------*/

function loadListData(page) {
    initApp();
    if (page === "shiny-list" || page === "shiny-list-temp") {
        loadShinyListData(page === "shiny-list-temp");
    } else if (page === "future-list") {
        loadFutureListData();
    } else if (page === "moves") {
        loadMoveList();
    } else if (page == "pokedex") {
        loadPokedexData();
    } else if (page == "lucky-list") {
        loadLuckyListData();
    }

    if (page == "future-list-2" && getCookie("isDeveloper")) {
        loadFutureListForDevelopersData();
    }

}


/* SHINY LIST */
function loadShinyListData(isTemporary) {
    $("#list-div").empty();
    $("#list-loading").css("display", "block");

    $("#list-title").text("My Shiny List");


    if (isPokemonDataOnCache("shiny")) {
        $.get("/shiny-list-config", {}, function(result) {
            if (result.error == null) {
                if (isTemporary && result.actions) {
                    result.actions.stats = false;
                }
                var pokemonList = Object.values(getPokemonDataFromCache("shiny"));
                loadPokemonDataToWeb(pokemonList, result.actions, "shinylist", isTemporary);
            }
        });
    } else if (isPokemonDataOnCache(null)) {
        $.post("/shiny-list-data/" + getCookie("user"), { light: true }, function(result) {
            if (result.error == null) {
                if (isTemporary && result.actions) {
                    result.actions.stats = false;
                }
                var dataFromCache = getPokemonDataFromCache();
                var defaultUserData = { quantity: 0, lastModified: new Date(0).toString(), startSeen: 0, currentSeen: 0 };

                Object.entries(dataFromCache).forEach(([key, value]) => {
                    if (result.user_data[value.id]) {
                        Object.entries(result.user_data[value.id]).forEach(([key2, value2]) => {
                            dataFromCache[key][key2] = value2;
                        })
                    } else {
                        Object.entries(defaultUserData).forEach(([key2, value2]) => {
                            dataFromCache[key][key2] = value2;
                        })
                    }
                });

                loadPokemonDataToCache(dataFromCache);
                setPokemonDataCacheFlag("shiny");
                loadPokemonDataToWeb(Object.values(dataFromCache), result.actions, "shinylist", isTemporary);
            }
        });
    } else {
        $.post("/shiny-list-data/" + getCookie("user"), {}, function(result) {
            if (result.error == null) {
                if (isTemporary && result.actions) {
                    result.actions.stats = false;
                }
                loadPokemonDataToWeb(result.pokemon_list, result.actions, "shinylist", isTemporary);
                // only save in cache, the available pokemons
                loadPokemonDataToCache(Object.fromEntries(Object.entries(pokemon_data).filter(([key, value]) => value.availability.isPokemonAvailable)));
                setPokemonDataCacheFlag("shiny");
            }
        });
    }

    $.get("/moves-list", {}, function(result) {
        if (result.error == null) {
            var moves_list = result.moves_list;
            for (var i = 0; i < moves_list.length; i++) {
                var move = moves_list[i];
                move_data[move.id] = move;
            }
        }
    });
}

/* FUTURE LIST */
function loadFutureListData() {
    $("#list-div").empty();
    $("#list-loading").css("display", "block");

    $("#available-count-label").remove();
    $("#unique-count-label").remove();
    $("#percentage-count-label").remove();
    $("#total-count-label").html($("#total-count-label").html().replace($("#total-count-label").text(), $("#total-count-label").text().replace("/", "")));

    var urlSearchParams = new URLSearchParams(window.location.search);
    var params = Object.fromEntries(urlSearchParams.entries());

    $("#list-title").text(params.type == "shiny" ? "Next Shinies" : "Next Pokémon");

    var total = 0;

    if (isPokemonDataOnCache(null)) {
        $.get("/config/futurelist_" + params.type, {}, function(result) {
            if (result.error == null) {
                var pokemonList = Object.values(getPokemonDataFromCache(null));
                loadPokemonDataToWeb(pokemonList, result.actions, "futurelist/" + params.type, null);
            }
        });
    } else {
        $.get("/pokemon-list/futurelist_" + params.type, {}, function(result) {
            if (result.error == null) {
                loadPokemonDataToWeb(result.pokemon_list, result.actions, "futurelist/" + params.type, null);
                // only save in cache, the available pokemons
                loadPokemonDataToCache(Object.fromEntries(Object.entries(pokemon_data).filter(([key, value]) => value.availability.isPokemonAvailable)));
            }
        });
    }

    $.get("/moves-list", {}, function(result) {
        if (result.error == null) {
            var moves_list = result.moves_list;
            for (var i = 0; i < moves_list.length; i++) {
                var move = moves_list[i];
                move_data[move.id] = move;
            }
        }
    });
}

/* FUTURE LIST FOR DEVELOPERS */
function loadFutureListForDevelopersData() {
    $("#list-div").empty();
    $("#list-loading").css("display", "block");

    $("#available-count-label").remove();
    $("#unique-count-label").remove();
    $("#percentage-count-label").remove();
    $("#total-count-label").html($("#total-count-label").html().replace($("#total-count-label").text(), $("#total-count-label").text().replace("/", "")));

    var urlSearchParams = new URLSearchParams(window.location.search);
    var params = Object.fromEntries(urlSearchParams.entries());

    $("#list-title").text(params.type == "shiny" ? "Next Shinies" : "Next Pokémon");

    var total = 0;

    $.get("/pokemon-list/futurelist_" + params.type, {}, function(result) {
        if (result.error == null) {
            loadPokemonDataToWeb(result.pokemon_list, result.actions, "futurelist/developers/" + params.type, null);
        }
    });

    $.get("/moves-list", {}, function(result) {
        if (result.error == null) {
            var moves_list = result.moves_list;
            for (var i = 0; i < moves_list.length; i++) {
                var move = moves_list[i];
                move_data[move.id] = move;
            }
        }
    });
}


/* MOVE LIST */

function loadMoveList() {
    $("#list-div").empty();
    $("#list-loading").css("display", "block");

    $("#available-count-label").remove();
    $("#unique-count-label").remove();
    $("#percentage-count-label").remove();
    $("#total-count-label").html($("#total-count-label").html().replace($("#total-count-label").text(), $("#total-count-label").text().replace("/", "")));


    $("#list-title").text("Move List");

    if (!isPokemonDataOnCache(null)) {
        $.get("/pokemon-list", {}, function(result) {
            if (result.error == null) {
                var pokemon_list = result.pokemon_list;
                for (var i = 0; i < pokemon_list.length; i++) {
                    var pokemon = pokemon_list[i];

                    pokemon_data[pokemon.id] = pokemon;
                }
                loadPokemonDataToCache(Object.fromEntries(Object.entries(pokemon_data).filter(([key, value]) => value.availability.isPokemonAvailable)));
            }
        });
    } else {
        var pokemonList = Object.values(getPokemonDataFromCache(null));
        for (var i = 0; i < pokemonList.length; i++) {
            var pokemon = pokemonList[i];
            pokemon_data[pokemon.id] = pokemon;
        }
    }

    $.get("/moves-list/config", {}, function(result) {
        if (result.error == null) {
            var moves_list = result.moves_list;
            for (var i = 0; i < moves_list.length; i++) {
                var move = moves_list[i];

                move_data[move.id] = move;

                list_types.add(move.type.toLowerCase());

                var content = buildDynamicMoveCard(move);
                $("#list-div").append(content);
            }
            openedPage = "moves";
            setCounters(null, moves_list.length, null);

            if (result.actions) {
                loadActions(result.actions, "moves");
            }

            $("#list-loading").css("display", "none");
            $("#list-div").css("display", "");
        }
    });
}

/* POKEDEX */

function loadPokedexData() {
    $("#list-div").empty();
    $("#list-loading").css("display", "block");

    $("#available-count-label").remove();
    $("#unique-count-label").remove();
    $("#percentage-count-label").remove();
    $("#total-count-label").html($("#total-count-label").html().replace($("#total-count-label").text(), $("#total-count-label").text().replace("/", "")));

    $("#list-title").text("Pokédex");

    if (isPokemonDataOnCache(null)) {
        $.get("/config/pokedex", {}, function(result) {
            if (result.error == null) {
                var pokemonList = Object.values(getPokemonDataFromCache(null));
                loadPokemonDataToWeb(pokemonList, result.actions, "pokedex", null);
            }
        });
    } else {
        $.get("/pokemon-list/pokedex", {}, function(result) {
            if (result.error == null) {
                loadPokemonDataToWeb(result.pokemon_list, result.actions, "pokedex", null);
                // only save in cache, the available pokemons
                loadPokemonDataToCache(Object.fromEntries(Object.entries(pokemon_data).filter(([key, value]) => value.availability.isPokemonAvailable)));
            }
        });
    }

    $.get("/moves-list", {}, function(result) {
        if (result.error == null) {
            var moves_list = result.moves_list;
            for (var i = 0; i < moves_list.length; i++) {
                var move = moves_list[i];
                move_data[move.id] = move;
            }
        }
    });
}

/* LUCKY LIST */

function loadLuckyListData() {
    $("#list-div").empty();
    $("#list-loading").css("display", "block");

    $("#list-title").text("My Lucky List");

    $("#total-count-label").remove();

    if (isPokemonDataOnCache("lucky")) {
        $.get("/lucky-list-config", {}, function(result) {
            if (result.error == null) {
                var pokemonList = Object.values(getPokemonDataFromCache("lucky"));
                loadPokemonDataToWeb(pokemonList, result.actions, "luckylist", null);
            }
        });
    } else if (isPokemonDataOnCache(null)) {
        $.post("/lucky-list-data/" + getCookie("user"), { light: true }, function(result) {
            if (result.error == null) {
                var dataFromCache = getPokemonDataFromCache();

                Object.entries(dataFromCache).forEach(([key, value]) => {
                    if (value.isMainLucky) {
                        if (result.user_data[value.id]) {
                            dataFromCache[key].hasLucky = true;
                        } else {
                            dataFromCache[key].hasLucky = false;
                        }
                    }
                });

                loadPokemonDataToCache(dataFromCache);
                loadPokemonDataToWeb(Object.values(dataFromCache), result.actions, "luckylist", null);
            }
        });
    } else {
        $.post("/lucky-list-data/" + getCookie("user"), {}, function(result) {
            if (result.error == null) {
                loadPokemonDataToWeb(result.pokemon_list, result.actions, "luckylist", null);
                // only save in cache, the available pokemons
                loadPokemonDataToCache(Object.fromEntries(Object.entries(pokemon_data).filter(([key, value]) => value.availability.isPokemonAvailable)));
                setPokemonDataCacheFlag("lucky");
            }
        });
    }

    $.get("/moves-list", {}, function(result) {
        if (result.error == null) {
            var moves_list = result.moves_list;
            for (var i = 0; i < moves_list.length; i++) {
                var move = moves_list[i];
                move_data[move.id] = move;
            }
        }
    });
}

function loadPokemonDataToWeb(pokemonList, actions, page, isTemporary) {
    unique = total = available = 0;
    openedPage = page;
    var subPage = null;

    pokemonList.sort((a, b) => a.idNumeric > b.idNumeric ? 1 : -1);
    for (var i = 0; i < pokemonList.length; i++) {
        var pokemon = pokemonList[i];
        pokemon_data[pokemon.id] = pokemon;

        if (page == "shinylist") {
            if (pokemon.availability.hasShinyAvailable && new Date(pokemon.startDates.shinyStartDate) < new Date()) {
                setPokemonDataToWeb(pokemon, page, isTemporary);
            }
        } else if (page.startsWith("futurelist")) {
            var type = "pokemon";
            var developerPage = false;
            if (page.split("/").length == 2) {
                type = page.split("/")[1];
                subPage = page.split("/")[0] + page.split("/")[1].charAt(0).toUpperCase() + page.split("/")[1].slice(1);
            } else if (page.split("/").length == 3 && page.split("/")[1] == "developers") {
                developerPage = true;
                type = page.split("/")[2];
                subPage = page.split("/")[0] + page.split("/")[2].charAt(0).toUpperCase() + page.split("/")[2].slice(1);
            }
            if (!developerPage && type == "shiny" && pokemon.availability.hasShinyAvailable && new Date(pokemon.startDates.shinyStartDate) > new Date()) {
                setPokemonDataToWeb(pokemon, subPage, isTemporary);
            } else if (!developerPage && type == "pokemon" && pokemon.availability.isPokemonAvailable && new Date(pokemon.startDates.pokemonStartDate) > new Date()) {
                setPokemonDataToWeb(pokemon, subPage, isTemporary);
            } else if (developerPage && type == "shiny" && !pokemon.availability.hasShinyAvailable && new Date(pokemon.startDates.shinyStartDate) > new Date()) {
                setPokemonDataToWeb(pokemon, subPage, isTemporary);
            } else if (developerPage && type == "pokemon" && !pokemon.availability.isPokemonAvailable && new Date(pokemon.startDates.pokemonStartDate) > new Date()) {
                setPokemonDataToWeb(pokemon, subPage, isTemporary);
            }



        } else if (page == "luckylist") {
            if (pokemon.availability.isPokemonAvailable && new Date(pokemon.startDates.pokemonStartDate) < new Date() && !pokemon.isTemporary && pokemon.isMainLucky) {
                setPokemonDataToWeb(pokemon, page, isTemporary);
            }
        } else {
            setPokemonDataToWeb(pokemon, page, isTemporary);
        }
    }

    if (subPage) {
        page = subPage
        openedPage = subPage;
    }

    setCounters(unique, total, available);

    if (actions) {
        page = (page == "shinylist" && isTemporary) ? "shinylistTemp" : page;
        loadActions(actions, page);
    }

    $("#list-loading").css("display", "none");
    $("#list-div").css("display", "");
}

function setPokemonDataToWeb(data, page, isTemporary) {

    if (page == "luckylist") {
        buildDynamicLuckydexCard(data)
    } else {
        buildDynamicPokemonCard(data, page, isTemporary);
    }

    if (isTemporary == null || isTemporary == data.isTemporary) {
        list_pokemon_id.push(data.id);
        if (data.quantity && page == "shinylist") {
            available++;
            total += parseInt(data.quantity);
            unique = parseInt(data.quantity) > 0 ? unique + 1 : unique;
        } else if (page == "luckylist") {
            available++;
            unique = data.hasLucky ? unique + 1 : unique;
        } else {
            total++;
        }


        list_regions.add(data.location.region.toLowerCase());
        list_forms.add(data.location.form.toLowerCase());

        data.eventList.forEach(event => list_events.add(event.toLowerCase()));
        data.filters.forEach(filter => list_filters.add(filter.toLowerCase()));
        data.genders.forEach(gender => list_genders.add(gender.toLowerCase()));
        data.types.forEach(type => list_types.add(type.toLowerCase()));
        data.group.forEach(gr => list_categories.add(gr.toLowerCase()));
    }
}



function buildDynamicPokemonCard(pokemon, page, isMegaPage) {
    var imagesToLoad = [];

    if (page == "shinylist" && pokemon.isTemporary != isMegaPage) {
        return;
    }

    var content = "<div class=\"col-md-3 col-12 cont list-card-design\">";

    if (page == "shinylist" && pokemon.quantity > 0) {
        content += "<div class=\"list-card list-card-shiny\">";
    } else if (page == "shinylist") {
        content += "<div class=\"list-card\">";
    } else {
        content += "<div class=\"list-card simple-card\">";
    }


    content += "<span id=\"card-id\" style=\"display: none;\">" + pokemon.id + "</span>";
    content += "<span id=\"card-type\" style=\"display: none;\">shinylist</span>";
    // set images
    if (page == "futurelistShiny" || page == "shinylist" && pokemon.quantity > 0) {
        content += "<img id=\"" + pokemon.id + "-image\" class=\"img-responsive img-shiny pokemon-card-img list-card-img\" loading=\"lazy\"/>"
        imagesToLoad.push({ "url": "pokemon_icons/" + pokemon.image.imageShiny, "target": pokemon.id + "-image", "id": pokemon.id, "compoundId": "SHINY" });
    } else if (page == "shinylist") {
        content += "<img id=\"" + pokemon.id + "-image\" class=\"img-responsive img-normal pokemon-card-img list-card-img\" loading=\"lazy\"/>"
        imagesToLoad.push({ "url": "pokemon_icons/" + pokemon.image.imageNormal, "target": pokemon.id + "-image", "id": pokemon.id, "compoundId": null });
    } else {
        content += "<img id=\"" + pokemon.id + "-image\" class=\"img-responsive pokemon-card-img list-card-img\" loading=\"lazy\"/>"
        imagesToLoad.push({ "url": "pokemon_icons/" + pokemon.image.imageNormal, "target": pokemon.id + "-image", "id": pokemon.id, "compoundId": null });
    }

    content += "<div class=\"image-number-label\">" + pokemon.idNumeric + "</div>";

    // set quantity label on shiny list cards
    if (page == "shinylist") {
        content += "<div id=\"pokemon-quantity-label\" class=\"image-quantity-label\">" + pokemon.quantity + "x</div>";
    }

    if (pokemon.filters.includes("shadow")) {
        content += "<img id=\"pokemon-type-icon\" src=\"/img/ic_shadow.png\" class=\"img-responsive icon-type\"/>";
    } else if (pokemon.filters.includes("purified")) {
        content += "<img id=\"pokemon-type-icon\" src=\"/img/ic_purified.png\" class=\"img-responsive icon-type\"/>";
    } else if (pokemon.isTemporary) {
        content += "<img id=\"pokemon-type-icon\" src=\"/img/ic_mega.png\" class=\"img-responsive icon-type\"/>";
    } else if (pokemon.filters.includes("regional")) {
        content += "<img id=\"pokemon-type-icon\" src=\"/img/planet_earth.png\" class=\"img-responsive icon-type\"/>";
    } else if (pokemon.filters.includes("costume")) {
        content += "<img id=\"pokemon-type-icon\" src=\"/img/party_hat.png\" class=\"img-responsive icon-type\"/>";
    }

    content += "<div class=\"card-body\"><div class=\"card-title-div\"><span class=\"card-title\" title=\"" + pokemon.name + "\">" + pokemon.name + "</span></div>";

    if (pokemon.startDates.shinyStartDate && (page == "shinylist" || page == "futurelistShiny")) {
        content += "<p class=\"card-text\"><strong>Start Date: </strong>" + convertDateToText(pokemon.startDates.shinyStartDate) + "</p>";
    }
    if (pokemon.startDates.pokemonStartDate && page == "futurelistPokemon") {
        content += "<p class=\"card-text\"><strong>Start Date: </strong>" + convertDateToText(pokemon.startDates.pokemonStartDate) + "</p>";
    }

    // update shiny buttons
    if (page == "shinylist") {
        content += "<div class=\"row\"><div class=\"col-md-7\">";
        content += "<button id=\"pokemon-remove-btn\" class=\"pokemon-card-update-qt button-remove\"" + (pokemon.quantity == 0 ? "disabled" : "") + "><i class=\"fas fa-minus\"></i></button>";
        content += "<button id=\"pokemon-add-btn\" class=\"pokemon-card-update-qt button-add\"" + (pokemon.maxShinyCount != null && pokemon.quantity >= pokemon.maxShinyCount ? "disabled" : "") + "><i class=\"fas fa-plus\"></i></button></div>";
        content += "<div class=\"col-md-5 text-right\"><div class=\"dropdown\"><button class=\"btn btn-secondary dropdown-toggle\" type=\"button\" id=\"actions-dropdown\" data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\"><i class=\"fas fa-cogs\"></i></button>";
        content += "<div class=\"dropdown-menu\" aria-labelledby=\"dropdownMenuButton\"><a class=\"dropdown-item\" id=\"pokemon-update-shiny-btn\" style=\"cursor: pointer;\">Update shiny amount</a>";
        if (!pokemon.isTemporary) {
            content += "<a class=\"dropdown-item\" id=\"pokemon-update-checks-btn\" style=\"cursor: pointer;\">Update number of checks</a>";
        }
        content += "<\div><\div><\div><\div><\div>"
    }


    content += "</div></div></div>";
    $("#list-div").append(content);
    loadImages(imagesToLoad);
}

function buildDynamicMoveCard(move) {
    var content = "<div class=\"col-md-2 col-12 cont list-card-design\"><div class=\"list-card move-card\">";
    content += "<span id=\"card-id\" style=\"display: none;\">" + move.id + "</span>";
    content += "<span id=\"card-type\" style=\"display: none;\">move</span>";
    content += "<img src=\"/img/type_" + move.type + ".png\" class=\"img-responsive list-card-img\" style=\"height: 60%;\" loading=\"lazy\"/>"
    content += "<div class=\"card-body\"><div class=\"card-title-div\"><span class=\"card-title\" title=\"" + move.name + "\">" + move.name + "</span></div>";
    content += "</div></div></div>";
    return content;
}

function buildDynamicLuckydexCard(pokemon) {
    var imagesToLoad = [];

    var name = pokemon.nameSpecies.charAt(0).toUpperCase() + pokemon.nameSpecies.slice(1);

    var content = "<div class=\"col-md-2 list-card-design\"><div class=\"" + (pokemon.hasLucky ? 'lucky-dex-card lucky-dex-card-checked' : 'lucky-dex-card') + "\">";
    content += "<div class=\"lucky-dex-card-body\"><label class=\"image-checkbox\">";
    content += "<span id=\"card-id\" style=\"display: none;\">" + pokemon.id + "</span>";
    content += "<input id=\"pokemon-id\" type=\"checkbox\" style=\"display: none;\" value=\"" + pokemon.id + "\"" + (pokemon.hasLucky ? 'checked' : '') + ">";
    content += "<i class=\"fa fa-check hidden\"></i>";

    //content += "<img src=\"/img/pokemon_icons/" + pokemon.image.imageNormal + "\" class=\"img-responsive img-normal\" loading=\"lazy\"/>";
    content += "<img id=\"" + pokemon.id + "lucky-image\" class=\"img-responsive pokemon-card-img list-card-img\" loading=\"lazy\"/>"
    imagesToLoad.push({ "url": "pokemon_icons/" + pokemon.image.imageNormal, "target": pokemon.id + "lucky-image", "id": pokemon.id, "compoundId": null });

    content += "<div class=\"lucky-dex-card-label text-center\"><span class=\"card-link\" title=\"" + name + "\">" + name + "</span></div>";
    content += "</label></div></div></div>";

    $("#list-div").append(content);
    loadImages(imagesToLoad);
}

/*--------------------------------------END LOAD DATA ------------------------------------------------------------------------*/


/*-------------------------------------- USER ACTIONS ------------------------------------------------------------------------*/
$(function() {
    toastr.options.closeButton = true;
    toastr.options.closeMethod = 'fadeOut';
    toastr.options.closeDuration = 300;
    toastr.options.closeEasing = 'swing';

    /* CHANGE QUANTITY */

    $(document).on("click", ".list-card .pokemon-card-update-qt", function(e) {
        var card = this.parentElement.parentElement.parentElement.parentElement;
        var pokemonID = card.querySelector("#card-id").innerHTML;
        var pokemonData = pokemon_data[pokemonID];
        var quantity = $(this).attr("id").includes("add") ? parseInt(pokemonData.quantity) + 1 : parseInt(pokemonData.quantity) - 1;
        updateShinyToBe(pokemonID, quantity, card);
    });

    $(document).on("click", ".list-card #pokemon-update-shiny-btn", function(e) {
        var card = this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
        var pokemonID = card.querySelector("#card-id").innerHTML;
        var pokemonData = pokemon_data[pokemonID];
        $("#change-quantity-modal .modal-title").text("Change Quantity of Shiny " + pokemonData.name);
        $("#change-quantity-modal #new-quantity-input").val(pokemonData.quantity);
        $("#change-quantity-modal #pokemon-id-hidden-input").val(pokemonData.id);
        cardOnChangeQuantity = card;
        $("#change-quantity-modal").modal();
    });

    $(document).on("click", ".list-card #pokemon-update-checks-btn", function(e) {
        var card = this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
        var pokemonID = card.querySelector("#card-id").innerHTML;
        var pokemonData = pokemon_data[pokemonID];
        $("#update-checks-modal .modal-title").text("Update number of checks of " + pokemonData.name);
        $("#update-checks-modal #start-seen-input").val(pokemonData.startSeen);
        $("#update-checks-modal #current-seen-input").val(pokemonData.currentSeen);

        if (parseInt(pokemonData.startSeen) > 0) {
            $("#update-checks-modal #start-seen-input").prop("disabled", true);
        } else {
            $("#update-checks-modal #start-seen-input").prop("disabled", false);
        }

        $("#update-checks-modal #pokemon-id-hidden-input").val(pokemonData.id);
        $("#update-checks-modal").modal();
    });


    $(document).on('click', ".list-card .list-card-img", function(e) {
        var cardId = this.parentElement.querySelector("#card-id").innerHTML;
        var cardType = this.parentElement.querySelector("#card-type").innerHTML;

        currentCard = $(this);
        previousCard = $(this).parent().parent().prev().children().children(".list-card-img");
        nextCard = $(this).parent().parent().next().children().children(".list-card-img");

        if (cardType == "shinylist") {
            openBioModal(cardId);
        } else if (cardType == "move") {
            loadMoveModal(cardId);
        }
    });

    $("#submit-new-quantity-form").click(function() {
        if (cardOnChangeQuantity != null) {
            var pokemonID = $("#change-quantity-modal #pokemon-id-hidden-input").val();
            var quantity = $("#change-quantity-modal #new-quantity-input").val();
            updateShinyToBe(pokemonID, quantity, cardOnChangeQuantity);
        }
    });

    $("#submit-checks-form").click(function() {
        var pokemonID = $("#update-checks-modal #pokemon-id-hidden-input").val();
        var startSeen = parseInt($("#update-checks-modal #start-seen-input").val());
        var currentSeen = parseInt($("#update-checks-modal #current-seen-input").val());

        if (isNaN(startSeen) || startSeen < 0) {
            $("#update-checks-modal #start-seen-error").css("display", "block");
            return;
        }

        if (isNaN(currentSeen) || currentSeen < 0) {
            $("#update-checks-modal #current-seen-error span").text("Wrong number format!");
            $("#update-checks-modal #current-seen-error").css("display", "block");
            return;
        }

        if (currentSeen < startSeen) {
            $("#update-checks-modal #current-seen-error span").text("The number of current seen must be higher than the number of seen before the shiny release");
            $("#update-checks-modal #current-seen-error").css("display", "block");
            return;
        }


        $.post("/update-checks", { pokemon: pokemonID, startSeen: startSeen, currentSeen: currentSeen }, function(result) {
            pokemon_data[result.pokemon_id].startSeen = parseInt(result.startSeen);
            pokemon_data[result.pokemon_id].currentSeen = parseInt(result.currentSeen);
            setPokemonPropertyDataOnCache(result.pokemon_id, "startSeen", result.startSeen);
            setPokemonPropertyDataOnCache(result.pokemon_id, "currentSeen", result.currentSeen);

            $('#update-checks-modal').modal('hide')

            $("#update-checks-modal #start-seen-error").css("display", "none");
            $("#update-checks-modal #current-seen-error").css("display", "none");
        });
    });

    $("#btn-stats-list").on("click", function() {
        var listIds = [];
        $(".list-card-design").each(function() {
            if (!$(this).attr("class").includes("d-none")) {
                listIds.push($(this).find("#card-id").text());
            }
        });

        loadStatsData(Object.values(pokemon_data).filter(pokemon => !pokemon.isTemporary && pokemon.availability.hasShinyAvailable && new Date(pokemon.startDates.shinyStartDate) < new Date() && listIds.includes(pokemon.id)));
        $("#stats-modal").modal();
    });

});

/*--------------------------------------END USER ACTIONS ------------------------------------------------------------------------*/


/*-------------------------------------- SEND DATA TO DB  ------------------------------------------------------------------------*/

function updateShinyToBe(pokemon_id, quantity, card) {
    var maxShinyCount = pokemon_data[pokemon_id].maxShinyCount;
    if (cardOnChangeQuantity != null && (isNaN(quantity) || quantity < 0 || (maxShinyCount != null && quantity > maxShinyCount))) {
        $("#change-quantity-modal .alert-danger").css("display", "block");
        return;
    } else if (isNaN(quantity) || quantity < 0 || (maxShinyCount != null && quantity > maxShinyCount)) {
        toastr.error('Wrong number format!');
        return;
    }

    if (pokemon_data[pokemon_id].isTemporary && quantity > 1) {
        quantity = 1;
    }

    var original_quantity = pokemon_data[pokemon_id].quantity;

    $.post("/update-shiny", { pokemon: pokemon_id, quantity: quantity, isTemporary: pokemon_data[pokemon_id].isTemporary }, function(result) {
        var imagesToLoad = [];
        pokemon_data[result.pokemon_id].quantity = parseInt(result.quantity);
        pokemon_data[result.pokemon_id].lastModified = result.lastModified;
        setPokemonPropertyDataOnCache(result.pokemon_id, "quantity", result.quantity);
        setPokemonPropertyDataOnCache(result.pokemon_id, "lastModified", result.lastModified);

        $(card).children("#pokemon-quantity-label").text(result.quantity + "x");
        $(card).children("#" + result.pokemon_id + "-image").toggleClass("img-shiny", quantity > 0);
        $(card).children("#" + result.pokemon_id + "-image").toggleClass("img-normal", quantity == 0);
        imagesToLoad.push({
            "url": "pokemon_icons/" + (result.quantity > 0 ? pokemon_data[pokemon_id].image.imageShiny : pokemon_data[pokemon_id].image.imageNormal),
            "target": result.pokemon_id + "-image",
            "id": pokemon_id,
            "compoundId": result.quantity > 0 ? "SHINY" : null
        });

        loadImages(imagesToLoad);

        $(card).find("#pokemon-remove-btn").prop("disabled", result.quantity == 0);
        $(card).find("#pokemon-add-btn").prop("disabled", result.quantity > 0 && (pokemon_data[pokemon_id].isTemporary || quantity == maxShinyCount));
        $(card).toggleClass("list-card-shiny", result.quantity > 0);

        $("#total-count").text(parseInt($("#total-count").text()) + (result.quantity - original_quantity));

        if (original_quantity == 0 && result.quantity > 0) {
            $("#unique-count").text(parseInt($("#unique-count").text()) + 1);
        } else if (original_quantity > 0 && quantity == 0) {
            $("#unique-count").text(parseInt($("#unique-count").text()) - 1);
        }

        $("#percentage-count").text(((parseInt($("#unique-count").text()) / parseInt($("#available-count").text())) * 100).toFixed(1) + " %");

        // update actions
        var minMax = getMinMaxFromAttributes("quantity", null);
        updateSliderMinMax("filter-list-quantity-slider", "min", minMax[0]);
        updateSliderMinMax("filter-list-quantity-slider", "max", minMax[1]);

        search();
        $(".dropdown-sort-list.active").prop("disabled", false);
        $(".dropdown-sort-list.active").click();
        $(".dropdown-sort-list.active").prop("disabled", true);



        $('#change-quantity-modal').modal('hide')

        if (cardOnChangeQuantity != null) {
            cardOnChangeQuantity = null;
        } else {
            $("#change-quantity-modal .alert-danger").css("display", "none");
        }

    });
}

/*-------------------------------------- END SEND DATA TO DB  ------------------------------------------------------------------------*/

/*-------------------------------------- EXTRA FUNCTIONS  ------------------------------------------------------------------------*/

function setCounters(unique, total, available) {
    if (unique != null && document.getElementById("unique-count")) {
        document.getElementById("unique-count").innerText = unique;
    }

    if (available != null && document.getElementById("available-count")) {
        document.getElementById("available-count").innerText = available;
    }

    if (total != null && document.getElementById("total-count")) {
        document.getElementById("total-count").innerText = total;
    }

    if (unique != null && available != null && document.getElementById("percentage-count")) {
        if (available != 0) {
            document.getElementById("percentage-count").innerText = (unique / available * 100).toFixed(1) + " %";
        } else {
            document.getElementById("percentage-count").innerText = "0 %";
        }
    }
}

function processDateToBio(date) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    date = new Date(date);

    return (date.getDate() < 10 ? '0' : '') + date.getDate() + " " + months[date.getMonth()] +
        " " + date.getFullYear() + " " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
}

function loadImages(images) {
    images.forEach(image => {
        // SOME POKEMON IDS IMAGE ARE THE SAME OF THE ORIGINAL (EX: SHADOW, PURIFIED)
        // THIS SHOULD NOT BE CACHED
        var splittedImageId = image.id.split("_");
        if (IMAGE_CACHE_IGNORE_KEYWORDS.includes(splittedImageId[splittedImageId.length - 1])) {
            splittedImageId.pop();
            image.id = splittedImageId.join("_");
        }

        loadImageFromFirebaseAndCache(image.url, image.target, image.id, image.compoundId);
    })
}