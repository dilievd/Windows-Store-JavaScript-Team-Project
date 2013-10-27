(function () {
    "use strict";

    function toastNotifier (text) {

        var notifications = Windows.UI.Notifications;

        var template = notifications.ToastTemplateType.toastText01;
        var toastXml = notifications.ToastNotificationManager.getTemplateContent(template);

        var toastTextElements = toastXml.getElementsByTagName("text");
        toastTextElements[0].appendChild(toastXml.createTextNode(text));

        toastXml.selectSingleNode("/toast").setAttribute("launch", '{"type":"toast","param1":"12345","param2":"67890"}');

        var toast = new notifications.ToastNotification(toastXml);

        var notifier = notifications.ToastNotificationManager.createToastNotifier();
        notifier.show(toast);
    };
    
    WinJS.Namespace.define("Notificator", {
        toastNotifier: toastNotifier
    });

})();