const PREVIOUS_ROUNDS_STORAGE_SEPERATOR = ";.-@/*+#";
const PREVIOUS_ROUNDS_STORAGE_ID = "savedRounds";
const CURRENT_ROUND_STORAGE_ID = "savedCurrentRound";

let roundOverviewBlueprint = document.getElementById("roundOverviewBlueprint");
let historyPage = document.getElementById("history");
let skippedBar = document.getElementById("skippedBar");
let errorBar = document.getElementById("errorBar");



class Round {
    constructor(date, name, persons, numberOfTargets, timestamps) {
        this.date = date;
        this.name = name.replace(PREVIOUS_ROUNDS_STORAGE_SEPERATOR, "");
        this.persons = persons;
        this.numberOfTargets = numberOfTargets;
        if (timestamps) this.timestamps = timestamps;
        else this.timestamps = [];
    }


    createOverview() {
        this.overviewElement = roundOverviewBlueprint.cloneNode(true);
        this.overviewElement.classList.remove("blueprint");
        this.menuButton = this.overviewElement.getElementsByClassName("editRoundButton")[0];

        this.overviewElement.getElementsByClassName("roundDate")[0].innerText = this.date.toLocaleDateString();
        this.overviewElement.getElementsByClassName("roundName")[0].innerText = this.name;
        this.overviewElement.getElementsByClassName("roundTotalTargets")[0].innerText = this.numberOfTargets + " Targets";

        let minimum = Infinity;
        let maximum = -Infinity;
        for (let i = 0; i < this.timestamps.length; i++) {
            if (this.timestamps[i] < minimum) minimum = this.timestamps[i];
            if (this.timestamps[i] > maximum) maximum = this.timestamps[i];
        }
        let totalTimeDifference = maximum - minimum;
        if (totalTimeDifference > 8.64e+7 || totalTimeDifference < 0) totalTimeDifference = "";
        else totalTimeDifference = msToHoursAndMinutes(totalTimeDifference);

        this.overviewElement.getElementsByClassName("roundTotalTime")[0].innerText = totalTimeDifference;


        //this.overviewElement.getElementsByClassName("roundTotalTime")[0].innerText = "3h 25min";


        this.grid = this.overviewElement.getElementsByClassName("roundGrid")[0];

        this.recalculatePoints(true);
        for (let i = this.persons.length - 1; i >= 0; i--) {

            let avatar = this.grid.getElementsByClassName("avatar")[0].cloneNode(true);
            let name = this.grid.getElementsByClassName("roundPersonName")[0].cloneNode(true);
            let points = this.grid.getElementsByClassName("roundTotalPoints")[0].cloneNode(true);
            let average = this.grid.getElementsByClassName("roundAveragePoints")[0].cloneNode(true);

            name.innerText = this.persons[i].name;
            points.innerText = this.persons[i].totalPoints;
            average.innerText = "Ø" + round(this.persons[i].average, 2);
            this.grid.appendChild(avatar);
            this.grid.appendChild(name);
            this.grid.appendChild(points);
            this.grid.appendChild(average);
        }
        //Remove blueprint
        for (let i = 0; i < 4; i++) {
            this.grid.removeChild(this.grid.firstElementChild);
        }

        let self = this;
        this.menu = new Menu(this.menuButton, ["Export", "Show Details", "Delete"], [
            function () { copyTextToClipboard(self.toTextOutput()); },
            function () { alert(self.toTextOutput()); },
            function () { self.delete() }
        ]);
        historyPage.appendChild(this.overviewElement);
        // this.addButtonEvents();
    }
    recalculatePoints(roundFinished) {
        let skipped = this.getSkippedTargets();
        for (let i = this.persons.length - 1; i >= 0; i--) {
            this.persons[i].recalculatePoints(roundFinished, skipped.targets, skipped.amount);
        }
        this.earliestMissingTarget = this.getEarliestMissingTarget();
    }
    createActiveRoundElements() {
        this.persons.forEach(function (person) { person.addOverview(); });
    }
    removeActiveRoundElements() {
        this.persons.forEach(function (person) { person.removeOverview(); });
    }
    refreshDisplayedData() {
        let skipped = this.getSkippedTargets();
        this.persons.forEach(function (person) {
            person.refreshDisplayedData(skipped.targets, skipped.amount);
        });
        this.earliestMissingTarget = this.getEarliestMissingTarget();
        if (this.earliestMissingTarget < currentTarget) this.showMissingPointsError(this.earliestMissingTarget);
        else this.hideMissingPointsError();
        if (skipped.targets[currentTarget] == "-") skippedBar.style.display = "block";
        else skippedBar.style.display = "none";
    }
    setTimestampForTarget(target, timestamp) {
        if (this.timestamps[target] == null) {
            this.timestamps[target] = timestamp;
        }
    }
    hideMissingPointsError() {
        errorBar.style.display = "none";
    }

    showMissingPointsError(earliestMissingTarget) {
        errorBar.innerText = "Missing Points (Target " + (earliestMissingTarget + 1) + ")";
        errorBar.style.display = "block";
    }
    getEarliestMissingTarget() {
        let earliestMissingTarget = this.numberOfTargets - 1;
        let self = this;
        this.persons.forEach(function (person) {
            for (let i = 0; i < self.numberOfTargets; i++) {
                if (person.pointsArray[i] == null && i < earliestMissingTarget) {
                    earliestMissingTarget = i;
                    break;
                }
            }
        });
        return earliestMissingTarget;
    }
    getSkippedTargets() {
        let skippedTargets = [];
        let skippedTargetsAmount = 0;

        for (let j = 0; j < this.numberOfTargets; j++) {
            skippedTargets[j] = 1;
        }
        for (let i = 0; i < this.persons.length; i++) {
            for (let j = 0; j < this.numberOfTargets; j++) {
                if (this.persons[i].pointsArray[j] == "-") {
                    if (skippedTargets[j] != "-") skippedTargetsAmount++;
                    skippedTargets[j] = "-";
                }
            }
        }

        return { targets: skippedTargets, amount: skippedTargetsAmount }
    }
    isCurrentTargetPartiallyEmpty() {
        let isEmpty = false;
        this.persons.forEach(function (person) {
            if (person.pointsArray[currentTarget] == null) {
                isEmpty = true;
            }
        });
        return isEmpty;
    }
    setCurrentTargetAsSkipped() {
        this.persons.forEach(function (person) {
            if (person.pointsArray[currentTarget] == null) {
                person.pointsArray[currentTarget] = "-";
            }
        });
    }
    save() {
        let previous = localStorage.getItem(PREVIOUS_ROUNDS_STORAGE_ID);
        if (previous == null) {
            localStorage.setItem(PREVIOUS_ROUNDS_STORAGE_ID, this.toTextOutput());
        } else {
            previous += PREVIOUS_ROUNDS_STORAGE_SEPERATOR;
            localStorage.setItem(PREVIOUS_ROUNDS_STORAGE_ID, previous + this.toTextOutput());
        }
        localStorage.removeItem(CURRENT_ROUND_STORAGE_ID);
    }
    saveAsActive() {
        console.log("saving active round")
        localStorage.setItem(CURRENT_ROUND_STORAGE_ID, this.toTextOutput());
    }
    delete() {
        showDialog(deletionFailsafe);
        let self = this;
        deleteFailsafeButton.onclick = function () {
            if (deletionFailsafeInput.value == "DELETE") {
                let previous = localStorage.getItem(PREVIOUS_ROUNDS_STORAGE_ID);
                let thisRound = self.toTextOutput();
                let newHistory = previous.replace(thisRound, "");
                if (newHistory.length < previous.length) {
                    newHistory = newHistory.replace(PREVIOUS_ROUNDS_STORAGE_SEPERATOR + PREVIOUS_ROUNDS_STORAGE_SEPERATOR, PREVIOUS_ROUNDS_STORAGE_SEPERATOR);
                    if (newHistory.endsWith(PREVIOUS_ROUNDS_STORAGE_SEPERATOR)) newHistory = newHistory.slice(0, 0 - PREVIOUS_ROUNDS_STORAGE_SEPERATOR.length);
                    if (newHistory.startsWith(PREVIOUS_ROUNDS_STORAGE_SEPERATOR)) newHistory = newHistory.slice(PREVIOUS_ROUNDS_STORAGE_SEPERATOR.length);


                    if (newHistory.length > 0) localStorage.setItem(PREVIOUS_ROUNDS_STORAGE_ID, newHistory);
                    else localStorage.removeItem(PREVIOUS_ROUNDS_STORAGE_ID);
                    window.location.reload(false);

                } else {
                    alert("Error deleting this round, could not be found.")
                }
            }
        }
    }
    toTextOutput() {
        let outputString = "";
        outputString += this.date.toDateString() + ": " + this.name + '\n';

        let dateColumn = this.timestamps.length > 0;
        if (dateColumn) outputString += "Time, "

        for (let i = 0; i < this.persons.length; i++) {
            if (i != 0) outputString += " ";
            outputString += this.persons[i].name + ",";
        }
        outputString = outputString.substring(0, outputString.length - 1);
        outputString += '\n';

        for (let j = 0; j < this.numberOfTargets; j++) {
            if (dateColumn && this.timestamps[j]) outputString += timeString(this.timestamps[j]) + ", ";
            if (dateColumn && !this.timestamps[j]) outputString += "null, ";
            for (let i = 0; i < this.persons.length; i++) {
                if (i != 0) outputString += " ";
                outputString += this.persons[i].pointsArray[j] + ",";
            }
            //wenn kein beistrich am ende, interpretiert zb excel 1,2,0 als datum 01.02.2000
            outputString = outputString.substring(0, outputString.length - 1);
            outputString += '\n';
        }
        outputString = outputString.substring(0, outputString.length - 1);
        return outputString;
    }
}

function createRoundFromString(string) {
    let _3dSkillboardImport = convert3dSkillBoard(string);
    if (_3dSkillboardImport) string = _3dSkillboardImport;
    let lines = string.split('\n');
    if (lines.length < 3) return null;
    let date = lines[0].substr(0, lines[0].indexOf(':'));
    let name = lines[0].substring(date.length + 2);

    let columnNames = lines[1].split(',');
    let nameOffset = 0;
    let timeColumn = null;
    for (let i = 0; i < columnNames.length; i++) {
        let columnName = columnNames[i].replace(" ", "");
        if (columnName == "Time") {
            nameOffset++;
            timeColumn = i;
        }
    }
    // let personNames = columnNames.slice(nameOffset);
    let points = [];
    for (let i = 2; i < lines.length; i++) {
        points[i - 2] = lines[i].split(',');
    }
    let persons = [];
    for (let i = nameOffset; i < columnNames.length; i++) {
        let personPoints = [];
        for (let j = 0; j < points.length; j++) {
            if (points[j][i].includes("undefined") || points[j][i].includes("null")) personPoints[j] = null;
            else if (points[j][i].includes("-")) personPoints[j] = "-";
            else personPoints[j] = parseInt(points[j][i]);
        }
        let personName = columnNames[i];
        if (personName.substring(0, 1) == " ") personName = personName.substring(1);
        persons.push(new Person(personName, personPoints, lines.length - 2));
    }
    let timestamps = null;
    if (timeColumn != null) {
        timestamps = [];
        for (let j = 0; j < points.length; j++) {
            if (points[j][timeColumn].includes("null")) {
                timestamps[j] = null;
            } else {
                let time = points[j][timeColumn].replace(" ", "").split(":");
                timestamps[j] = ((new Date(date)).addHours(time[0])).addMinutes(time[1])
            }
        }
    }

    currentRound = new Round((new Date(date)), name, persons, points.length, timestamps);
    if (name == "skippersen-.-") {
        console.log("hi")
    }
    return currentRound;
}

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}
Date.prototype.addMinutes = function (m) {
    this.setTime(this.getTime() + (m * 60 * 1000));
    return this;
}
function timeString(date) {
    let mins = date.getMinutes();
    let hours = date.getHours();
    if (mins < 10) mins = "0" + mins;
    if (hours < 10) hours = "0" + hours;
    return hours + ":" + mins;
}
function msToHoursAndMinutes(ms) {
    var d = new Date(1000 * Math.round(ms / 1000)); // round to nearest second
    function pad(i) { return ('0' + i).slice(-2); }
    return d.getUTCHours() + ':' + pad(d.getUTCMinutes());
}

function convert3dSkillBoard(jsonExport) {
    try {
        // jsonExport = Importinger;
        jsonExport = JSON.parse(jsonExport);
        let output = "";
        let date = (new Date(jsonExport.eventdate)).toDateString();
        let location = jsonExport.place.replace(/\d+/g, '').trim();
        output += date + ": " + location + "\n";
        for (let i = 0; i < jsonExport.players.length; i++) {
            output += jsonExport.players[i].name;
            if (i < jsonExport.players.length - 1) output += ", ";
        }
        output += "\n";
        for (let j = 0; j < jsonExport.target.length; j++) {
            for (let i = 0; i < jsonExport.players.length; i++) {
                if (jsonExport.players[i].eventresult[j].resulttype == "N") {
                    output += jsonExport.players[i].eventresult[j].points;
                } else {
                    output += "-";
                }
                if (i < jsonExport.players.length - 1) output += ", ";
            }
            if (j < jsonExport.target.length - 1) output += "\n";
        }
        return output;
    } catch (error) {
        return false;
    }
}
function importFrom3dSkillboard(string) {
    createRoundFromString(string);
}
