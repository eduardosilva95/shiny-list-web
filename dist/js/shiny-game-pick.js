var checked_pokemon = [];

var MAXIMUM_SELECTED_POKEMON = 20;

$(function() {


    $(".choose-mode-img").on('click', function() {
        $("#home-page-div").css("display", "none");
        if ($(this).data('target') === "pokemon-mode") {
            $("#pokemon-div").css("display", "block");
        } else {
            $("#events-div").css("display", "block");
        }
    });

    $(".choose-mode-text").on('click', function() {
        $("#home-page-div").css("display", "none");
        if ($(this).data('target') === "pokemon-mode") {
            $("#pokemon-div").css("display", "block");
        } else {
            $("#events-div").css("display", "block");
        }
    });

    $(".back-btn").on('click', function() {
        $("#home-page-div").css("display", "block");
        $("#pokemon-div").css("display", "none");
        $("#events-div").css("display", "none");
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
    $(".pokemon-card-btn").on('click', function() {
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