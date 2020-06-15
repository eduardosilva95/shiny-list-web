var pokemon_data = [];
var pokemon_list = [];
var event_data = {};

var BASE_IMAGE_URL = "https://github.com/PokeMiners/pogo_assets/blob/master/Images/Pokemon/";

var num_tries = 0;
var num_shinies = 0;
var SHINY_NUMBER = 1;

var current, odds, encounters, shinies, streak, worst_streak, best_streak;
var autochecking = false;
var autostarter = null;
var autochecker = null;
var sparkling = false;
var noflash = false;


function loadData(list, data, event) {
    pokemons = data;

    for (var i = 0; i < pokemons.length; i++) {
        p = JSON.parse(pokemons[i]);
        pokemon_data.push(p);
        $("#pokemon_" + p.id + "_normal").attr("src", BASE_IMAGE_URL + p.image.image_normal + "?raw=true");
        $("#pokemon_" + p.id + "_shiny").attr("src", BASE_IMAGE_URL + p.image.image_shiny + "?raw=true");
    }

    pokemon_list = list.split(',');
    event_data = JSON.parse(event);

    encounters = shinies = streak = worst_streak = 0;
}

$(function() {

    var pokemon_selector = document.getElementById("pokemons");
    var catch_screen = document.getElementById("catch_screen");
    var stats = document.getElementById("stats");
    var flash = document.getElementById("flash");

    reveal();

    $("#encounter img").mousedown(function(e) {
        e.preventDefault();
        if (autostarter == null)
            autostarter = setTimeout(autocheck, 500);
    });

    $("#encounter img").on('touchstart', function(e) {
        e.preventDefault();
        if (autostarter == null)
            autostarter = setTimeout(autocheck, 500);
    });

    $("#encounter img").mouseup(function() {
        if (!autochecking && !sparkling) {
            flash.style.transition = "none";
            if (!noflash) flash.style.opacity = 0.4;
            setTimeout(reveal, 5);
        }

        autochecking = false;
        clearInterval(autostarter);
        clearInterval(autochecker);
        autostarter = null;
    });

    $("#encounter img").on('touchend', function() {
        if (!autochecking && !sparkling) {
            flash.style.transition = "none";
            if (!noflash) flash.style.opacity = 0.4;
            setTimeout(reveal, 5);
        }

        autochecking = false;
        clearInterval(autostarter);
        clearInterval(autochecker);
        autostarter = null;
    });

    $(".back-btn").on('click', function() {
        window.history.back();
    });

    document.body.onkeydown = function(e) {
        e.preventDefault();
        if (e.keyCode == 32 && !sparkling) reveal();
    }

    /*pokemon.oncontextmenu = shiny.oncontextmenu = function(e){
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }*/



    function autocheck() {
        autochecking = true;
        autochecker = setInterval(reveal, 5);
    }


    var sparkle = document.getElementById("sparkle");
    var sparkles = document.getElementById("sparkles");
    var ctx = sparkles.getContext("2d");
    var particles = [];
    var drawer;

    function addSparkles() {
        for (var i = 0; i < 8; i++) particles.push({ "scale": 1, "radius": 60, "angle": 45 * i });
    }

    function drawSparkles() {
        ctx.clearRect(0, 0, 256, 256);
        for (p of particles) {
            var x = 128 + p.radius * Math.cos(p.angle * Math.PI / 180);
            var y = 128 + p.radius * Math.sin(p.angle * Math.PI / 180);
            var scaled = Math.max(32 * p.scale, 0);
            ctx.drawImage(sparkle, x - scaled / 2, y - scaled / 2, scaled, scaled);
            if (p.scale > 0.6) p.scale -= 0.2;
            else p.scale -= 0.05;
            p.angle -= 5;
            p.radius += 5;
        }
    }

    function stopDrawing() {
        clearInterval(drawer);
        particles = [];
        sparkling = false;
    }

    function shine() {
        if (!particles.length) {
            for (var i = 0; i < 5; i++) setTimeout(addSparkles, i * 100);
            drawer = setInterval(drawSparkles, 50);
            setTimeout(stopDrawing, 1000);
        }
    }

    function reveal() {
        spawn = generateSpawn();
        pokemon_info = null;

        pokemon_data.forEach(function(elem, index) {
            if (elem.id == spawn) {
                pokemon_info = elem;
            }
        });

        $("#encounter img").css("display", "none");

        var odds = getPokemonShinyOdd(spawn, pokemon_info);

        console.log(odds);

        $("#pokemon_" + spawn + "_encounters").html(parseInt($("#pokemon_" + spawn + "_encounters").html()) + 1);
        $("#total_encounters").html(parseInt($("#total_encounters").html()) + 1);

        if (Math.ceil(Math.random() * odds) == Math.ceil(Math.random() * odds)) {
            sparkling = true;
            clearInterval(autochecker);
            $("#pokemon_" + spawn + "_shiny").css("display", "block");
            $("#pokemon_" + spawn + "_shinies").html(parseInt($("#pokemon_" + spawn + "_shinies").html()) + 1);
            $("#total_shinies").html(parseInt($("#total_shinies").html()) + 1);
            //if (best_streak > streak || best_streak == "-") best_streak = streak;
            setTimeout(shine, 1000);
        } else {
            $("#pokemon_" + spawn + "_normal").css("display", "block");
            //pokemon.style.display = 'block';
            //shiny.style.display = 'none';
        }


        flash.style.transition = "opacity 0.4s";
        flash.style.opacity = 0;
    }


});



function generateSpawn() {
    var min = 0;
    var max = pokemon_list.length - 1;
    var pokemon_idx = generateRandomBetweenTwoNum(min, max);
    var pokemon = pokemon_list[pokemon_idx];

    return pokemon;

}

function generateRandomBetweenTwoNum(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function getPokemonShinyOdd(pokemon_id, pokemon_info) {
    if (event_data.length > 0 && event_data.pokemon[pokemon_id].odd) {
        return parseInt(event_data.pokemon[pokemon_id].odd);
    } else {
        return parseInt(pokemon_info.odds);
    }
}