// For an introduction to the Navigation template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkId=232506
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;
    var nav = WinJS.Navigation;
    
    var username;
    WinJS.Namespace.define("App", {
        username: username,
    });

    WinJS.strictProcessing();

    app.addEventListener("activated", function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                WinJS.Application.onsettings = function (e) {
                    e.detail.applicationcommands = { "help": { title: "Privacy policy", href: "/pages/privacy.html" } };
                    WinJS.UI.SettingsFlyout.populateSettings(e);
                };
            } else {
                // Restore application state here.
            }

            if (app.sessionState.history) {
                nav.history = app.sessionState.history;
            }
            args.setPromise(WinJS.UI.processAll().then(function () {
                if (nav.location) {
                    if (nav.location !== "/pages/newMemory/newMemory.html") {
                        nav.history.current.initialPlaceholder = true;
                        return nav.navigate(nav.location, nav.state);
                    }
                    else {
                        return nav.back(0);
                    }
                } else {
                    return nav.navigate(Application.navigator.home);
                }
            }));
        }
    });

    app.onerror = function (customEventObject) {
        
        nav.navigate("/pages/noInternet/noInternet.html", customEventObject);
        return true;
    }

    function sync() {
        Data.getUserPhotos();
    }

    function capturePhoto() {
        try {
            var dialog = new Windows.Media.Capture.CameraCaptureUI();
            dialog.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).then(function (file) {
                if (file) {
                    nav.navigate("/pages/newMemory/newMemory.html", { file: file, pageTitle: "Save photo" });
                } else {
                    //No photo captured
                }
            }, function (err) {
                console.log(err);
            });
        } catch (err) {
            console.log(err);
        }

    }

    WinJS.Namespace.define("AppBarButtons", {
        sync: sync,
        capturePhoto: capturePhoto
    });

    app.oncheckpoint = function (args) {
        app.sessionState.history = nav.history;
    };

    app.start();
})();
