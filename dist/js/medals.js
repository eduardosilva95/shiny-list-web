var medals = {};
var medalOpenId = null;
var medals_loading_counter = 0;

function loadMedals() {
    $.get("/medals", {}, function(result) {
        if (result.error == null) {
            $("#medals-div").empty();
            var medals_list = result.medals_list;
            medals_list.sort((a, b) => a.idNumeric > b.idNumeric ? 1 : -1);

            medals_list.forEach((medal) => {
                target = "0";
                Object.entries(medal.targets).forEach((value, key) => {
                    if (parseInt(medal.total) >= parseInt(value[1].targetGoal)) {
                        target = value[1].number;
                    }
                })

                medal["targetIdx"] = target;
            });

            medals_list.sort((a, b) => a.targetIdx <= b.targetIdx ? 1 : -1);

            medals_list.filter(medal => medal.type.eventBadge).forEach((medal) => loadMedal(medal));
            medals_list.filter(medal => !medal.type.eventBadge && !medal.type.typeBadge).forEach((medal) => loadMedal(medal));
            medals_list.filter(medal => medal.type.typeBadge).forEach((medal) => loadMedal(medal));

            loadMedalInfo(medals_list[0]);

            $("#medals-modal").modal();
        }
    });
}


function loadMedal(medal) {

    medals[medal.id] = medal;

    buildDynamicMedalDiv(medal.id, medal.type);

    loadImageFromFirebase("medals/" + medal.targets[medal.targetIdx].image, medal.id + "-medal-img");
}



function buildDynamicMedalDiv(id, badgeType) {
    var classType = "normal-badge"
    if (badgeType.eventBadge) {
        classType = "event-badge"
    } else if (badgeType.typeBadge) {
        classType = "type-badge"
    }

    if ($("#" + classType + "-div").length == 0) {
        $("#medals-div").append("<div id=\"" + classType + "-div\" class=\"row\"></div>");
        if (classType == "normal-badge") {
            $("#medals-div").append("<hr class=\"medals-modal-hr\">");
        }
    }


    let content = "<div class=\"col-md-2\"><div class=\"medal-div " + classType + "\"><p id=\"medal-id\" style=\"display: none;\">" + id + "</p><img id=\"" + id + "-medal-img" + "\" style=\"max-width: 100%\"></div></div>"
    $("#" + classType + "-div").append(content);
}


$(function() {
    var medal_img_1 = $("#medal-img-1");
    var medal_img_2 = $("#medal-img-2");
    var medal_img_3 = $("#medal-img-3");
    var medal_img_4 = $("#medal-img-4");
    var medal_img_5 = $("#medal-img-5");

    var medal_icon_1 = $("#medal-icon-1");
    var medal_icon_2 = $("#medal-icon-2");
    var medal_icon_3 = $("#medal-icon-3");
    var medal_icon_4 = $("#medal-icon-4");
    var medal_icon_5 = $("#medal-icon-5");


    $(document).on('click', ".medal-div img", function(e) {
        var medalId = this.parentElement.querySelector("#medal-id").innerHTML;
        var medal = medals[medalId];

        if (medal) {
            loadMedalInfo(medal);
        }
    });


    medal_icon_1.on('click', function() {
        medal_icon_1.attr("src", medal_icon_1.attr("src").replace("_grey", ""));
        medal_icon_2.attr("src", medal_icon_2.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_3.attr("src", medal_icon_3.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_4.attr("src", medal_icon_4.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_5.attr("src", medal_icon_5.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_img_1.css("display", "initial");
        medal_img_2.css("display", "none");
        medal_img_3.css("display", "none");
        medal_img_4.css("display", "none");
        medal_img_5.css("display", "none");
    });

    medal_icon_2.on('click', function() {
        medal_icon_1.attr("src", medal_icon_1.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_2.attr("src", medal_icon_2.attr("src").replace("_grey", ""));
        medal_icon_3.attr("src", medal_icon_3.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_4.attr("src", medal_icon_4.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_5.attr("src", medal_icon_5.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_img_1.css("display", "none");
        medal_img_2.css("display", "initial");
        medal_img_3.css("display", "none");
        medal_img_4.css("display", "none");
        medal_img_5.css("display", "none");
    });

    medal_icon_3.on('click', function() {
        medal_icon_1.attr("src", medal_icon_1.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_2.attr("src", medal_icon_2.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_3.attr("src", medal_icon_3.attr("src").replace("_grey", ""));
        medal_icon_4.attr("src", medal_icon_4.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_5.attr("src", medal_icon_5.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_img_1.css("display", "none");
        medal_img_2.css("display", "none");
        medal_img_3.css("display", "initial");
        medal_img_4.css("display", "none");
        medal_img_5.css("display", "none");
    });

    medal_icon_4.on('click', function() {
        medal_icon_1.attr("src", medal_icon_1.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_2.attr("src", medal_icon_2.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_3.attr("src", medal_icon_3.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_4.attr("src", medal_icon_4.attr("src").replace("_grey", ""));
        medal_icon_5.attr("src", medal_icon_5.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_img_1.css("display", "none");
        medal_img_2.css("display", "none");
        medal_img_3.css("display", "none");
        medal_img_4.css("display", "initial");
        medal_img_5.css("display", "none");
    });

    medal_icon_5.on('click', function() {
        medal_icon_1.attr("src", medal_icon_1.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_2.attr("src", medal_icon_2.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_3.attr("src", medal_icon_3.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_4.attr("src", medal_icon_4.attr("src").replace("_grey", "").split(".")[0] + "_grey" + ".png");
        medal_icon_5.attr("src", medal_icon_5.attr("src").replace("_grey", ""));
        medal_img_1.css("display", "none");
        medal_img_2.css("display", "none");
        medal_img_3.css("display", "none");
        medal_img_4.css("display", "none");
        medal_img_5.css("display", "initial");
    });


    $("#medal-total-edit-btn").click(function() {
        $("#medal-total").css("display", "none");
        $("#medal-total-input").css("display", "initial");
        $("#medal-total-edit-btn").css("display", "none");
        $("#medal-total-save-btn").css("display", "initial");
        $("#medal-total-cancel-btn").css("display", "initial");
    });

    $("#medal-total-save-btn").click(function() {
        if (medalOpenId) {
            var medal = medals[medalOpenId];
            var total = $("#medal-total-input").val();

            $.post("/update-medal", { medal: medalOpenId, total: total }, function(result) {
                if (result.medal_id) {
                    $("#medal-total").text(result.total);
                    $("#medal-total-input").val(result.total);

                    medal.total = result.total;

                    target = "0";
                    Object.entries(medal.targets).forEach((value, key) => {
                        if (parseInt(result.total) >= parseInt(value[1].targetGoal)) {
                            target = value[1].number;
                        }
                    });
                    medal.targetIdx = target;
                    medals[result.medal_id] = medal;

                    $("#medal-total").css("display", "initial");
                    $("#medal-total-input").css("display", "none");
                    $("#medal-total-edit-btn").css("display", "initial");
                    $("#medal-total-save-btn").css("display", "none");
                    $("#medal-total-cancel-btn").css("display", "none");

                    var classType = "normal-badge"
                    if (medal.type.eventBadge) {
                        classType = "event-badge"
                    } else if (medal.type.typeBadge) {
                        classType = "type-badge"
                    }

                    $('#' + classType + '-div .col-md-2').sort(function(a, b) {
                        return medals[$(a).find("#medal-id").text()].idNumeric > medals[$(b).find("#medal-id").text()].idNumeric ? 1 : -1;
                    }).appendTo("#" + classType + "-div");

                    $('#' + classType + '-div .col-md-2').sort(function(a, b) {
                        return medals[$(a).find("#medal-id").text()].targetIdx <= medals[$(b).find("#medal-id").text()].targetIdx ? 1 : -1;
                    }).appendTo("#" + classType + "-div");

                    loadImageFromFirebase("medals/" + medal.targets[medal.targetIdx].image, medal.id + "-medal-img");
                    loadMedalInfo(medals[result.medal_id]);
                }
            });
        }
    });

    $("#medal-total-cancel-btn").click(function() {
        $("#medal-total").css("display", "initial");
        $("#medal-total-input").css("display", "none");
        $("#medal-total-edit-btn").css("display", "initial");
        $("#medal-total-save-btn").css("display", "none");
        $("#medal-total-cancel-btn").css("display", "none");
    });




});


function loadMedalInfo(medal) {
    medalOpenId = medal.id;

    // SET MEDAL TITLE
    $("#medal-title").text(medal.name);

    /* SET IMAGES AND MEDALS ICONS */

    var medal_img_1 = $("#medal-img-1");
    var medal_img_2 = $("#medal-img-2");
    var medal_img_3 = $("#medal-img-3");
    var medal_img_4 = $("#medal-img-4");
    var medal_img_5 = $("#medal-img-5");

    var medal_icon_1 = $("#medal-icon-1");
    var medal_icon_2 = $("#medal-icon-2");
    var medal_icon_3 = $("#medal-icon-3");
    var medal_icon_4 = $("#medal-icon-4");
    var medal_icon_5 = $("#medal-icon-5");

    var i = 1;
    Object.entries(medal.targets).forEach((value, key) => {
        target = value[1];

        loadImageFromFirebase("medals/" + target.image, "medal-img-" + i);
        startLoading();

        if (target.number == medal.targetIdx) {
            $("#medal-img-" + i).css("display", "initial");
        } else {
            $("#medal-img-" + i).css("display", "none");
        }

        i++;
    })


    medal_icon_1.attr("src", "img/badge_shadow_grey.png");
    medal_icon_2.attr("src", "img/badge_bronze_grey.png");
    medal_icon_3.attr("src", "img/badge_silver_grey.png");
    medal_icon_4.attr("src", "img/badge_gold_grey.png");
    medal_icon_5.attr("src", "img/badge_platinum_grey.png");


    let iconIdx = parseInt(medal.targetIdx) + 1;
    $("#medal-icon-" + iconIdx).attr("src", $("#medal-icon-" + iconIdx).attr("src").replace("_grey", ""));

    // TOTAL DIV
    $("#medal-total").css("display", "initial");
    $("#medal-total-input").css("display", "none");
    $("#medal-total-edit-btn").css("display", "initial");
    $("#medal-total-save-btn").css("display", "none");
    $("#medal-total-cancel-btn").css("display", "none");

    $("#medal-total").text(medal.total);
    $("#medal-total-input").attr("max", medal.maxTargetGoal);
    $("#medal-total-input").val(medal.total);

    // DESCRIPTION DIV

    loadImageFromFirebase("medals/" + medal.targets["1"].image, "medal-bronze-description-img");
    $("#medal-bronze-description-text").text(medal.description.plural.badge_en.replace("{0}", medal.targets[1].targetGoal)
        .replace("{0:0.#}", medal.targets[1].targetGoal));
    startLoading();

    loadImageFromFirebase("medals/" + medal.targets["2"].image, "medal-silver-description-img");
    $("#medal-silver-description-text").text(medal.description.plural.badge_en.replace("{0}", medal.targets[2].targetGoal)
        .replace("{0:0.#}", medal.targets[2].targetGoal));
    startLoading();

    loadImageFromFirebase("medals/" + medal.targets["3"].image, "medal-gold-description-img");
    $("#medal-gold-description-text").text(medal.description.plural.badge_en.replace("{0}", medal.targets[3].targetGoal)
        .replace("{0:0.#}", medal.targets[3].targetGoal));
    startLoading();

    loadImageFromFirebase("medals/" + medal.targets["4"].image, "medal-platinum-description-img");
    $("#medal-platinum-description-text").text(medal.description.plural.badge_en.replace("{0}", medal.targets[4].targetGoal)
        .replace("{0:0.#}", medal.targets[4].targetGoal));
    startLoading();
}

function startLoading() {
    if (medals_loading_counter == 0) {
        $("#edit-medal-count-div").css("display", "none");
        $("#medals-loading").css("display", "block");
    }
    medals_loading_counter++;
}

function endLoading() {
    medals_loading_counter--;
    if (medals_loading_counter == 0) {
        $("#edit-medal-count-div").css("display", "block");
        $("#medals-loading").css("display", "none");
    }
}