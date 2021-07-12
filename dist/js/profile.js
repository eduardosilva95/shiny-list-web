var activeImage = null;
var totalImages = 0;
var imagesToUpload = [];
var imagesToRemove = [];
var droppedFiles = false;
var photos_loading_counter = 0;
var photos_loading_error = false;

$(document).on("click", "#profile-modal-edit-btn", function() {
    $("#profile-nickname-span").css("display", "none");
    $("#profile-nickname-input").css("display", "initial");
    $("#profile-xp-span").css("display", "none");
    $("#profile-xp-input").css("display", "initial");
    $("#profile-level-span").css("display", "none");
    $("#profile-level-input").css("display", "initial");
    $("#profile-modal-edit-btn").css("display", "none");
    $("#profile-modal-edit-photos-btn").css("display", "none");
    $("#profile-modal-save-btn").css("display", "block");
    $("#profile-modal-cancel-btn").css("display", "block");
});

$(document).on("click", "#profile-modal-save-btn", function() {
    var nickname = $("#profile-nickname-input").val();
    var xp = $("#profile-xp-input").val();
    var level = $("#profile-level-input").val();
    $.post("/update-profile", { nickname: nickname, xp: xp, level: level }, function(result) {

        if (result.success) {
            $("#profile-nickname-span").text(nickname);
            $("#profile-nickname-span").css("display", "initial");
            $("#profile-nickname-input").css("display", "none");
            $("#profile-level-span").text(result.playerLevel);
            $("#profile-level-span").css("display", "initial");
            $("#profile-level-input").css("display", "none");
            $("#profile-level-input").val(result.playerLevel);
            $("#profile-xp-span").text(Number(xp).toLocaleString('pt'));
            $("#profile-xp-span").css("display", "initial");
            $("#profile-xp-input").css("display", "none");
            $("#profile-modal-edit-btn").css("display", "initial");
            $("#profile-modal-edit-photos-btn").css("display", "initial");
            $("#profile-modal-save-btn").css("display", "none");
            $("#profile-modal-cancel-btn").css("display", "none");
        }

    });
});

$(document).on("click", "#profile-modal-cancel-btn", function() {
    $("#profile-nickname-span").css("display", "initial");
    $("#profile-nickname-input").css("display", "none");
    $("#profile-level-span").css("display", "initial");
    $("#profile-level-input").css("display", "none");
    $("#profile-xp-span").css("display", "initial");
    $("#profile-xp-input").css("display", "none");
    $("#profile-modal-edit-btn").css("display", "initial");
    $("#profile-modal-edit-photos-btn").css("display", "initial");
    $("#profile-modal-save-btn").css("display", "none");
    $("#profile-modal-cancel-btn").css("display", "none");
});



$(document).on("click", "#profile-modal-edit-photos-btn", function() {
    $("#profile-modal").modal("hide");

    loadPhotos();
    $("#photos-management-modal").modal();
    $("#photos-div").css("display", "none");
    $("#photos-loading").css("display", "block");
});

function loadPhotos() {
    totalImages = 0;
    $.get("/profile-info/image", {}, function(result) {
        if (result.image) {
            activeImage = result.image;
            $("div.upload-photo-gallery").empty();
            loadUserPhotosFromFirebase("users/" + getCookie("user"), "div.upload-photo-gallery");
            $("#photos-div").css("display", "block");
            $("#photos-loading").css("display", "none");
        } else {
            if (result.error && result.message.includes("image not exists")) {
                $("div.upload-photo-gallery").empty();

                addImageToGallery("/img/login.png", "div.upload-photo-gallery", "default.png", true);
                $("#upload-photo-icon").css("display", "none");
                $(".upload-photo-labels").toggleClass("empty-files", false);

                $("#photos-div").css("display", "block");
                $("#photos-loading").css("display", "none");
            } else {
                showToastr("error", "Error loading photos", "");
            }
        }
    });
}


// PHOTOS MANAGEMENT MODAL

$(document).on('drag dragstart dragend dragover dragenter dragleave drop', ".upload-photo-div", function(e) {
        e.preventDefault();
    })
    .on('dragover dragenter', function() {
        $(".upload-photo-div").addClass('is-dragover');
    })
    .on('dragleave dragend drop', function() {
        $(".upload-photo-div").removeClass('is-dragover');
    })
    .on('drop', function(e) {
        droppedFiles = e.originalEvent.dataTransfer.files;
        imagesPreview(e.originalEvent.dataTransfer, 'div.upload-photo-gallery');
    });


function loadUserPhotosFromFirebase(folderUrl, targetDiv) {
    storage.ref().child(folderUrl).listAll().then((res) => {
        res.items.forEach((itemRef) => {
            storage.ref().child(itemRef.location.path).getDownloadURL().then(function(url) {
                addImageToGallery(url, targetDiv, itemRef.location.path.match(/[^\\/]*$/)[0], false);
                $("#upload-photo-icon").css("display", "none");
                $(".upload-photo-labels").toggleClass("empty-files", false);
            }).catch(function(error) {
                console.log("Error getting the image from Firebase");
            });
        });
    }).catch(function(error) {
        console.log("Error getting the files from folder from Firebase");
    });
}


function onImageLoad(img) {
    if (activeImage && $(img).data("imageId") == activeImage) {
        changeActionsBtnStatus(img, true);
    }

    if ($(img).data("needsConvertion")) {
        imagesToUpload.push({ name: $(img).data("imageId"), image: convertWebImageToBase64($(img).prop("id")) });
    }

    totalImages++;
    $("#photos-total-count").text(totalImages);
}

$(document).on("change", "#upload-photo-input", function(e) {
    imagesPreview(this, 'div.upload-photo-gallery');
});

// Multiple images preview in browser
var imagesPreview = function(input, placeToInsertImagePreview) {

    if (input.files) {
        var filesAmount = input.files.length;

        if (filesAmount > 0) {
            $("#upload-photo-icon").css("display", "none");
            $(".upload-photo-labels").toggleClass("empty-files", false);
        }

        for (i = 0; i < filesAmount; i++) {
            var reader = new FileReader();
            reader.fileName = input.files[i].name
            reader.onload = function(event) {
                imagesToUpload.push({ name: event.target.fileName, image: event.target.result });
                addImageToGallery(event.target.result, placeToInsertImagePreview, event.target.fileName, false);
            }

            reader.readAsDataURL(input.files[i]);
        }
    }
};


function addImageToGallery(imageUrl, target, fileName, needsConvertion) {
    var content = "<div class=\"upload-photo-gallery-div\"><div class=\"upload-photo-gallery-header\">";
    content += "<div class=\"upload-photo-gallery-header-content\">";
    content += "<span>" + fileName + "</span>"
    content += "<div class=\"upload-photo-gallery-actions\"><button class=\"upload-photo-gallery-activate-btn\" title=\"Set image as profile picture\"><i class=\"fas fa-thumbtack\"></i></button>";
    content += "<button class=\"upload-photo-gallery-remove-btn\" title=\"Remove image\"><i class=\"far fa-trash-alt\"></i></button></div>";
    content += "</div></div>";
    content += "<img class=\"upload-photo-gallery-img\" id=\"upload-photo-image-" + fileName + "\" src=\"" + imageUrl + "\" data-image-id=\"" + fileName + "\" onload=\"onImageLoad(this)\"" + (needsConvertion ? "data-needs-convertion=\"true\"" : "") + ">";
    content += "</div>";
    $(target).append(content);
}


// REMOVE IMAGE
$(document).on("click", ".upload-photo-gallery-remove-btn", function() {
    var imageId = $(this).parent().parent().parent().siblings(".upload-photo-gallery-img").data("imageId");

    remainingImagesToUpload = removeImageFromList(imagesToUpload, imageId, "name");

    if (imagesToUpload.length == remainingImagesToUpload) {
        imagesToRemove.push(imageId);
    }

    imagesToUpload = remainingImagesToUpload;

    totalImages--;
    $("#photos-total-count").text(totalImages);

    if (totalImages == 0) {
        $("#upload-photo-icon").css("display", "initial");
        $(".upload-photo-labels").toggleClass("empty-files", true);
    }

    $(this).closest(".upload-photo-gallery-div").remove();
    $("#upload-photo-input").val("");

});


// ACTIVATE IMAGE
$(document).on("click", ".upload-photo-gallery-activate-btn", function() {
    var imageId = $(this).parent().parent().parent().siblings(".upload-photo-gallery-img").data("imageId");

    // remove active class from previous active image
    changeActionsBtnStatus($(".upload-photo-gallery-div.active").children("img"), false);

    console.log("Turn image " + imageId + " in profile pic");

    changeActionsBtnStatus("img[data-image-id='" + imageId + "']", true);

});

function changeActionsBtnStatus(element, isActive) {
    $(element).parent().find(".upload-photo-gallery-remove-btn").toggleClass("disabled", isActive);
    $(element).parent().find(".upload-photo-gallery-activate-btn").toggleClass("disabled", isActive);
    $(element).parent().find(".upload-photo-gallery-remove-btn").prop("disabled", isActive);
    $(element).parent().find(".upload-photo-gallery-activate-btn").prop("disabled", isActive);
    $(element).parent().toggleClass("active", isActive);
}

$(document).on("click", "#photos-management-modal-save-btn", function() {
    var currentActiveImg = $(".upload-photo-gallery-div.active").children("img").data("imageId");

    if (!currentActiveImg) {
        showToastr("error", "Cannot save photos", "There are no photos set as profile picture");
        return;
    }

    if (imagesToUpload.length > 0) {
        startLoading();
        uploadPhotos(imagesToUpload)
            .then((res) => {
                showToastr("success", "Photos successfully uploaded", "The pictures were successfully uploaded");
                endLoading();
                // IF NEW ACTIVE IMAGE IS A NEW IMAGE, ONLY SET AFTER SUCCESSFULLY UPLOAD
                if (activeImage != currentActiveImg && imagesToUpload.includes(currentActiveImg)) {
                    startLoading();
                    setActiveImage(currentActiveImg)
                        .then(function(result) {
                            if (result.error) {
                                photos_loading_error = true;
                                showToastr("error", "Profile picture not changed", "An error occurred when changing the profile picture");
                                endLoading();
                            } else {
                                var d = new Date();
                                d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
                                var expires = "expires=" + d.toUTCString();
                                setCookie("picture", currentActiveImg, expires);
                                loadImageFromFirebase("users/" + getCookie("user") + "/" + currentActiveImg, "user-profile-pic");
                                loadImageFromFirebase("users/" + getCookie("user") + "/" + currentActiveImg, "profile-pic-img");

                                showToastr("success", "Profile picture changed", "The picture " + currentActiveImg + " is the new profile picture");
                                endLoading();
                                // IF OLD ACTIVE IMAGE IS A REMOVED IMAGE, ONLY REMOVE AFTER SUCCESFULLY UPLOAD AND ACTIVATE THE NEW ONE
                                if (imagesToRemove.includes(activeImage)) {
                                    startLoading();
                                    removePhotos(imagesToRemove)
                                        .then((res) => {
                                            imagesToRemove = [];
                                            showToastr("success", "Images removed", "The images were successfully removed");
                                            endLoading();
                                        }).catch((error) => {
                                            endLoading();
                                        });
                                }
                                activeImage = currentActiveImg;
                                currentActiveImg = null;
                            }
                        });
                }
            })
            .catch((error) => {
                endLoading();
            });
    }


    if (activeImage != currentActiveImg && !imagesToUpload.includes(currentActiveImg)) {
        startLoading();
        setActiveImage(currentActiveImg)
            .then(function(result) {
                if (result.error) {
                    photos_loading_error = true;
                    showToastr("error", "Profile picture not changed", "An error occurred when changing the profile picture");
                    endLoading();
                } else {
                    var d = new Date();
                    d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
                    var expires = "expires=" + d.toUTCString();
                    setCookie("picture", currentActiveImg, expires);
                    loadImageFromFirebase("users/" + getCookie("user") + "/" + currentActiveImg, "user-profile-pic");
                    loadImageFromFirebase("users/" + getCookie("user") + "/" + currentActiveImg, "profile-pic-img");


                    showToastr("success", "Profile picture changed", "The picture " + currentActiveImg + " is the new profile picture");
                    endLoading();
                    // IF OLD ACTIVE IMAGE IS A REMOVED IMAGE, ONLY REMOVE AFTER SUCCESFULLY UPLOAD AND ACTIVATE THE NEW ONE
                    if (imagesToRemove.includes(activeImage)) {
                        startLoading();
                        removePhotos(imagesToRemove)
                            .then((res) => {
                                imagesToRemove = [];
                                showToastr("success", "Images removed", "The images were successfully removed");
                                endLoading();
                            }).catch((error) => {
                                endLoading();
                            });
                    }
                    activeImage = currentActiveImg;
                    currentActiveImg = null;
                }
            });
    }


    if (imagesToRemove.length > 0 && !imagesToRemove.includes(activeImage)) {
        startLoading();
        removePhotos(imagesToRemove)
            .then((res) => {
                imagesToRemove = [];
                showToastr("success", "Images removed", "The images were successfully removed");
                endLoading();
            }).catch((error) => {
                endLoading();
            });
    }
});

$(document).on("click", "#photos-management-modal-cancel-btn", function() {
    $("#photos-management-modal").modal("hide");
    $("#profile-modal").modal();
});

function uploadPhotos(photos) {
    return Promise.all(
        photos.map((photo) => {
            return storage.ref().child('users/' + getCookie("user") + "/" + photo.name).putString(photo.image, 'data_url')
                .then((snapshot) => {
                    imagesToUpload = removeImageFromList(imagesToUpload, snapshot.metadata.name, "name");
                }).catch((error) => {
                    photos_loading_error = true;
                    showToastr("error", "Error saving image", "The image " + error + " was not saved");
                });
        })
    );
}

function removePhotos(photos) {
    return Promise.all(
        photos.map((photo) => {
            return storage.ref().child('users/' + getCookie("user") + "/" + photo).delete()
                .then(() => {}).catch((error) => {
                    photos_loading_error = true;
                    showToastr("error", "Error removing image", "The image " + error + " was not removed");
                });
        })
    );
}

function setActiveImage(imageId) {
    return $.post("/update-profile-photo", { user_id: getCookie("user"), photo: imageId });
}

function removeImageFromList(list, elem, key) {
    return list.filter(a => (key == null && a != elem || key != null && a[key] != elem));
}

function startLoading() {
    if (photos_loading_counter == 0) {
        $("#photos-div").css("display", "none");
        $("#photos-loading").css("display", "block");
    }
    photos_loading_counter++;
}

function endLoading() {
    photos_loading_counter--;
    if (photos_loading_counter == 0) {
        if (photos_loading_error) {
            loadPhotos();
        }
        photos_loading_error = false;
        $("#photos-div").css("display", "block");
        $("#photos-loading").css("display", "none");
    }
}