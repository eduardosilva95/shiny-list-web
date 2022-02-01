// All the CP multipliers
const cpms = [0.094, 0.135137432, 0.16639787, 0.192650919, 0.21573247, 0.236572661, 0.25572005, 0.273530381, 0.29024988, 0.306057377, 0.3210876, 0.335445036, 0.34921268, 0.362457751, 0.37523559, 0.387592406, 0.39956728, 0.411193551, 0.42250001, 0.432926419, 0.44310755, 0.4530599578, 0.46279839, 0.472336083, 0.48168495, 0.4908558, 0.49985844, 0.508701765, 0.51739395, 0.525942511, 0.53435433, 0.542635767, 0.55079269, 0.558830576, 0.56675452, 0.574569153, 0.58227891, 0.589887917, 0.59740001, 0.604818814, 0.61215729, 0.619399365, 0.62656713, 0.633644533, 0.64065295, 0.647576426, 0.65443563, 0.661214806, 0.667934, 0.674577537, 0.68116492, 0.687680648, 0.69414365, 0.700538673, 0.70688421, 0.713164996, 0.71939909, 0.725571552, 0.7317, 0.734741009, 0.73776948, 0.740785574, 0.74378943, 0.746781211, 0.74976104, 0.752729087, 0.75568551, 0.758630378, 0.76156384, 0.764486065, 0.76739717, 0.770297266, 0.7731865, 0.776064962, 0.77893275, 0.781790055, 0.78463697, 0.787473578, 0.7903, 0.7928039417, 0.7953, 0.797803917, 0.8003, 0.8028038926, 0.8053, 0.8078038685, 0.8103, 0.8128038447, 0.8153, 0.8178038212, 0.8203, 0.822803798, 0.8253, 0.8278037751, 0.8303, 0.8328037524, 0.8353, 0.83780373, 0.8403, 0.8428037079, 0.8453, 0.847803686, 0.8503, 0.8528036644, 0.8553, 0.857803643, 0.8603, 0.8628036219, 0.8653];


/*-------------------------------------- LOAD DATA  ------------------------------------------------------------------------*/

function openBioModal(pokemonID) {
    var pokemonData = pokemon_data[pokemonID];

    if (!pokemonData) {
        return;
    }

    imagesToLoad = [];
    bioGenderContext = pokemonData.image.imageNormal2 ? bioGenderContext : "male";

    var index = 1;
    if (bioContext == "shiny" && bioGenderContext == "male") {
        index = 2;
    } else if (bioContext == "normal" && bioGenderContext == "female") {
        index = 3;
    } else if (bioContext == "shiny" && bioGenderContext == "female") {
        index = 4;
    }

    /* SET IMAGES AND GENDER ICONS */
    var pokemon_img_1 = $("#pokemon-bio-img-1");
    var pokemon_img_2 = $("#pokemon-bio-img-2");
    var pokemon_img_3 = $("#pokemon-bio-img-3");
    var pokemon_img_4 = $("#pokemon-bio-img-4");

    var pokemon_img_gender_1 = $("#pokemon-bio-gender-img-1");
    var pokemon_img_gender_2 = $("#pokemon-bio-gender-img-2");
    var pokemon_img_gender_3 = $("#pokemon-bio-gender-img-3");
    var pokemon_img_gender_4 = $("#pokemon-bio-gender-img-4");

    var pokemon_icon_type = $("#pokemon-bio-type-icon");


    pokemon_img_gender_1.attr("src", "img/male_l_mod_grey.png");
    pokemon_img_gender_2.attr("src", "img/male_shiny_l_grey.png");
    pokemon_img_gender_3.attr("src", "img/female_l_mod_grey.png");
    pokemon_img_gender_4.attr("src", "img/female_shiny_l_grey.png");

    for (var i = 1; i <= $(".pokemon-bio-gender-img").length; i++) {
        if (index == i) {
            $("#pokemon-bio-gender-img-" + i).attr("src", $("#pokemon-bio-gender-img-" + i).attr("src").replace("_grey", ""));
            $("#pokemon-bio-img-" + i).css("display", "initial");
        } else {
            $("#pokemon-bio-img-" + i).css("display", "none");
        }
    }

    $("#pokemon-bio-is-shiny-icon").css("display", bioContext == "shiny" ? "initial" : "none");


    pokemon_img_gender_1.css("display", "initial");
    pokemon_img_gender_2.css("display", "initial");
    pokemon_img_gender_3.css("display", "initial");
    pokemon_img_gender_4.css("display", "initial");

    pokemon_icon_type.css("display", "none");


    imagesToLoad.push({ "url": "pokemon_icons/" + pokemonData.image.imageNormal, "target": "pokemon-bio-img-1", "id": pokemonData.id, "compoundId": null });
    imagesToLoad.push({ "url": "pokemon_icons/" + pokemonData.image.imageShiny, "target": "pokemon-bio-img-2", "id": pokemonData.id, "compoundId": "SHINY" });

    if (pokemonData.genders.includes("male") && pokemonData.genders.includes("female")) {
        if (pokemonData.image.imageNormal2) {
            imagesToLoad.push({ "url": "pokemon_icons/" + pokemonData.image.imageNormal2, "target": "pokemon-bio-img-3", "id": pokemonData.id, "compoundId": "IMAGE2" });
            imagesToLoad.push({ "url": "pokemon_icons/" + pokemonData.image.imageShiny2, "target": "pokemon-bio-img-4", "id": pokemonData.id, "compoundId": "IMAGE2_SHINY" });
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
        imagesToLoad.push({ "url": "pokemon_icons/" + pokemonData.image.imageNormal, "target": "pokemon-bio-img-3", "id": pokemonData.id, "compoundId": null });
        imagesToLoad.push({ "url": "pokemon_icons/" + pokemonData.image.imageShiny, "target": "pokemon-bio-img-4", "id": pokemonData.id, "compoundId": "SHINY" });
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
    } else if (pokemonData.isTemporary) {
        pokemon_icon_type.css("display", "initial");
        pokemon_icon_type.attr("src", "/img/ic_mega.png");
    } else if (pokemonData.filters.includes("regional")) {
        pokemon_icon_type.css("display", "initial");
        pokemon_icon_type.attr("src", "/img/planet_earth.png");
    } else if (pokemonData.filters.includes("costume")) {
        pokemon_icon_type.css("display", "initial");
        pokemon_icon_type.attr("src", "/img/party_hat.png");
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
    $("#pokemon-bio-family").text(pokemonData.family.charAt(0).toUpperCase() + pokemonData.family.slice(1).replace("_", ""));
    $("#pokemon-bio-group").text(pokemonData.group.length > 0 ? pokemonData.group[0].charAt(0).toUpperCase() + pokemonData.group[0].slice(1).replace("_", "") : "None");
    $("#pokemon-bio-description").text(pokemonData.description.description_en);
    $("#pokemon-bio-category").text(pokemonData.category.category_en);
    $("#pokemon-bio-start-date").text(processDateToBio(pokemonData.startDates.pokemonStartDate));
    $("#pokemon-bio-shiny-start-date").text(processDateToBio(pokemonData.startDates.shinyStartDate));

    var height = "??? m";
    if (pokemonData.pokemonDimensions.height >= 0) {
        height = pokemonData.pokemonDimensions.height.toFixed(1);
        height = height + " ± " + pokemonData.pokemonDimensions.heightStdDev.toFixed(2) + " m";
    }
    $("#pokemon-bio-height").text(height);

    var weight = "??? kg";
    if (pokemonData.pokemonDimensions.weight >= 0) {
        weight = pokemonData.pokemonDimensions.weight.toFixed(1);
        weight = weight + " ± " + pokemonData.pokemonDimensions.weightStdDev.toFixed(2) + " kg";
    }
    $("#pokemon-bio-weight").text(weight);



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

    var familyTreeIndex = 1;

    Object.keys(pokemonData.familyTree).forEach((path) => {
        if (buildDynamicFamilyTree(pokemonData.familyTree[path], familyTreeIndex)) {
            familyTreeIndex++;
        }
    });

    activateFamilyTree(pokemonData, bioContext === 'shiny', bioGenderContext === 'female');


    /* SET MOVES TAB */
    $("#pokemon-fast-moves").empty();
    $("#pokemon-charged-moves").empty();

    // do this to have the moves shown in the right way
    pokemonData.pokemonMoves.afastMoves = Object.assign({}, pokemonData.pokemonMoves.fastMoves);
    delete pokemonData.pokemonMoves.fastMoves;

    Object.entries(pokemonData.pokemonMoves).sort((a, b) => a > b ? 1 : -1).forEach(([key, value]) => {
        key = key == "afastMoves" ? "fastMoves" : key;
        var isFast = key.toLowerCase().includes("fast");
        var moveCategory = key.toLowerCase().replace("fast", "").replace("charged", "").replace("moves", "");
        moveCategory = moveCategory == "" ? "normal" : moveCategory;
        Object.keys(value).forEach((key2) => {
            buildDynamicMoveDiv(isFast, moveCategory, value[key2]);
        });
    });

    pokemonData.pokemonMoves.fastMoves = Object.assign({}, pokemonData.pokemonMoves.afastMoves);
    delete pokemonData.pokemonMoves.afastMoves;

    loadImages(imagesToLoad);

    $('#pokemon-bio-modal').modal();

    /* SET POKEMON STATS DIV */

    $("#pokemon-bio-base-stat-attack").text(pokemonData.pokemonStats.baseAttack);
    $("#pokemon-bio-base-stat-defense").text(pokemonData.pokemonStats.baseDefense);
    $("#pokemon-bio-base-stat-stamina").text(pokemonData.pokemonStats.baseStamina);

    computeFormCP();

    $("#pokemon-bio-max-cp-15").text(computePokemonCP(pokemonData.pokemonStats.baseAttack, pokemonData.pokemonStats.baseDefense, pokemonData.pokemonStats.baseStamina, 15, 15, 15, 15));
    $("#pokemon-bio-max-cp-20").text(computePokemonCP(pokemonData.pokemonStats.baseAttack, pokemonData.pokemonStats.baseDefense, pokemonData.pokemonStats.baseStamina, 15, 15, 15, 20));
    $("#pokemon-bio-max-cp-25").text(computePokemonCP(pokemonData.pokemonStats.baseAttack, pokemonData.pokemonStats.baseDefense, pokemonData.pokemonStats.baseStamina, 15, 15, 15, 25));
    $("#pokemon-bio-max-cp-40").text(computePokemonCP(pokemonData.pokemonStats.baseAttack, pokemonData.pokemonStats.baseDefense, pokemonData.pokemonStats.baseStamina, 15, 15, 15, 40));
    $("#pokemon-bio-max-cp-50").text(computePokemonCP(pokemonData.pokemonStats.baseAttack, pokemonData.pokemonStats.baseDefense, pokemonData.pokemonStats.baseStamina, 15, 15, 15, 50));
    $("#pokemon-bio-max-cp-51").text(computePokemonCP(pokemonData.pokemonStats.baseAttack, pokemonData.pokemonStats.baseDefense, pokemonData.pokemonStats.baseStamina, 15, 15, 15, 51));
    $("#pokemon-bio-max-cp-54").text(computePokemonCP(pokemonData.pokemonStats.baseAttack, pokemonData.pokemonStats.baseDefense, pokemonData.pokemonStats.baseStamina, 15, 15, 15, 54));
    $("#pokemon-bio-max-cp-55").text(computePokemonCP(pokemonData.pokemonStats.baseAttack, pokemonData.pokemonStats.baseDefense, pokemonData.pokemonStats.baseStamina, 15, 15, 15, 55));

}



function buildDynamicFamilyTree(familyTree, index) {
    if (familyTree.filter((member) => pokemon_data.hasOwnProperty(member)).length != familyTree.length) {
        return false;
    }

    var imagesToLoad = [];

    var content = "<div class=\"pokemon-family-tree-path\">";
    content += "<div class=\"pokemon-family-tree-path-img\">";

    content += buildDynamicFamilyTreeMember(familyTree[0], index, 1, imagesToLoad);
    if (familyTree.length > 1) {
        content += "<div class=\"pokemon-family-tree-path-icon\">";
        if (pokemon_data[familyTree[1]].isTemporary) {
            content += "<img class=\"pokemon-family-tree-path-mega-icon\" src=\"img/pokemon_details_cp_mega.png\">";
        }
        content += "<i id=\"pokemon-family-tree-" + index + "-arrow-1\" class=\"fas fa-arrow-right fa-2x\"></i>";
        content += "</div>";
        content += "<div class=\"pokemon-family-tree-path-img\">";
        content += buildDynamicFamilyTreeMember(familyTree[1], index, 2, imagesToLoad);
    }

    if (familyTree.length > 2) {
        content += "<div class=\"pokemon-family-tree-path-icon\">";
        if (pokemon_data[familyTree[2]].isTemporary) {
            content += "<img class=\"pokemon-family-tree-path-mega-icon\" src=\"img/pokemon_details_cp_mega.png\">";
        }
        content += "<i id=\"pokemon-family-tree-" + index + "-arrow-2\" class=\"fas fa-arrow-right fa-2x\"></i>";
        content += "</div>";
        content += "<div class=\"pokemon-family-tree-path-img\">";
        content += buildDynamicFamilyTreeMember(familyTree[2], index, 3, imagesToLoad);
    }

    content += "</div>";
    $("#family-trees-div").append(content);
    loadImages(imagesToLoad);
    return true;
}

function buildDynamicFamilyTreeMember(familyMember, familyIndex, memberIndex, imagesToLoad) {
    var content = "<img class=\"pokemon-family-tree-img\" id=\"pokemon-family-tree-" + familyIndex + "-member-" + memberIndex + "-img-1\"  data-id=\"" + familyMember + "\">";
    imagesToLoad.push({ "url": "pokemon_icons/" + getFamilyMemberImg(familyMember, false, false), "target": "pokemon-family-tree-" + familyIndex + "-member-" + memberIndex + "-img-1", "id": familyMember, "compoundId": null });

    content += "<img class=\"pokemon-family-tree-img\" id=\"pokemon-family-tree-" + familyIndex + "-member-" + memberIndex + "-img-1-shiny\" data-id=\"" + familyMember + "\" style=\"display: none\">";
    imagesToLoad.push({ "url": "pokemon_icons/" + getFamilyMemberImg(familyMember, true, false), "target": "pokemon-family-tree-" + familyIndex + "-member-" + memberIndex + "-img-1-shiny", "id": familyMember, "compoundId": "SHINY" });

    if (pokemon_data[familyMember].image.imageNormal2) {
        content += "<img class=\"pokemon-family-tree-img\" id=\"pokemon-family-tree-" + familyIndex + "-member-" + memberIndex + "-img-2\" data-id=\"" + familyMember + "\" style=\"display: none\">";
        imagesToLoad.push({ "url": "pokemon_icons/" + getFamilyMemberImg(familyMember, false, true), "target": "pokemon-family-tree-" + familyIndex + "-member-" + memberIndex + "-img-2", "id": familyMember, "compoundId": "IMAGE2" });
        content += "<img class=\"pokemon-family-tree-img\" id=\"pokemon-family-tree-" + familyIndex + "-member-" + memberIndex + "-img-2-shiny\" data-id=\"" + familyMember + "\" style=\"display: none\">";
        imagesToLoad.push({ "url": "pokemon_icons/" + getFamilyMemberImg(familyMember, true, true), "target": "pokemon-family-tree-" + familyIndex + "-member-" + memberIndex + "-img-2-shiny", "id": familyMember, "compoundId": "IMAGE2_SHINY" });
    }

    if (pokemon_data[familyMember].filters.includes("shadow")) {
        content += "<img class=\"pokemon-family-tree-icon\" src=\"img/ic_shadow.png\">";
    } else if (pokemon_data[familyMember].filters.includes("purified")) {
        content += "<img class=\"pokemon-family-tree-icon\" src=\"img/ic_purified.png\">";
    } else if (pokemon_data[familyMember].isTemporary) {
        content += "<img class=\"pokemon-family-tree-icon\" src=\"img/ic_mega.png\">";
    } else if (pokemon_data[familyMember].filters.includes("regional")) {
        content += "<img class=\"pokemon-family-tree-icon\" src=\"img/planet_earth.png\">";
    } else if (pokemon_data[familyMember].filters.includes("costume")) {
        content += "<img class=\"pokemon-family-tree-icon costume-icon\" src=\"img/party_hat.png\">";
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

function buildDynamicMoveDiv(isFast, category, move) {
    var content = "<div>";
    if (category == "snapshot") {
        content += "<img class=\"pokemon-bio-move pokemon-move-tm-icon\" src=\"img/tx_ar_photo_camera.png\" data-id=\"" + move.id + "\">";
    } else if (category == "unavailable") {
        content += "<img class=\"pokemon-bio-move pokemon-move-other-icon\" style=\"margin-left: 10px; margin-right: 10px;\" src=\"img/block.png\" data-id=\"" + move.id + "\">";
    } else {
        content += "<img class=\"pokemon-bio-move pokemon-move-tm-icon\" src=\"img/" + category + (isFast ? "_fast" : "_charged") + "_tm.png\" data-id=\"" + move.id + "\">";
    }
    content += "<img class=\"pokemon-move-type-icon\" src=\"img/type_" + move.type + ".png\">";
    content += "<span class=\"pokemon-bio-move pokemon-move-text\" data-id=\"" + move.id + "\">" + move.name + "</span></div>";

    if (isFast) {
        $("#pokemon-fast-moves").append(content);
    } else {
        $("#pokemon-charged-moves").append(content);
    }
}


function loadMoveModal(moveId) {
    var move = move_data[moveId];
    if (!move) {
        return;
    }

    // SET MOVE TITLE
    $("#move-title").text(move.name);

    // SET MOVE DETAILS 
    $("#move-type-icon").attr("src", "/img/type_" + move.type + ".png");
    $("#move-type-name").text(move.moveAttackType.charAt(0).toUpperCase() + move.moveAttackType.slice(1));

    $("#move-pve-power").text(move.pveSettings.moveStats.power);
    $("#move-pve-energy").text(move.pveSettings.moveStats.energyDelta);
    $("#move-pvp-power").text(move.pvpSettings.moveStats.power);
    $("#move-pvp-energy").text(move.pvpSettings.moveStats.energyDelta);

    if (move.moveAttackType == "charged") {
        var moveType = move.type.charAt(0).toUpperCase() + move.type.slice(1);
        $("#move-pve-img").attr("src", "/img/charge_" + move.pveSettings.moveStats.nbars + "_" + moveType + ".png");
        $("#move-pve-img").css("display", "initial");

        $("#move-pvp-img").attr("src", "/img/charge_" + move.pvpSettings.moveStats.nbars + "_" + moveType + ".png");
        $("#move-pvp-img").css("display", "initial");
    } else {
        $("#move-pve-img").attr("src", "");
        $("#move-pve-img").css("display", "none");
        $("#move-pvp-img").attr("src", "");
        $("#move-pvp-img").css("display", "none");
    }

    // SET PVP DIV
    var pvpBuffs = move.pvpSettings.buffs;
    var hasPvPBuffs = (pvpBuffs.attackerAttackStatStageChange != 0) ||
        (pvpBuffs.attackerDefenseStatStageChange != 0) ||
        (pvpBuffs.targetAttackStatStageChange != 0) ||
        (pvpBuffs.targetDefenseStatStageChange != 0)

    $("#move-pvp-buffs-attacker").empty();
    $("#move-pvp-buffs-target").empty();

    if (hasPvPBuffs) {
        $("#move-pvp-buff-div").css("display", "block");
        $("#move-pvp-buff-chance").text(pvpBuffs.buffActivationChance * 100);

        if (pvpBuffs.attackerAttackStatStageChange != 0) {
            buildDynamicPvPBuffDiv(pvpBuffs.attackerAttackStatStageChange, true, true);
        }
        if (pvpBuffs.attackerDefenseStatStageChange != 0) {
            buildDynamicPvPBuffDiv(pvpBuffs.attackerDefenseStatStageChange, false, true);
        }
        if (pvpBuffs.targetAttackStatStageChange != 0) {
            buildDynamicPvPBuffDiv(pvpBuffs.targetAttackStatStageChange, true, false);
        }
        if (pvpBuffs.targetDefenseStatStageChange != 0) {
            buildDynamicPvPBuffDiv(pvpBuffs.targetDefenseStatStageChange, false, false);
        }
    } else {
        $("#move-pvp-buff-div").css("display", "none");
    }

    // SET POKEMON LIST
    $("#move-pokemon-list-div").empty();

    Object.keys(sortObjectByKeys(move.pokemon)).forEach((key) => {
        buildDynamicMovePokemonCard(sortObjectByKeys(move.pokemon)[key].id, sortObjectByKeys(move.pokemon)[key].typeOfMove);
    });


    $("#move-info-modal").modal();
}

function buildDynamicPvPBuffDiv(statStageChange, isAttack, isAttacker) {
    var content = "<div>";
    if (statStageChange > 0) {
        content += "<img class=\"move-pvp-buff-icon\" src=\"img/green_arrow.png\">";
    } else {
        content += "<img class=\"move-pvp-buff-icon\" src=\"img/red_arrow.png\">";
    }

    if (isAttack) {
        content += "<img class=\"move-pvp-buff-icon\" src=\"img/sword.png\">";
    } else {
        content += "<img class=\"move-pvp-buff-icon\" src=\"img/shield.png\">";
    }

    content += "<span class=\"move-pvp-buff-text\">" + Math.abs(statStageChange) + "</span></div>";

    if (isAttacker) {
        $("#move-pvp-buffs-attacker").append(content);
    } else {
        $("#move-pvp-buffs-target").append(content);
    }
}

function buildDynamicMovePokemonCard(pokemonId, typeOfMove) {
    var pokemon = pokemon_data[pokemonId];

    if (!pokemon) {
        return;
    }

    typeOfMove = typeOfMove.toLowerCase();
    var category = "normal"
    var isFast = typeOfMove.includes("fast");
    if (typeOfMove.includes("elite")) {
        category = "elite";
    } else if (typeOfMove.includes("snapshot")) {
        category = "snapshot";
    } else if (typeOfMove.includes("unavailable")) {
        category = "unavailable";
    }


    var content = "<div class=\"col-md-2 col-12 move-pokemon-card-design\"><div class=\"move-pokemon-card\">";
    content += "<span id=\"pokemon-id\" style=\"display: none;\">" + pokemon.id + "</span>";
    content += "<img id=\"move-card-" + pokemon.id + "-image\" src=\"" + loadImageFromFirebase("pokemon_icons/" + pokemon.image.imageNormal, "move-card-" + pokemon.id + "-image") + "\" class=\"img-responsive pokemon-card-img move-pokemon-img\" style=\"height: 60%;\" loading=\"lazy\" data-id=\"" + pokemon.id + "\"/>"

    if (category == "snapshot") {
        content += "<img class=\"pokemon-move-other-icon\" src=\"img/tx_ar_photo_camera.png\">";
    } else if (category == "unavailable") {
        content += "<img class=\"pokemon-move-other-icon\" src=\"img/block.png\">";
    } else {
        content += "<img class=\"pokemon-move-tm-icon\" src=\"img/" + category + (isFast ? "_fast" : "_charged") + "_tm.png\">";
    }

    if (pokemon.filters.includes("shadow")) {
        content += "<img id=\"pokemon-type-icon\" src=\"/img/ic_shadow.png\" class=\"img-responsive icon-type\"/>";
    } else if (pokemon.filters.includes("purified")) {
        content += "<img id=\"pokemon-type-icon\" src=\"/img/ic_purified.png\" class=\"img-responsive icon-type\"/>";
    } else if (pokemon.isTemporary) {
        content += "<img id=\"pokemon-type-icon\" src=\"/img/ic_mega.png\" class=\"img-responsive icon-type\"/>";
    }
    content += "</div></div>";

    $("#move-pokemon-list-div").append(content);
}

/*-------------------------------------- END LOAD DATA  ------------------------------------------------------------------------*/

/*-------------------------------------- USER ACTIONS ------------------------------------------------------------------------*/

$(document).on("click", ".pokemon-bio-gender-img", function() {
    var index = parseInt($(this).attr("id").replace("pokemon-bio-gender-img-", ""));
    var isShiny = index == 2 || index == 4;
    var isFemale = index == 3 || index == 4;

    for (var i = 1; i <= $(".pokemon-bio-gender-img").length; i++) {
        if (index == i) {
            $("#pokemon-bio-gender-img-" + i).attr("src", $("#pokemon-bio-gender-img-" + i).attr("src").replace("_grey", ""));
            $("#pokemon-bio-img-" + i).css("display", "initial");
        } else {
            $("#pokemon-bio-gender-img-" + i).attr("src", $("#pokemon-bio-gender-img-" + i).attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
            $("#pokemon-bio-img-" + i).css("display", "none");
        }
    }

    $("#pokemon-bio-is-shiny-icon").css("display", isShiny ? "initial" : "none");
    bioContext = isShiny ? "shiny" : "normal";
    bioGenderContext = isFemale ? "female" : "male";

    var pokemonData = pokemon_data[this.parentElement.parentElement.querySelector("#pokemon-bio-id").innerHTML];
    activateFamilyTree(pokemonData, isShiny, isFemale);
});

// click on a move of the bio modal => open second modal
$(document).on("click", ".pokemon-bio-move", function() {
    stackOpenModals.push({ "modal": "move-info-modal", "id": $(this).data("id") });
    $('#pokemon-bio-modal').modal("hide");
    loadMoveModal($(this).data("id"));
});

// click on a pokemon of the bio modal => open second modal
$(document).on("click", ".move-pokemon-img", function() {
    stackOpenModals.push({ "modal": "pokemon-bio-modal", "id": $(this).data("id") });
    $('#move-info-modal').modal("hide");
    openBioModal($(this).data("id"));
});



//on modal close
$('#pokemon-bio-modal').on('hidden.bs.modal', function() {
    if (stackOpenModals.length > 0 && stackOpenModals[stackOpenModals.length - 1].modal == $(this).attr("id")) {
        stackOpenModals.pop();
        if (stackOpenModals.length == 0) {
            currentCard.click();
        } else {
            var prevModal = stackOpenModals[stackOpenModals.length - 1];
            loadMoveModal(prevModal.id);
        }
    } else if (stackOpenModals.length == 0) {
        currentCard = null;
        previousCard = null;
        nextCard = null;
        bioContext = "normal";
        bioGenderContext = "male";
    }
});

$('#move-info-modal').on('hidden.bs.modal', function() {
    if (stackOpenModals.length > 0 && stackOpenModals[stackOpenModals.length - 1].modal == $(this).attr("id")) {
        stackOpenModals.pop();
        if (stackOpenModals.length == 0) {
            currentCard.click();
        } else {
            var prevModal = stackOpenModals[stackOpenModals.length - 1];
            openBioModal(prevModal.id);
        }
    } else if (stackOpenModals.length == 0) {
        currentCard = null;
        previousCard = null;
        nextCard = null;
        bioContext = "normal";
        bioGenderContext = "male";
    }
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

$(document).on('click', "#family-trees-div .pokemon-family-tree-img", function(e) {
    var id = $(this).data("id");
    openBioModal(id);
});

$(document).on("change", "#attack-iv-input", function(e) {
    computeFormCP();
});

$(document).on("change", "#defense-iv-input", function(e) {
    computeFormCP();
});

$(document).on("change", "#stamina-iv-input", function(e) {
    computeFormCP();
});

$(document).on("change", "#pokemon-level-input", function(e) {
    computeFormCP();
});

function computeFormCP() {
    $("#cp-calculator-result").text("");
    var isValid = true;
    var ivsValues = {};
    for (ivStat of["attack", "defense", "stamina"]) {
        var ivVal = parseInt($("#" + ivStat + "-iv-input").val());
        if (isNaN(ivVal) || ivVal < 0 || ivVal > 15) {
            isValid = false;
            $("#" + ivStat + "-iv-input").toggleClass("red-border", true);
        } else {
            ivsValues[ivStat] = ivVal;
            $("#" + ivStat + "-iv-input").toggleClass("red-border", false);
        }
    }

    var levelVal = parseInt($("#pokemon-level-input").val());
    if (isNaN(levelVal) || levelVal < 1 || levelVal > 55) {
        isValid = false;
        $("#pokemon-level-input").toggleClass("red-border", true);
    } else {
        $("#pokemon-level-input").toggleClass("red-border", false);
    }

    if (isValid) {
        var baseAtk = parseInt($("#pokemon-bio-base-stat-attack").text());
        var baseDef = parseInt($("#pokemon-bio-base-stat-defense").text());
        var baseStam = parseInt($("#pokemon-bio-base-stat-stamina").text());
        $("#cp-calculator-result").text(computePokemonCP(baseAtk, baseDef, baseStam, ivsValues.attack, ivsValues.defense, ivsValues.stamina, levelVal));
    }
}


/*-------------------------------------- END USER ACTIONS  ------------------------------------------------------------------------*/


/*-------------------------------------- EXTRA FUNCTIONS  ------------------------------------------------------------------------*/


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

function computePokemonCP(baseAtk, baseDef, baseStam, ivAtk, ivDef, ivSta, level) {
    var cpm = cpms[level * 2 - 2];
    return parseInt((baseAtk + ivAtk) * (Math.pow((baseDef + ivDef), 0.5) * Math.pow((baseStam + ivSta), 0.5) * Math.pow((cpm), 2)) / 10);
}