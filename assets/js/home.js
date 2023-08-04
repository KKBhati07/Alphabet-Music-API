(() => {
    //SETTING TOASTR FOR NOTIFICATIONS
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "3000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut",
        "opacity": "1"
    }

    //declaring global variables
    let isAuthenticated = false;

    //to authenticate the user, on start
    authenticate();




    // ----------------------AUTHENTICATE-------------------
    function authenticate() {
        $.ajax({
            type: "get",
            url: "/api/v1/users/authenticate",
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            },
            success: function (response) {
                isAuthenticated = true;
                $(".signup").text(response.name).removeAttr("id");
                $(".login").text("Log out").attr("id", "logout-user");
            }
        });
    }



    // --------------------TO UPLOAD----------------------

    //to upload a song on the server
    function uploadSong(data) {
        $.ajax({
            url: "/api/v1/songs/upload",
            type: "POST",
            data: data,
            processData: false,
            contentType: false,
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token"),
            },
            success: function (response) {
                $(".upload-song-form")[0].reset();
                $("#file-name").text("");
                //to notify the user
                toastr.success("Song uploaded successfully!");
            },
            error: function (error) {
                //to notify the user of the error
                if (error.responseJSON.message === "Invalid token") {
                    toastr.error("Login to upload songs!");
                    return;
                }
                if (error.responseJSON.logout) {
                    localStorage.removeItem("token");
                    window.location.reload();
                }
                toastr.error(error.responseJSON.message);
            },
        });
    }

    // ---------------------TO LOGIN---------------------

    //to create a new session
    function createSession(data) {
        // if the user already logged in
        if (isAuthenticated) {
            toastr.error("User already logged in");
            return;
        }

        $.ajax({
            type: "post",
            url: "/api/v1/users/create-session",
            data: data,
            success: function (response) {
                //to make changes on DOM after successful login
                $(".signup").text(response.name).removeAttr("id");
                $(".login").text("Log out").attr("id", "logout-user");
                //saving the generated token
                localStorage.setItem("token", response.token);
                toastr.success("Logged in successfully");
                //setting authenticated to true
                isAuthenticated = true;
                $(".login-form")[0].reset();
                $(".login-form-container").css("height", "0vh");
                $(".login-form-container").css("height", "0vh");
                $(".sign-up-container").css("height", "0vh");
                setTimeout(() => {
                    $(".sign-up-container").css("border", "none");
                    $(".login-form-container").css("border", "none");

                }, 500);
            },
            error: function (error) {
                //to notify the user
                toastr.error(error.responseJSON.message);
            }
        });
    }






    // -------------------TO CREATE---------------------

    //to create a new user
    function createUser(data) {
        $.ajax({
            type: "post",
            url: "/api/v1/users/create",
            data: data,
            success: function (response) {
                //to notify the user
                toastr.success("Signed up successfully!");
                $(".signup-form")[0].reset();
            },
            error: function (error) {
                toastr.error(error.responseJSON.message);
            }
        });
    }



    // --------------------EVENT HANDLERS-----------------------

    //to submit the login form
    function loginFormSubmitHandler(event) {
        event.preventDefault();
        createSession($(".login-form").serialize());
    }


    //to submit the signup form
    function signupFormSubmitHandler(event) {
        event.preventDefault();

        //to create new uer
        createUser($(".signup-form").serialize());
    }


    //to upload a song to the server
    function uploadFormSubmitHandler(event) {
        event.preventDefault();

        var formData = new FormData();

        //to check the file is not empty
        var songFile = $("#song-file-input")[0].files[0];
        if (!songFile) {
            toastr.error("Select a song to upload");
            return;
        }
        let title = $("#title").val();
        let artist = $("#artist").val();
        let album = $("#album").val();
        var fileExtension = songFile.name.split(".").pop().toLowerCase();

        formData.append("song", songFile);
        formData.append("title", title);
        formData.append("artist", artist);
        formData.append("album", album);

        uploadSong(formData);

    }


    //to logout the user
    function logoutUserClickHandler() {
        try {
            localStorage.removeItem("token");
            $(".login").text("Login").attr("id", "login-user");
            $(".signup").text("Sign Up").attr("id", "signup-user");
            //setting authenticated to false after logout
            isAuthenticated = false;
            toastr.success("Logged out successfully!");
        } catch (error) {
            toastr.error("Unable to log out");
        }
    }


    // to render the login form
    function loginBtnClickHandler() {
        $(".login-form-container").css("height", "70vh");
        $(".sign-up-container").css("height", "0vh");
        $(".login-form-container").css("border-bottom", "2px solid var(--borderColor)");
    }


    // to render the signup form
    function signupBtnClickHandler() {
        $(".sign-up-container").css("height", "70vh");
        $(".sign-up-container").css("border-bottom", "2px solid var(--borderColor)");
    }


    //to close login and signup form
    function closeFormBtnClickHandler() {
        $(".login-form-container").css("height", "0vh");
        $(".login-form-container").css("height", "0vh");
        $(".sign-up-container").css("height", "0vh");
        setTimeout(() => {
            $(".sign-up-container").css("border", "none");
            $(".login-form-container").css("border", "none");

        }, 500);

    }

    //to show the file name on DOM
    function fileInputChangeHandler() {
        if (this.files.length > 0) $("#file-name").text(this.files[0].name);
    }



    // -----------------------EVENT LISTENERS-----------------

    $(".signup-form").submit(signupFormSubmitHandler);
    $(".upload-song-form").submit(uploadFormSubmitHandler);
    $(".login-form").submit(loginFormSubmitHandler);
    $(".navigation").on("click", "#logout-user", logoutUserClickHandler);
    $(".navigation").on("click", "#signup-user", signupBtnClickHandler);
    $("#login-user").click(loginBtnClickHandler);
    $(".close-form").click(closeFormBtnClickHandler);
    $("#song-file-input").on("change", fileInputChangeHandler);
    $("#app-heading").click(() => window.location.href = "/home");




})();