(function () {
    "use strict";

    var ui = WinJS.UI;
    var utils = WinJS.Utilities;
    ui.processAll().then(function () {

        ui.Pages.define("/pages/noInternet/noInternet.html", {
            // This function is called whenever a user navigates to this page. It
            // populates the page elements with the app's data.
            ready: function (element, options) {
            }
        });
    });
})();
