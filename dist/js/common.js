var redirect_url = null;
const DEFAULT_IMAGE = "/img/default_badge_0.png"
const TBA_DATE_TIMESTAMP = 253402300799000;

/*-------------------------------------- LOGIN  ------------------------------------------------------------------------*/

var firebaseConfig = {
    apiKey: "AIzaSyDmRmAEccwcgxz5SUmwEuqklfypdM0qC3k",
    authDomain: "shiny-pogo.firebaseapp.com",
    databaseURL: "https://shiny-pogo.firebaseio.com",
    projectId: "shiny-pogo",
    storageBucket: "shiny-pogo.appspot.com",
    messagingSenderId: "608457625867",
    appId: "1:608457625867:web:686af4fa599f39a906d20e"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var storage = firebase.storage();

function googleLogin() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    firebase.auth().signInWithPopup(provider).then(function(result) {
        var token = result.credential.accessToken;
        var user = result.user;
        loginWithFirebase(user);
    }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;
    });
}


function loginWithFirebase(user) {
    user.providerData.forEach(function(profile) {
        $.post("/google-signin", { uid: user.uid, name: profile.displayName, picture: profile.photoURL }, function(result) {
            $("#login-modal").modal('hide');
            if (result.error) {
                if (result.msg == "NEED_REGISTER") {
                    $("#register-modal").modal();
                    $("#id-input").val(result.id);
                    $("#name-input").val(result.name);
                } else {
                    showToastr("error", "Error on login. Try again.", "");
                }
            } else {
                $("#need-login-error").css("display", "none");
                setUserCookie(result.user_id, result.picture, result.isDeveloper);

                var d = new Date();
                d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toUTCString();
                setCookie("appVersion", result.version, expires);

                sessionStorage.setItem("sessionInitialized", true);
                if (redirect_url != null) {
                    location.href = redirect_url;
                } else {
                    initApp();
                    showToastr("success", 'Welcome back <b>' + result.username + "</b>", "");
                }
            }
        });
    });
}

function signOut() {
    firebase.auth().signOut().then(function() {
        clearUserData();
    }).catch(function(error) {
        // An error happened.
    });
}

function clearUserData() {
    deleteUserCookie();
    sessionStorage.clear();
    localStorage.removeItem("userData");
    //TODO: FIX REDIRECT WHEN SIGN OUT
    if (window.location.pathname + window.location.search != "/") {
        window.location.href = "/";
    } else {
        document.getElementById("profile").style.display = 'none';
        document.getElementById("login").style.display = 'block';
    }
}


/*-------------------------------------- COOKIES MANAGEMENT ------------------------------------------------------------------------*/

function setCookie(key, value, expires) {
    expires = expires != null ? expires : "";
    document.cookie = key + "=" + value + "; " + expires + ";path=/";
}

function getCookie(key) {
    var value = "";

    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(key + "=") == 0) {
            value = c.substring((key + "=").length, c.length);
        }
    }

    if (value != "") {
        return value;
    } else {
        return null;
    }
}


function setUserCookie(user_id, picture, isDeveloper) {
    var d = new Date();
    d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();

    setCookie("user", user_id, expires);
    setCookie("isDeveloper", isDeveloper, expires);

    if (picture && picture != "undefined") {
        setCookie("picture", picture, expires);
    }

}

function hasUserCookies() {
    return getCookie("user") && getCookie("user") != "";
}


function deleteUserCookie() {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "picture=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}



/*-------------------------------------- FIREBASE STORAGE ------------------------------------------------------------------------*/

function loadImageFromFirebase(imageUrl, target) {
    storage.ref().child(imageUrl).getDownloadURL().then(function(url) {
        document.getElementById(target).src = url;
    }).catch(function(error) {
        document.getElementById(target).src = DEFAULT_IMAGE;
        console.log("Error getting the image from Firebase");
    });
}

function loadImageFromFirebaseAndCache(imageUrl, target, id, compoundId) {
    id = compoundId != null ? id + "_" + compoundId : id;
    var imageUrlFromCache = getImageFromFirebaseCache(id);

    if (imageUrlFromCache) {
        document.getElementById(target).src = imageUrlFromCache;
    } else {
        storage.ref().child(imageUrl).getDownloadURL().then(function(url) {
            document.getElementById(target).src = url;
            setImageOnFirebaseCache(id, url);
        }).catch(function(error) {
            document.getElementById(target).src = DEFAULT_IMAGE;
            console.log("Error getting the image from Firebase");
        });
    }
}

function loadFolderFromFirebase(folderUrl, targetDiv, className, extraContent) {
    storage.ref().child(folderUrl).listAll().then((res) => {
        res.items.forEach((itemRef) => {
            storage.ref().child(itemRef.location.path).getDownloadURL().then(function(url) {
                $("#" + targetDiv).append("<div class=\"" + className + "\"><img class=\"" + className + "-img\" src=\"" + url + "\" data-image-id=\"" + itemRef.location.path + "\" onload=\"onImageLoad(this)\"> " +
                    (extraContent ? extraContent : "" + "</div>"));
            }).catch(function(error) {
                console.log("Error getting the image from Firebase");
            });
        });
    }).catch(function(error) {
        console.log("Error getting the files from folder from Firebase");
    });
}

function getImageFromFirebaseCache(id) {
    var cache = localStorage.getItem("firebaseImageCache");

    if (cache) {
        return JSON.parse(cache)[id];
    }

    return null;
}

function setImageOnFirebaseCache(id, imageUrl) {
    var cache = localStorage.getItem("firebaseImageCache");

    if (!cache) {
        cache = {};
    } else {
        cache = JSON.parse(cache);
    }

    cache[id] = imageUrl;

    localStorage.setItem("firebaseImageCache", JSON.stringify(cache));
}


/*-------------------------------------- APP ACTIONS ------------------------------------------------------------------------*/

function initApp() {
    if (getCookie("appVersion")) {
        $(".footer-version").text("Shiny List Web v" + getCookie("appVersion"));
    }
    if (sessionStorage.getItem("sessionInitialized") && sessionStorage.getItem("sessionInitialized") == "true") {
        loadNavbar();
    } else {
        $.get("/app-data", {}, function(result) {
            if (result.error == null) {
                $(".footer-version").text("Shiny List Web v" + result.version);
                var version = getCookie("appVersion");
                if (hasUserCookies() && version != "" && version == result.version) {
                    loadNavbar();
                    // update last access date
                    $.post("/update-last-access", { uid: getCookie("user") }, function(result) {
                        if (result.success) {
                            sessionStorage.setItem("sessionInitialized", true);
                        }
                    });
                } else {
                    if (hasUserCookies()) {
                        clearUserData();
                    }
                    document.getElementById("profile").style.display = 'none';
                    document.getElementById("login").style.display = 'block';
                }
            }
        });
    }
}


function loadNavbar() {
    var user_id = getCookie("user");
    var picture = getCookie("picture");

    if (picture == null) {
        document.getElementById("user-profile-pic").src = 'img/login.png';
    } else {
        loadImageFromFirebase("users/" + user_id + "/" + picture, "user-profile-pic");
    }

    if (document.getElementById("user-id") != null)
        document.getElementById("user-id").value = user_id;

    document.getElementById("profile").style.display = 'block';
    document.getElementById("login").style.display = 'none';

    if (getCookie("isDeveloper")) {
        buildDeveloperUserOptions();
    }
}

function buildDeveloperUserOptions() {
    var content = "<a class=\"dropdown-item header dropdown-developer need-user-link\" id=\"link-future-list-2\" data-link-query=\"type=pokemon\">";
    content += "<img src=\"img/calendar.png\"><span>Next Pokémon</span><i class=\"far fa-star dropdown-developer-icon\"></i></a>";

    content += "<a class=\"dropdown-item header dropdown-developer need-user-link\" id=\"link-future-list-2\" data-link-query=\"type=shiny\">";
    content += "<img src=\"img/shiny.png\"><span>Next Shiny</span><i class=\"far fa-star dropdown-developer-icon\"></i></a>";
    $("#profile .dropdown-divider").before(content);
}


function showToastr(type, title, message) {
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": false,
        "positionClass": "toast-top-center",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }

    toastr[type](message, title);
}

$(function() {

    var inputSwitches = $(".inputSwitch");
    var inputs = inputSwitches.find("input");
    var spans = inputSwitches.find("span");

    $("#view-profile-btn").click(function() {
        $.get("/profile-info", {}, function(result) {
            if (result.error == null) {
                if (result.picture) {
                    loadImageFromFirebase("users/" + result.user_id + "/" + result.picture, "profile-pic-img");
                } else {
                    $("#profile-pic-img").attr("src", "/img/login.png");
                }

                $("#profile-name").text(result.name);
                $("#profile-nickname-span").text(result.nickname);
                $("#profile-nickname-input").val(result.nickname);
                $("#profile-start-date").text(result.startDate);
                $("#profile-level-span").text(result.level);
                $("#profile-level-input").val(result.level);
                $("#profile-xp-span").text(Number(result.xp).toLocaleString('pt'));
                $("#profile-xp-input").val(result.xp);

                $("#profile-modal").modal();

            }
        });
        $("#profile-modal").modal();
    });

    $("#view-medals-btn").click(function() {
        loadMedals();
    });

    $(document).on("click", ".need-user-link", function() {
        var page = $(this).attr("id").replace("link-", "");
        var query = $(this).data("linkQuery");
        var requestPage = page;

        if (page.includes("shiny-list") || page == "future-list-2") {
            requestPage = "shiny-list";
        }

        $.get("/request-" + requestPage, {}, function(result) {
            if (result.success) {
                location.href = "/" + page + (query ? "?" + query : "");
            } else {
                redirect_url = "/" + page + (query ? "?" + query : "");
                $("#need-login-error").css("display", "block");
                $("#login-modal").modal();
            }
        });
    });

    $("#register-modal-continue-btn").click(function() {
        var id = $("#id-input").val();
        var name = $("#name-input").val();
        var nickname = $("#nickname-input").val();
        var level = $("#level-input").val();
        var xp = $("#xp-input").val();


        $.post("/register", { id: id, name: name, nickname: nickname, level: level, xp: xp }, function(result) {

            if (result.success) {
                $("#need-login-error").css("display", "none");
                setUserCookie(result.user_id, result.picture, result.isDeveloper);

                var d = new Date();
                d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
                var expires = "expires=" + d.toUTCString();
                setCookie("appVersion", result.version, expires);
                sessionStorage.setItem("sessionInitialized", true);

                $("#register-modal").modal('hide');
                initApp();
                toastr.success('Welcome <b>' + result.username + "</b>");
            }

        });
    });

    $("#view-settings-btn").on("click", function() {
        if (getCookie("appVersion")) {
            $(".app-version").text("v" + getCookie("appVersion"));
        }
        $("#settings-modal-clear-data-success-label").css("display", "none");

        $("#settings-modal").modal();
    });

});


function isPokemonDataOnCache(extraData) {
    var flag = "null";
    if (extraData == "shiny") {
        flag = sessionStorage.getItem("shinyListDataFlag");
    } else if (extraData == "lucky") {
        flag = sessionStorage.getItem("luckyListDataFlag");
    }

    return (flag == "null" || flag) && sessionStorage.getItem("pokemonListDataFlag");
}

function setPokemonDataCacheFlag(key) {
    sessionStorage.setItem(key + "ListDataFlag", true);
}

function getPokemonDataFromCache(extraData) {
    if (isPokemonDataOnCache(extraData)) {
        var cache = sessionStorage.getItem("pokemonDataCache");

        if (cache) {
            return JSON.parse(cache);
        }

        return null;
    }
}

function loadPokemonDataToCache(pokemonData) {
    sessionStorage.setItem("pokemonDataCache", JSON.stringify(pokemonData));
    setPokemonDataCacheFlag("pokemon");
}


function setPokemonPropertyDataOnCache(id, property, value) {
    var cache = sessionStorage.getItem("pokemonDataCache");

    if (!cache) {
        cache = {};
    } else {
        cache = JSON.parse(cache);
    }

    if (cache[id]) {
        cache[id][property] = value;
    }

    sessionStorage.setItem("pokemonDataCache", JSON.stringify(cache));
}

function clearPokemonDataCache() {
    if (sessionStorage.getItem("shinyListDataFlag")) {
        sessionStorage.removeItem("shinyListDataFlag");
    }
    if (sessionStorage.getItem("luckyListDataFlag")) {
        sessionStorage.removeItem("luckyListDataFlag");
    }
    if (sessionStorage.getItem("pokemonListDataFlag")) {
        sessionStorage.removeItem("pokemonListDataFlag");
    }
    if (sessionStorage.getItem("pokemonDataCache")) {
        sessionStorage.removeItem("pokemonDataCache");
    }
}



/*-------------------------------------- SETTINGS ------------------------------------------------------------------------*/



$(function() {
    $("#settings-modal-clear-data-btn").on("click", function() {
        clearPokemonDataCache();
        $("#settings-modal-clear-data-success-label").css("display", "initial");
    });
});



// AUX FUNCTIONS

function sortObjectByKeys(o) {
    return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
}

function convertDateToText(date) {
    date = new Date(date);

    if (date.getTime() === TBA_DATE_TIMESTAMP) {
        return "TBA";
    }

    return (date.getDate() < 10 ? '0' : '') + date.getDate() + "-" + ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1) + "-" + date.getFullYear() +
        " " + (date.getHours() < 10 ? '0' : '') + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
}

function capitalizeFirstLetterOfEachWord(word) {
    var splittedWord = word.toLowerCase().split(" ");

    for (var i = 0; i < splittedWord.length; i++) {
        splittedWord[i] = splittedWord[i].charAt(0).toUpperCase() + splittedWord[i].substring(1);
    }

    return splittedWord.join(" ");
}

function convertWebImageToBase64(element) {
    var c = document.createElement('canvas');
    var img = document.getElementById(element);
    c.height = img.naturalHeight;
    c.width = img.naturalWidth;
    var ctx = c.getContext('2d');

    ctx.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL();
}

function roughSizeOfObject(object) {

    var objectList = [];
    var stack = [object];
    var bytes = 0;

    while (stack.length) {
        var value = stack.pop();

        if (typeof value === 'boolean') {
            bytes += 4;
        } else if (typeof value === 'string') {
            bytes += value.length * 2;
        } else if (typeof value === 'number') {
            bytes += 8;
        } else if (
            typeof value === 'object' &&
            objectList.indexOf(value) === -1
        ) {
            objectList.push(value);

            for (var i in value) {
                stack.push(value[i]);
            }
        }
    }
    return bytes;
}