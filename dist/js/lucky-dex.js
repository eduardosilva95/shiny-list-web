var unique = 0,
    available = 0,
    total = 0;


function loadData() {
    loadNavbar();

    $("#lucky-dex-list").empty();
    $("#loading").css("display", "block");

    $.get("/lucky-dex-list/" + getUserCookie(), {}, function(result) {
        if (result.error == null) {
            var pokemon_list = result.pokemon_list;
            for (var i = 0; i < pokemon_list.length; i++) {
                var pokemon = pokemon_list[i];

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
    var content = "<div class=\"col-md-2\"><div id=\"lucky-dex-card\" class=\"" + (hasLucky ? 'lucky-dex-card lucky-dex-card-checked' : 'lucky-dex-card') + "\">";
    content += "<div class=\"lucky-dex-card-body\"><label class=\"image-checkbox\">";
    content += "<input type=\"checkbox\" style=\"display: none;\" value=\"" + pokemon.id + "\"" + (hasLucky ? 'checked' : '') + ">";
    content += "<i class=\"fa fa-check hidden\"></i>";
    content += "<img src=\"/img/pokemon_icons/" + pokemon.image.image_normal + "\" class=\"img-responsive img-normal\"/>";
    content += "<div class=\"lucky-dex-card-label text-center\"><span class=\"card-link\" title=\"" + pokemon.name + "\">" + pokemon.name + "</span></div>";
    content += "</label></div></div></div>";

    return content;
}


$(function() {

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


});


function updateLuckyDexToBe(pokemon_id, hasLucky, card) {

    $.post("/update-lucky", { pokemon: pokemon_id, hasLucky: hasLucky, }, function(result) {
        card.toggleClass('lucky-dex-card-checked');
        var $checkbox = card.find('input[type="checkbox"]');
        $checkbox.prop("checked", !$checkbox.prop("checked"))

        if (hasLucky) {
            $("#unique-count").text(parseInt($("#unique-count").text()) + 1);
        } else {
            $("#unique-count").text(parseInt($("#unique-count").text()) - 1);
        }

        $("#unique-percentage").text(((parseInt($("#unique-count").text()) / parseInt($("#available-count").text())) * 100).toFixed(1) + " %");
    });

}