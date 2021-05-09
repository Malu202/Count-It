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

        this.zeroFab = this.overviewElement.getElementsByClassName("zeroFab")[0];


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
        let zeroHits = null;
        if (!isNaN(this.pointsArray[currentTarget])) {
            let currentArrowAndZone = getArrowAndZoneFromPoints(this.pointsArray[currentTarget]);
            currentArrow = currentArrowAndZone.arrow;
            currentZone = currentArrowAndZone.zone;
            zeroHits = currentArrowAndZone.zeroHits;
        }
        let counterFabs = this.overviewElement.getElementsByClassName("counterFab");
        for (let i = 0; i < counterFabs.length; i++) {
            counterFabs[i].classList.add("fabDeselected");
        }

        if (currentArrow != null) counterFabs[currentArrow].classList.remove("fabDeselected");
        if (currentZone != null) counterFabs[currentZone + 3].classList.remove("fabDeselected");
        if (zeroHits == true) this.setZeroHitsVisually(true);
        else this.setZeroHitsVisually(false);
    }
    toggleZeroHitsVisually() {
        let zeroHits = !this.zeroFab.classList.toggle("fabDeselected");
        this.setZeroHitsVisually(zeroHits);
    }
    setZeroHitsVisually(zeroHits) {
        if (zeroHits) this.zeroFab.classList.remove("fabDeselected");
        else this.zeroFab.classList.add("fabDeselected");

        [].forEach.call(this.overviewElement.getElementsByClassName("counterFab"), function (fab, i) {
            if (zeroHits) fab.classList.add("disabled");
            else fab.classList.remove("disabled");;
        });
    }
    addButtonEvents() {
        let self = this;
        [].forEach.call(this.overviewElement.getElementsByClassName("counterFab"), function (fab, i) {
            fab.addEventListener("click", function () {
                if (!self.zeroFab.classList.contains("fabDeselected")) return;
                fab.classList.toggle("fabDeselected");
                let row = Math.floor(i / 3);
                for (let j = row * 3; j < (row + 1) * 3; j++) {
                    if (j != i) self.overviewElement.getElementsByClassName("counterFab")[j].classList.add("fabDeselected");
                }

                self.recalculatePoints();
                currentRound.saveAsActive();
            });
        });

        this.zeroFab.addEventListener("click", function () {
            self.toggleZeroHitsVisually();

            self.recalculatePoints();
            currentRound.saveAsActive();
        });
    }
    recalculatePoints(roundFinished) {
        let arrow = null;
        let zone = null;
        [].forEach.call(this.overviewElement.getElementsByClassName("counterFab"), function (fab, i) {
            if (!fab.classList.contains("fabDeselected")) {
                if (i < 3) arrow = i;
                else zone = i - 3;
            }
        });
        let zeroHits = !this.overviewElement.getElementsByClassName("zeroFab")[0].classList.contains("fabDeselected");
        let currentPoints = getPointsFromArrowAndZone(arrow, zone, zeroHits);
        this.pointsArray[currentTarget] = currentPoints;
        let newPointsString;
        if (currentPoints != null) newPointsString = "+" + this.pointsArray[currentTarget];
        else newPointsString = "";
        this.overviewElement.getElementsByClassName("newPoints")[0].innerText = newPointsString;

        let totalPoints = 0;
        this.pointsArray.forEach(function (round) { totalPoints += round; })
        this.overviewElement.getElementsByClassName("totalPoints")[0].innerText = totalPoints;


        this.lastNonNullTarget = 0;
        for (let i = 0; i < this.pointsArray.length; i++) {
            if (this.pointsArray[i] != null) this.lastNonNullTarget = i;
        }
        let average = totalPoints / (this.lastNonNullTarget + 1);
        if (roundFinished) average = totalPoints / this.numberOfTargets;
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