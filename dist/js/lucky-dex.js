var unique = 0,
    available = 0,
    total = 0;

var pokemon_data = {};

function loadData() {
    loadNavbar();

    $("#lucky-dex-list").empty();
    $("#loading").css("display", "block");

    $.get("/lucky-dex-list/" + getUserCookie(), {}, function(result) {
        if (result.error == null) {
            var pokemon_list = result.pokemon_list;
            for (var i = 0; i < pokemon_list.length; i++) {
                var pokemon = pokemon_list[i];

                pokemon_data[pokemon.id] = pokemon;

                var hasLucky = pokemon.hasLucky != undefined && pokemon.hasLucky === true;
                unique = hasLucky ? unique + 1 : unique;
                available++;

                var content = buildDynamicLuckydexCard(pokemon, hasLucky);
                $("#lucky-dex-list").append(content);

                var unique_count_label = $("#unique-count");
                var available_count_label = $("#available-count");
                var unique_percentage_label = $("#unique-percentage");

                unique_count_label.text(unique);
                available_count_label.text(available);
                unique_percentage_label.text((unique / available * 100).toFixed(1) + " %");
            }
            $("#loading").css("display", "none");
            $("#lucky-dex-list").css("display", "");
        }
    });


}



function buildDynamicLuckydexCard(pokemon, hasLucky) {
    var content = "<div class=\"col-md-2 lucky-dex-card-design\"><div id=\"lucky-dex-card\" class=\"" + (hasLucky ? 'lucky-dex-card lucky-dex-card-checked' : 'lucky-dex-card') + "\">";
    content += "<div class=\"lucky-dex-card-body\"><label class=\"image-checkbox\">";
    content += "<input id=\"pokemon-id\" type=\"checkbox\" style=\"display: none;\" value=\"" + pokemon.id + "\"" + (hasLucky ? 'checked' : '') + ">";
    content += "<i class=\"fa fa-check hidden\"></i>";
    content += "<img src=\"/img/pokemon_icons/" + pokemon.image.imageNormal + "\" class=\"img-responsive img-normal\" loading=\"lazy\"/>";
    content += "<div class=\"lucky-dex-card-label text-center\"><span class=\"card-link\" title=\"" + pokemon.name + "\">" + pokemon.name + "</span></div>";
    content += "</label></div></div></div>";

    return content;
}


$(function() {
    var unique_count_label = $("#unique-count");
    var available_count_label = $("#available-count");
    var unique_percentage_label = $("#unique-percentage");


    $("#lucky-dex-card").each(function() {
        if ($(this).find('input[type="checkbox"]').first().attr("checked")) {
            $(this).addClass('lucky-dex-card-checked');
        } else {
            $(this).removeClass('lucky-dex-card-checked');
        }
    });

    $("#lucky-dex-list").on('click', '.lucky-dex-card', function(e) {
        var pokemon_id = $(this).find('input[type="checkbox"]').val();
        var isLuckySelected = $(this).hasClass('lucky-dex-card-checked');
        updateLuckyDexToBe(pokemon_id, !isLuckySelected, $(this));
        e.preventDefault();
    });

    /* FILTER */

    $('#have-filter-checkbox').change(function() {
        search();
        unique_count_label.text(unique);
        available_count_label.text(available);
        unique_percentage_label.text((available > 0 ? (unique / available * 100).toFixed(1) : 0) + " %");
    });

    $('#dont-have-filter-checkbox').change(function() {
        search();
        unique_count_label.text(unique);
        available_count_label.text(available);
        unique_percentage_label.text((available > 0 ? (unique / available * 100).toFixed(1) : 0) + " %");
    });


});


function updateLuckyDexToBe(pokemon_id, hasLucky, card) {

    $.post("/update-lucky", { pokemon: pokemon_id, hasLucky: hasLucky, quantity: 1 }, function(result) {
        card.toggleClass('lucky-dex-card-checked');
        var $checkbox = card.find('input[type="checkbox"]');
        $checkbox.prop("checked", !$checkbox.prop("checked"))

        pokemon_data[pokemon_id].hasLucky = hasLucky;

        search();


    });

}


function search() {
    $('.lucky-dex-card-design').removeClass('d-none');

    unique = 0, available = 0, total = 0;

    $(".lucky-dex-card-design").each(function() {
        pokemon_id = $(this.querySelector("#pokemon-id")).val()

        if (!evaluateSubQuery(pokemon_id)) {
            $(this).addClass('d-none');
        } else {
            available++;
            unique = this.querySelector("#pokemon-id").checked ? unique + 1 : unique;
        }
    });
}

function evaluateSubQuery(pokemon_id) {
    var queryEvaluation = true;

    // filter evaluation
    if (!$("#have-filter-checkbox").is(':checked') && filterByHave(pokemon_id, false)) {
        return false;
    }

    if (!$("#dont-have-filter-checkbox").is(':checked') && filterByHave(pokemon_id, true)) {
        return false;
    }

    return queryEvaluation;
}

function filterByHave(pokemon_id, notFlag) {
    if (!pokemon_data[pokemon_id].hasLucky) {
        return notFlag;
    }
    return !notFlag;
}