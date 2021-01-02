var checked_pokemon = [];

var events_data = {};

var MAXIMUM_SELECTED_POKEMON = 20;


$(function() {

    $(".choose-mode-img").on('click', function() {
        if ($(this).data('target') === "pokemon-mode") {
            $("#pokemon-mode-loader").css("display", "block");
            loadPokemons();
        } else {
            $("#event-mode-loader").css("display", "block");
            loadEvents();
        }
    });

    $(".choose-mode-text").on('click', function() {
        if ($(this).data('target') === "pokemon-mode") {
            $("#pokemon-mode-loader").css("display", "block");
            loadPokemons();
        } else {
            $("#event-mode-loader").css("display", "block");
            loadEvents();
        }
    });

    $(".back-btn").on('click', function() {
        $("#pokemon-div").css("display", "none");
        $("#events-div").css("display", "none");
        $("#pokemon-mode-loader").css("display", "none");
        $("#event-mode-loader").css("display", "none");
        $("#home-page-div").css("display", "block");
    });


});



function clickEvent(event_id) {
    console.log(event_id)
    $.post("/shiny-simulator", { isEvent: 1, eventID: event_id });
}

function removeCheckedPokemon(pokemon) {
    const index = checked_pokemon.indexOf(pokemon);
    if (index > -1) {
        checked_pokemon.splice(index, 1);
    }
}

$(function() {
    $(".card-event-featured-pokemon-btn").on('click', function() {
        if (this.querySelector("i").className == "fas fa-chevron-down") {
            this.querySelector("i").className = "fas fa-chevron-up";
        } else {
            this.querySelector("i").className = "fas fa-chevron-down";
        }
    });
});


$(function() {
    $("#pokemon-list-div").on('click', '.pokemon-card-btn', function() {
        var pokemon_id = this.querySelector("input").value;
        if (checked_pokemon.includes(pokemon_id)) {
            removeCheckedPokemon(pokemon_id);
            this.querySelector("#gallery-card").className = "gallery-card-unchecked"
            this.querySelector(".img-normal").style.display = 'block';
            this.querySelector(".img-shiny").style.display = 'none';
            $("#pokemon-selected-count").text(checked_pokemon.length);
            $("#pokemon-list-submit").val(checked_pokemon);
            if (checked_pokemon.length === 0) {
                $("#play-btn").prop('disabled', true);
            }

        } else {
            if (checked_pokemon.length == MAXIMUM_SELECTED_POKEMON) return;
            checked_pokemon.push(pokemon_id);
            this.querySelector("#gallery-card").className = "gallery-card-checked"
            this.querySelector(".img-normal").style.display = 'none';
            this.querySelector(".img-shiny").style.display = 'block ';
            $("#pokemon-selected-count").text(checked_pokemon.length);
            $("#pokemon-list-submit").val(checked_pokemon);
            $("#play-btn").prop('disabled', false);
        }
    });
});


function loadEvents() {
    $("#future-events-div").empty();
    $("#past-events-div").empty();
    $("#active-events-div").empty();

    $.get("/event-list", {}, function(result) {
        events_data = {};
        if (result.error == null) {
            var now = new Date();
            var event_list = result.event_list;

            var years = [];
            for (var i = 0; i < event_list.length; i++) {
                var event = event_list[i];
                var year = parseInt(new Date(event.startDate).getFullYear());
                if (!years.includes(year) && event.category != undefined && new Date(event["startDate"]) <= now) {
                    years.push(year);
                }
            }
            years.sort(function(a, b) { return b - a; }).forEach(year => buildPastEventsSubDiv(year, year));
            buildPastEventsSubDiv("cd", "Community Day");
            buildPastEventsSubDiv("go-fest-safari", "Go Fest & Safari Zone");


            for (var i = 0; i < event_list.length; i++) {
                var event = event_list[i];
                events_data[event.id] = event;
                var content = buildDynamicEventCard(event);

                if (new Date(event["startDate"]) > now) {
                    $("#future-events-div").append(content);
                } else if (new Date(event["endDate"]._seconds * 1000) < now) {
                    if (event.category && event.category === 'COMMUNITY_DAY') {
                        $("#cd-events-div").append(content);
                    } else if (event.category && (event.category === 'GO_FEST' || event.category === 'SAFARI_ZONE')) {
                        $("#go-fest-safari-events-div").append(content);
                    } else {
                        var sectionId = "#" + (new Date(event.startDate).getFullYear()) + "-events-div";
                        $(sectionId).append(content);
                    }
                } else {
                    $("#active-events-div").append(content);
                }
            }

            sortEventsSections();

            $("#home-page-div").css("display", "none");
            $("#events-div").css("display", "block");
        }
    });
}

function loadPokemons() {
    $("#pokemon-list-div").empty();

    $.get("/pokemon-list", {}, function(result) {
        if (result.error == null) {
            var pokemon_list = result.pokemon_list;
            for (var i = 0; i < pokemon_list.length; i++) {
                var pokemon = pokemon_list[i];
                var content = buildDynamicPokemonCard(pokemon);
                $("#pokemon-list-div").append(content);
            }
            $("#home-page-div").css("display", "none");
            $("#pokemon-div").css("display", "block");
        }
    });
}



function buildDynamicEventCard(event) {
    var content = "<div class=\"event-card-design\"><form action=\"/shiny-simulator\" method=\"post\"><div class=\"col-md col-12 cont\"><div class=\"card event-card\" style=\"width: 18rem;\">";
    content += "<img class=\"card-img-top card-event-img\" src=\"" + event.image + "\">";
    content += "<div class=\"card-body\"><input name=\"eventID\" id=\"event-id\" value=\"" + event.id + "\" style=\"display: none;\">";
    content += "<h5 class=\"card-title\" title=\"" + event.name + "\">" + event.name + "</h5>";
    content += "<span class=\"card-event-schedule\">" + event.startDate_label + "</span><p class=\"card-event-schedule\">" + event.endDate_label + "</p>";
    content += "<p><a class=\"card-event-featured-pokemon-btn\" data-toggle=\"collapse\" href=\"#" + event.id + "-featuredPokemon\" role=\"button\" aria-expanded=\"false\" aria-controls=\"#" + event.id + "-featuredPokemon\">";
    content += "<i class=\"fas fa-chevron-down\"></i> <span style=\"padding-left: 10px;\">Featured Pokemon</span></a></p>"
    content += "<div class=\"collapse\" id=\"" + event.id + "-featuredPokemon\"><div class=\"card card-body\"><ul>";

    for (var i = 0; i < event.pokemon.length; i++) {
        content += "<li>" + event.pokemon[i].name + "</li>";
    }

    content += "</ul></div></div><br>";

    if (event.isPlayable) {
        content += "<button type=\"submit\" class=\"btn btn-success\">Play !</button>";
    } else {
        content += "<button type=\"submit\" class=\"btn btn-success\" disabled>Play !</button>";
    }

    content += "</div></div></div></form></div>";

    return content;
}


function buildDynamicPokemonCard(pokemon) {
    var content = "<div class=\"col-md-2\"><a class=\"pokemon-card-btn\"><div id=\"gallery-card\" class=\"gallery-card-unchecked\">";
    content += "<input style=\"display: none;\" value=\"" + pokemon.id + "\">";
    content += "<div class=\"gallery-card-body\"><label class=\"block-check\">";
    content += "<img src=\"/img/pokemon_icons/" + pokemon.image.image_normal + "\" class=\"img-responsive img-normal\"/>";
    content += "<img src=\"/img/pokemon_icons/" + pokemon.image.image_shiny + "\" class=\"img-responsive img-shiny\" style=\"display: none;\"/></label>";
    content += "<div class=\"mycard-footer text-center\"><span class=\"card-link\" title=\"" + pokemon.name + "\">" + pokemon.name + "</span></div>";
    content += "</div></div></a></div>";

    return content;

}


function sortEventsSections() {
    $('#active-events-div .event-card-design').sort(function(a, b) {
        return new Date(events_data[$(a).find("#event-id").val()].startDate) < new Date(events_data[$(b).find("#event-id").val()].startDate) ? 1 : -1;
    }).appendTo("#active-events-div");

    $('#future-events-div .event-card-design').sort(function(a, b) {
        return new Date(events_data[$(a).find("#event-id").val()].startDate) > new Date(events_data[$(b).find("#event-id").val()].startDate) ? 1 : -1;
    }).appendTo("#future-events-div");

    $('#2021-events-div .event-card-design').sort(function(a, b) {
        return new Date(events_data[$(a).find("#event-id").val()].startDate) < new Date(events_data[$(b).find("#event-id").val()].startDate) ? 1 : -1;
    }).appendTo("#2021-events-div");

    $('#2020-events-div .event-card-design').sort(function(a, b) {
        return new Date(events_data[$(a).find("#event-id").val()].startDate) < new Date(events_data[$(b).find("#event-id").val()].startDate) ? 1 : -1;
    }).appendTo("#2020-events-div");

    $('#2019-events-div .event-card-design').sort(function(a, b) {
        return new Date(events_data[$(a).find("#event-id").val()].startDate) < new Date(events_data[$(b).find("#event-id").val()].startDate) ? 1 : -1;
    }).appendTo("#2019-events-div");

    $('#cd-events-div .event-card-design').sort(function(a, b) {
        return new Date(events_data[$(a).find("#event-id").val()].startDate) < new Date(events_data[$(b).find("#event-id").val()].startDate) ? 1 : -1;
    }).appendTo("#cd-events-div");

    $('#go-fest-safari-events-div .event-card-design').sort(function(a, b) {
        return new Date(events_data[$(a).find("#event-id").val()].startDate) < new Date(events_data[$(b).find("#event-id").val()].startDate) ? 1 : -1;
    }).appendTo("#go-fest-safari-events-div");
}


function buildPastEventsSubDiv(key, label) {
    var content = "<div class=\"row\"><div class=\"col-md-12 col-12\"><br>";
    content += "<p style=\"color: #fff; font-size: 23px; opacity: .7; border-bottom: 3px solid #ffd700; width: fit-content; height: 45px;\">" + label + "</p>";
    content += "<div class=\"row\"><div class=\"d-flex flex-row flex-nowrap\" style=\"overflow-y: auto;\" id=\"" + key + "-events-div\"></div></div></div></div>";

    $("#events-div").append(content);

}