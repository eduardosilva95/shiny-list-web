var number, total, unique;
var number_community_day, total_community_day, unique_community_day;
var number_raid_day, total_raid_day, unique_raid_day;
var number_safari_zone, total_safari_zone, unique_safari_zone;
var number_go_fest, total_go_fest, unique_go_fest;
var number_other, total_other, unique_other;
var number_research_day, total_research_day, unique_research_day;
var number_go_battle_day, total_go_battle_day, unique_go_battle_day;
var number_incense_day, total_incense_day, unique_incense_day;
var number_meltan_box, total_meltan_box, unique_meltan_box;
var number_shadow, total_shadow, unique_shadow;
var number_purified, total_purified, unique_purified;
var number_special, total_special, unique_special;
var number_no_event, total_no_event, unique_no_event;
var pokemon_caught;

var data = [];

var list_cd_to_ignore = ['0092_00_GASTLY', '0093_00_HAUNTER', '0094_00_GENGAR'];



exports.initializeStatsController = function() {
    number = 0, total = 0, unique = 0;
    number_community_day = 0, total_community_day = 0, unique_community_day = 0;
    number_raid_day = 0, total_raid_day = 0, unique_raid_day = 0;
    number_safari_zone = 0, total_safari_zone = 0, unique_safari_zone = 0;
    number_go_fest = 0, total_go_fest = 0, unique_go_fest = 0;
    number_other = 0, total_other = 0, unique_other = 0;
    number_research_day = 0, total_research_day = 0, unique_research_day = 0;
    number_go_battle_day = 0, total_go_battle_day = 0, unique_go_battle_day = 0;
    number_incense_day = 0, total_incense_day = 0, unique_incense_day = 0;
    number_meltan_box = 0, total_meltan_box = 0, unique_meltan_box = 0;
    number_shadow = 0, total_shadow = 0, unique_shadow = 0;
    number_purified = 0, total_purified = 0, unique_purified = 0;
    number_special = 0, total_special = 0, unique_special = 0;
    number_no_event = 0, total_no_event = 0, unique_no_event = 0;
    pokemon_caught = 0;
};

exports.setPokemonCaught = function(pokemonCaught) {
    pokemon_caught = pokemonCaught;
}

exports.setPokemon = function(pokemon) {
    total++;
    number += parseInt(pokemon.quantity);
    unique = parseInt(pokemon.quantity) > 0 ? unique + 1 : unique;

    if (pokemon.filters.costume) {
        number_special += parseInt(pokemon.quantity);
        total_special++;
        unique_special = parseInt(pokemon.quantity) > 0 ? unique_special + 1 : unique_special;
    } else if (pokemon.filters.shadow) {
        number_shadow += parseInt(pokemon.quantity);
        total_shadow++;
        unique_shadow = parseInt(pokemon.quantity) > 0 ? unique_shadow + 1 : unique_shadow;
    } else if (pokemon.filters.purified) {
        number_purified += parseInt(pokemon.quantity);
        total_purified++;
        unique_purified = parseInt(pokemon.quantity) > 0 ? unique_purified + 1 : unique_purified;
    } else if (pokemon.id == '808_00_MELTAN' || pokemon.id == '809_00_MELMETAL') {
        number_meltan_box += parseInt(pokemon.quantity);
        total_meltan_box++;
        unique_meltan_box = parseInt(pokemon.quantity) > 0 ? unique_meltan_box + 1 : unique_meltan_box;
    } else {
        switch (pokemon.event) {
            case "communityday":
                if (list_cd_to_ignore.includes(pokemon.id)) break;
                number_community_day += parseInt(pokemon.quantity);
                total_community_day++;
                unique_community_day = parseInt(pokemon.quantity) > 0 ? unique_community_day + 1 : unique_community_day;
                break;
            case "raidday":
                number_raid_day += parseInt(pokemon.quantity);
                total_raid_day++;
                unique_raid_day = parseInt(pokemon.quantity) > 0 ? unique_raid_day + 1 : unique_raid_day;
                break;
            case "safarizone":
                number_safari_zone += parseInt(pokemon.quantity);
                total_safari_zone++;
                unique_safari_zone = parseInt(pokemon.quantity) > 0 ? unique_safari_zone + 1 : unique_safari_zone;
                break;
            case "gofest":
                number_go_fest += parseInt(pokemon.quantity);
                total_go_fest++;
                unique_go_fest = parseInt(pokemon.quantity) > 0 ? unique_go_fest + 1 : unique_go_fest;
                break;
            case "other":
                number_other += parseInt(pokemon.quantity);
                total_other++;
                unique_other = parseInt(pokemon.quantity) > 0 ? unique_other + 1 : unique_other;
                break;
            case "researchday":
                number_research_day += parseInt(pokemon.quantity);
                total_research_day++;
                unique_research_day = parseInt(pokemon.quantity) > 0 ? unique_research_day + 1 : unique_research_day;
                break;
            case "gobattleday":
                number_go_battle_day += parseInt(pokemon.quantity);
                total_go_battle_day++;
                unique_go_battle_day = parseInt(pokemon.quantity) > 0 ? unique_go_battle_day + 1 : unique_go_battle_day;
                break;
            case "incenseday":
                number_incense_day += parseInt(pokemon.quantity);
                total_incense_day++;
                unique_incense_day = parseInt(pokemon.quantity) > 0 ? unique_incense_day + 1 : unique_incense_day;
                break;
            default:
                number_no_event += parseInt(pokemon.quantity);
                total_no_event++;
                unique_no_event = parseInt(pokemon.quantity) > 0 ? unique_no_event + 1 : unique_no_event;
                break;
        }
    }
};

exports.getData = function() {
    data = [];
    setData('Community Day', 'img/stats_icons/community-day.png', total_community_day, unique_community_day, number_community_day);
    setData('Raid Day', 'img/stats_icons/raid.png', total_raid_day, unique_raid_day, number_raid_day);
    setData('Research Day', 'img/stats_icons/research.png', total_research_day, unique_research_day, number_research_day);
    setData('Safari Zone', 'img/stats_icons/safari-zone.png', total_safari_zone, unique_safari_zone, number_safari_zone);
    setData('Go Fest', 'img/stats_icons/go-fest.png', total_go_fest, unique_go_fest, number_go_fest);
    setData('Meltan Box', 'img/stats_icons/meltan-box.png', total_meltan_box, unique_meltan_box, number_meltan_box);
    setData('Team GO Rocket', 'img/stats_icons/team-rocket.png', total_shadow, unique_shadow, number_shadow + number_purified);
    setData('Costume', 'img/stats_icons/costume.png', total_special, unique_special, number_special);
    setData('Go Battle Day', 'img/stats_icons/battle.png', total_go_battle_day, unique_go_battle_day, number_go_battle_day);
    setData('Incense Day', 'img/stats_icons/incense.png', total_incense_day, unique_incense_day, number_incense_day);

    if (total_other > 0)
        setData('Other Events', 'img/stats_icons/general.png', total_other, unique_other, number_other);

    setData('No Event', 'img/stats_icons/general.png', total_no_event, unique_no_event, number_no_event);
    setData('Total', '', total, unique, number);

    return data;
};

exports.getShinyPokemonCaughtPercentage = function() {
    return (number / pokemon_caught * 100).toFixed(2) + "%";
};



function setData(title, image, total, unique, number) {
    data.push({
        'title': title,
        'image': image,
        'unique': unique,
        'available': total,
        'total': number,
        'shinydex': total > 0 ? (unique / total * 100).toFixed(2) + "%" : 0.0,
        'diversity': number > 0 ? (unique / number * 100).toFixed(2) + "%" : 0.0,
    });
}