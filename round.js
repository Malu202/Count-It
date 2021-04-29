let roundOverviewBlueprint = document.getElementById("roundOverviewBlueprint");
let historyPage = document.getElementById("history");

class Round {
    constructor(date, name, persons, numberOfTargets) {
        this.date = date;
        this.name = name;
        this.persons = persons;
        this.numberOfTargets = numberOfTargets;
    }


    createOverview() {
        this.overviewElement = roundOverviewBlueprint.cloneNode(true);
        this.overviewElement.classList.remove("blueprint");

        this.overviewElement.getElementsByClassName("roundDate")[0].innerText = this.date.toLocaleDateString();
        this.overviewElement.getElementsByClassName("roundName")[0].innerText = this.name;
        this.overviewElement.getElementsByClassName("roundTotalTargets")[0].innerText = this.numberOfTargets + " Targets";

        //this.overviewElement.getElementsByClassName("roundTotalTime")[0].innerText = "3h 25min";


        this.grid = this.overviewElement.getElementsByClassName("roundGrid")[0];

        for (let i = 0; i < persons.length; i++) {
            let avatar = this.grid.getElementsByClassName("avatar")[0].cloneNode(true);
            let name = this.grid.getElementsByClassName("roundPersonName")[0].cloneNode(true);
            let points = this.grid.getElementsByClassName("roundTotalPoints")[0].cloneNode(true);
            let average = this.grid.getElementsByClassName("roundAveragePoints")[0].cloneNode(true);

            name.innerText = persons[i].name;
            points.innerText = persons[i].totalPoints;
            average.innerText = "Ø" + persons[i].average;
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
    createActiveRoundElements() {
        this.persons.forEach(function (person) { person.addOverview(); });
    }
    refreshDisplayedData() {
        this.persons.forEach(function (person) { person.refreshDisplayedData() });
    }
}