const PREVIOUS_ROUNDS_STORAGE_SEPERATOR = ";.-@/*+#";
const PREVIOUS_ROUNDS_STORAGE_ID = "savedRounds";
const CURRENT_ROUND_STORAGE_ID = "savedCurrentRound";

let roundOverviewBlueprint = document.getElementById("roundOverviewBlueprint");
let historyPage = document.getElementById("history");



class Round {
    constructor(date, name, persons, numberOfTargets) {
        this.date = date;
        this.name = name.replace(PREVIOUS_ROUNDS_STORAGE_SEPERATOR, "");
        this.persons = persons;
        this.numberOfTargets = numberOfTargets;
        this.errorBar = document.getElementById("errorBar");
    }


    createOverview() {
        this.overviewElement = roundOverviewBlueprint.cloneNode(true);
        this.overviewElement.classList.remove("blueprint");

        this.overviewElement.getElementsByClassName("roundDate")[0].innerText = this.date.toLocaleDateString();
        this.overviewElement.getElementsByClassName("roundName")[0].innerText = this.name;
        this.overviewElement.getElementsByClassName("roundTotalTargets")[0].innerText = this.numberOfTargets + " Targets";

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
        historyPage.appendChild(this.overviewElement);
        // this.addButtonEvents();
    }
    recalculatePoints(roundFinished) {
        for (let i = this.persons.length - 1; i >= 0; i--) {
            this.persons[i].recalculatePoints(roundFinished);
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
        this.persons.forEach(function (person) { person.refreshDisplayedData() });
        this.earliestMissingTarget = this.getEarliestMissingTarget();
        if (this.earliestMissingTarget < currentTarget) this.showMissingPointsError(this.earliestMissingTarget);
        else this.hideMissingPointsError();

    }
    hideMissingPointsError() {
        this.errorBar.style.display = "none";
    }

    showMissingPointsError(earliestMissingTarget) {
        this.errorBar.innerText = "Missing Points (Target " + (earliestMissingTarget + 1) + ")";
        this.errorBar.style.display = "block";
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
    save() {
        let previous = localStorage.getItem(PREVIOUS_ROUNDS_STORAGE_ID);
        if (previous == null) {
            localStorage.setItem(PREVIOUS_ROUNDS_STORAGE_ID, this.toString());
        } else {
            previous += PREVIOUS_ROUNDS_STORAGE_SEPERATOR;
            localStorage.setItem(PREVIOUS_ROUNDS_STORAGE_ID, previous + this.toString());
        }
        localStorage.removeItem(CURRENT_ROUND_STORAGE_ID);
    }
    saveAsActive() {
        console.log("saving active round")
        localStorage.setItem(CURRENT_ROUND_STORAGE_ID, this.toString());
        let a = 0;
    }
    toString() {
        let outputString = "";
        outputString += this.date.toDateString() + ": " + this.name + '\n';
        for (let i = 0; i < this.persons.length; i++) {
            if (i != 0) outputString += " ";
            outputString += this.persons[i].name + ",";
        }
        outputString = outputString.substring(0, outputString.length - 1);
        outputString += '\n';

        for (let j = 0; j < this.numberOfTargets; j++) {
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
    let lines = string.split('\n');
    let date = lines[0].substr(0, lines[0].indexOf(':'));
    let name = lines[0].substring(date.length + 2);

    let personNames = lines[1].split(',');

    let points = [];
    for (let i = 2; i < lines.length; i++) {
        points.push(lines[i].split(','))
    }
    let persons = [];
    for (let i = 0; i < personNames.length; i++) {
        let personPoints = [];
        for (let j = 0; j < points.length; j++) {
            if (!points[j][i].includes("undefined") && !points[j][i].includes("null")) personPoints.push(parseInt(points[j][i]));
        }
        let personName = personNames[i];
        if (personName.substring(0, 1) == " ") personName = personName.substring(1);
        persons.push(new Person(personName, personPoints, lines.length - 2));
    }

    currentRound = new Round(new Date(date), name, persons, points.length);
    return currentRound;
}