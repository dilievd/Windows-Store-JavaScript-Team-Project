var loadedImagesIds = [];

(function () {
    "use strict";

    // Get a reference for an item, using the group key and item title as a
    // unique reference to the item that can be easily serialized.
    function getItemReference(item) {
        return [item.group.key, item.title];
    }

    function resolveGroupReference(key) {
        for (var i = 0; i < groupedItems.groups.length; i++) {
            if (groupedItems.groups.getAt(i).key === key) {
                return groupedItems.groups.getAt(i);
            }
        }
    }

    function resolveItemReference(reference) {
        for (var i = 0; i < groupedItems.length; i++) {
            var item = groupedItems.getAt(i);
            if (item.group.key === reference[0] && item.title === reference[1]) {
                return item;
            }
        }
    }

    // This function returns a WinJS.Binding.List containing only the items
    // that belong to the provided group.
    function getItemsFromGroup(group) {
        return list.createFiltered(function (item) {
            return item.group.key === group.key;
        });
    }

    var list = new WinJS.Binding.List();
    var groupedItems = list.createGrouped(
        function groupKeySelector(item) {
            return item.group.key;
        },
        function groupDataSelector(item) {
            return item.group;
        }
    );

    WL.Event.subscribe("auth.login", onLoginComplete);
    function onLoginComplete() {
        var session = WL.getSession();
        WL.api("me/skydrive/files",
            function (response) {
                var skyDriveFiles = response.data;
                if (skyDriveFiles) {
                    for (var i = 0; i < skyDriveFiles.length; i++) {
                        if (skyDriveFiles[i].name == "memories") {
                            Windows.Storage.ApplicationData.current.localSettings.values["skydrivefolderid"] = skyDriveFiles[i].id;
                        }
                    }
                }
            }, function (error) {
                console.log("ERROR");
            }).then(
            function () {
                if (!session.error) {
                    getUserPhotos();
                }
            });
    };

    function getUserPhotos() {
        var albums_path = Windows.Storage.ApplicationData.current.localSettings.values["skydrivefolderid"];
        WL.api({
            path: albums_path + "/files",
            method: "GET"
        }).then(function (response) {
            getPictures(response);
        });
    }

    var groups = [];
    function getPictures(result) {
        if (result.error) {
            console.log(result.error);
        }
        else {
            var items = result.data;
            for (var index in items) {
                downloadPicture(items[index].id);
                groups.push({
                    key: items[index].id,
                    title: items[index].name,
                    subtitle: items[index].name,
                    description: items[index].type
                });
            }
        }
    };

    function downloadPicture(folderId) {
        var path = folderId + "/files"

        // Submit request
        WL.api({
            path: path,
            method: "GET"
        }).then(function (response) {
            loadPhotos(response);
        });
    };

    function loadPhotos(result) {
        if (result.error) {
            console.log("Error loading photos");
        }
        else {
            var msg;
            var items = result.data
            for (var index in items) {
                var parentGroup;
                for (var g = 0, gl = groups.length; g < gl; g++) {
                    if (groups[g].key === items[index].parent_id) {
                        parentGroup = groups[g];
                        break;
                    }
                }

                var thumbnail = 'images/video.jpeg';
                if (items[index].images) {
                    thumbnail = items[index].images[0].source;
                }

                var dateAndTimeTaken = '';
                var info = items[index].when_taken;
                if (info) {
                    dateAndTimeTaken = info.substring(0, 10) + ' ';
                    dateAndTimeTaken += info.substring(11, 19);
                }

                if (loadedImagesIds.indexOf("" + items[index].id) < 0) {
                    loadedImagesIds.push("" + items[index].id);
                    list.push({
                        group: parentGroup,
                        key: items[index].id,
                        title: items[index].name,
                        subtitle: dateAndTimeTaken || '',
                        backgroundImage: items[index].source || '',
                        type: items[index].type,
                        content: '',
                        description: items[index].description,
                        thumbnail: thumbnail
                    });
                }
            }
        }
    };

    function uploadCapturedFile(file) {
        var albums_path = Windows.Storage.ApplicationData.current.localSettings.values["skydrivefolderid"];
        WL.api({
            path: albums_path + "/files",
            method: "GET"
        }).then(function (response) {
            var years = response.data;
            var currentYear = new Date().getFullYear();
            for (var index in years) {
                if (years[index].name == currentYear) {
                    Windows.Storage.ApplicationData.current.localSettings.values["yearfolderid"] = years[index].id;
                }
            }

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

        }).then(
            WL.backgroundUpload({
                path: Windows.Storage.ApplicationData.current.localSettings.values["yearfolderid"],
                file_name: file.name,
                file_input: file,
                overwrite: "rename"
            }).then(function (args) {
                Notificator.toastNotifier("Successfully uploaded file: " + file.displayName);
            },
                    function (err) {
                        Notificator.toastNotifier("Could not upload file: " + file.displayName);
                    },
                    function (e) {
                    }));

    };

    WinJS.Namespace.define("Data", {
        items: groupedItems,
        groups: groupedItems.groups,
        getItemsFromGroup: getItemsFromGroup,
        getItemReference: getItemReference,
        getUserPhotos: getUserPhotos,
        resolveGroupReference: resolveGroupReference,
        resolveItemReference: resolveItemReference,
        uploadFile: uploadCapturedFile
    });
})();
