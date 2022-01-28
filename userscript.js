// ==UserScript==
// @name         DownLiker
// @namespace    https://github.com/storjak
// @version      1.0
// @description  DownLiker
// @author       storjak
// @match        https://www.twitter.com
// @match        https://www.twitter.com/home
// @match        *://*.twitter.com/*
// @match        *://*.twitter.com
// @run-at       document-idle
// @grant        none
// ==/UserScript==

"use strict";

let latestBar, nativeSwitcherButton, embeddedCheckboxWhole, embeddedCheckboxInput, clickListenerHook;
const root = document.getElementById("react-root"),
	latestBarClasses = "css-1dbjc4n r-1awozwy r-18u37iz r-1h3ijdo r-1777fci r-1jgb5lz r-sb58tz r-ymttw5 r-13qz1uu",
	switcherButtonClasses = "css-1dbjc4n r-obd0qt r-1pz39u2 r-1777fci r-15ysp7h r-s8bhmr",
	toggleSwitchElem = document.createElement("div"),
	defaultSetting = true;
if (defaultSetting) {
	toggleSwitchElem.innerHTML = "<label class=\"switch\"><input id=\"downLikeCheckbox\" type=\"checkbox\" checked=\"true\"><span class=\"slider round\"></span></label>";
} else {
	toggleSwitchElem.innerHTML = "<label class=\"switch\"><input id=\"downLikeCheckbox\" type=\"checkbox\"><span class=\"slider round\"></span></label>";
}
const newStyle = document.createElement("style");
newStyle.innerHTML = ".switch{position:relative;display:inline-block;width:60px;height:34px;}.switch input{opacity:0;width:0;height:0;}.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;-webkit-transition:.4s;  transition:.4s;}.slider:before{position:absolute;content:\"\";height:26px;width:26px;left:4px;bottom:4px;background-color:white;-webkit-transition:.4s;transition:.4s;}input:checked+.slider{background-color:#2196F3;}input:focus+.slider{box-shadow:0 0 1px #2196F3;}input:checked+.slider:before{-webkit-transform:translateX(26px);-ms-transform:translateX(26px);transform:translateX(26px);}.slider.round{border-radius:34px;}.slider.round:before{border-radius:50%;}"; // slider credit goes to w3schools.com

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
		clickListenerHook = document.getElementsByTagName("section");
		if (clickListenerHook[0] == null || clickListenerHook[0] == undefined) {
			// do nothing
		} else {
			clearInterval(feedDetector);
			clearTimeout(feedDetectorIntervalCleaner);
			clickListenerHook = clickListenerHook[0];
			embeddedCheckboxInput.addEventListener("click", downLikeToggleHandler);
			downLikeToggleHandler();
		}
	}, 200);
	let feedDetectorIntervalCleaner = setTimeout(() => {
		clearInterval(feedDetector);
		console.error("DownLiker error: Feed element not detected, could not make hook, likes are not being monitored.");
	}, 20000);
	document.head.append(newStyle);
	embeddedCheckboxWhole = latestBar[0].insertBefore(toggleSwitchElem, nativeSwitcherButton[0]);
	embeddedCheckboxInput = document.getElementById("downLikeCheckbox");
}

function downLikeToggleHandler() {
	if (embeddedCheckboxInput.checked) {
		likeClickListener(true);
	} else if (!embeddedCheckboxInput.checked) {
		likeClickListener(false);
	}
}

function likeClickListener(s) {
	if (s) {
		clickListenerHook.addEventListener('click', likeClickHandler);
	} else {
		clickListenerHook.removeEventListener('click', likeClickHandler);
	}
}

function likeClickHandler(e) {
	const likesElement = e.path.slice(1, 6).find(x => x.dataset.testid === "like");
	if (likesElement) {
		const article = e.path.find(x => {
				return x.tagName === "ARTICLE";
			}),
			acceptable = ["https://pbs.twimg.com/m", "https://pbs.twimg.com/e", "https://pbs.twimg.com/t"],
			mediaCollection = article.getElementsByTagName("img");
		let urlPrefix,
			sources = [];
		for (let i = 0; i < mediaCollection.length; i++) {
			urlPrefix = mediaCollection[i].attributes[2].value.substring(0, 23);
			if (acceptable.includes(urlPrefix)) sources.push(mediaCollection[i].attributes[2].value);
		}
		downloadHandler(sources, article);
	}
	// else do nothing
}

function downloadHandler(srcArr, article) {
	const type = srcArr[0][22];
	let re,
		result; // unnecessary for now but used for testing.
	switch (type) {
		case "m": // image
			re = /a\/(\S+)\?/;
			result = srcArr.map(x => x.match(re)[1]);
			imageIterator(result);
			break;
		case "t": // gif
			re = /b\/(\S+)\?/;
			result = srcArr[0].match(re)[1];
			fetchRequest("https://video.twimg.com/tweet_video/" + result + ".mp4", result);
			break;
		case "e": { // video
			re = /\d+$/;
			let id = (article.getElementsByClassName("css-4rbku5 css-18t94o4 css-901oao r-9ilb82 r-1loqt21 r-1q142lx r-37j5jr r-a023e6 r-16dba41 r-rjixqe r-bcqeeo r-3s2u2q r-qvutc0")[0] || article.getElementsByClassName("css-4rbku5 css-18t94o4 css-901oao css-16my406 r-9ilb82 r-1loqt21 r-poiln3 r-bcqeeo r-qvutc0")[0]).getAttribute("href").match(re)[0];
			videoDownloader(srcArr[0], id);
			break;
		}
		default:
			console.error("DownLiker downloadHandler error: expected argument \"type\" to be \"image\", \"video\", or \"gif\", received: " + type);
			return;
	}
}

function imageIterator(idsArr) {
	idsArr.forEach(x => {
		fetchRequest("https://pbs.twimg.com/media/" + x + "?format=jpg&name=4096x4096", x);
	});
}

async function fetchRequest(url, id) {
	console.log("Download id: " + id + " started");
	fetch(new Request(url))
		.then((res) => {
			res.blob().then((blob) => {
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
			console.error("Download id: " + id + " error: " + err);
		})
		.then(() => {
			console.log("Download id: " + id + " finished");
		});
}

async function videoDownloader(id) {
	console.dir("video id: " + id);
	oAuthManager();
	//fetchRequest('generated url', id) ?
}

function oAuthManager() {

}