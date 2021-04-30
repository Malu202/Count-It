let personCounterBlueprint = document.getElementById("personCounterBlueprint");
let countingPage = document.getElementById("countingPage");
let nextTargetButton = document.getElementById("nextTarget");
let previousTargetButton = document.getElementById("previousTarget");
let currentTargetLabel = document.getElementById("currentTargetLabel");
let drawer = document.getElementById("drawer");
let drawerScrim = document.getElementById("drawerScrim");
let menuButton = document.getElementById("menu");
let addRoundButton = document.getElementById("addRound");
let newRoundDialog = document.getElementById("newRoundDialog");
let cancelNewRoundButton = document.getElementById("cancelNewRound");
let startNewRoundButton = document.getElementById("startNewRound");
let newRoundNameInput = document.getElementById("newRoundName");
let newRoundTargetsInput = document.getElementById("newRoundTargets");
let newRoundPersonsInput = document.getElementById("newRoundPersons");
let newRoundDatePrefix = document.getElementById("datePrefix");
let saveCurrentRoundButton = document.getElementById("saveCurrentRound");
let saveCurrentRoundSpaceBehind = document.getElementById("saveCurrentRoundSpaceBehind");

let currentTarget = 0;
let currentRound;

previousTargetButton.addEventListener("click", function () {
    currentTarget--;
    nextTargetButton.style.visibility = "visible";
    saveCurrentRoundButton.style.display = "none";
    saveCurrentRoundSpaceBehind.style.display = "none";
    if (currentTarget == 0) previousTargetButton.style.visibility = "hidden";
    showRound();
});
nextTargetButton.addEventListener("click", function () {
    currentTarget++;
    previousTargetButton.style.visibility = "visible";
    if (currentTarget == currentRound.numberOfTargets - 1) {
        nextTargetButton.style.visibility = "hidden";
        saveCurrentRoundButton.style.display = "block";
        saveCurrentRoundSpaceBehind.style.display = "block";
    }
    showRound();
});
function showRound() {
    currentTargetLabel.innerText = "Target " + (currentTarget + 1);
    currentRound.refreshDisplayedData();
}
drawerScrim.addEventListener("click", function () {
    drawer.style.display = "none";
    drawerScrim.style.display = "none";
});
menuButton.addEventListener("click", function () {
    drawer.style.display = "inherit";
    drawerScrim.style.display = "inherit";
});

[].forEach.call(drawer.getElementsByClassName("mdc-list-item"), function (button, i) {
    button.addEventListener("click", function () {
        [].forEach.call(document.getElementsByClassName("mdc-list-item--activated"), function (b) {
            b.classList.remove("mdc-list-item--activated");
        });
        button.classList.add("mdc-list-item--activated");
        [].forEach.call(document.getElementsByClassName("page"), function (page) {
            page.style.display = "none";
        });
        [].forEach.call(document.getElementsByClassName(button.id), function (page) {
            page.style.display = "flex";
        });
        drawerScrim.click();
    });
});
document.getElementById("previousRoundsButton").click();
// document.getElementById("currentRoundButton").click();


function getArrowAndZoneFromPoints(points) {
    if (points == 0) return { "zone": null, "arrow": null }
    points = points / 2;
    points = 10 - points;
    let zone = points % 3;
    let arrow = Math.floor(points / 3);
    return { "zone": zone, "arrow": arrow }
}
function getPointsFromArrowAndZone(arrow, zone) {
    if (arrow == null || zone == null) return 0;
    let points = 4 + 2 * (2 - zone) + 6 * (2 - arrow);
    return points;
}

let previousRounds;
function loadPreviousRounds() {
    previousRounds = localStorage.getItem(PREVIOUS_ROUNDS_STORAGE_ID);
    if (previousRounds != null) {
        previousRounds = previousRounds.split(PREVIOUS_ROUNDS_STORAGE_SEPERATOR);
        for (let i = 0; i < previousRounds.length; i++) {
            let previousRound = createRoundFromString(previousRounds[i]);
            previousRound.createOverview();
        }
    }
}
loadPreviousRounds();

datePrefix.innerText = (new Date()).toLocaleDateString();
addRoundButton.addEventListener("click", function () {
    newRoundDialog.classList.add("mdc-dialog--open");
});
cancelNewRoundButton.addEventListener("click", function () {
    newRoundDialog.classList.remove("mdc-dialog--open");
    let inputs = newRoundDialog.getElementsByTagName("input");
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].value = "";
    }
});
startNewRoundButton.addEventListener("click", function () {
    let nameValid = newRoundNameInput.value != "";
    let targetsValid = newRoundTargetsInput.value != "" && !isNaN(newRoundTargetsInput.value);

    let personNames = newRoundPersonsInput.value.split(",");
    for (let i = 0; i < personNames.length; i++) {
        if (personNames[i].substring(0, 1) == " ") personNames[i] = personNames[i].substring(1);
    }
    personNames.sort();
    let personsValid = personNames.length > 0;

    if (nameValid && targetsValid && personsValid) {
        let persons = [];
        for (let i = 0; i < personNames.length; i++) {
            persons.push(new Person(personNames[i], [], parseInt(newRoundTargetsInput.value)));
        }

        currentRound = new Round(new Date(), newRoundNameInput.value, persons, parseInt(newRoundTargetsInput.value));
        currentRound.createActiveRoundElements();
        cancelNewRoundButton.click();
        document.getElementById("currentRoundButton").click();
    }
});

saveCurrentRoundButton.addEventListener("click", function () {
    let currentRoundString = currentRound.toString();
    currentRound.removeActiveRoundElements();
    currentRound.save();
    currentRound = null;

    copyTextToClipboard(currentRoundString);
    window.location.reload(false);
    // document.getElementById("previousRoundsButton").click();

});


function copyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        console.log('Copying text command was ' + msg);
    } catch (err) {
        console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
}

function round(value, decimals) {

    //Removing scientific notation if used:
    var valueString = value.toString();
    var indexOfE = valueString.indexOf("E");
    var indexOfe = valueString.indexOf("e");
    var power = 0;
    if (indexOfe > -1) {
        power = parseFloat(valueString.substring(indexOfe + 1));
        valueString = valueString.substring(0, indexOfe)
    } else if (indexOfE > -1) {
        power = parseFloat(valueString.substring(indexOfE + 1));
        valueString = valueString.substring(0, indexOfE)
    }
    //round
    return Number(Math.round(valueString + 'e' + (power + decimals)) + 'e-' + (decimals));
}
