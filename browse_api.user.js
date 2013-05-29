// ==UserScript==
// @match http://*/api/v2*
// ==/UserScript==

// sure it matches on all domains that have that url fragment, but this script
// really doesn't do very much and should be safe to run on apis that aren't
// ours. Heck, it might even work on them too.

//var currentStateKey = "geno-api-browser-state";
var currentState = "disabled";

function forEachLink (doSomethingWithLink) {
    var attributes = document.querySelectorAll(".webkit-html-attribute"),
        i, attributeName, valueElement, endsInUri;

    if (attributes == null) {
        console.log("Could not find tags with class .webkit-html-attribute");
        return;
    }

    i = 0;
    for(; i < attributes.length; i++) {
        attributeName = attributes[i].querySelector(".webkit-html-attribute-name").textContent;
        valueElement = attributes[i].querySelector(".webkit-html-attribute-value");
        endsInUri = /.*uri/i;

        if (endsInUri.test(attributeName) || valueElement.textContent.substring(0, 4) === "http") {
            doSomethingWithLink(valueElement);
        }
    }
}

function showHand (event) {
    // hack - chrome seems to handle xml-only pages oddly
    if (event.target.style !== null) {
        event.target.style.cursor = "pointer";
    }
}

function removeHand (event) {
    if (event.target.style !== null) {
        event.target.style.cursor = "default";
    }
}

function visitLink (event) {
    window.location = event.target.innerText; // or innerHTML, or attributes.href...
}

function enableLink (valueElement) {
    if (valueElement === null) {
        console.log("Was handed a null valueElement in enableLink.");
        return;
    }

    // I wish this would work, but for some reason it doesn't.
    // valueElement.innerHTML = '<a href="' + uri + '">' + uri + '</a>';

    // so do this hack instead
    valueElement.style.textDecoration = "underline";
    valueElement.addEventListener("mouseover", showHand);
    valueElement.addEventListener("mouseout", removeHand);
    valueElement.addEventListener("click", visitLink);
}

function disableLink (valueElement) {
    if (valueElement === null) {
        console.log("Was handed a null valueElement in disableLink.");
        return;
    }
    valueElement.style.textDecoration = "none";
    valueElement.removeEventListener("mouseover", showHand);
    valueElement.removeEventListener("mouseout", removeHand);
    valueElement.removeEventListener("click", visitLink);
}

function toggleEnabled () {
    if (currentState === "enabled") {
        forEachLink(disableLink);
        currentState = "disabled";
        //localStorage.setItem(currentStateKey, "disabled");
    } else {
        forEachLink(enableLink);
        currentState = "enabled";
        //localStorage.setItem(currentStateKey, "enabled");
    }
}

function initialize () {
    var xmlBlurb = document.querySelector(".header span"),
        enableOrDisableLink;

    xmlBlurb.innerHTML += " (<span id='toggle-api-browser'>Geno API Browser installed, click here to toggle</span>)";

    enableOrDisableLink = xmlBlurb.querySelector("#toggle-api-browser")

    // these don't work because I can't change style for SOME reason
    // enableOrDisableLink.setAttribute("style", "text-decoration: underline;");
    // enableOrDisableLink.addEventListener("mouseover", showHand);
    // enableOrDisableLink.addEventListener("mouseout", removeHand);

    enableOrDisableLink.addEventListener("click", function (event) {
        toggleEnabled();
    });

    toggleEnabled();
}

initialize();
