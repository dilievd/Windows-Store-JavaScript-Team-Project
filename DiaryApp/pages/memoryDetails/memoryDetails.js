﻿(function () {
    "use strict";

    var ui = WinJS.UI;
    var utils = WinJS.Utilities;
    ui.processAll().then(function () {

        ui.Pages.define("/pages/memoryDetails/memoryDetails.html", {
            // This function is called whenever a user navigates to this page. It
            // populates the page elements with the app's data.
            ready: function (element, options) {
                var item = options && options.item ? Data.resolveItemReference(options.item) : Data.items.getAt(0);
                element.querySelector(".titlearea .pagetitle").textContent = item.title;
                element.querySelector("article .item-image").src = item.backgroundImage;
                element.querySelector("article .item-image").alt = item.subtitle;
                element.querySelector("article .item-description").innerHTML = item.description;
                element.querySelector(".content").focus();
            }
        });
    });
})();