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
var list_events = ["communityday", "researchday", "raidday", "gofest", "safarizone", "gobattleday", "incenseday", "other", "normal"];
var list_genders = ["male", "female", "genderless"];
var list_categories = ["fossil", "baby", "mythical", "legendary", "starter", "nocategory", "pseudo-legendary", "ultrabeast"];

var cardOnChangeQuantity = null;

var previousCard = null;
var nextCard = null;

function loadData(backend_data) {
    for (i = 0; i < backend_data.length; i++) {
        var data = JSON.parse(backend_data[i].replace(/\r?\n|\r/g, ''));
        pokemon_data[data.id] = data;
        available++;
        total += parseInt(data.quantity);
        unique = parseInt(data.quantity) > 0 ? unique + 1 : unique;
    }

    console.log(pokemon_data);
}


$(function() {

    desactivateAndEnableSortOptions();
    $("#sort-num-1n-btn").addClass("active");
    $("#sort-num-1n-btn").prop("disabled", "true");
    $('.shinylist .shinylist-card-design').sort(function(a, b) {
        return $(a).find("#pokemon-id").text() > $(b).find("#pokemon-id").text() ? 1 : -1;
    }).appendTo(".shinylist");

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

    unique_count_label.text(unique);
    available_count_label.text(available);
    total_count_label.text(total);

    $(".shinylist-card").on('click', function(e) {
        var pokemonID = this.querySelector("#pokemon-id").innerHTML;
        var pokemonData = pokemon_data[pokemonID];

        previousCard = $(this).parent().prev().children();
        nextCard = $(this).parent().next().children();

        /* CHANGE QUANTITY */

        if ($(e.target).closest("#pokemon-remove-btn:enabled").length > 0) {
            var quantity = parseInt(pokemonData.quantity) - 1;
            updateShinyToBe(pokemonID, quantity, this);
            return;
        }

        if ($(e.target).closest("#pokemon-add-btn:enabled").length > 0) {
            var quantity = parseInt(pokemonData.quantity) + 1;
            updateShinyToBe(pokemonID, quantity, this);
            return;
        }

        if ($(e.target).closest("#pokemon-change-btn:enabled").length > 0) {
            $("#change-quantity-modal .modal-title").text("Change Quantity of Shiny " + pokemonData.name);
            $("#change-quantity-modal #new-quantity-input").val(pokemonData.quantity);
            $("#change-quantity-modal #pokemon-id-hidden-input").val(pokemonData.id);
            cardOnChangeQuantity = this;
            $("#change-quantity-modal").modal();
            return;
        }

        /* SET IMAGES AND GENDER ICONS */

        pokemon_img_1.css("display", "initial");
        pokemon_img_2.css("display", "none");
        pokemon_img_3.css("display", "none");
        pokemon_img_4.css("display", "none");

        pokemon_img_gender_1.css("display", "initial");
        pokemon_img_gender_2.css("display", "initial");
        pokemon_img_gender_3.css("display", "initial");
        pokemon_img_gender_4.css("display", "initial");

        pokemon_icon_type.css("display", "none");
        pokemon_icon_is_shiny.css("display", "none");

        pokemon_img_gender_1.attr("src", "img/male_l_mod.png");
        pokemon_img_gender_2.attr("src", "img/male_shiny_l_grey.png");
        pokemon_img_gender_3.attr("src", "img/female_l_mod_grey.png");
        pokemon_img_gender_4.attr("src", "img/female_shiny_l_grey.png");

        pokemon_img_1.attr("src", BASE_IMG_FOLDER_URL + pokemonData.image.image_normal);
        pokemon_img_2.attr("src", BASE_IMG_FOLDER_URL + pokemonData.image.image_shiny);

        if (pokemonData.genders.male && pokemonData.genders.female) {
            if (pokemonData.image.image_normal_2) {
                pokemon_img_3.attr("src", BASE_IMG_FOLDER_URL + pokemonData.image.image_normal_2);
                pokemon_img_4.attr("src", BASE_IMG_FOLDER_URL + pokemonData.image.image_shiny_2);
            } else {
                pokemon_img_gender_1.attr("src", "img/genderall_l_mod.png");
                pokemon_img_gender_2.attr("src", "img/genderall_shiny_l_grey.png");
                pokemon_img_gender_3.css("display", "none");
                pokemon_img_gender_4.css("display", "none");
            }
        } else if (pokemonData.genders.male) {
            pokemon_img_gender_3.css("display", "none");
            pokemon_img_gender_4.css("display", "none");

        } else if (pokemonData.genders.female) {
            pokemon_img_gender_1.css("display", "none");
            pokemon_img_gender_2.css("display", "none");
            pokemon_img_gender_3.attr("src", "img/female_l_mod.png");
            pokemon_img_3.attr("src", BASE_IMG_FOLDER_URL + pokemonData.image.image_normal);
            pokemon_img_4.attr("src", BASE_IMG_FOLDER_URL + pokemonData.image.image_shiny);
        } else if (pokemonData.genders.genderless) {
            pokemon_img_gender_1.attr("src", "img/genderless_l_mod.png");
            pokemon_img_gender_2.attr("src", "img/genderless_shiny_l_grey.png");
            pokemon_img_gender_3.css("display", "none");
            pokemon_img_gender_4.css("display", "none");
        }

        if (pokemonData.filters.shadow) {
            pokemon_icon_type.css("display", "initial");
            pokemon_icon_type.attr("src", "/img/ic_shadow.png");
        } else if (pokemonData.filters.purified) {
            pokemon_icon_type.css("display", "initial");
            pokemon_icon_type.attr("src", "/img/ic_purified.png");
        }


        /* SET TYPE ICONS */

        var pokemon_img_type_1 = $("#pokemon-bio-type-1-img");
        var pokemon_img_type_2 = $("#pokemon-bio-type-2-img");

        pokemon_img_type_1.css("display", "initial");
        pokemon_img_type_2.css("display", "initial");

        var types = 0;
        for (key in pokemonData.types) {
            if (pokemonData.types[key] == true && types == 0) {
                pokemon_img_type_1.attr("src", "img/type_" + key + ".png");
                types++;
            } else if (pokemonData.types[key] == true && types == 1) {
                pokemon_img_type_2.attr("src", "img/type_" + key + ".png");
                types++;
            }
        }

        if (types < 2) {
            pokemon_img_type_2.css("display", "none");
        }

        /* SET TEXT INFORMATION */


        $("#pokemon-bio-id").text(pokemonData.id);
        $("#pokemon-bio-title").text(pokemonData.name);
        $("#pokemon-bio-pokedex-number").text(pokemonData.id_numeric);
        $("#pokemon-bio-height").text(pokemonData.height < 0 ? "??? m" : pokemonData.height.toFixed(2) + " m");
        $("#pokemon-bio-family").text(pokemonData.family.charAt(0).toUpperCase() + pokemonData.family.slice(1).replace("_", ""));
        $("#pokemon-bio-category").text(pokemonData.category.charAt(0).toUpperCase() + pokemonData.category.slice(1).replace("_", ""));
        $("#pokemon-bio-weight").text(pokemonData.weight < 0 ? "??? kg" : pokemonData.weight.toFixed(2) + " kg");
        $("#pokemon-bio-description").text(pokemonData.description.description_en);

        /* SET FAMILY TREE PATHS */

        $("#family-trees-div").empty();

        buildDynamicFamilyTree(pokemonData.familyTree.path1, 1);
        if (pokemonData.familyTree.path2) {
            buildDynamicFamilyTree(pokemonData.familyTree.path2, 2);
        }
        if (pokemonData.familyTree.path3) {
            buildDynamicFamilyTree(pokemonData.familyTree.path3, 3);
        }
        if (pokemonData.familyTree.path4) {
            buildDynamicFamilyTree(pokemonData.familyTree.path4, 4);
        }
        if (pokemonData.familyTree.path5) {
            buildDynamicFamilyTree(pokemonData.familyTree.path5, 5);
        }
        if (pokemonData.familyTree.path6) {
            buildDynamicFamilyTree(pokemonData.familyTree.path6, 6);
        }
        if (pokemonData.familyTree.path7) {
            buildDynamicFamilyTree(pokemonData.familyTree.path7, 7);
        }


        $('#pokemon-bio-modal').modal();
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
        activateFamilyTree(pokemonData, false);

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
        activateFamilyTree(pokemonData, true);
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
        activateFamilyTree(pokemonData, false);
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
        activateFamilyTree(pokemonData, true);
    });

    //on pokemon bio modal close
    $('#pokemon-bio-modal').on('hidden.bs.modal', function() {
        previousCard = null;
        nextCard = null;
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
            return new Date(pokemon_data[$(a).find("#pokemon-id").text()].startDate) > new Date(pokemon_data[$(b).find("#pokemon-id").text()].startDate) ? 1 : -1;
        }).appendTo(".shinylist");
    });

    $("#sort-date-new-btn").click(function() {
        desactivateAndEnableSortOptions();
        $("#sort-date-new-btn").addClass("active");
        $("#sort-date-new-btn").prop("disabled", "true");
        $('.shinylist .shinylist-card-design').sort(function(a, b) {
            return new Date(pokemon_data[$(a).find("#pokemon-id").text()].startDate) < new Date(pokemon_data[$(b).find("#pokemon-id").text()].startDate) ? 1 : -1;
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
    if (pokemon_data[pokemon_id].region != query) {
        return notFlag;
    }
    return !notFlag;
}

function filterByForm(query, pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].form != query) {
        return notFlag;
    }
    return !notFlag;
}

function filterByType(query, pokemon_id, notFlag) {
    if (!pokemon_data[pokemon_id].types[query]) {
        return notFlag;
    }
    return !notFlag;
}

function filterByFilter(query, pokemon_id, notFlag) {
    if (!pokemon_data[pokemon_id].filters[query]) {
        return notFlag;
    }
    return !notFlag;
}

function filterByGender(query, pokemon_id, notFlag) {
    if (!pokemon_data[pokemon_id].genders[query]) {
        return notFlag;
    }
    return !notFlag;
}

function filterByEvent(query, pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].event != query) {
        return notFlag;
    }
    return !notFlag;
}

function filterByIdx(query, pokemon_id, notFlag) {
    if (!pokemon_data[pokemon_id].id_numeric == parseInt(query.split("#")[0]) || !pokemon_data[pokemon_id].id_type == parseInt(query.split("#")[1])) {
        return notFlag;
    }
    return !notFlag;
}

function filterByIdx2(query, pokemon_id, notFlag) {
    if (!pokemon_data[pokemon_id].id_numeric == parseInt(query.split("#")[0]) || !pokemon_data[pokemon_id].id_type == parseInt(query.split("#")[1]) || !pokemon_data[pokemon_id].id_2types == parseInt(query.split("#")[2])) {
        return notFlag;
    }
    return !notFlag;
}

function filterByCategory(query, pokemon_id, notFlag) {
    if (query == "pseudo-legendary") {
        query = "pseudo_legendary";
    }
    if (pokemon_data[pokemon_id].category != query) {
        return notFlag;
    }
    return !notFlag;
}


function filterByCategoryFamily(query, pokemon_id, notFlag) {
    if (query == "pseudo-legendary") {
        query = "pseudo_legendary";
    }
    if (!pokemon_data[pokemon_id].categoryMembers[query]) {
        return notFlag;
    }
    return !notFlag;
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
    if (pokemon_data[pokemon_id].generation != query) {
        return notFlag;
    }
    return !notFlag;
}

function filterById(query, pokemon_id, notFlag) {
    if (pokemon_data[pokemon_id].id_numeric != query) {
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
    if (!isNaN(query.split("-")[0]) && pokemon_data[pokemon_id].id_numeric >= parseInt(query.split("-")[0]) &&
        !isNaN(query.split("-")[1]) && pokemon_data[pokemon_id].id_numeric <= parseInt(query.split("-")[1])) {
        return !notFlag;
    } else if (query.split("-")[0] == "" && pokemon_data[pokemon_id].id_numeric <= parseInt(query.split("-")[1])) {
        return !notFlag;
    } else if (query.split("-")[1] == "" && pokemon_data[pokemon_id].id_numeric >= parseInt(query.split("-")[0])) {
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
    if (new Date(pokemon_data[pokemon_id].startDate).getFullYear() != parseInt(query)) {
        return notFlag;
    }
    return !notFlag;
}

/* EXTRA FUNCTIONS */


function getFamilyTreeLabel(familyMemberId) {
    var name = pokemon_data[Object.keys(pokemon_data).find(element => element.includes(familyMemberId))].name_species;
    return name.charAt(0).toUpperCase() + name.slice(1);
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

    var original_quantity = pokemon_data[pokemon_id].quantity;

    $.post("/update-shiny", { pokemon: pokemon_id, quantity: quantity }, function(result) {
        pokemon_data[result.pokemon_id].quantity = parseInt(result.quantity);
        card.querySelector("#pokemon-quantity-label").innerHTML = quantity + "x";

        if (quantity == 0) {
            card.querySelector("#pokemon-card-img").classList.remove("img-shiny");
            card.querySelector("#pokemon-card-img").classList.add("img-normal");
            card.querySelector("#pokemon-card-img").src = BASE_IMG_FOLDER_URL + pokemon_data[pokemon_id].image.image_normal;
            card.querySelector("#pokemon-remove-btn").disabled = true;
        } else {
            card.querySelector("#pokemon-card-img").classList.remove("img-normal");
            card.querySelector("#pokemon-card-img").classList.add("img-shiny");
            card.querySelector("#pokemon-card-img").src = BASE_IMG_FOLDER_URL + pokemon_data[pokemon_id].image.image_shiny;
            card.querySelector("#pokemon-remove-btn").disabled = false;
        }

        $("#total-count").text(parseInt($("#total-count").text()) + (quantity - original_quantity));

        if (original_quantity == 0 && quantity > 0) {
            $("#unique-count").text(parseInt($("#unique-count").text()) + 1);
        } else if (original_quantity > 0 && quantity == 0) {
            $("#unique-count").text(parseInt($("#unique-count").text()) - 1);
        }


        $('#change-quantity-modal').modal('hide')

        if (cardOnChangeQuantity != null) {
            cardOnChangeQuantity = null;
        } else {
            $("#change-quantity-modal .alert-danger").css("display", "none");
        }
    });

}


function buildDynamicFamilyTree(familyTree, index) {
    var content = "<div class=\"pokemon-family-tree-path text-center\">";
    if (familyTree.length == 1) {
        content += "<div class=\"pokemon-family-tree-path-img-singular\">";
    } else if (familyTree.length == 2) {
        content += "<div class=\"pokemon-family-tree-path-img-double\">";
    } else {
        content += "<div class=\"pokemon-family-tree-path-img\">";
    }

    content += "<img id=\"pokemon-family-tree-" + index + "-img-1\" src=\"" + BASE_IMG_FAMILY_TREE_PATH + familyTree[0] + ".png\">";
    content += "<img id=\"pokemon-family-tree-" + index + "-img-1-shiny\" src=\"" + BASE_IMG_FAMILY_TREE_PATH + familyTree[0] + "_shiny.png\" style=\"display: none\">";
    content += "<p id=\"pokemon-family-tree-" + index + "-label-1\">" + getFamilyTreeLabel(familyTree[0]) + "</p></div>";
    if (familyTree.length > 1) {
        content += "<div class=\"pokemon-family-tree-path-icon\"><i id=\"pokemon-family-tree-" + index + "-arrow-1\" class=\"fas fa-arrow-right fa-2x\"></i></div>";
        content += "<div class=\"pokemon-family-tree-path-img\">";
        content += "<img id=\"pokemon-family-tree-" + index + "-img-2\" src=\"" + BASE_IMG_FAMILY_TREE_PATH + familyTree[1] + ".png\">";
        content += "<img id=\"pokemon-family-tree-" + index + "-img-2-shiny\" src=\"" + BASE_IMG_FAMILY_TREE_PATH + familyTree[1] + "_shiny.png\" style=\"display: none\">";
        content += "<p id=\"pokemon-family-tree-" + index + "-label-2\">" + getFamilyTreeLabel(familyTree[1]) + "</p></div>";
    }

    if (familyTree.length > 2) {
        content += "<div class=\"pokemon-family-tree-path-icon\"><i id=\"pokemon-family-tree-" + index + "-arrow-1\" class=\"fas fa-arrow-right fa-2x\"></i></div>";
        content += "<div class=\"pokemon-family-tree-path-img\">";
        content += "<img id=\"pokemon-family-tree-" + index + "-img-3\" src=\"" + BASE_IMG_FAMILY_TREE_PATH + familyTree[2] + ".png\">";
        content += "<img id=\"pokemon-family-tree-" + index + "-img-3-shiny\" src=\"" + BASE_IMG_FAMILY_TREE_PATH + familyTree[2] + "_shiny.png\" style=\"display: none\">";
        content += "<p id=\"pokemon-family-tree-" + index + "-label-3\">" + getFamilyTreeLabel(familyTree[2]) + "</p></div>";
    }

    content += "</div>";
    $("#family-trees-div").append(content);
}

function activateFamilyTree(data, isShiny) {
    console.log(data);
    for (var i = 0; i < Object.keys(data.familyTree).length; i++) {
        var p = data.familyTree[Object.keys(data.familyTree)[i]];
        for (var j = 0; j < p.length; j++) {
            if (isShiny) {
                $("#pokemon-family-tree-" + (i + 1) + "-img-" + (j + 1)).css("display", "none");
                $("#pokemon-family-tree-" + (i + 1) + "-img-" + (j + 1) + "-shiny").css("display", "block");
            } else {
                $("#pokemon-family-tree-" + (i + 1) + "-img-" + (j + 1)).css("display", "block");
                $("#pokemon-family-tree-" + (i + 1) + "-img-" + (j + 1) + "-shiny").css("display", "none");
            }
        }
    }
}