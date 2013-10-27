(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;
    var utils = WinJS.Utilities;

    WinJS.UI.Pages.define("/pages/home/home.html", {
        // This function updates the ListView with new layouts
        initializeLayout: function (listView, viewState) {
            if (viewState === appViewState.snapped) {
                listView.itemDataSource = Data.groups.dataSource;
                listView.groupDataSource = null;
                listView.layout = new ui.ListLayout();
            } else {
                listView.itemDataSource = Data.items.dataSource;
                listView.groupDataSource = Data.groups.dataSource;
                listView.layout = new ui.GridLayout({
                    groupHeaderPosition: "top"
                });
            }
        },

        itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                // If the page is snapped, the user invoked a group.
                var group = Data.groups.getAt(args.detail.itemIndex);
            } else {
                // If the page is not snapped, the user invoked an item.
                var item = Data.items.getAt(args.detail.itemIndex);
                nav.navigate("/pages/memoryDetails/memoryDetails.html", { item: Data.getItemReference(item) });
            }
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {

            var connectivity = Windows.Networking.Connectivity;
            var profile = connectivity.NetworkInformation.getInternetConnectionProfile();
            if (!profile) {
                nav.navigate("/pages/noInternet/noInternet.html");
            }

            var listView = element.querySelector(".groupeditemslist").winControl;
            listView.groupHeaderTemplate = element.querySelector(".headerTemplate");
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.oniteminvoked = this.itemInvoked.bind(this);

            this.initializeLayout(listView, appView.value);
            listView.element.focus();

            WL.Event.subscribe("auth.login", onLoginComplete);
            WL.init();

            WL.login({
                scope: ["wl.signin", "wl.photos", "wl.skydrive", "wl.skydrive_update", "wl.basic"],
            }).then(
                function (response) {
                    WL.api({
                        path: "me/skydrive",
                        method: "POST",
                        body: {
                            "name": "memories",
                            "description": "Content from 'Memories Diary' Windows App"
                        }
                    }).then(
                        function (response) {
                            console.log(
                                "Created folder. Name: " + response.name + ", ID: " + response.id);
                            Windows.Storage.ApplicationData.current.localSettings.values["skydrivefolderid"] = response.id;

                            var currentYear = new Date().getFullYear();

                            WL.api({
                                path: Windows.Storage.ApplicationData.current.localSettings.values["skydrivefolderid"],
                                method: "POST",
                                body: {
                                    "name": "" + currentYear
                                }
                            }).then(
                                function (response) {
                                    Windows.Storage.ApplicationData.current.localSettings.values["yearfolderid"] = response.id;
                                });
                        },
                        function (responseFailed) {
                            console.log(
                                "Error calling API: " + responseFailed.error.message);

                            WL.api("me/skydrive/files", function (response) {
                                var skyDriveFiles = response.data;
                                if (skyDriveFiles) {
                                    for (var i = 0; i < skyDriveFiles.length; i++)
                                        if (skyDriveFiles[i].name == "memories") {
                                            Windows.Storage.ApplicationData.current.localSettings.values["skydrivefolderid"] = skyDriveFiles[i].id;
                                        }
                                }
                            });

                            var currentYear = new Date().getFullYear();

                            WL.api({
                                path: Windows.Storage.ApplicationData.current.localSettings.values["skydrivefolderid"],
                                method: "POST",
                                body: {
                                    "name": "" + currentYear
                                }
                            }).then(
                                function (response) {
                                    Windows.Storage.ApplicationData.current.localSettings.values["yearfolderid"] = response.id;
                                });
                        }
                    );
                },
                function (responseFailed) {
                    console.log(
                        "Error signing in: " + responseFailed.error_description);
                }
            );
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            var listView = element.querySelector(".groupeditemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    this.initializeLayout(listView, viewState);
                }
            }
        }
    });

    function onLoginComplete() {
        var session = WL.getSession();
        if (!session.error) {
            signedInUser();
        }
    };

    function signedInUser() {
        WL.api({
            path: "/me",
            method: "get"
        }).then(
            function (result) {
                // User is signed in
            });
    };

    function getUserPicture() {
        WL.api
        ({
            path: "me/picture",
            method: "get"
        }).then(
            function (result) {
            });
    };
})();