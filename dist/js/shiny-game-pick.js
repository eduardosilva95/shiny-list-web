var checked_pokemon = [];
var events_data = {};
var MAXIMUM_SELECTED_POKEMON = 20;
var isPreviewModalImagesShiny = false;
var openedPage = "events";

// JQUERY CODE
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

    $(document).on('click', ".btn-preview-event", function() {
        var eventId = $(this).parent().parent().children("#event-id").val();
        var eventData = events_data[eventId];
        var imagesToLoad = [];

        $("#preview-event-modal-event-title").text(eventData.name);

        $(".preview-event-modal-pokemon-list").empty();

        for (var i = 0; i < eventData.pokemon.length; i++) {
            var eventDataPokemon = eventData.pokemon[i];
            var className = "preview-event-modal-pokemon text-center " + (eventDataPokemon.newShiny ? "new-shiny" : "");
            var content = "<div class=\"" + className + "\">";
            content += "<img class=\"preview-event-modal-pokemon-img-normal icon-md\" id=\"preview-event-pokemon-" + i + "\">";
            imagesToLoad.push({ "url": "pokemon_icons/" + eventDataPokemon.image.imageNormal, "target": "preview-event-pokemon-" + i, "id": eventDataPokemon.id, "compoundId": null });
            content += "<img class=\"preview-event-modal-pokemon-img-shiny icon-md\" id=\"preview-event-pokemon-" + i + "-shiny\" style=\"display: none\">";
            imagesToLoad.push({ "url": "pokemon_icons/" + eventDataPokemon.image.imageShiny, "target": "preview-event-pokemon-" + i + "-shiny", "id": eventDataPokemon.id, "compoundId": "SHINY" });

            if (eventDataPokemon.newShiny) {
                content += "<img src=\"/img/ic_shiny.png\" class=\"preview-event-pokemon-new-shiny-icon\" />";
            }

            content += "<p class=\"preview-event-modal-pokemon-label\">" + eventDataPokemon.name + "</p></div>";
            $(".preview-event-modal-pokemon-list").append(content);
        }

        loadImages(imagesToLoad);

        $("#preview-event-modal-play-btn").attr("disabled", !eventData.isPlayable);
        $("#preview-event-modal-play-btn").attr("data-event-id", eventId);

        isPreviewModalImagesShiny = false;

        $('#preview-event-modal').modal();
    });

    $(document).on('click', ".btn-play-event", function() {
        var eventId = $(this).parent().parent().children("#event-id").val();
        var event = events_data[eventId];

        if (event.isPremium) {
            openPremiumEventChooseModal(event);
        } else {
            openSimulator(eventId, false);
        }
    });


    $(document).on('click', "#preview-event-modal-toggle-btn", function() {
        isPreviewModalImagesShiny = !isPreviewModalImagesShiny;
        $(".preview-event-modal-pokemon-img-normal").css("display", isPreviewModalImagesShiny ? "none" : "initial");
        $(".preview-event-modal-pokemon-img-shiny").css("display", isPreviewModalImagesShiny ? "initial" : "none");
    });

    $(document).on('click', "#preview-event-modal-play-btn", function() {
        var eventId = $(this).data("eventId");
        var event = events_data[eventId];
        if (event.isPremium) {
            $('#preview-event-modal').modal('hide');
            openPremiumEventChooseModal(event);
        } else {
            openSimulator(eventId, false);
        }
    });

    $(document).on('click', "#premium-event-choose-modal-play-free-btn", function() {
        openSimulator($(this).data("eventId"), false);
    });

    $(document).on('click', "#premium-event-choose-modal-play-premium-btn", function() {
        openSimulator($(this).data("eventId"), true);
    });


});

// OPEN SIMULATOR
function openSimulator(eventId, isPremium) {
    var url = "/shiny-simulator";
    var form = $('<form action="' + url + '" method="post">' +
        "<input name=\"eventID\" id=\"event-id\" value=\"" + eventId + "\" style=\"display: none;\">" +
        "<input name=\"isPremium\" id=\"event-is-premium\" value=\"" + isPremium + "\" style=\"display: none;\">" +
        '</form>');
    $('body').append(form);
    form.submit();
}

// OPEN PREMIUM EVENT CHOOSE MODAL
function openPremiumEventChooseModal(event) {
    $("#event-title").text(event.name);

    loadImageFromFirebase("medals/" + event.medal, "event-medal");

    $(".event-exclusive-pokemon").empty();

    var imagesToLoad = [];

    event.pokemon.filter((pokemon) => pokemon.isPremium).forEach((pokemon) => {
        var content = "<div class=\"preview-event-modal-pokemon text-center\">";
        content += "<img class=\"icon-sm\" id=\"event-exclusive-pokemon-" + pokemon.id + "\">";
        imagesToLoad.push({ "url": "pokemon_icons/" + pokemon.image.imageNormal, "target": "event-exclusive-pokemon-" + pokemon.id, "id": pokemon.id, "compoundId": null });

        content += "<p class=\"preview-event-modal-pokemon-label\">" + pokemon.name + "</p></div>";
        $(".event-exclusive-pokemon").append(content);
    });

    $(".event-shiny-boosted-pokemon").empty();

    event.pokemon.filter((pokemon) => pokemon.premiumOdd && pokemon.premiumOdd != pokemon.odd).forEach((pokemon) => {
        var content = "<div class=\"preview-event-modal-pokemon text-center\">";
        content += "<img class=\"icon-sm\" id=\"event-shiny-boosted-pokemon-" + pokemon.id + "\">";
        imagesToLoad.push({ "url": "pokemon_icons/" + pokemon.image.imageNormal, "target": "event-shiny-boosted-pokemon-" + pokemon.id, "id": pokemon.id, "compoundId": null });

        content += "<p class=\"preview-event-modal-pokemon-label\">" + pokemon.name + "</p></div>";
        $(".event-shiny-boosted-pokemon").append(content);
    });

    if (event.hasFreeVersion) {
        $("#premium-event-choose-modal-play-free-btn").css("display", "initial");
        $("#premium-event-choose-modal-play-free-btn").attr("data-event-id", event.id);
    } else {
        $("#premium-event-choose-modal-play-free-btn").css("display", "none");
    }

    $("#premium-event-choose-modal-play-premium-btn").attr("data-event-id", event.id);

    loadImages(imagesToLoad);

    $('#premium-event-choose-modal').modal();
}


function removeCheckedPokemon(pokemon) {
    const index = checked_pokemon.indexOf(pokemon);
    if (index > -1) {
        checked_pokemon.splice(index, 1);
    }
}

function loadEvents() {
    $("#future-events-div").empty();
    $("#active-events-div").empty();

    // clear all past events already created
    $(".past-event-div").remove();


    $.get("/event-list", {}, function(result) {
        events_data = {};
        if (result.error == null) {
            var now = new Date();
            var event_list = result.event_list;

            var years = [];
            for (var i = 0; i < event_list.length; i++) {
                var event = event_list[i];
                var year = getEventYear(event);
                if (!years.includes(year) && event.category == "none" && new Date(event["startDate"]) <= now) {
                    years.push(year);
                }
            }

            years.sort(function(a, b) { return b - a; }).forEach(year => buildPastEventsSubDiv(year, year));
            buildPastEventsSubDiv("cd", "Community Day");
            buildPastEventsSubDiv("go-fest-safari", "Go Fest & Safari Zone");

            var imagesToLoad = [];

            for (var i = 0; i < event_list.length; i++) {
                var event = event_list[i];
                events_data[event.id] = event;
                var content = buildDynamicEventCard(event, imagesToLoad);

                if (event.category && event.category != "none") {
                    list_events_categories.add(event.category.toLowerCase().replace("_", ""));
                }

                if (new Date(event["startDate"]) > now) {
                    $("#future-events-div").append(content);
                } else if (new Date(event["endDate"]) < now) {
                    if (event.category && event.category === 'COMMUNITY_DAY') {
                        $("#cd-events-div").append(content);
                        $("#cd-events-div-count").text(parseInt($("#cd-events-div-count").text()) + 1);
                    } else if (event.category && (event.category === 'GO_FEST' || event.category === 'SAFARI_ZONE')) {
                        $("#go-fest-safari-events-div").append(content);
                        $("#go-fest-safari-events-div-count").text(parseInt($("#go-fest-safari-events-div-count").text()) + 1);
                    } else {
                        var sectionId = "#" + getEventYear(event) + "-events-div";
                        $(sectionId).append(content);
                    }
                } else {
                    $("#active-events-div").append(content);
                }

                // If an event has a property color defined, then its card will be customized with the defined color
                if (event.color) {
                    customizeEventCard(event.id, event.color);
                }

            };

            loadImages(imagesToLoad);

            sortEventsSections();

            updateDivsCounter();

            $("#home-page-div").css("display", "none");
            $("#events-div").css("display", "block");

            if (result.actions) {
                loadActions(result.actions, "events");
            }
        }
    });
}

function getEventYear(event) {
    var startDate = new Date(event["startDate"]);
    var endDate = new Date(event["endDate"]);

    if (startDate.getFullYear() == endDate.getFullYear()) {
        return startDate.getFullYear();
    }
    var newYearFirstDate = new Date("01-01-" + endDate.getFullYear());
    var diffToStartDate = Math.abs(newYearFirstDate - startDate);
    var diffToEndDate = Math.abs(newYearFirstDate - endDate);

    if (diffToStartDate > diffToEndDate) {
        return startDate.getFullYear();
    }

    return endDate.getFullYear();

}


function loadPokemons() {
    $("#pokemon-list-div").empty();

    $.get("/pokemon-list", {}, function(result) {
        if (result.error == null) {
            var pokemon_list = result.pokemon_list;
            for (var i = 0; i < pokemon_list.length; i++) {
                var pokemon = pokemon_list[i];
                buildDynamicPokemonCard(pokemon);
            }
            $("#home-page-div").css("display", "none");
            $("#pokemon-div").css("display", "block");
        }
    });
}



function buildDynamicEventCard(event, imagesToLoad) {
    var content = "<div class=\"event-card-design\"><div class=\"col-md col-12 cont\"><div class=\"card event-card " + (event.isPremium && !event.color ? "event-card-premium" : "") +
        "\" style=\"width: 18rem;\">";
    if (event.webImage) {
        content += "<img class=\"card-img-top card-event-img\" id=\"event-" + event.id + "-image\">";
        imagesToLoad.push({ "url": "events/" + event.webImage, "target": "event-" + event.id + "-image" });
    } else {
        content += "<img class=\"card-img-top card-event-img\" src=\"" + event.image + "\">";
    }
    content += "<div class=\"card-body\"><input name=\"eventID\" id=\"event-id\" value=\"" + event.id + "\" style=\"display: none;\">";
    content += "<h5 class=\"card-title\" title=\"" + event.name + "\">" + event.name + "</h5>";
    content += "<span class=\"card-event-schedule\">" + event.startDate_label + "</span><p class=\"card-event-schedule\">" + event.endDate_label + "</p>";

    content += "<div class=\"card-event-footer\">"

    content += "<button class=\"btn btn-warning btn-preview-event\">Preview</button>"

    if (event.isPlayable) {
        content += "<button class=\"btn btn-success btn-play-event\">Play !</button>";
    } else {
        content += "<button class=\"btn btn-success btn-play-event\" disabled>Play !</button>";
    }

    content += "</div></div></div></div></div>";

    return content;
}

function customizeEventCard(eventId, color) {
    $("input[value=\'" + eventId + "\']").closest(".event-card").css("border-color", color);
    $("input[value=\'" + eventId + "\']").siblings(".card-title").css("color", color);
    $("input[value=\'" + eventId + "\']").siblings(".card-event-schedule").css("color", color);
}


function buildDynamicPokemonCard(pokemon) {
    if (!pokemon.image.imageNormal || !pokemon.image.imageShiny) {
        return "";
    }

    var imagesToLoad = [];

    var content = "<div class=\"col-md-2\"><a class=\"pokemon-card-btn\"><div id=\"gallery-card\" class=\"gallery-card-unchecked\">";
    content += "<input style=\"display: none;\" value=\"" + pokemon.id + "\">";
    content += "<div class=\"gallery-card-body\"><label class=\"block-check\">";
    content += "<img id=\"simulator-pokemon-" + pokemon.id + "-img\" class=\"img-responsive img-normal\" loading=\"lazy\" />";
    imagesToLoad.push({ "url": "pokemon_icons/" + pokemon.image.imageNormal, "target": "simulator-pokemon-" + pokemon.id + "-img", "id": pokemon.id, "compoundId": null });
    content += "<img id=\"simulator-pokemon-" + pokemon.id + "-shiny-img\" class=\"img-responsive img-shiny\" loading=\"lazy\" style=\"display: none;\"/></label>";
    imagesToLoad.push({ "url": "pokemon_icons/" + pokemon.image.imageShiny, "target": "simulator-pokemon-" + pokemon.id + "-shiny-img", "id": pokemon.id, "compoundId": "SHINY" });
    content += "<div class=\"mycard-footer text-center\"><span class=\"card-link\" title=\"" + pokemon.name + "\">" + pokemon.name + "</span></div>";
    content += "</div></div></a></div>";

    $("#pokemon-list-div").append(content);
    loadImages(imagesToLoad);

}


function sortEventsSections() {
    $('#active-events-div .event-card-design').sort(function(a, b) {
        return new Date(events_data[$(a).find("#event-id").val()].startDate) < new Date(events_data[$(b).find("#event-id").val()].startDate) ? 1 : -1;
    }).appendTo("#active-events-div");

    $('#future-events-div .event-card-design').sort(function(a, b) {
        return new Date(events_data[$(a).find("#event-id").val()].startDate) > new Date(events_data[$(b).find("#event-id").val()].startDate) ? 1 : -1;
    }).appendTo("#future-events-div");

    $(".past-event-div-content").each(function() {
        $(this).find('.event-card-design').sort(function(a, b) {
            return new Date(events_data[$(a).find("#event-id").val()].startDate) < new Date(events_data[$(b).find("#event-id").val()].startDate) ? 1 : -1;
        }).appendTo(this);
    })
}


function buildPastEventsSubDiv(key, label) {
    var content = "<div class=\"event-div past-event-div\"><br>";
    content += "<p style=\"color: #fff; font-size: 23px; opacity: .7; border-bottom: 3px solid #ffd700; width: fit-content; height: 45px;\">" + label +
        " (<span class=\"past-events-div-count\" id=\"" + key + "-events-div-count\">0</span> Events)</p>";
    content += "<div class=\"event-list-div past-event-div-content\" id=\"" + key + "-events-div\"></div>";
    content += "<span class=\"empty-event-list-div-label\">No events available</span></div>";

    $("#events-div").append(content);

}

function loadImages(images) {
    images.forEach(image => {
        if (image.id) {
            loadImageFromFirebaseAndCache(image.url, image.target, image.id, image.compoundId);
        } else {
            loadImageFromFirebase(image.url, image.target);
        }
    })
}

// OVERRIDE SEARCH LIST
// ON press enter
$(function() {
    var input = document.getElementById("events-search-list-input");

    if (input) {
        input.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                searchEvents();
                updateDivsCounter();
            }
        });
    }
});

$(function() {
    $('#btn-search-events').click(function() {
        searchEvents();
        updateDivsCounter();
    });
});


function searchEvents() {
    $('.event-card-design').removeClass('d-none');
    var filter = $("#events-search-list-input").val(); // get the value of the input, which we filter on

    if (filter != undefined) {
        var or_filter = filter.split(",");
        for (key in or_filter) {
            or_filter[key] = or_filter[key].split('&');
        }

        $(".event-card-design").each(function() {
            var card_id = this.querySelector("#event-id").value;
            var result = false;
            for (var i = 0; i < or_filter.length; i++) {
                var and_result = true;
                for (var j = 0; j < or_filter[i].length; j++) {
                    if (!evaluateSubQuery(or_filter[i][j], card_id)) {
                        and_result = false;
                        break;
                    }
                }
                if (and_result) {
                    result = true;
                    break;
                }
            }
            if (!result) {
                $(this).addClass('d-none');
            }
        });
    }
}

function updateDivsCounter() {
    $(".past-event-div").each(function() {
        var events = this.querySelectorAll(".event-card-design:not(.d-none)");
        this.querySelector(".past-events-div-count").innerHTML = events.length;
        $(this).children(".empty-event-list-div-label").css("display", events.length == 0 ? "initial" : "none");
    });

    $(".future-event-div").each(function() {
        var events = this.querySelectorAll(".event-card-design:not(.d-none)");
        console.log("FUTURE EVENTS:: ", events.length);
        $(this).children(".empty-event-list-div-label").css("display", events.length == 0 ? "initial" : "none");
    });

    $(".active-event-div").each(function() {
        var events = this.querySelectorAll(".event-card-design:not(.d-none)");
        $(this).children(".empty-event-list-div-label").css("display", events.length == 0 ? "initial" : "none");
    });
}