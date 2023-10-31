// ==UserScript==
// @name         DownLiker
// @namespace    https://github.com/storjak
// @version      1.0
// @description  DownLiker
// @author       storjak
// @match        *://*.twitter.com/*
// @match        *://*.twitter.com
// @exclude      *://business.twitter.com/*/
// @exclude      *://business.twitter.com/*/*
// @exclude      *://analytics.twitter.com/*/
// @exclude      *://analytics.twitter.com/*/*
// @exclude      *://help.twitter.com/*
// @exclude      *://*.twitter.com/notifications
// @exclude      *://*.twitter.com/notifications/*
// @exclude      *://*.twitter.com/messages
// @exclude      *://*.twitter.com/messages/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

"use strict";

// Will currently recognize and download single images, image collections, played GIFs and unplayed GIFs.  Videos are not yet supported.

let latestBar, nativeSwitcherButton, embeddedCheckboxWhole, embeddedCheckboxInput, clickListenerHook;
const root = document.getElementById("react-root"),
    latestBarClasses = "css-1dbjc4n r-1awozwy r-1igl3o0 r-rull8r r-qklmqi r-ouzzow r-18u37iz r-16y2uox r-1hvjb8t",
    switcherButtonClasses = "css-1dbjc4n r-obd0qt r-1pz39u2 r-1777fci r-15ysp7h r-s8bhmr",
    toggleSwitchElem = document.createElement("div"),
    newStyle = document.createElement("style"),
    defaultSetting = true;
if (defaultSetting) {
    toggleSwitchElem.innerHTML = "<label class=\"switch\"><input id=\"downLikeCheckbox\" type=\"checkbox\" checked=\"true\"><span class=\"slider round\"></span></label>";
} else {
    toggleSwitchElem.innerHTML = "<label class=\"switch\"><input id=\"downLikeCheckbox\" type=\"checkbox\"><span class=\"slider round\"></span></label>";
}
newStyle.innerHTML = ".switch{position:relative;display:inline-block;width:60px;height:34px;margin-right:15px}.switch input{opacity:0;width:0;height:0}.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:rgb(32 35 39);-webkit-transition:0.4s;transition:0.4s}.slider:before{position:absolute;content:\"\";height:26px;width:26px;left:4px;bottom:4px;background-color:rgb(217 217 217);-webkit-transition:0.4s;transition:0.4s}input:checked+.slider{background-color:rgb(29 155 240)}input:focus+.slider{box-shadow:0 0 1px rgb(29 155 240)}input:checked+.slider:before{-webkit-transform:translateX(26px);-ms-transform:translateX(26px);transform:translateX(26px)}.slider.round{border-radius:34px}.slider.round:before{border-radius:50%}#errorBox{font:1.4em -apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;position:fixed;left:0;right:0;background-color:#B30000;display:inline-flex;align-self:center;justify-content:center;transition-duration:0.4s;transition-property:all;transition-timing-function:ease-out}#errorBox.show{bottom:0}#errorBox.hide{bottom:-60px}@keyframes slideIn{from{bottom:-60px}to{bottom:0}}#errorBox div{margin-top:15px;margin-bottom:15px}#errorBoxMessage{color:#F7FDFF}#errorBoxCloseButton{cursor:pointer;margin-left:15px;position:relative;top:0.15em}#errorBoxCloseButton svg{height:1em;width:1em;fill:#f7fdff;stroke:#f7fdff}";

(() => {
    let detector = setInterval(() => {
        let checkerHook = document.getElementsByClassName(latestBarClasses);
        if (checkerHook[0] == null || checkerHook[0] == undefined) {
            // do nothing
        } else {
            clearInterval(detector);
            clearTimeout(detectorIntervalCleaner);
            latestBar = document.getElementsByClassName(latestBarClasses);
            nativeSwitcherButton = document.getElementsByClassName(switcherButtonClasses);
            initialToggleEmbed();
        }
    }, 200);
    let detectorIntervalCleaner = setTimeout(() => {
        clearInterval(detector)
        console.error("DownLiker error: Feed element not detected, could not make hook, likes are not being monitored.");
    }, 10000);
})();

function initialToggleEmbed() {
    let feedDetector = setInterval(() => {
        clickListenerHook = root.children[0].children[0];
        if (clickListenerHook == null || clickListenerHook == undefined) {
            // do nothing
        } else {
            clearInterval(feedDetector);
            clearTimeout(feedDetectorIntervalCleaner);
            embeddedCheckboxInput.addEventListener("click", downLikeToggleHandler);
            downLikeToggleHandler();
        }
    }, 200);
    let feedDetectorIntervalCleaner = setTimeout(() => {
        clearInterval(feedDetector);
        console.error("DownLiker error: Feed element not detected, could not make hook, likes are not being monitored.");
        errorBox("DownLiker error: Feed element not detected, could not make hook, likes are not being monitored.");
    }, 20000);
    document.head.append(newStyle);
    embeddedCheckboxWhole = latestBar[0].insertBefore(toggleSwitchElem, nativeSwitcherButton[0]);
    embeddedCheckboxInput = document.getElementById("downLikeCheckbox");
}

function downLikeToggleHandler() {
    if (embeddedCheckboxInput.checked) {
        clickListenerHook.addEventListener('click', likeClickHandler);
    } else if (!embeddedCheckboxInput.checked) {
        clickListenerHook.removeEventListener('click', likeClickHandler);
    }
}

function likeClickHandler(e) {
    const likesElement = e.composedPath().slice(1, 6).find(x => x.dataset.testid === "like");
    if (likesElement) {
        let article = e.composedPath().find(x => x.tagName === "ARTICLE");
        if (!article) article = articleGetter();
        if (!article) {
            let message = "Status link element is not in the page, download failed.";
            console.error(message);
            errorBox(message);
            return;
        }
        let videoElement = article.getElementsByTagName("video");
        if (videoElement.length > 0) { // if active video or gif, handle then download
            const poster = videoElement[0].getAttribute("poster")[22];
            if (poster[22] === "t") {
                downloadHandler([poster], poster[22]); // active gif, sending poster url
            } else { // has to be "e"
                downloadHandler(videoElement[0], "a", article); // active video, sending element
            }
            return;
        }
        const mediaCollection = article.getElementsByTagName("img"),
            acceptable = ["https://pbs.twimg.com/m", "https://pbs.twimg.com/e", "https://pbs.twimg.com/t"],
            sources = [...mediaCollection].reduce((arr, x) => {
                if (acceptable.includes(x.attributes[2].value.substring(0, 23))) arr.push(x.attributes[2].value);
                return arr;
            }, []);
        downloadHandler(sources, sources[0][22], article);
    }
    // else do nothing
}

async function downloadHandler(src, type, article = undefined) {
    let re;
    let result; // unnecessary for now but used for testing.
    switch (type) {
        case "m": // image(s)
            re = /a\/(\S+)\?/;
            result = src.map(x => x.match(re)[1]);
            result.forEach(x => {
                fetchRequest("https://pbs.twimg.com/media/" + x + "?format=jpg&name=4096x4096", x); // name=orig ?
            });
            break;
        case "t": // gif thumbnail
            re = /b\/(\S+)(\?|\.)/;
            result = src[0].match(re)[1];
            fetchRequest("https://video.twimg.com/tweet_video/" + result + ".mp4", result); // url, id
            break;
        case "e": { // video thumbnail
            return; // DO NOTHING - NOT FINISHED
        }
        case "a": { // active video, src = video element
            let attribute = src.getAttribute("poster");
            if (attribute[22] === "e") { // video
                return; // DO NOTHING - NOT FINISHED
            } else { // gif
                downloadHandler([attribute], "t");
            }
            break;
        }
        default:
            console.error("Error, media type not recognized");
            errorBox("Error, media type not recognized");
            break;
    }
}

async function fetchRequest(url, id) {
    console.log("Download id: " + id + " started");
    fetch(new Request(url))
        .then((res) => {
            res.blob()
                .then((blob) => {
                    const objectURL = URL.createObjectURL(blob);
                    const downloadElement = document.createElement("a");
                    downloadElement.href = objectURL;
                    downloadElement.setAttribute("download", id);
                    downloadElement.click();
                    downloadElement.remove();
                    URL.revokeObjectURL(objectURL);
                });
        })
        .catch((err) => {
            let message = "Download id: " + id + " error: " + err;
            console.error(message);
            errorBox(message);
        });
}

function errorBox(message = "Download Error") {
    const errorBox = document.createElement("div"); // 57px tall
    errorBox.setAttribute("id", "errorBox");
    errorBox.setAttribute("class", "hide");
    errorBox.innerHTML = "<div id=errorBoxMessage>" + message + "</div><div id=errorBoxCloseButton><svg height=100 version=1.2 viewBox=\"0 0 100 100\"width=100 x=0 xmlns=http://www.w3.org/2000/svg y=0><path d=\"m72.6 67l-5.6 5.6q-1.2 1.2-2.9 1.2q-1.6 0-2.8-1.2l-11.3-11.3l-11.3 11.3q-1.2 1.2-2.8 1.2q-1.7 0-2.9-1.2l-5.6-5.6q-1.2-1.2-1.2-2.9q0-1.6 1.2-2.8l11.3-11.3l-11.3-11.3q-1.2-1.2-1.2-2.8q0-1.7 1.2-2.9l5.6-5.6q1.2-1.2 2.9-1.2q1.6 0 2.8 1.2l11.3 11.3l11.3-11.3q1.2-1.2 2.8-1.2q1.7 0 2.9 1.2l5.6 5.6q1.2 1.2 1.2 2.9q0 1.6-1.2 2.8l-11.3 11.3l11.3 11.3q1.2 1.2 1.2 2.8q0 1.7-1.2 2.9zm1.5-58.6q-11-6.4-24.1-6.4q-13.1 0-24.1 6.4q-11 6.5-17.5 17.5q-6.4 11-6.4 24.1q0 13.1 6.4 24.1q6.5 11 17.5 17.5q11 6.4 24.1 6.4q13.1 0 24.1-6.4q11-6.5 17.5-17.5q6.4-11 6.4-24.1q0-13.1-6.4-24.1q-6.5-11-17.5-17.5z\"/></svg></div>";
    document.body.append(errorBox);
    errorBox.children[1].addEventListener("click", removeErrorBox);
    setTimeout(() => errorBox.setAttribute("class", "show"), 10);
    const boxRemover = setTimeout(() => {
        removeErrorBox(errorBox);
    }, 15000);

    function removeErrorBox() {
        clearTimeout(boxRemover);
        errorBox.children[1].removeEventListener("click", removeErrorBox);
        errorBox.setAttribute("class", "hide");
        setTimeout(() => errorBox.remove(), 450);
    }
}

function articleGetter() {
    let statusRef = window.location.pathname.match(/\/(\S+)\/p/)[1],
        query1 = clickListenerHook.querySelectorAll(`a[href*="${statusRef}"][id]`),
        query2 = clickListenerHook.querySelectorAll(`a[href*="${statusRef}"][class="css-4rbku5 css-18t94o4 css-901oao css-16my406 r-9ilb82 r-1loqt21 r-poiln3 r-bcqeeo r-qvutc0"]`);
    if (query1.length > 0) { // in the feed the link will have an id
        return query1[0].closest("article");
    } else if (query2.length > 1) { // in a status page the link will have a special class, and there may be 2.
        return query2[1].closest("article");
    } else if (query2.length > 0) {
        return query2[0].closest("article");
    } else {
        return undefined;
    }
}
