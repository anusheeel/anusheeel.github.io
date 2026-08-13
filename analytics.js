(function () {
    "use strict";

    var apiOrigin = "https://page-views-api.ratneshc.com";
    var site = "anusheeel.github.io";
    var landingPath = "/";
    var resumePath = "/resume-download";
    var visitCount = document.getElementById("visit-count");
    var resumeDownloadCount = document.getElementById("resume-download-count");
    var resumeDownloadLinks = document.querySelectorAll("[data-resume-download]");
    var numberFormatter = new Intl.NumberFormat();

    function endpoint(kind, path) {
        return apiOrigin + "/api/v1/" + kind + "?site=" +
            encodeURIComponent(site) + "&path=" + encodeURIComponent(path);
    }

    function showCount(node, value) {
        if (!node) return;
        node.textContent = numberFormatter.format(value);
    }

    function showUnavailable(node) {
        if (!node) return;
        node.textContent = "Unavailable";
    }

    function readCount(path, node) {
        return fetch(endpoint("views", path), {
            credentials: "omit",
            mode: "cors"
        })
            .then(function (response) {
                if (!response.ok) throw new Error("Count request failed");
                return response.json();
            })
            .then(function (data) {
                showCount(node, Number(data.views) || 0);
            })
            .catch(function () {
                showUnavailable(node);
            });
    }

    function track(path) {
        return fetch(endpoint("track", path), {
            credentials: "omit",
            keepalive: true,
            mode: "cors"
        });
    }

    function trackLandingVisit() {
        if (window.location.pathname !== landingPath && window.location.pathname !== "/index.html") {
            return readCount(landingPath, visitCount);
        }

        return track(landingPath)
            .catch(function () {})
            .then(function () {
                return readCount(landingPath, visitCount);
            });
    }

    trackLandingVisit();
    readCount(resumePath, resumeDownloadCount);

    Array.prototype.forEach.call(resumeDownloadLinks, function (resumeDownloadLink) {
        resumeDownloadLink.addEventListener("click", function () {
            track(resumePath)
                .catch(function () {})
                .then(function () {
                    return readCount(resumePath, resumeDownloadCount);
                });
        });
    });
})();
