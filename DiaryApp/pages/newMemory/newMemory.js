(function () {
    "use strict";

    var ui = WinJS.UI;
    var utils = WinJS.Utilities;
    ui.processAll().then(function () {

        ui.Pages.define("/pages/newMemory/newMemory.html", {
            // This function is called whenever a user navigates to this page. It
            // populates the page elements with the app's data.
            ready: function (element, options) {
                var file = options.file;
                var inputValues = {};

                element.querySelector(".titlearea .pagetitle").textContent = options.pageTitle;
                element.querySelector("article #item-image").src = URL.createObjectURL(file);
                element.querySelector("article #item-image").alt = file.name;
                element.querySelector("article #save-to-skydrive-button").addEventListener("click", function (eventInfo) {
                    inputValues = {
                        fileTitle: element.querySelector("article #file-title").textContent
                    };
                    file.comments = inputValues.fileTitle;
                    file.properties.getImagePropertiesAsync().then(function (properties) {
                        properties.title = inputValues.fileTitle;
                        if (properties.subtitle !== undefined) {
                            properties.subtitle = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("month day year hour minute second").format(new Date());
                        }
                        properties.comments = inputValues.fileTitle;
                        return properties.savePropertiesAsync();
                    }).then(function () {
                        Data.uploadFile(file);
                    }
                        );
                });
                element.querySelector(".content").focus();
            }
        });
    });
})();
