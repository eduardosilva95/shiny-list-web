var redirect_url = null;

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
                    toastr.error("ERROR: " + result.msg);
                }
            } else {
                $("#need-login-error").css("display", "none");
                setUserCookie(result.user_id, result.picture);
                if (redirect_url != null) {
                    location.href = redirect_url;
                } else {
                    loadNavbar();
                    toastr.success('Welcome back <b>' + result.username + "</b>");
                }

            }
        });
    });

}


function signOut() {
    firebase.auth().signOut().then(function() {
        deleteUserCookie();
        window.location.href = "/";
    }).catch(function(error) {
        // An error happened.
    });
}


function setUserCookie(user_id, picture, type) {
    var d = new Date();
    d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();

    document.cookie = "user=" + user_id + "; " + expires + ";path=/";
    document.cookie = "picture=" + picture + "; " + expires + ";path=/";

}


function setSessionCookie(user_id, picture, type) {
    document.cookie = "user=" + user_id + ";path=/";
    document.cookie = "picture=" + picture + ";path=/";
}

function hasUserCookies() {
    var user_id = "";
    var picture = "";

    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf("user=") == 0) {
            user_id = c.substring("user=".length, c.length);
        }

        if (c.indexOf("picture=") == 0) {
            picture = c.substring("picture=".length, c.length);
        }
    }

    if (user_id != "" && picture != "") {
        return true;
    } else {
        return false;
    }


}

function getUserCookie() {
    var user_id = "";

    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf("user=") == 0) {
            user_id = c.substring("user=".length, c.length);
        }
    }

    if (user_id != "") {
        return user_id;
    } else {
        return null;
    }
}

function getPictureCookie() {
    var picture = "";

    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];

        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf("picture=") == 0) {
            picture = c.substring("picture=".length, c.length);
        }
    }

    if (picture != "" && picture != null && picture != "undefined") {
        return picture;
    } else {
        return null;
    }
}



function deleteUserCookie() {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "picture=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function loadNavbar() {
    if (hasUserCookies()) {
        var user_id = getUserCookie();
        var picture = getPictureCookie();


        if (picture == null) {
            document.getElementById("user-profile-pic").src = 'img/login.png';
        } else {
            storage.ref().child("users/" + user_id + "/" + picture).getDownloadURL().then(function(url) {
                // Or inserted into an <img> element:
                document.getElementById("user-profile-pic").src = url;

            }).catch(function(error) {
                // Handle any errors
            });
        }

        if (document.getElementById("user-id") != null)
            document.getElementById("user-id").value = user_id;




        document.getElementById("profile").style.display = 'block';
        document.getElementById("login").style.display = 'none';

    } else {
        document.getElementById("profile").style.display = 'none';
        document.getElementById("login").style.display = 'block';
    }
}

$(function() {

    var inputSwitches = $(".inputSwitch");
    var inputs = inputSwitches.find("input");
    var spans = inputSwitches.find("span");

    $("#view-profile-btn").click(function() {
        $.get("/profile-info", {}, function(result) {
            if (result.error == null) {
                if (result.picture) {
                    storage.ref().child("users/" + result.user_id + "/" + result.picture).getDownloadURL().then(function(url) {
                        // Or inserted into an <img> element:
                        $("#profile-pic-img").attr("src", url);

                    }).catch(function(error) {
                        // Handle any errors
                    });
                } else {
                    $("#profile-pic-img").attr("src", "/img/login.png");
                }

                $("#profile-name").text(result.name);
                $("#profile-nickname-span").text(result.nickname);
                $("#profile-nickname-input").val(result.nickname);
                $("#profile-start-date").text(result.startDate);
                $("#profile-pokemon-caught-span").text(result.pokemonCaught);
                $("#profile-pokemon-caught-input").val(result.pokemonCaught);

                $("#profile-modal").modal();

            }
        });
    });

    $("#profile-modal-edit-btn").click(function() {
        $("#profile-nickname-span").css("display", "none");
        $("#profile-nickname-input").css("display", "initial");
        $("#profile-pokemon-caught-span").css("display", "none");
        $("#profile-pokemon-caught-input").css("display", "initial");
        $("#profile-modal-edit-btn").css("display", "none");
        $("#profile-modal-save-btn").css("display", "block");
        $("#profile-modal-cancel-btn").css("display", "block");
    });

    $("#profile-modal-save-btn").click(function() {
        var nickname = $("#profile-nickname-input").val();
        var pokemon_caught = $("#profile-pokemon-caught-input").val();
        $.post("/update-profile", { nickname: nickname, pokemon_caught: pokemon_caught }, function(result) {

            if (result.success) {
                $("#profile-nickname-span").text(nickname);
                $("#profile-nickname-span").css("display", "initial");
                $("#profile-nickname-input").css("display", "none");
                $("#profile-pokemon-caught-span").text(pokemon_caught);
                $("#profile-pokemon-caught-span").css("display", "initial");
                $("#profile-pokemon-caught-input").css("display", "none");
                $("#profile-modal-edit-btn").css("display", "initial");
                $("#profile-modal-save-btn").css("display", "none");
                $("#profile-modal-cancel-btn").css("display", "none");
            }

        });
    });

    $("#profile-modal-cancel-btn").click(function() {
        $("#profile-nickname-span").css("display", "initial");
        $("#profile-nickname-input").css("display", "none");
        $("#profile-pokemon-caught-span").css("display", "initial");
        $("#profile-pokemon-caught-input").css("display", "none");
        $("#profile-modal-edit-btn").css("display", "initial");
        $("#profile-modal-save-btn").css("display", "none");
        $("#profile-modal-cancel-btn").css("display", "none");
    });

    $("#link-friends").click(function() {
        $.get("/request-friends", {}, function(result) {
            if (result.success) {
                location.href = "/friends";
            } else {
                redirect_url = "/friends";
                $("#need-login-error").css("display", "block");
                $("#login-modal").modal();
            }
        });
    });

    $("#link-stats").click(function() {
        $.get("/request-stats", {}, function(result) {
            if (result.success) {
                location.href = "/stats";
            } else {
                redirect_url = "/stats";
                $("#need-login-error").css("display", "block");
                $("#login-modal").modal();
            }
        });
    });

    $("#link-shiny-list").click(function() {
        $.get("/request-shiny-list", {}, function(result) {
            if (result.success) {
                location.href = "/shiny-list";
            } else {
                redirect_url = "/shiny-list";
                $("#need-login-error").css("display", "block");
                $("#login-modal").modal();
            }
        });
    });

    $("#link-shiny-list-temp").click(function() {
        $.get("/request-shiny-list", {}, function(result) {
            if (result.success) {
                location.href = "/shiny-list-temp";
            } else {
                redirect_url = "/shiny-list-temp";
                $("#need-login-error").css("display", "block");
                $("#login-modal").modal();
            }
        });
    });

    $("#register-modal-continue-btn").click(function() {
        var id = $("#id-input").val();
        var name = $("#name-input").val();
        var nickname = $("#nickname-input").val();
        var pokemon_caught = $("#pokemon-caught-input").val();


        $.post("/register", { id: id, name: name, nickname: nickname, pokemon_caught: pokemon_caught }, function(result) {

            if (result.success) {
                $("#need-login-error").css("display", "none");
                setUserCookie(result.user_id, result.picture);
                $("#register-modal").modal('hide');
                loadNavbar();
                toastr.success('Welcome <b>' + result.username + "</b>");
            }

        });
    });


});