var list_regions = new Set();
var list_forms = new Set();
var list_types = new Set();
var list_filters = new Set();
var list_events = new Set();
var list_genders = new Set();
var list_categories = new Set();
var list_events_categories = new Set();

var enableFunctions = [];
var filterCacheKey = null;

/* SEARCH */

function loadActions(actions, page) {
    // load search
    var searchData;
    $("#search-help-filters-div").empty();

    if (!actions || !actions.search || Object.keys(actions.search).length == 0) {
        $("#search-list-div").remove();
    } else {
        for (var key in actions.search) {
            if (actions.search.hasOwnProperty(key)) {
                searchData = actions.search[key];
                if (searchData.enableFunc) {
                    enableFunctions = enableFunctions.concat(searchData.enableFunc);
                }
                if (searchData.title && searchData.description) {
                    appendSearchFilter(searchData.title, searchData.description);
                }

            }
        }
        $("#search-list-div").css("display", "flex");
    }

    // load sort
    if (!actions || !actions.sort || Object.keys(actions.sort).length == 0) {
        $("#sort-list-div").remove();
    } else {
        $("#sort-list-dropdown-div").empty();
        for (var key in actions.sort) {
            if (actions.sort.hasOwnProperty(key)) {
                appendSortOption(actions.sort[key]);
            }
        }
        $("#sort-list-div").css("display", "initial");
    }

    // load filters
    if (!actions || !actions.filter || actions.filter.length == 0) {
        $("#filter-list-div").remove();
    } else {
        filterCacheKey = page + "Filters";
        $("#filter-list-dropdown-div").empty();
        actions.filter.forEach((filterGroup) => buildFiltersGroup(filterGroup));
        $("#filter-list-div").css("display", "initial");
    }

    // load stats
    if (!actions || !actions.stats) {
        $("#stats-list-div").remove();
    } else {
        $("#stats-list-div").css("display", "initial");
    }


    search();
}

function appendSearchFilter(title, description) {
    $("#search-help-filters-div").append("<p><strong>" + title + ":</strong> " + description + "</p>");
}

function appendSortOption(sort) {
    var content = "<button type=\"button\" id=\"" + sort.id + "\" class=\"dropdown-item dropdown-sort-list" + (sort.active ? " active" : "") + " \"data-attribute=\"" + sort.attribute + "\" data-is-date=\"" + sort.isDateAttribute + "\">";
    content += "<i class=\"" + sort.icon + "\"></i><span style=\"padding-left: 10px;\">" + sort.title + "</span></button>";
    $("#sort-list-dropdown-div").append(content);

    if (sort.active) {
        $("#" + sort.id).click();
        $("#" + sort.id).prop('disabled', true);
    }

}

function buildFiltersGroup(filterGroup) {
    content = "<div id=\"" + filterGroup.id + "\">";
    if (filterGroup.label) {
        content += "<p><strong>" + filterGroup.label + "</strong></p>";
    }

    var sliders = [];

    var filter = null;

    filterGroup.inputs.forEach((input) => {
        if (input.type == "checkbox") {
            filter = getFiltersFromCache(input.id);
            var isChecked = filter == null || filter == true;
            content += "<div class=\"custom-control custom-checkbox\"><input type=\"checkbox\" class=\"custom-control-input filter-list-checkbox filter-list\" id=\"" + input.id + "\" data-attribute=\"" +
                input.attribute + "\" data-value=\"" + input.value + "\" data-type=\"" + input.type + "\" " + (isChecked ? "checked" : "") + ">";
            content += "<label class=\"custom-control-label\" for=\"" + input.id + "\"><img class=\"filter-list-checkbox-icon\" src=\"" + input.image + "\">" + input.label + "</label></div>";
            setFiltersOnCache(input.id, isChecked);
        } else if (input.type == "slider") {
            sliders.push(input);
            content += "<div class=\"filter-list-slider\"><p><label for=\"" + input.id + "-label\"><b>" + input.label + ":</b></label>";
            content += "<input type=\"text\" id=\"" + input.id + "-label\" class=\"filter-list\" data-attribute=\"" + input.attribute + "\" data-type=\"" + input.type + "\" data-is-date=\"" + input.isDateAttribute + "\" readonly><p>";
            content += "<div id=\"" + input.id + "\"></div>";
        }
    });

    content += "</div><br>";
    $("#filter-list-dropdown-div").append(content);

    // register sliders
    sliders.forEach(slider => registerSlider(slider));
}

function registerSlider(slider) {
    var min = 0,
        max = 0;

    if (slider.minMaxDyn) {
        var attrs = slider.minMaxDyn.split(",");
        var minMax = [];
        if (slider.isDateAttribute) {
            minMax = getMinMaxFromDateAttributes(attrs[0], attrs.length > 1 ? attrs[1] : null);
        } else {
            minMax = getMinMaxFromAttributes(attrs[0], attrs.length > 1 ? attrs[1] : null);
        }

        if (minMax.length == 2) {
            min = minMax[0];
            max = minMax[1];
        }
    } else {
        min = slider.min;
        max = slide.max;
    }

    var values = [min, max];

    var savedValues = getFiltersFromCache(slider.id);
    var savedMin, savedMax;
    if (savedValues && savedValues.split("-").length == 2) {
        savedMin = savedValues.split("-")[0];
        savedMax = savedValues.split("-")[1];

        if (!isNaN(savedMin) && savedMin > min) {
            values[0] = parseInt(savedMin);
        }

        if (!isNaN(savedMax) && savedMax < max) {
            values[1] = parseInt(savedMax)
        }
    }

    $("#" + slider.id).slider({
        range: true,
        min: min,
        max: max,
        step: slider.step,
        values: values,
        slide: function(event, ui) {
            $("#" + slider.id + "-label").val(ui.values[0] + " - " + ui.values[1]);
            setFiltersOnCache(slider.id, ui.values[0] + "-" + ui.values[1]);
            search();
        }
    });

    $("#" + slider.id + "-label").val(values[0] + " - " + values[1]);

    setFiltersOnCache(slider.id, values[0] + "-" + values[1]);
}

function updateSliderMinMax(sliderId, property, value) {
    var min = property == "min" ? value : $("#" + sliderId).slider("option", "min");
    var max = property == "max" ? value : $("#" + sliderId).slider("option", "max");
    var selectedMin = property == "min" && $("#" + sliderId).slider("values")[0] == $("#" + sliderId).slider("option", "min") ? value : $("#" + sliderId).slider("values")[0];
    var selectedMax = property == "max" && $("#" + sliderId).slider("values")[1] == $("#" + sliderId).slider("option", "max") ? value : $("#" + sliderId).slider("values")[1];
    var values = [selectedMin, selectedMax];

    $("#" + sliderId).slider({
        min: min,
        max: max,
        values: values
    });

    $("#" + sliderId + "-label").val(values[0] + " - " + values[1]);

    setFiltersOnCache(sliderId, values[0] + "-" + values[1]);
}


function getMinMaxFromAttributes(attr1, attr2) {
    var min, max;

    if (attr2 == null) {
        max = pokemon_data[list_pokemon_id.reduce(function(a, b) {
            return pokemon_data[a][attr1] > pokemon_data[b][attr1] ? a : b;
        })][attr1];

        min = pokemon_data[list_pokemon_id.reduce(function(a, b) {
            return pokemon_data[a][attr1] < pokemon_data[b][attr1] ? a : b;
        })][attr1];

    } else {
        max = pokemon_data[list_pokemon_id.reduce(function(a, b) {
            return pokemon_data[a][attr1][attr2] > pokemon_data[b][attr1][attr2] ? a : b;
        })][attr1][attr2];

        min = pokemon_data[list_pokemon_id.reduce(function(a, b) {
            return pokemon_data[a][attr1][attr2] < pokemon_data[b][attr1][attr2] ? a : b;
        })][attr1][attr2];
    }

    return [min, max];
}


function getMinMaxFromDateAttributes(attr1, attr2) {
    var min, max;

    if (attr2 == null) {
        max = new Date(pokemon_data[list_pokemon_id.reduce(function(a, b) {
            return new Date(pokemon_data[a][attr1]) > new Date(pokemon_data[b][attr1]) ? a : b;
        })][attr1]).getFullYear();

        min = new Date(pokemon_data[list_pokemon_id.reduce(function(a, b) {
            return new Date(pokemon_data[a][attr1]) < new Date(pokemon_data[b][attr1]) ? a : b;
        })][attr1]).getFullYear();

    } else {
        max = new Date(pokemon_data[list_pokemon_id.reduce(function(a, b) {
            return new Date(pokemon_data[a][attr1][attr2]) > new Date(pokemon_data[b][attr1][attr2]) ? a : b;
        })][attr1][attr2]).getFullYear();

        min = new Date(pokemon_data[list_pokemon_id.reduce(function(a, b) {
            return new Date(pokemon_data[a][attr1][attr2]) < new Date(pokemon_data[b][attr1][attr2]) ? a : b;
        })][attr1][attr2]).getFullYear();
    }

    // the max value for a year is the current year
    if (max > new Date().getFullYear()) {
        max = new Date().getFullYear();
    }


    return [min, max];
}


// ON press enter
$(function() {
    var input = document.getElementById("search-list-input");

    if (input) {
        input.addEventListener("keyup", function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                search();
            }
        });
    }
});

$(function() {
    $('#btn-search-list').click(function() {
        search();
    });
});


function search() {
    $('.list-card-design').removeClass('d-none');
    var filter = $("#search-list-input").val(); // get the value of the input, which we filter on

    if (filter != undefined) {
        var or_filter = filter.split(",");
        for (key in or_filter) {
            or_filter[key] = or_filter[key].split('&');
        }

        var unique = 0,
            available = 0,
            total = 0;

        $(".list-card-design").each(function() {
            var card_id = this.querySelector("#card-id").innerHTML;
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
            } else {
                available++;
                if (openedPage == "shinylist") {
                    total = total + parseInt(pokemon_data[card_id].quantity);
                    unique = pokemon_data[card_id].quantity > 0 ? unique + 1 : unique;
                } else if (openedPage == "luckylist") {
                    unique = pokemon_data[card_id].hasLucky ? unique + 1 : unique;
                }
            }
        });

        if (openedPage === "shinylist" || openedPage === "luckylist") {
            setCounters(unique, total, available);
        } else if (openedPage !== "events") {
            setCounters(null, available, null);
        }
    }
}



function evaluateSubQuery(query, card_id) {
    var queryEvaluation = evaluateByQuery(query, card_id);

    // filter evaluation
    $(".filter-list").each(function() {
        // Too hammered ... but cant think of a better way 
        if ($(this).data("type") == "checkbox" && $(this).data("attribute") == "filter" && !$(this).is(":checked") && filterByFilter($(this).data("value"), card_id, false)) {
            queryEvaluation = false;
        } else if ($(this).data("type") == "checkbox" && $(this).data("attribute") == "have" && !$(this).is(":checked") && filterByHave(card_id, !$(this).data("value"))) {
            queryEvaluation = false;
        } else if ($(this).data("type") == "checkbox" && $(this).data("attribute") == "haveLucky" && !$(this).is(":checked") && filterByHaveLucky(card_id, !$(this).data("value"))) {
            queryEvaluation = false;
        } else if ($(this).data("type") == "slider" && $(this).data("isDate") != "undefined") {
            var attr = $(this).data("attribute") == "shinyStartDate" ? "shiny" : "pokemon";
            if (!filterByYear($(this).val().replace(/\s/g, ''), card_id, false, attr)) {
                queryEvaluation = false;
            }
        } else if ($(this).data("type") == "slider" && $(this).data("attribute") == "quantity") {
            if (!filterByQuantity($(this).val(), card_id, false)) {
                queryEvaluation = false;
            }
        }
    });

    return queryEvaluation;
}

function evaluateByQuery(query, card_id) {
    var notFlag = query.startsWith('!');
    if (notFlag) query = query.slice(1);

    query = query.toLowerCase();


    // FILTER POKEMON BY KEYWORD
    if (enableFunctions.includes("pokemonGen") && query.startsWith('gen') && !isNaN(query.slice(3))) {
        return filterByGeneration(parseInt(query.slice(3)), card_id, notFlag);
    } else if (enableFunctions.includes("pokemonHave") && query == 'have') {
        return filterByHave(card_id, notFlag);
    } else if (enableFunctions.includes("pokemonQuantity") && checkFilterWithRange(query, "quantity")) {
        return filterByQuantity(query.slice(8), card_id, notFlag);
    } else if (enableFunctions.includes("pokemonYear") && checkFilterWithRange(query, "yearpokemon")) {
        return filterByYear(query.slice(11), card_id, notFlag, "pokemon");
    } else if (enableFunctions.includes("pokemonYear") && checkFilterWithRange(query, "yearshiny")) {
        return filterByYear(query.slice(9), card_id, notFlag, "shiny");
    } else if (enableFunctions.includes("pokemonYear") && checkFilterWithRange(query, "year")) {
        return filterByYear(query.slice(4), card_id, notFlag, "both");
    } else if (enableFunctions.includes("pokemonMove") && query == "@move" || query == "@3move") {
        return filterByFilter("@move", card_id, notFlag);
    } else if (enableFunctions.includes("pokemonMove") && query.startsWith("@1")) {
        return filterByFastMove(query, card_id, notFlag);
    } else if (enableFunctions.includes("pokemonMove") && (query.startsWith("@2") || query.startsWith("@3"))) {
        return filterByChargedMove(query, card_id, notFlag);
    } else if (enableFunctions.includes("pokemonMove") && query.startsWith("@")) {
        return filterByPokemonMove(query, card_id, notFlag);
    } else if (enableFunctions.includes("movePvPBuffs") && query == "buffs") {
        return filterByPvPBuffs(query, card_id, notFlag);
    } else if (enableFunctions.includes("eventYear") && checkFilterWithRange(query, "year")) {
        return filterByEventYear(query.slice(4), card_id, notFlag, "both");
    } else if (enableFunctions.includes("eventYear") && checkFilterWithRange(query, "yearstart")) {
        return filterByEventYear(query.slice(9), card_id, notFlag, "start");
    } else if (enableFunctions.includes("eventYear") && checkFilterWithRange(query, "yearend")) {
        return filterByEventYear(query.slice(7), card_id, notFlag, "end");

        // FILTER POKEMON BY LISTS LOADED
    } else if (enableFunctions.includes("pokemonRegion") && list_regions.has(query.toLowerCase())) {
        return filterByRegion(query, card_id, notFlag);
    } else if (enableFunctions.includes("pokemonForm") && query.charAt(0) == '%' && list_forms.has(query.slice(1).toLowerCase())) {
        return filterByForm(query.slice(1), card_id, notFlag);
    } else if (enableFunctions.includes("pokemonType") && list_types.has(query.toLowerCase())) {
        return filterByType(query, card_id, notFlag);
    } else if (enableFunctions.includes("pokemonFilters") && list_filters.has(query.toLowerCase())) {
        return filterByFilter(query, card_id, notFlag);
    } else if (enableFunctions.includes("pokemonGender") && list_genders.has(query.toLowerCase())) {
        return filterByGender(query, card_id, notFlag);
    } else if (enableFunctions.includes("pokemonEvent") && list_events.has(query.toLowerCase())) {
        return filterByEvent(query, card_id, notFlag);
    } else if (enableFunctions.includes("pokemonFilters") && list_categories.has(query)) {
        return filterByCategory(query, card_id, notFlag);
    } else if (enableFunctions.includes("pokemonFilters") && query.charAt(0) == '+' && list_categories.has(query.slice(1))) {
        return filterByCategoryFamily(query.slice(1), card_id, notFlag);
    } else if (enableFunctions.includes("moveType") && list_types.has(query.toLowerCase())) {
        return filterByMove(query, card_id, notFlag);
    } else if (enableFunctions.includes("eventCategory") && list_events_categories.has(query.toLowerCase().replace(" ", ""))) {
        return filterByEventCategory(query, card_id, notFlag);

        // REMAINING FILTERS
    } else if (enableFunctions.includes("pokemonSecondId") && query.split("#").length == 2 && !isNaN(query.split("#")[0])) {
        return filterByIdx(query, card_id, notFlag);
    } else if (enableFunctions.includes("pokemonSecondId") && query.split("#").length == 3 && !isNaN(query.split("#")[0])) {
        return filterByIdx2(query, card_id, notFlag);
    } else if (enableFunctions.includes("pokemonFamilyId") && query.charAt(0) == '+' && !isNaN(query.slice(1))) {
        return filterByFamilyIds(parseInt(query.slice(1)), card_id, notFlag);
    } else if (enableFunctions.includes("pokemonFamilyName") && query.charAt(0) == '+') {
        return filterByFamilyNames(query.slice(1), card_id, notFlag);
    } else if (enableFunctions.includes("pokemonIdRange") && checkFilterWithRange(query, "")) {
        return filterByIdRange(query, card_id, notFlag);
    } else if (enableFunctions.includes("pokemonId") && query.length <= 9 && !isNaN(query) && query != "") {
        return filterById(parseInt(query), card_id, notFlag);
    } else if (enableFunctions.includes("pokemonName") && query != "") {
        return filterByName(query, card_id, notFlag);
    } else if (enableFunctions.includes("moveName") && query != "") {
        return filterByMove(query, card_id, notFlag);
    } else if (enableFunctions.includes("eventName") && query != "") {
        return filterByEventName(query, card_id, notFlag);
    } else {
        return !notFlag && query == "";
    }
}

function checkFilterWithRange(query, keyword) {
    if (query.startsWith(keyword)) {
        var remQuery = query.slice(keyword.length);
        if (!isNaN(remQuery) && remQuery != "") {
            return true;
        } else if (remQuery.split("-").length == 2) {
            if ((!isNaN(remQuery.split("-")[0]) || remQuery.split("-")[0] == "") && (!isNaN(remQuery.split("-")[1]) || remQuery.split("-")[1] == "")) {
                return true;
            }
        }
    }
    return false;
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
    if (pokemon_data[pokemon_id].group.includes(query)) {
        return !notFlag;
    }
    return notFlag;
}


function filterByCategoryFamily(query, pokemon_id, notFlag) {
    if (query == "pseudo-legendary") {
        query = "pseudo_legendary";
    }

    if (pokemon_data[pokemon_id].groupFamily.includes(query)) {
        return !notFlag;
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
    if (pokemon_data[pokemon_id].familyMembers.filter(member => member.startsWith(query)).length > 0) {
        return !notFlag;
    }
    return notFlag;
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

function filterByHaveLucky(pokemon_id, notFlag) {
    if (!pokemon_data[pokemon_id].hasLucky) {
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

function filterByYear(query, pokemon_id, notFlag, filter) {
    var pokemonYears = [];
    if (filter == "shiny") {
        pokemonYears.push(new Date(pokemon_data[pokemon_id].startDates.shinyStartDate).getFullYear());
    } else if (filter == "pokemon") {
        pokemonYears.push(new Date(pokemon_data[pokemon_id].startDates.pokemonStartDate).getFullYear());
    } else if (filter == "both") {
        pokemonYears.push(new Date(pokemon_data[pokemon_id].startDates.pokemonStartDate).getFullYear());
        if (!pokemonYears.includes(new Date(pokemon_data[pokemon_id].startDates.shinyStartDate).getFullYear())) {
            pokemonYears.push(new Date(pokemon_data[pokemon_id].startDates.shinyStartDate).getFullYear());
        }
    }

    if (!isNaN(query) && pokemonYears.includes(parseInt(query))) {
        return !notFlag;
    } else if (!isNaN(query.split("-")[0]) && !isNaN(query.split("-")[1])) {
        for (var i = 0; i < pokemonYears.length; i++) {
            if (pokemonYears[i] >= parseInt(query.split("-")[0]) && pokemonYears[i] <= parseInt(query.split("-")[1])) {
                return !notFlag;
            }
        }

    } else if (query.split("-")[0] == "") {
        for (var i = 0; i < pokemonYears.length; i++) {
            if (pokemonYears[i] <= parseInt(query.split("-")[1])) {
                return !notFlag;
            }
        }
    } else if (query.split("-")[1] == "") {
        for (var i = 0; i < pokemonYears.length; i++) {
            if (pokemonYears[i] >= parseInt(query.split("-")[0])) {
                return !notFlag;
            }
        }
    }

    return notFlag;
}


function filterByFastMove(query, pokemon_id, notFlag) {
    var moves = pokemon_data[pokemon_id].pokemonMoves;
    var specialMoves = moves.eliteFastMoves ? Object.values(moves.eliteFastMoves) : [];
    specialMoves = moves.unavailableFastMoves ? specialMoves.concat(Object.values(moves.unavailableFastMoves)) : specialMoves;
    specialMoves = moves.snapshotFastMoves ? specialMoves.concat(Object.values(moves.snapshotFastMoves)) : specialMoves;

    if (query == "@1special" && specialMoves.length > 0) {
        return !notFlag;
    } else if (list_types.has(query.replace("@1", ""))) {
        var fastMoves = Object.values(moves.fastMoves).concat(specialMoves).map(a => a.type);
        return fastMoves.includes(query.replace("@1", "")) && !notFlag;
    } else if (query != "@1move") {
        var fastMoves = Object.values(moves.fastMoves).concat(specialMoves).map(a => a.nameGeneric);

        return fastMoves.filter(move => move.startsWith(query.replace("@1", ""))).length > 0 && !notFlag;
    }


    return notFlag;
}

function filterByChargedMove(query, pokemon_id, notFlag) {
    var moves = pokemon_data[pokemon_id].pokemonMoves;
    var specialMoves = moves.eliteChargedMoves ? Object.values(moves.eliteChargedMoves) : [];
    specialMoves = moves.unavailableChargedMoves ? specialMoves.concat(Object.values(moves.unavailableChargedMoves)) : specialMoves;
    specialMoves = moves.snapshotChargedMoves ? specialMoves.concat(Object.values(moves.snapshotChargedMoves)) : specialMoves;

    if ((query == "@2special" || query == "@3special") && specialMoves.length > 0) {
        return !notFlag;
    } else if (list_types.has(query.replace("@2", "").replace("@3", ""))) {
        var chargedMoves = Object.values(moves.chargedMoves).concat(specialMoves).map(a => a.type);
        return chargedMoves.includes(query.replace("@2", "").replace("@3", "")) && !notFlag;
    } else if (query != "@2move" && query != "@3move") {
        var chargedMoves = Object.values(moves.chargedMoves).concat(specialMoves).map(a => a.nameGeneric);
        return chargedMoves.filter(move => move.startsWith(query.replace("@2", "").replace("@3", ""))).length > 0 && !notFlag;
    }

    return notFlag;
}


function filterByPokemonMove(query, pokemon_id, notFlag) {
    var moves = pokemon_data[pokemon_id].pokemonMoves;
    var specialMoves = moves.eliteFastMoves ? Object.values(moves.eliteFastMoves) : [];
    specialMoves = moves.eliteChargedMoves ? specialMoves.concat(Object.values(moves.eliteChargedMoves)) : specialMoves;
    specialMoves = moves.unavailableFastMoves ? specialMoves.concat(Object.values(moves.unavailableFastMoves)) : specialMoves;
    specialMoves = moves.unavailableChargedMoves ? specialMoves.concat(Object.values(moves.unavailableChargedMoves)) : specialMoves;
    specialMoves = moves.snapshotFastMoves ? specialMoves.concat(Object.values(moves.snapshotFastMoves)) : specialMoves;
    specialMoves = moves.snapshotChargedMoves ? specialMoves.concat(Object.values(moves.snapshotChargedMoves)) : specialMoves;

    if (query == "@special" && specialMoves.length > 0) {
        return !notFlag;
    } else if (list_types.has(query.replace("@", ""))) {
        var allMoves = Object.values(moves.fastMoves).concat(Object.values(moves.chargedMoves)).concat(specialMoves).map(a => a.type);
        return allMoves.includes(query.replace("@", "")) && !notFlag;
    } else if (query != "@move") {
        var allMoves = Object.values(moves.fastMoves).concat(Object.values(moves.chargedMoves)).concat(specialMoves).map(a => a.nameGeneric);

        return allMoves.filter(move => move.startsWith(query.replace("@", ""))).length > 0 && !notFlag;
    }

    return notFlag;
}

function filterByMove(query, move_id, notFlag) {
    var move = move_data[move_id];
    var finalQuery = query;

    if (query.startsWith(1)) {
        finalQuery = query.replace("1", "");
        if (list_types.has(finalQuery)) {
            return move.type == finalQuery && move.moveAttackType == "fast" && !notFlag;
        } else {
            return move.name.toLowerCase().startsWith(finalQuery) && move.moveAttackType == "fast" && !notFlag;
        }
    } else if (query.startsWith(2)) {
        finalQuery = query.replace("2", "");
        if (list_types.has(finalQuery)) {
            return move.type == finalQuery && move.moveAttackType == "charged" && !notFlag;
        } else {
            return move.name.toLowerCase().startsWith(finalQuery) && move.moveAttackType == "charged" && !notFlag;
        }
    }

    if (list_types.has(query)) {
        return move.type == query && !notFlag;
    }

    return move.name.toLowerCase().startsWith(query) && !notFlag;
}

function filterByPvPBuffs(query, move_id, notFlag) {
    var pvpBuffs = move_data[move_id].pvpSettings.buffs;;

    var hasPvPBuffs = (pvpBuffs.attackerAttackStatStageChange != 0) ||
        (pvpBuffs.attackerDefenseStatStageChange != 0) ||
        (pvpBuffs.targetAttackStatStageChange != 0) ||
        (pvpBuffs.targetDefenseStatStageChange != 0)

    return hasPvPBuffs && !notFlag;
}

function filterByEventName(query, event_id, notFlag) {
    if (events_data[event_id].name.toLowerCase().includes(query.toLowerCase())) {
        return !notFlag;
    }
    return notFlag;
}

function filterByEventCategory(query, event_id, notFlag) {
    if (events_data[event_id].category && events_data[event_id].category.toLowerCase().replace("_", "") === query.replace(" ", "")) {
        return !notFlag;
    }
    return notFlag;
}

function filterByEventYear(query, event_id, notFlag, filter) {
    var eventYears = [];
    if (filter == "start") {
        eventYears.push(new Date(events_data[event_id].startDate).getFullYear());
    } else if (filter == "end") {
        eventYears.push(new Date(events_data[event_id].endDate).getFullYear());
    } else if (filter == "both") {
        eventYears.push(new Date(events_data[event_id].startDate).getFullYear());
        if (!eventYears.includes(new Date(events_data[event_id].endDate).getFullYear())) {
            eventYears.push(new Date(events_data[event_id].endDate).getFullYear());
        }
    }

    if (!isNaN(query) && eventYears.includes(parseInt(query))) {
        return !notFlag;
    } else if (!isNaN(query.split("-")[0]) && !isNaN(query.split("-")[1])) {
        for (var i = 0; i < eventYears.length; i++) {
            if (eventYears[i] >= parseInt(query.split("-")[0]) && eventYears[i] <= parseInt(query.split("-")[1])) {
                return !notFlag;
            }
        }

    } else if (query.split("-")[0] == "") {
        for (var i = 0; i < eventYears.length; i++) {
            if (eventYears[i] <= parseInt(query.split("-")[1])) {
                return !notFlag;
            }
        }
    } else if (query.split("-")[1] == "") {
        for (var i = 0; i < eventYears.length; i++) {
            if (eventYears[i] >= parseInt(query.split("-")[0])) {
                return !notFlag;
            }
        }
    }

    return notFlag;
}


// SORT OPTIONS

function desactivateAndEnableSortOptions() {
    $(".dropdown-sort-list").each(function() {
        $(this).removeClass("active");
        $(this).removeAttr('disabled');
    });
}

$(document).on("click", ".dropdown-sort-list", function() {
    desactivateAndEnableSortOptions();
    $(this).toggleClass("active", true);
    $(this).prop("disabled", "true");

    var attr = $(this).data("attribute").split(",");
    var isDate = $(this).data("isDate");

    if (isDate == "undefined") {
        isDate = false
    }

    var data;
    if (openedPage === "moves") {
        data = move_data;
    } else if (openedPage === "events") {
        data = events_data;
    } else {
        data = pokemon_data;
    }

    if (openedPage !== "events") {
        // by default the list are sorted by id
        sortPokemonByAttribute("id", false, data);

        if (isDate) {
            if (attr.length == 1) {
                sortPokemonByDate(attr[0], $(this).attr("id").includes("desc"), data);
            } else if (attr.length == 2) {
                sortPokemonByDateWithTwoAttr(attr[0], attr[1], $(this).attr("id").includes("desc"), data)
            }
        } else {
            if (attr.length == 1) {
                sortPokemonByAttribute(attr[0], $(this).attr("id").includes("desc"), data);
            } else if (attr.length == 2) {
                sortPokemonByTwoAttr(attr[0], attr[1], $(this).attr("id").includes("desc"), data)
            }
        }
    } else {
        if (isDate) {
            sortEventByDate(attr[0], $(this).attr("id").includes("desc"), data);
        } else {
            sortEventByAttribute(attr[0], $(this).attr("id").includes("desc"), data);
        }
    }

});


function sortPokemonByAttribute(attribute, reversed, data) {
    if (!reversed) {
        $('.list .list-card-design').sort(function(a, b) {
            return data[$(a).find("#card-id").text()][attribute] > data[$(b).find("#card-id").text()][attribute] ? 1 : -1;
        }).appendTo(".list");
    } else {
        $('.list .list-card-design').sort(function(a, b) {
            return data[$(a).find("#card-id").text()][attribute] < data[$(b).find("#card-id").text()][attribute] ? 1 : -1;
        }).appendTo(".list");
    }
}

function sortPokemonByTwoAttr(attr1, attr2, reversed, data) {
    if (!reversed) {
        $('.list .list-card-design').sort(function(a, b) {
            return data[$(a).find("#card-id").text()][attr1][attr2] > data[$(b).find("#card-id").text()][attr1][attr2] ? 1 : -1;
        }).appendTo(".list");
    } else {
        $('.list .list-card-design').sort(function(a, b) {
            return data[$(a).find("#card-id").text()][attr1][attr2] < data[$(b).find("#card-id").text()][attr1][attr2] ? 1 : -1;
        }).appendTo(".list");
    }

}

function sortPokemonByDate(attribute, reversed, data) {
    if (!reversed) {
        $('.list .list-card-design').sort(function(a, b) {
            return new Date(data[$(a).find("#card-id").text()][attribute]) > new Date(data[$(b).find("#card-id").text()][attribute]) ? 1 : -1;
        }).appendTo(".list");
    } else {
        $('.list .list-card-design').sort(function(a, b) {
            return new Date(data[$(a).find("#card-id").text()][attribute]) < new Date(data[$(b).find("#card-id").text()][attribute]) ? 1 : -1;
        }).appendTo(".list");
    }
}

function sortPokemonByDateWithTwoAttr(attr1, attr2, reversed, data) {
    if (!reversed) {
        $('.list .list-card-design').sort(function(a, b) {
            return new Date(data[$(a).find("#card-id").text()][attr1][attr2]) > new Date(data[$(b).find("#card-id").text()][attr1][attr2]) ? 1 : -1;
        }).appendTo(".list");
    } else {
        $('.list .list-card-design').sort(function(a, b) {
            return new Date(data[$(a).find("#card-id").text()][attr1][attr2]) < new Date(data[$(b).find("#card-id").text()][attr1][attr2]) ? 1 : -1;
        }).appendTo(".list");
    }
}

function sortEventByAttribute(attribute, reversed, data) {
    if (!reversed) {
        $(".event-div").each(function() {
            $(this).children(".event-list-div").children(".event-card-design").sort(function(a, b) {
                return data[$(a).find("#event-id").val()][attribute] > data[$(b).find("#event-id").val()][attribute] ? 1 : -1;
            }).appendTo($(this).children(".event-list-div"));
        });
    } else {
        $(".event-div").each(function() {
            $(this).children(".event-list-div").children(".event-card-design").sort(function(a, b) {
                return data[$(a).find("#event-id").val()][attribute] < data[$(b).find("#event-id").val()][attribute] ? 1 : -1;
            }).appendTo($(this).children(".event-list-div"));

        });
    }
}

function sortEventByDate(attribute, reversed, data) {
    if (!reversed) {
        $(".event-div").each(function() {
            $(this).children(".event-list-div").children(".event-card-design").sort(function(a, b) {
                return new Date(data[$(a).find("#event-id").val()][attribute]) > new Date(data[$(b).find("#event-id").val()][attribute]) ? 1 : -1;
            }).appendTo($(this).children(".event-list-div"));
        });
    } else {
        $(".event-div").each(function() {
            $(this).children(".event-list-div").children(".event-card-design").sort(function(a, b) {
                return new Date(data[$(a).find("#event-id").val()][attribute]) < new Date(data[$(b).find("#event-id").val()][attribute]) ? 1 : -1;
            }).appendTo($(this).children(".event-list-div"));

        });
    }
}

/* FILTER */

$(function() {
    $(document).on("change", ".filter-list", function() {
        if ($(this).data("type") == "checkbox") {
            setFiltersOnCache($(this).attr("id"), $(this).is(":checked"))
        }
        search();
    });
});

// SAVE FILTERS
function getFiltersFromCache(key) {
    if (filterCacheKey) {
        var cache = localStorage.getItem("userData");

        if (cache) {
            cache = JSON.parse(cache);
            if (cache[filterCacheKey]) {
                return cache[filterCacheKey][key];
            }
        }
    }

    return null;
}

function setFiltersOnCache(key, value) {
    if (filterCacheKey) {
        var cache = localStorage.getItem("userData");

        if (!cache) {
            cache = {};
        } else {
            cache = JSON.parse(cache);
        }

        if (!cache[filterCacheKey]) {
            cache[filterCacheKey] = {};
        }

        cache[filterCacheKey][key] = value;

        localStorage.setItem("userData", JSON.stringify(cache));
    }
}