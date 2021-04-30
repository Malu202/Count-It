class Person {
    constructor(name, points, numberOfTargets) {
        this.name = name;
        this.numberOfTargets = numberOfTargets;
        this.createOverview(points);
    }
    createOverview(points) {
        this.pointsArray = [];
        if (points != null) this.pointsArray = points;

        this.overviewElement = personCounterBlueprint.cloneNode(true);
        this.overviewElement.classList.remove("blueprint");
        this.overviewElement.getElementsByClassName("name")[0].innerText = this.name;

        this.addButtonEvents();
        this.refreshDisplayedData();
    }
    refreshDisplayedData() {
        this.selectButtons();
        this.recalculatePoints();
    }
    selectButtons() {
        let currentArrow = null;
        let currentZone = null;
        if (!isNaN(this.pointsArray[currentTarget])) {
            let currentArrowAndZone = getArrowAndZoneFromPoints(this.pointsArray[currentTarget]);
            currentArrow = currentArrowAndZone.arrow;
            currentZone = currentArrowAndZone.zone;
        }
        for (let i = 0; i < 6; i++) {
            this.overviewElement.getElementsByClassName("counterFab")[i].classList.add("fabDeselected");
        }

        if (currentArrow != null) this.overviewElement.getElementsByClassName("counterFab")[currentArrow].classList.remove("fabDeselected");
        if (currentZone != null) this.overviewElement.getElementsByClassName("counterFab")[currentZone + 3].classList.remove("fabDeselected");

    }
    addButtonEvents() {
        let self = this;
        [].forEach.call(this.overviewElement.getElementsByClassName("counterFab"), function (fab, i) {
            fab.addEventListener("click", function () {
                fab.classList.toggle("fabDeselected");
                let row = Math.floor(i / 3);
                for (let j = row * 3; j < (row + 1) * 3; j++) {
                    if (j != i) self.overviewElement.getElementsByClassName("counterFab")[j].classList.add("fabDeselected");
                }

                self.recalculatePoints();
            });
        });
    }
    recalculatePoints() {
        let arrow = null;
        let zone = null;
        [].forEach.call(this.overviewElement.getElementsByClassName("counterFab"), function (fab, i) {
            if (!fab.classList.contains("fabDeselected")) {
                if (i < 3) arrow = i;
                else zone = i - 3;
            }
        });
        let currentPoints = getPointsFromArrowAndZone(arrow, zone);
        this.pointsArray[currentTarget] = currentPoints;
        this.overviewElement.getElementsByClassName("newPoints")[0].innerText = "+" + this.pointsArray[currentTarget];

        let totalPoints = 0;
        this.pointsArray.forEach(function (round) { totalPoints += round; })
        this.overviewElement.getElementsByClassName("totalPoints")[0].innerText = totalPoints;


        let lastNonZeroTarget = 0;
        for (let i = 0; i < this.pointsArray.length; i++) {
            if (this.pointsArray[i] != 0) lastNonZeroTarget = i;
        }
        let average = totalPoints / (lastNonZeroTarget + 1);
        this.overviewElement.getElementsByClassName("averagePoints")[0].innerText = round(average, 2);


        this.totalPoints = totalPoints;
        this.average = average;
    }
    addOverview() {
        countingPage.insertBefore(this.overviewElement, countingPage.firstChild);
    }
    removeOverview() {
        countingPage.removeChild(this.overviewElement);
    }
}