var eventsObject = {};
var typesObject = {};
var regionsObject = {};
var groupsObject = {};

$(function() {
    $(document).on("click", ".dropdown-stats-list", function() {
        // remove the active class from the previous selected option
        $(".dropdown-stats-list").each(function() {
            $(this).removeClass("active");
            $(this).removeAttr('disabled');
        });

        $(this).addClass("active");
        $(this).prop("disabled", "true");
        $("#stats-select-text").text($(this).children().text());

        if ($(this).children().text().toLowerCase() == "event") {
            updateEventTable();
        } else if ($(this).children().text().toLowerCase() == "type") {
            updateTypeTable();
        } else if ($(this).children().text().toLowerCase() == "region") {
            updateRegionTable();
        } else if ($(this).children().text().toLowerCase() == "group") {
            updateGroupTable();
        }


    });
});

function loadStatsData(data) {
    initStats();
    var statsUnique = 0,
        statsTotal = 0;
    for (var i = 0; i < data.length; i++) {
        statsTotal += data[i].quantity;
        statsUnique += (data[i].quantity > 0) ? 1 : 0;

        // UPDATE EVENT STATS
        if (data[i].eventList) {
            if (data[i].eventList.length == 0) {
                obj = eventsObject.values.find(a => a.id == "general");
                if (!obj) {
                    obj = { id: "general", label: "No Special Event", icon: "img/stats_icons/general.png" }
                    eventsObject.values.push(obj);
                }
                updateObject(obj, data[i]);
            }
            data[i].eventList.forEach(event => {
                obj = eventsObject.values.find(a => a.id == event);
                if (!obj) {
                    obj = { id: event, label: capitalizeFirstLetterOfEachWord(event), icon: "img/stats_icons/" + event.replaceAll(" ", "-") + ".png" }
                    eventsObject.values.push(obj);
                }
                updateObject(obj, data[i]);
            });
        }

        // UPDATE TYPE STATS
        data[i].types.forEach(type => {
            obj = typesObject.values.find(a => a.id == type);
            if (!obj) {
                obj = { id: type, label: type.charAt(0).toUpperCase() + type.slice(1), icon: "img/type_" + type + ".png" }
                typesObject.values.push(obj);
            }
            updateObject(obj, data[i]);
        });

        // UPDATE REGION STATS
        var region = data[i].location.region;
        obj = regionsObject.values.find(a => a.id == region);
        if (!obj) {
            obj = { id: region, label: region.charAt(0).toUpperCase() + region.slice(1), icon: "img/stats_icons/region/" + region + ".png", generation: data[i].location.generation }
            regionsObject.values.push(obj);
        }
        updateObject(obj, data[i]);
        if (!obj.generation) {
            obj.generation = data[i].location.generation;
        }

        if (data[i].location.form != "noform") {
            var form = data[i].location.form;
            obj = regionsObject.values.find(a => a.id == form);
            if (!obj) {
                obj = { id: form, label: form.charAt(0).toUpperCase() + form.slice(1), icon: "img/stats_icons/region/" + form + ".png" }
                regionsObject.values.push(obj);
            }
            updateObject(obj, data[i]);
        }

        // UPDATE GROUP STATS
        if (data[i].group.length == 0) {
            obj = groupsObject.values.find(a => a.id == "general");
            if (!obj) {
                obj = { id: "general", label: "No Group", icon: "img/stats_icons/group/general.png" }
                groupsObject.values.push(obj);
            }
            updateObject(obj, data[i]);
        }
        data[i].group.forEach(gr => {
            obj = groupsObject.values.find(a => a.id == gr);
            if (!obj) {
                obj = { id: gr, label: gr.charAt(0).toUpperCase() + gr.slice(1), icon: "img/stats_icons/group/" + gr + ".png" }
                groupsObject.values.push(obj);
            }
            updateObject(obj, data[i]);
        });


    };
    $("#stats-unique-count").text(statsUnique);
    $("#stats-available-count").text(data.length);
    $("#stats-total-count").text(statsTotal);
    $("#stats-percentage-count").text((statsUnique / data.length * 100).toFixed(1) + " %");

    if ($(".dropdown-stats-list.active").children().text().toLowerCase() == "event") {
        updateEventTable();
    } else if ($(".dropdown-stats-list.active").children().text().toLowerCase() == "type") {
        updateTypeTable();
    } else if ($(".dropdown-stats-list.active").children().text().toLowerCase() == "region") {
        updateRegionTable();
    } else if ($(".dropdown-stats-list.active").children().text().toLowerCase() == "group") {
        updateGroupTable();
    }

}

function updateObject(obj, data) {
    if (!obj.available) {
        obj.available = 0;
    }
    obj.available++;

    if (!obj.unique) {
        obj.unique = 0;
    }
    obj.unique += (data.quantity > 0) ? 1 : 0;

    if (!obj.total) {
        obj.total = 0;
    }
    obj.total += data.quantity;
    obj.percentage = (obj.unique / obj.available * 100).toFixed(2);
}


function updateEventTable() {
    $("#stats-table tbody").empty();
    var generalRow = eventsObject.values.find(ev => ev.id == "general");

    eventsObject.values.filter(ev => ev.id != "general").sort((a, b) => a.label > b.label ? 1 : -1).forEach((row) => {
        buildStatsTableRow(row, null);
    })

    buildStatsTableRow(generalRow, null);
}

function updateTypeTable() {
    $("#stats-table tbody").empty();
    typesObject.values.sort((a, b) => a.label > b.label ? 1 : -1).forEach((row) => {
        buildStatsTableRow(row, null);
    })
}

function updateRegionTable() {
    $("#stats-table tbody").empty();
    regionsObject.values.sort((a, b) => a.generation > b.generation ? 1 : -1).forEach((row) => {
        buildStatsTableRow(row, "stats-table-region-icon");
    })
}

function updateGroupTable() {
    $("#stats-table tbody").empty();
    var generalRow = groupsObject.values.find(gr => gr.id == "general");
    groupsObject.values.filter(gr => gr.id != "general").sort((a, b) => a.label > b.label ? 1 : -1).forEach((row) => {
        buildStatsTableRow(row, null);
    })
    buildStatsTableRow(generalRow, null);
}

function buildStatsTableRow(row, iconClass) {
    var content = "<tr><td>";
    content += "<img class=\"" + (iconClass != null ? iconClass : "stats-table-row-icon") + "\" src=\"" + row.icon + "\"></td>";
    content += "<td scope=\"row\"><strong>" + row.label + "</strong></td>"
    content += "<td>" + row.unique + "</td>"
    content += "<td>" + row.available + "</td>"
    content += "<td>" + row.total + "</td>"
    content += "<td>" + row.percentage + "</td>"
    $("#stats-table tbody").append(content);
}


// INIT STATS - LOAD STATIC DATA

function initStats() {
    eventsObject = {
        label: "Event",
        values: []
    };

    typesObject = {
        label: "Type",
        values: []
    }

    regionsObject = {
        label: "Region",
        values: []
    }

    groupsObject = {
        label: "Group",
        values: []
    }

}