var pokemon_data = {};

var BASE_IMG_FOLDER_URL = "/img/pokemon_icons/";
var BASE_IMG_FAMILY_TREE_PATH = "/img/pokemon_icons/pokemon_icon_";

var unique = 0,
    available = 0,
    total = 0;

var list_regions = ["kanto", "johto", "hoenn", "sinnoh", "unova", "kalos", "alola", "galar", "noform"];
var list_types = ["normal", "fire", "fighting", "water", "flying", "grass",
    "poison", "electric", "ground", "psychic", "rock", "ice",
    "bug", "dragon", "ghost", "dark", "steel", "fairy", "???"
];
var list_filters = ["shadow", "purified", "regional", "costume", "exclusive", "tradable", "deployable", "transferable", "evolve", "tradeevolve", "itemevolve"];
var list_events = ["community day", "research day", "raid day", "go fest", "safari zone", "gobattle day", "incense day", "other", "normal"];
var list_genders = ["male", "female", "genderless"];
var list_categories = ["fossil", "baby", "mythical", "legendary", "starter", "nocategory", "pseudo-legendary", "ultrabeast"];

var cardOnChangeQuantity = null;

var previousCard = null;
var nextCard = null;
var bioContext = "normal";
var bioGenderContext = "male";

function loadData(backend_data, isTemporary) {
    for (i = 0; i < backend_data.length; i++) {
        var data = JSON.parse(backend_data[i].replace(/\r?\n|\r/g, ''));
        pokemon_data[data.id] = data;
        if (isTemporary == data.isTemporary) {
            available++;
            total += parseInt(data.quantity);
            unique = parseInt(data.quantity) > 0 ? unique + 1 : unique;
        }
    }

    console.log(pokemon_data);
}


$(function() {

    desactivateAndEnableSortOptions();

    if (location.href.includes("future-shiny-list")) {
        $("#sort-date-new-btn").addClass("active");
        $("#sort-date-new-btn").prop("disabled", "true");

    } else {
        $("#sort-num-1n-btn").addClass("active");
        $("#sort-num-1n-btn").prop("disabled", "true");
    }

    toastr.options.closeButton = true;
    toastr.options.closeMethod = 'fadeOut';
    toastr.options.closeDuration = 300;
    toastr.options.closeEasing = 'swing';


    var pokemon_img_1 = $("#pokemon-bio-img-1");
    var pokemon_img_2 = $("#pokemon-bio-img-2");
    var pokemon_img_3 = $("#pokemon-bio-img-3");
    var pokemon_img_4 = $("#pokemon-bio-img-4");

    var pokemon_img_gender_1 = $("#pokemon-bio-gender-img-1");
    var pokemon_img_gender_2 = $("#pokemon-bio-gender-img-2");
    var pokemon_img_gender_3 = $("#pokemon-bio-gender-img-3");
    var pokemon_img_gender_4 = $("#pokemon-bio-gender-img-4");

    var pokemon_icon_is_shiny = $("#pokemon-bio-is-shiny-icon");
    var pokemon_icon_type = $("#pokemon-bio-type-icon");

    var unique_count_label = $("#unique-count");
    var available_count_label = $("#available-count");
    var total_count_label = $("#total-count");
    var unique_percentage_label = $("#unique-percentage");

    unique_count_label.text(unique);
    available_count_label.text(available);
    total_count_label.text(total);
    unique_percentage_label.text((unique / available * 100).toFixed(1) + " %");

    /* CHANGE QUANTITY */

    $(".shinylist-card #pokemon-remove-btn").on('click', function(e) {
        var card = this.parentElement.parentElement.parentElement.parentElement;
        var pokemonID = card.querySelector("#pokemon-id").innerHTML;
        var pokemonData = pokemon_data[pokemonID];
        var quantity = parseInt(pokemonData.quantity) - 1;
        updateShinyToBe(pokemonID, quantity, card);
    });

    $(".shinylist-card #pokemon-add-btn").on('click', function(e) {
        var card = this.parentElement.parentElement.parentElement.parentElement;
        var pokemonID = card.querySelector("#pokemon-id").innerHTML;
        var pokemonData = pokemon_data[pokemonID];
        var quantity = parseInt(pokemonData.quantity) + 1;
        updateShinyToBe(pokemonID, quantity, card);
    });

    $(".shinylist-card #pokemon-update-shiny-btn").on('click', function(e) {
        var card = this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
        var pokemonID = card.querySelector("#pokemon-id").innerHTML;
        var pokemonData = pokemon_data[pokemonID];
        $("#change-quantity-modal .modal-title").text("Change Quantity of Shiny " + pokemonData.name);
        $("#change-quantity-modal #new-quantity-input").val(pokemonData.quantity);
        $("#change-quantity-modal #pokemon-id-hidden-input").val(pokemonData.id);
        cardOnChangeQuantity = card;
        $("#change-quantity-modal").modal();
    });

    $(".shinylist-card #pokemon-update-checks-btn").on('click', function(e) {
        var card = this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement;
        var pokemonID = card.querySelector("#pokemon-id").innerHTML;
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


    $(".shinylist-card").on('click', "#pokemon-card-img", function(e) {
        var pokemonID = this.parentElement.querySelector("#pokemon-id").innerHTML;

        previousCard = $(this).parent().parent().prev().children().children("#pokemon-card-img");
        nextCard = $(this).parent().parent().next().children().children("#pokemon-card-img");

        openBioModal(pokemonID);

    });

    pokemon_img_gender_1.on('click', function() {
        pokemon_img_gender_1.attr("src", pokemon_img_gender_1.attr("src").replace("_grey", ""));
        pokemon_img_gender_2.attr("src", pokemon_img_gender_2.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        pokemon_img_gender_3.attr("src", pokemon_img_gender_3.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png")
        pokemon_img_gender_4.attr("src", pokemon_img_gender_4.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png")
        pokemon_img_1.css("display", "initial");
        pokemon_img_2.css("display", "none");
        pokemon_img_3.css("display", "none");
        pokemon_img_4.css("display", "none");
        pokemon_icon_is_shiny.css("display", "none");
        pokemonData = pokemon_data[this.parentElement.parentElement.querySelector("#pokemon-bio-id").innerHTML];
        activateFamilyTree(pokemonData, false, false);
        bioContext = "normal";
        bioGenderContext = "male"
    });

    pokemon_img_gender_2.on('click', function() {
        pokemon_img_gender_1.attr("src", pokemon_img_gender_1.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        pokemon_img_gender_2.attr("src", pokemon_img_gender_2.attr("src").replace("_grey", ""));
        pokemon_img_gender_3.attr("src", pokemon_img_gender_3.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        pokemon_img_gender_4.attr("src", pokemon_img_gender_4.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        pokemon_img_1.css("display", "none");
        pokemon_img_2.css("display", "initial");
        pokemon_img_3.css("display", "none");
        pokemon_img_4.css("display", "none");
        pokemon_icon_is_shiny.css("display", "initial");
        pokemonData = pokemon_data[this.parentElement.parentElement.querySelector("#pokemon-bio-id").innerHTML];
        activateFamilyTree(pokemonData, true, false);
        bioContext = "shiny";
        bioGenderContext = "male"
    });

    pokemon_img_gender_3.on('click', function() {
        pokemon_img_gender_1.attr("src", pokemon_img_gender_1.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        pokemon_img_gender_2.attr("src", pokemon_img_gender_2.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        pokemon_img_gender_3.attr("src", pokemon_img_gender_3.attr("src").replace("_grey", ""));
        pokemon_img_gender_4.attr("src", pokemon_img_gender_4.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        pokemon_img_1.css("display", "none");
        pokemon_img_2.css("display", "none");
        pokemon_img_3.css("display", "initial");
        pokemon_img_4.css("display", "none");
        pokemon_icon_is_shiny.css("display", "none");
        pokemonData = pokemon_data[this.parentElement.parentElement.querySelector("#pokemon-bio-id").innerHTML];
        activateFamilyTree(pokemonData, false, true);
        bioContext = "normal";
        bioGenderContext = "female"
    });

    pokemon_img_gender_4.on('click', function() {
        pokemon_img_gender_1.attr("src", pokemon_img_gender_1.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        pokemon_img_gender_2.attr("src", pokemon_img_gender_2.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        pokemon_img_gender_3.attr("src", pokemon_img_gender_3.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        pokemon_img_gender_4.attr("src", pokemon_img_gender_4.attr("src").replace("_grey", ""));
        pokemon_img_1.css("display", "none");
        pokemon_img_2.css("display", "none");
        pokemon_img_3.css("display", "none");
        pokemon_img_4.css("display", "initial");
        pokemon_icon_is_shiny.css("display", "initial");
        pokemonData = pokemon_data[this.parentElement.parentElement.querySelector("#pokemon-bio-id").innerHTML];
        activateFamilyTree(pokemonData, true, true);
        bioContext = "shiny";
        bioGenderContext = "female"
    });

    //on pokemon bio modal close
    $('#pokemon-bio-modal').on('hidden.bs.modal', function() {
        previousCard = null;
        nextCard = null;
        bioContext = "normal";
    });

    // right and left arrow click
    $(document).keydown(function(e) {
        // left arrow click
        if (e.which == 37) {
            if (previousCard != null) {
                previousCard.click();
            }
        }

        // right arrow click 
        else if (e.which == 39) {
            if (nextCard != null) {
                nextCard.click();
            }
        }
    });

    $("#family-trees-div").on('click', ".pokemon-family-tree-img", function(e) {
        var id = $(this).data("id");
        //$("span").filter(function() { return ($(this).text() === id) }).siblings("#pokemon-card-img").click();
        openBioModal(id);
    });




    // SORT OPTIONS

    $("#sort-num-1n-btn").click(function() {
        desactivateAndEnableSortOptions();
        $("#sort-num-1n-btn").addClass("active");
        $("#sort-num-1n-btn").prop("disabled", "true");
        $('.shinylist .shinylist-card-design').sort(function(a, b) {
            return $(a).find("#pokemon-id").text() > $(b).find("#pokemon-id").text() ? 1 : -1;
        }).appendTo(".shinylist");
    });

    $("#sort-num-n1-btn").click(function() {
        desactivateAndEnableSortOptions();
        $("#sort-num-n1-btn").addClass("active");
        $("#sort-num-n1-btn").prop("disabled", "true");
        $('.shinylist .shinylist-card-design').sort(function(a, b) {
            return $(a).find("#pokemon-id").text() < $(b).find("#pokemon-id").text() ? 1 : -1;
        }).appendTo(".shinylist");
    });

    $("#sort-date-old-btn").click(function() {
        desactivateAndEnableSortOptions();
        $("#sort-date-old-btn").addClass("active");
        $("#sort-date-old-btn").prop("disabled", "true");
        $('.shinylist .shinylist-card-design').sort(function(a, b) {
            return new Date(pokemon_data[$(a).find("#pokemon-id").text()].startDates.shinyStartDate) > new Date(pokemon_data[$(b).find("#pokemon-id").text()].startDates.shinyStartDate) ? 1 : -1;
        }).appendTo(".shinylist");
    });

    $("#sort-date-new-btn").click(function() {
        desactivateAndEnableSortOptions();
        $("#sort-date-new-btn").addClass("active");
        $("#sort-date-new-btn").prop("disabled", "true");
        $('.shinylist .shinylist-card-design').sort(function(a, b) {
            return new Date(pokemon_data[$(a).find("#pokemon-id").text()].startDates.shinyStartDate) < new Date(pokemon_data[$(b).find("#pokemon-id").text()].startDates.shinyStartDate) ? 1 : -1;
        }).appendTo(".shinylist");
    });

    $("#sort-changed-old-btn").click(function() {
        desactivateAndEnableSortOptions();
        $("#sort-changed-old-btn").addClass("active");
        $("#sort-changed-old-btn").prop("disabled", "true");
        $('.shinylist .shinylist-card-design').sort(function(a, b) {
            return new Date(pokemon_data[$(a).find("#pokemon-id").text()].lastModified) > new Date(pokemon_data[$(b).find("#pokemon-id").text()].lastModified) ? 1 : -1;
        }).appendTo(".shinylist");
    });

    $("#sort-changed-new-btn").click(function() {
        desactivateAndEnableSortOptions();
        $("#sort-changed-new-btn").addClass("active");
        $("#sort-changed-new-btn").prop("disabled", "true");
        $('.shinylist .shinylist-card-design').sort(function(a, b) {
            return new Date(pokemon_data[$(a).find("#pokemon-id").text()].lastModified) < new Date(pokemon_data[$(b).find("#pokemon-id").text()].lastModified) ? 1 : -1;
        }).appendTo(".shinylist");
    });

    $("#sort-name-az-btn").click(function() {
        desactivateAndEnableSortOptions();
        $("#sort-name-az-btn").addClass("active");
        $("#sort-name-az-btn").prop("disabled", "true");
        $('.shinylist .shinylist-card-design').sort(function(a, b) {
            return $(a).find(".card-title").text() > $(b).find(".card-title").text() ? 1 : -1;
        }).appendTo(".shinylist");
    });

    $("#sort-name-za-btn").click(function() {
        desactivateAndEnableSortOptions();
        $("#sort-name-za-btn").addClass("active");
        $("#sort-name-za-btn").prop("disabled", "true");
        $('.shinylist .shinylist-card-design').sort(function(a, b) {
            return $(a).find(".card-title").text() < $(b).find(".card-title").text() ? 1 : -1;
        }).appendTo(".shinylist");
    });

    $("#sort-family-az-btn").click(function() {
        desactivateAndEnableSortOptions();
        $("#sort-family-az-btn").addClass("active");
        $("#sort-family-az-btn").prop("disabled", "true");
        $('.shinylist .shinylist-card-design').sort(function(a, b) {
            return pokemon_data[$(a).find("#pokemon-id").text()].family > pokemon_data[$(b).find("#pokemon-id").text()].family ? 1 : -1;
        }).appendTo(".shinylist");
    });

    $("#sort-family-za-btn").click(function() {
        desactivateAndEnableSortOptions();
        $("#sort-family-za-btn").addClass("active");
        $("#sort-family-za-btn").prop("disabled", "true");
        $('.shinylist .shinylist-card-design').sort(function(a, b) {
            return pokemon_data[$(a).find("#pokemon-id").text()].family < pokemon_data[$(b).find("#pokemon-id").text()].family ? 1 : -1;
        }).appendTo(".shinylist");
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

            $('#update-checks-modal').modal('hide')

            $("#update-checks-modal #start-seen-error").css("display", "none");
            $("#update-checks-modal #current-seen-error").css("display", "none");
        });
    });



    /* SEARCH */

    // ON press enter
    $(function() {
        var input = document.getElementById("query-search-input");

        input.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                search();
                unique_count_label.text(unique);
                available_count_label.text(available);
                total_count_label.text(total);
                unique_percentage_label.text((available > 0 ? (unique / available * 100).toFixed(1) : 0) + " %");
            }
        });

    });

    // on submit btn
    $(function() {
        $('#btn-search-shinylist').click(function() {
            search();
            unique_count_label.text(unique);
            available_count_label.text(available);
            total_count_label.text(total);
            unique_percentage_label.text((available > 0 ? (unique / available * 100).toFixed(1) : 0) + " %");
        });
    });


    /* FILTER */

    $(function() {

        $('#costume-filter-checkbox').change(function() {
            search();
            unique_count_label.text(unique);
            available_count_label.text(available);
            total_count_label.text(total);
            unique_percentage_label.text((available > 0 ? (unique / available * 100).toFixed(1) : 0) + " %");
        });

        $('#shadow-filter-checkbox').change(function() {
            search();
            unique_count_label.text(unique);
            available_count_label.text(available);
            total_count_label.text(total);
            unique_percentage_label.text((available > 0 ? (unique / available * 100).toFixed(1) : 0) + " %");
        });

        $('#purified-filter-checkbox').change(function() {
            search();
            unique_count_label.text(unique);
            available_count_label.text(available);
            total_count_label.text(total);
            unique_percentage_label.text((available > 0 ? (unique / available * 100).toFixed(1) : 0) + " %");
        });

    });

});


function search() {
    $('.shinylist-card-design').removeClass('d-none');
    var filter = $("#query-search-input").val(); // get the value of the input, which we filter on

    var or_filter = filter.split(",");
    for (key in or_filter) {
        or_filter[key] = or_filter[key].split('&');
    }

    unique = 0, available = 0, total = 0;

    $(".shinylist-card-design").each(function() {
        var pokemon_id = this.querySelector("#pokemon-id").innerHTML;
        var result = false;
        for (var i = 0; i < or_filter.length; i++) {
            var and_result = true;
            for (var j = 0; j < or_filter[i].length; j++) {
                if (!evaluateSubQuery(or_filter[i][j], pokemon_id)) {
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
        } else {
            available++;
            unique = pokemon_data[pokemon_id].quantity > 0 ? unique + 1 : unique;
            total = total + parseInt(pokemon_data[pokemon_id].quantity);
        }
    });
}



function evaluateSubQuery(query, pokemon_id) {
    var queryEvaluation = evaluateByQuery(query, pokemon_id);

    // filter evaluation
    if (!$("#shadow-filter-checkbox").is(':checked') && filterByFilter("shadow", pokemon_id, false)) {
        return false;
    }

    if (!$("#purified-filter-checkbox").is(':checked') && filterByFilter("purified", pokemon_id, false)) {
        return false;
    }

    if (!$("#costume-filter-checkbox").is(':checked') && filterByFilter("costume", pokemon_id, false)) {
        return false;
    }

    return queryEvaluation;

}

function evaluateByQuery(query, pokemon_id) {
    var notFlag = query.startsWith('!');
    if (notFlag) query = query.slice(1);

    if (list_regions.includes(query)) {
        return filterByRegion(query, pokemon_id, notFlag);
    } else if (query.charAt(0) == '%' && list_regions.includes(query.slice(1))) {
        return filterByForm(query.slice(1), pokemon_id, notFlag);
    } else if (list_types.includes(query)) {
        return filterByType(query, pokemon_id, notFlag);
    } else if (list_filters.includes(query)) {
        return filterByFilter(query, pokemon_id, notFlag);
    } else if (list_genders.includes(query)) {
        return filterByGender(query, pokemon_id, notFlag);
    } else if (query.charAt(0) == '?' && list_events.includes(query.slice(1))) {
        return filterByEvent(query.slice(1), pokemon_id, notFlag);
    } else if (query.split("#").length == 2 && !isNaN(query.split("#")[0])) {
        return filterByIdx(query, pokemon_id, notFlag);
    } else if (query.split("#").length == 3 && !isNaN(query.split("#")[0])) {
        return filterByIdx2(query, pokemon_id, notFlag);
    } else if (list_categories.includes(query)) {
        return filterByCategory(query, pokemon_id, notFlag);
    } else if (query.charAt(0) == '+' && list_categories.includes(query.slice(1))) {
        return filterByCategoryFamily(query.slice(1), pokemon_id, notFlag);
    } else if (query.charAt(0) == '+' && !isNaN(query.slice(1))) {
        return filterByFamilyIds(parseInt(query.slice(1)), pokemon_id, notFlag);
    } else if (query.charAt(0) == '+') {
        return filterByFamilyNames(query.slice(1), pokemon_id, notFlag);
    } else if (query.startsWith('gen') && !isNaN(query.slice(3))) {
        return filterByGeneration(parseInt(query.slice(3)), pokemon_id, notFlag);
    } else if (query == 'have') {
        return filterByHave(pokemon_id, notFlag);
    } else if (query.startsWith('quantity') && (!isNaN(query.slice(8)) || query.slice(8).split("-").length == 2 && (!isNaN(query.slice(8).split("-")[0]) || query.slice(8).split("-")[0] == "") && (!isNaN(query.slice(8).split("-")[1]) || query.slice(8).split("-")[1] == ""))) {
        return filterByQuantity(query.slice(8), pokemon_id, notFlag);
    } else if (query.startsWith('year') && !isNaN(query.slice(4))) {
        return filterByYear(query.slice(4), pokemon_id, notFlag);
    } else if (query.split("-").length == 2 && (!isNaN(query.split("-")[0]) || query.split("-")[0] == "") && (!isNaN(query.split("-")[1]) || query.split("-")[1] == "")) {
        return filterByIdRange(query, pokemon_id, notFlag);
    } else if (query.length <= 9 && !isNaN(query) && query != "") {
        return filterById(parseInt(query), pokemon_id, notFlag);
    } else if (query != "") {
        return filterByName(query, pokemon_id, notFlag);
    } else {
        return !notFlag;
    }
}


function filterByName(query, pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].name.toLowerCase().includes(query.toLowerCase())) {
        return !notFlag;
    }
    return notFlag;
}

function filterByRegion(query, pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].location.region != query) {
        return notFlag;
    }
    return !notFlag;
}

function filterByForm(query, pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].location.form != query) {
        return notFlag;
    }
    return !notFlag;
}

function filterByType(query, pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].types.includes(query)) {
        return !notFlag;
    }

    return notFlag;
}

function filterByFilter(query, pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].filters.includes(query)) {
        return !notFlag;
    }

    return notFlag;
}

function filterByGender(query, pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].genders.includes(query)) {
        return !notFlag;
    }

    return notFlag;
}

function filterByEvent(query, pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].eventList.includes(query)) {
        return !notFlag;
    }

    return notFlag;
}

function filterByIdx(query, pokemon_id, notFlag) {
    if (!pokemon_data[pokemon_id].idNumeric == parseInt(query.split("#")[0]) || !pokemon_data[pokemon_id].id_type == parseInt(query.split("#")[1])) {
        return notFlag;
    }
    return !notFlag;
}

function filterByIdx2(query, pokemon_id, notFlag) {
    if (!pokemon_data[pokemon_id].idNumeric == parseInt(query.split("#")[0]) || !pokemon_data[pokemon_id].id_type == parseInt(query.split("#")[1]) || !pokemon_data[pokemon_id].id_2types == parseInt(query.split("#")[2])) {
        return notFlag;
    }
    return !notFlag;
}

function filterByCategory(query, pokemon_id, notFlag) {
    if (query == "pseudo-legendary") {
        query = "pseudo_legendary";
    }
    if (pokemon_data[pokemon_id].group[0] != query) {
        return notFlag;
    }
    return !notFlag;
}


function filterByCategoryFamily(query, pokemon_id, notFlag) {
    if (query == "pseudo-legendary") {
        query = "pseudo_legendary";
    }

    let groupFamily = pokemon_data[pokemon_id].groupFamily;
    for (var i = 0; i < groupFamily.length; i++) {
        if (groupFamily[i] == query) {
            return !notFlag;
        }
    }

    return notFlag;
}

function filterByFamilyIds(query, pokemon_id, notFlag) {
    if (!pokemon_data[pokemon_id].familyIds.includes(query)) {
        return notFlag;
    }
    return !notFlag;
}

function filterByFamilyNames(query, pokemon_id, notFlag) {
    if (!pokemon_data[pokemon_id].familyMembers.includes(query.toLowerCase())) {
        return notFlag;
    }
    return !notFlag;
}

function filterByGeneration(query, pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].location.generation != query) {
        return notFlag;
    }
    return !notFlag;
}

function filterById(query, pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].idNumeric != query) {
        return notFlag;
    }
    return !notFlag;
}

function filterByHave(pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].quantity == 0) {
        return notFlag;
    }
    return !notFlag;
}

function filterByIdRange(query, pokemon_id, notFlag) {
    if (!isNaN(query.split("-")[0]) && pokemon_data[pokemon_id].idNumeric >= parseInt(query.split("-")[0]) &&
        !isNaN(query.split("-")[1]) && pokemon_data[pokemon_id].idNumeric <= parseInt(query.split("-")[1])) {
        return !notFlag;
    } else if (query.split("-")[0] == "" && pokemon_data[pokemon_id].idNumeric <= parseInt(query.split("-")[1])) {
        return !notFlag;
    } else if (query.split("-")[1] == "" && pokemon_data[pokemon_id].idNumeric >= parseInt(query.split("-")[0])) {
        return !notFlag;
    }
    return notFlag;
}

function filterByQuantity(query, pokemon_id, notFlag) {
    if (!isNaN(query) && pokemon_data[pokemon_id].quantity == parseInt(query)) {
        return !notFlag;
    } else if (!isNaN(query.split("-")[0]) && pokemon_data[pokemon_id].quantity >= parseInt(query.split("-")[0]) &&
        !isNaN(query.split("-")[1]) && pokemon_data[pokemon_id].quantity <= parseInt(query.split("-")[1])) {
        return !notFlag;
    } else if (query.split("-")[0] == "" && pokemon_data[pokemon_id].quantity <= parseInt(query.split("-")[1])) {
        return !notFlag;
    } else if (query.split("-")[1] == "" && pokemon_data[pokemon_id].quantity >= parseInt(query.split("-")[0])) {
        return !notFlag;
    }
    return notFlag;
}

function filterByYear(query, pokemon_id, notFlag) {
    if (new Date(pokemon_data[pokemon_id].startDates.shinyStartDate).getFullYear() != parseInt(query)) {
        return notFlag;
    }
    return !notFlag;
}

/* EXTRA FUNCTIONS */

function getFamilyShinyQuantity(pokemonData) {


    var quantity = parseInt(getFamilyMemberShinyQuantity(pokemonData))
}

function getFamilyPathShinyQuantity(path) {

}

function getFamilyMemberImg(familyMemberId, isShiny, isFemale) {
    if (!isFemale) {
        return isShiny ? pokemon_data[familyMemberId].image.imageShiny : pokemon_data[familyMemberId].image.imageNormal;
    } else {
        return isShiny ? pokemon_data[familyMemberId].image.imageShiny2 : pokemon_data[familyMemberId].image.imageNormal2;
    }
}

function getFamilyTreeLabel(familyMemberId) {
    return pokemon_data[familyMemberId].name;
}

function getFamilyMemberShinyQuantity(familyMemberId) {
    return parseInt(pokemon_data[familyMemberId].quantity);
}


function desactivateAndEnableSortOptions() {
    $("#sort-num-1n-btn").removeClass("active");
    $("#sort-num-n1-btn").removeClass("active");
    $("#sort-date-old-btn").removeClass("active");
    $("#sort-date-new-btn").removeClass("active");
    $("#sort-changed-old-btn").removeClass("active");
    $("#sort-changed-new-btn").removeClass("active");
    $("#sort-name-az-btn").removeClass("active");
    $("#sort-name-za-btn").removeClass("active");
    $("#sort-family-az-btn").removeClass("active");
    $("#sort-family-za-btn").removeClass("active");

    $("#sort-num-1n-btn").removeAttr('disabled')
    $("#sort-num-n1-btn").removeAttr('disabled')
    $("#sort-date-old-btn").removeAttr('disabled')
    $("#sort-date-new-btn").removeAttr('disabled')
    $("#sort-changed-old-btn").removeAttr('disabled')
    $("#sort-changed-new-btn").removeAttr('disabled')
    $("#sort-name-az-btn").removeAttr('disabled')
    $("#sort-name-za-btn").removeAttr('disabled')
    $("#sort-family-az-btn").removeAttr('disabled')
    $("#sort-family-za-btn").removeAttr('disabled')
}


function updateShinyToBe(pokemon_id, quantity, card) {
    if (cardOnChangeQuantity != null && (isNaN(quantity) || quantity < 0)) {
        $("#change-quantity-modal .alert-danger").css("display", "block");
        return;
    } else if (isNaN(quantity) || quantity < 0) {
        toastr.error('Wrong number format!');
        return;
    }

    if (pokemon_data[pokemon_id].isTemporary && quantity > 1) {
        quantity = 1;
    }

    var original_quantity = pokemon_data[pokemon_id].quantity;

    $.post("/update-shiny", { pokemon: pokemon_id, quantity: quantity, isTemporary: pokemon_data[pokemon_id].isTemporary }, function(result) {
        pokemon_data[result.pokemon_id].quantity = parseInt(result.quantity);
        pokemon_data[result.pokemon_id].lastModified = result.lastModified;
        card.querySelector("#pokemon-quantity-label").innerHTML = quantity + "x";

        if (quantity == 0) {
            card.querySelector("#pokemon-card-img").classList.remove("img-shiny");
            card.querySelector("#pokemon-card-img").classList.add("img-normal");
            card.querySelector("#pokemon-card-img").src = BASE_IMG_FOLDER_URL + pokemon_data[pokemon_id].image.imageNormal;
            card.querySelector("#pokemon-remove-btn").disabled = true;
            card.querySelector("#pokemon-add-btn").disabled = false;
        } else if (pokemon_data[pokemon_id].isTemporary) {
            card.querySelector("#pokemon-card-img").classList.remove("img-normal");
            card.querySelector("#pokemon-card-img").classList.add("img-shiny");
            card.querySelector("#pokemon-card-img").src = BASE_IMG_FOLDER_URL + pokemon_data[pokemon_id].image.imageShiny;
            card.querySelector("#pokemon-add-btn").disabled = true;
            card.querySelector("#pokemon-remove-btn").disabled = false;
        } else {
            card.querySelector("#pokemon-card-img").classList.remove("img-normal");
            card.querySelector("#pokemon-card-img").classList.add("img-shiny");
            card.querySelector("#pokemon-card-img").src = BASE_IMG_FOLDER_URL + pokemon_data[pokemon_id].image.imageShiny;
            card.querySelector("#pokemon-remove-btn").disabled = false;
        }

        $("#total-count").text(parseInt($("#total-count").text()) + (quantity - original_quantity));

        if (original_quantity == 0 && quantity > 0) {
            $("#unique-count").text(parseInt($("#unique-count").text()) + 1);
        } else if (original_quantity > 0 && quantity == 0) {
            $("#unique-count").text(parseInt($("#unique-count").text()) - 1);
        }

        $("#unique-percentage").text(((parseInt($("#unique-count").text()) / parseInt($("#available-count").text())) * 100).toFixed(1) + " %");

        $('#change-quantity-modal').modal('hide')

        if (cardOnChangeQuantity != null) {
            cardOnChangeQuantity = null;
        } else {
            $("#change-quantity-modal .alert-danger").css("display", "none");
        }
    });

}


function openBioModal(pokemonID) {
    var pokemonData = pokemon_data[pokemonID];

    bioGenderContext = pokemonData.image.imageNormal2 ? bioGenderContext : "male";

    /* SET IMAGES AND GENDER ICONS */

    var pokemon_img_1 = $("#pokemon-bio-img-1");
    var pokemon_img_2 = $("#pokemon-bio-img-2");
    var pokemon_img_3 = $("#pokemon-bio-img-3");
    var pokemon_img_4 = $("#pokemon-bio-img-4");

    var pokemon_img_gender_1 = $("#pokemon-bio-gender-img-1");
    var pokemon_img_gender_2 = $("#pokemon-bio-gender-img-2");
    var pokemon_img_gender_3 = $("#pokemon-bio-gender-img-3");
    var pokemon_img_gender_4 = $("#pokemon-bio-gender-img-4");

    var pokemon_icon_is_shiny = $("#pokemon-bio-is-shiny-icon");
    var pokemon_icon_type = $("#pokemon-bio-type-icon");


    if (bioContext === "normal" && bioGenderContext === "male") {
        pokemon_img_1.css("display", "initial");
        pokemon_img_2.css("display", "none");
        pokemon_img_3.css("display", "none");
        pokemon_img_4.css("display", "none");
        pokemon_icon_is_shiny.css("display", "none");
    } else if (bioContext === "shiny" && bioGenderContext === "male") {
        pokemon_img_1.css("display", "none");
        pokemon_img_2.css("display", "initial");
        pokemon_img_3.css("display", "none");
        pokemon_img_4.css("display", "none");
        pokemon_icon_is_shiny.css("display", "block");
    } else if (bioContext === "normal" && bioGenderContext === "female") {
        pokemon_img_1.css("display", "none");
        pokemon_img_2.css("display", "none");
        pokemon_img_3.css("display", "initial");
        pokemon_img_4.css("display", "none");
        pokemon_icon_is_shiny.css("display", "none");
    } else {
        pokemon_img_1.css("display", "none");
        pokemon_img_2.css("display", "none");
        pokemon_img_3.css("display", "none");
        pokemon_img_4.css("display", "initial");
        pokemon_icon_is_shiny.css("display", "block");
    }


    pokemon_img_gender_1.css("display", "initial");
    pokemon_img_gender_2.css("display", "initial");
    pokemon_img_gender_3.css("display", "initial");
    pokemon_img_gender_4.css("display", "initial");

    pokemon_icon_type.css("display", "none");

    if (bioContext === "normal" && bioGenderContext === "male") {
        pokemon_img_gender_1.attr("src", "img/male_l_mod.png");
        pokemon_img_gender_2.attr("src", "img/male_shiny_l_grey.png");
        pokemon_img_gender_3.attr("src", "img/female_l_mod_grey.png");
        pokemon_img_gender_4.attr("src", "img/female_shiny_l_grey.png");
    } else if (bioContext === "shiny" && bioGenderContext === "male") {
        pokemon_img_gender_1.attr("src", "img/male_l_mod_grey.png");
        pokemon_img_gender_2.attr("src", "img/male_shiny_l.png");
        pokemon_img_gender_3.attr("src", "img/female_l_mod_grey.png");
        pokemon_img_gender_4.attr("src", "img/female_shiny_l_grey.png");
    } else if (bioContext === "normal" && bioGenderContext === "female") {
        pokemon_img_gender_1.attr("src", "img/male_l_mod_grey.png");
        pokemon_img_gender_2.attr("src", "img/male_shiny_l_grey.png");
        pokemon_img_gender_3.attr("src", "img/female_l_mod.png");
        pokemon_img_gender_4.attr("src", "img/female_shiny_l_grey.png");
    } else {
        pokemon_img_gender_1.attr("src", "img/male_l_mod_grey.png");
        pokemon_img_gender_2.attr("src", "img/male_shiny_l_grey.png");
        pokemon_img_gender_3.attr("src", "img/female_l_mod_grey.png");
        pokemon_img_gender_4.attr("src", "img/female_shiny_l.png");
    }

    pokemon_img_1.attr("src", BASE_IMG_FOLDER_URL + pokemonData.image.imageNormal);
    pokemon_img_2.attr("src", BASE_IMG_FOLDER_URL + pokemonData.image.imageShiny);

    if (pokemonData.genders.includes("male") && pokemonData.genders.includes("female")) {
        if (pokemonData.image.imageNormal2) {
            pokemon_img_3.attr("src", BASE_IMG_FOLDER_URL + pokemonData.image.imageNormal2);
            pokemon_img_4.attr("src", BASE_IMG_FOLDER_URL + pokemonData.image.imageShiny2);
        } else {
            if (bioContext === "normal") {
                pokemon_img_gender_1.attr("src", "img/genderall_l_mod.png");
                pokemon_img_gender_2.attr("src", "img/genderall_shiny_l_grey.png");
            } else {
                pokemon_img_gender_1.attr("src", "img/genderall_l_mod_grey.png");
                pokemon_img_gender_2.attr("src", "img/genderall_shiny_l.png");
            }
            pokemon_img_gender_3.css("display", "none");
            pokemon_img_gender_4.css("display", "none");
        }
    } else if (pokemonData.genders.includes("male")) {
        pokemon_img_gender_3.css("display", "none");
        pokemon_img_gender_4.css("display", "none");

    } else if (pokemonData.genders.includes("female")) {
        pokemon_img_gender_1.css("display", "none");
        pokemon_img_gender_2.css("display", "none");
        pokemon_img_gender_3.attr("src", "img/female_l_mod.png");
        pokemon_img_3.attr("src", BASE_IMG_FOLDER_URL + pokemonData.image.imageNormal);
        pokemon_img_4.attr("src", BASE_IMG_FOLDER_URL + pokemonData.image.imageShiny);
    } else if (pokemonData.genders.includes("genderless")) {
        if (bioContext === "normal") {
            pokemon_img_gender_1.attr("src", "img/genderless_l_mod.png");
            pokemon_img_gender_2.attr("src", "img/genderless_shiny_l_grey.png");
        } else {
            pokemon_img_gender_1.attr("src", "img/genderless_l_mod_grey.png");
            pokemon_img_gender_2.attr("src", "img/genderless_shiny_l.png");
        }
        pokemon_img_gender_3.css("display", "none");
        pokemon_img_gender_4.css("display", "none");
    }

    if (pokemonData.filters.includes("shadow")) {
        pokemon_icon_type.css("display", "initial");
        pokemon_icon_type.attr("src", "/img/ic_shadow.png");
    } else if (pokemonData.filters.includes("purified")) {
        pokemon_icon_type.css("display", "initial");
        pokemon_icon_type.attr("src", "/img/ic_purified.png");
    }


    /* SET TYPE ICONS */

    var pokemon_img_type_1 = $("#pokemon-bio-type-1-img");
    var pokemon_img_type_2 = $("#pokemon-bio-type-2-img");

    pokemon_img_type_1.css("display", "initial");
    pokemon_img_type_2.css("display", "initial");

    var types = 0;
    pokemonData.types.forEach((type) => {
        if (types == 0) {
            pokemon_img_type_1.attr("src", "img/type_" + type + ".png");
            types++;
        } else if (types == 1) {
            pokemon_img_type_2.attr("src", "img/type_" + type + ".png");
            types++;
        }
    });


    if (types < 2) {
        pokemon_img_type_2.css("display", "none");
    }

    /* SET TEXT INFORMATION */


    $("#pokemon-bio-id").text(pokemonData.id);
    $("#pokemon-bio-title").text(pokemonData.name);
    $("#pokemon-bio-pokedex-number").text(pokemonData.idNumeric);
    $("#pokemon-bio-height").text(pokemonData.pokemonDimensions.height < 0 ? "??? m" : pokemonData.pokemonDimensions.height.toFixed(2) + " m");
    $("#pokemon-bio-family").text(pokemonData.family.charAt(0).toUpperCase() + pokemonData.family.slice(1).replace("_", ""));
    $("#pokemon-bio-category").text(pokemonData.group.length > 0 ? pokemonData.group[0].charAt(0).toUpperCase() + pokemonData.group[0].slice(1).replace("_", "") : "");
    $("#pokemon-bio-weight").text(pokemonData.pokemonDimensions.weight < 0 ? "??? kg" : pokemonData.pokemonDimensions.weight.toFixed(2) + " kg");
    $("#pokemon-bio-description").text(pokemonData.description.description_en);
    $("#pokemon-bio-start-date").text(processDateToBio(pokemonData.startDates.shinyStartDate));

    /* SET STATS INFORMATION */


    var no_checks = parseInt(pokemonData.currentSeen) - parseInt(pokemonData.startSeen);
    var percentage_1 = parseInt(pokemonData.quantity) > 0 ? " 1/" + (no_checks / parseInt(pokemonData.quantity).toFixed(0)).toString() :
        "0/" + no_checks;
    var percentage_2 = parseInt(pokemonData.quantity) / no_checks;

    if (pokemonData.currentSeen > 0) {
        $("#pokemon-stats-start-seen").text(pokemonData.startSeen || 0);
        $("#pokemon-stats-current-seen").text(pokemonData.currentSeen || 0);
        $("#pokemon-stats-checks-total").text(pokemonData.quantity + "/" + no_checks.toString());
        $("#pokemon-stats-checks-percentage").text(percentage_1);
        $("#pokemon-stats-checks-percentage-2").text(percentage_2);
    } else {
        $("#pokemon-stats-start-seen").text("No information available");
        $("#pokemon-stats-current-seen").text("No information available");
        $("#pokemon-stats-checks-total").text("No information available");
        $("#pokemon-stats-checks-percentage").text("No information available");
        $("#pokemon-stats-checks-percentage-2").text("No information available");
    }


    /* SET FAMILY TREE PATHS */

    $("#family-trees-div").empty();

    buildDynamicFamilyTree(pokemonData.familyTree.path01, 1);
    if (pokemonData.familyTree.path02) {
        buildDynamicFamilyTree(pokemonData.familyTree.path02, 2);
    }
    if (pokemonData.familyTree.path03) {
        buildDynamicFamilyTree(pokemonData.familyTree.path03, 3);
    }
    if (pokemonData.familyTree.path04) {
        buildDynamicFamilyTree(pokemonData.familyTree.path04, 4);
    }
    if (pokemonData.familyTree.path05) {
        buildDynamicFamilyTree(pokemonData.familyTree.path05, 5);
    }
    if (pokemonData.familyTree.path06) {
        buildDynamicFamilyTree(pokemonData.familyTree.path06, 6);
    }
    if (pokemonData.familyTree.path07) {
        buildDynamicFamilyTree(pokemonData.familyTree.path07, 7);
    }
    if (pokemonData.familyTree.path08) {
        buildDynamicFamilyTree(pokemonData.familyTree.path08, 8);
    }

    activateFamilyTree(pokemonData, bioContext === 'shiny', bioGenderContext === 'female');


    $('#pokemon-bio-modal').modal();
}



function buildDynamicFamilyTree(familyTree, index) {
    if (familyTree.filter((member) => pokemon_data.hasOwnProperty(member)).length != familyTree.length) {
        return;
    }

    var content = "<div class=\"pokemon-family-tree-path text-center\">";
    if (familyTree.length == 1) {
        content += "<div class=\"pokemon-family-tree-path-img-singular\">";
    } else if (familyTree.length == 2) {
        content += "<div class=\"pokemon-family-tree-path-img-double\">";
    } else {
        content += "<div class=\"pokemon-family-tree-path-img\">";
    }

    content += buildDynamicFamilyTreeMember(familyTree[0], index, 1);
    if (familyTree.length > 1) {
        content += "<div class=\"pokemon-family-tree-path-icon\"><i id=\"pokemon-family-tree-" + index + "-arrow-1\" class=\"fas fa-arrow-right fa-2x\"></i></div>";
        content += "<div class=\"pokemon-family-tree-path-img\">";
        content += buildDynamicFamilyTreeMember(familyTree[1], index, 2);
    }

    if (familyTree.length > 2) {
        content += "<div class=\"pokemon-family-tree-path-icon\"><i id=\"pokemon-family-tree-" + index + "-arrow-1\" class=\"fas fa-arrow-right fa-2x\"></i></div>";
        content += "<div class=\"pokemon-family-tree-path-img\">";
        content += buildDynamicFamilyTreeMember(familyTree[2], index, 3);
    }

    content += "</div>";
    $("#family-trees-div").append(content);
}

function buildDynamicFamilyTreeMember(familyMember, familyIndex, memberIndex) {
    var content = "<img class=\"pokemon-family-tree-img\" id=\"pokemon-family-tree-" + familyIndex + "-member-" + memberIndex + "-img-1\" src=\"" + BASE_IMG_FOLDER_URL + getFamilyMemberImg(familyMember, false, false) + "\" data-id=\"" + familyMember + "\">";
    content += "<img class=\"pokemon-family-tree-img\" id=\"pokemon-family-tree-" + familyIndex + "-member-" + memberIndex + "-img-1-shiny\" src=\"" + BASE_IMG_FOLDER_URL + getFamilyMemberImg(familyMember, true, false) + "\" data-id=\"" + familyMember + "\" style=\"display: none\">";

    if (pokemon_data[familyMember].image.imageNormal2) {
        content += "<img class=\"pokemon-family-tree-img\" id=\"pokemon-family-tree-" + familyIndex + "-member-" + memberIndex + "-img-2\" src=\"" + BASE_IMG_FOLDER_URL + getFamilyMemberImg(familyMember, false, true) + "\" data-id=\"" + familyMember + "\" style=\"display: none\">";
        content += "<img class=\"pokemon-family-tree-img\" id=\"pokemon-family-tree-" + familyIndex + "-member-" + memberIndex + "-img-2-shiny\" src=\"" + BASE_IMG_FOLDER_URL + getFamilyMemberImg(familyMember, true, true) + "\" data-id=\"" + familyMember + "\" style=\"display: none\">";
    }
    content += "<p id=\"pokemon-family-tree-" + familyIndex + "-label-" + memberIndex + "\" class=\"pokemon-family-tree-label\">" + getFamilyTreeLabel(familyMember) + "</p></div>";
    return content;
}

function activateFamilyTree(data, isShiny, isFemale) {
    var isMemberFemale = isFemale;
    for (var i = 0; i < Object.keys(data.familyTree).length; i++) {
        var p = data.familyTree[Object.keys(data.familyTree)[i]];

        if (p.filter((member) => pokemon_data.hasOwnProperty(member)).length != p.length) {
            continue;
        } else {
            for (var j = 0; j < p.length; j++) {
                isMemberFemale = pokemon_data[p[j]].image.imageNormal2 ? isFemale : false;
                if (isShiny && !isMemberFemale) {
                    $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-1").css("display", "none");
                    $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-1-shiny").css("display", "block");
                    if (pokemon_data[p[j]].image.imageNormal2) {
                        $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-2").css("display", "none");
                        $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-2-shiny").css("display", "none");
                    }
                } else if (!isShiny && !isMemberFemale) {
                    $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-1").css("display", "block");
                    $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-1-shiny").css("display", "none");
                    if (pokemon_data[p[j]].image.imageNormal2) {
                        $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-2").css("display", "none");
                        $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-2-shiny").css("display", "none");
                    }
                } else if (isShiny && isMemberFemale) {
                    $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-1").css("display", "none");
                    $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-1-shiny").css("display", "none");
                    if (pokemon_data[p[j]].image.imageNormal2) {
                        $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-2").css("display", "none");
                        $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-2-shiny").css("display", "block");
                    }
                } else {
                    $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-1").css("display", "none");
                    $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-1-shiny").css("display", "none");
                    if (pokemon_data[p[j]].image.imageNormal2) {
                        $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-2").css("display", "block");
                        $("#pokemon-family-tree-" + (i + 1) + "-member-" + (j + 1) + "-img-2-shiny").css("display", "none");
                    }
                }
            }
        }
    }
}

function processDateToBio(date) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    date = new Date(date);

    return (date.getDate() < 10 ? '0' : '') + date.getDate() + " " + months[date.getMonth()] +
        " " + date.getFullYear() + " " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

}