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
        //this.refreshDisplayedData();
    }
    refreshDisplayedData(skippedTargets, skippedAmount) {
        this.selectButtons();
        this.recalculatePoints(false, skippedTargets, skippedAmount);
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

                let skipped = currentRound.getSkippedTargets();
                self.updateAfterButtonPress(false, skipped.targets, skipped.amount);
                currentRound.setTimestampForTarget(currentTarget, new Date());
                currentRound.saveAsActive();
            });
        });

        this.zeroFab.addEventListener("click", function () {
            self.toggleZeroHitsVisually();

            let skipped = currentRound.getSkippedTargets();
            self.updateAfterButtonPress(false, skipped.targets, skipped.amount);
            currentRound.setTimestampForTarget(currentTarget, new Date());
            currentRound.saveAsActive();
        });
    }
    updateAfterButtonPress(roundFinished, skippedTargets, skippedTargetsAmount) {
        let arrow = null;
        let zone = null;
        [].forEach.call(this.overviewElement.getElementsByClassName("counterFab"), function (fab, i) {
            if (!fab.classList.contains("fabDeselected")) {
                if (i < 3) arrow = i;
                else zone = i - 3;
            }
        });
        let zeroHits = !this.overviewElement.getElementsByClassName("zeroFab")[0].classList.contains("fabDeselected");
        this.skipped = this.pointsArray[currentTarget] == "-";
        let currentPoints = getPointsFromArrowAndZone(arrow, zone, zeroHits, this.skipped);
        this.pointsArray[currentTarget] = currentPoints;
        this.recalculatePoints(roundFinished, skippedTargets, skippedTargetsAmount);
    }
    recalculatePoints(roundFinished, skippedTargets, skippedTargetsAmount) {
        let newPointsString;
        if (skippedTargets[currentTarget] == "-") newPointsString = "-";
        else if (this.pointsArray[currentTarget] != null) newPointsString = "+" + this.pointsArray[currentTarget];
        else newPointsString = "";
        this.overviewElement.getElementsByClassName("newPoints")[0].innerText = newPointsString;

        let totalPoints = 0;
        this.pointsArray.forEach(function (round, i) {
            if (skippedTargets[i] != "-") totalPoints += round;
        })
        this.overviewElement.getElementsByClassName("totalPoints")[0].innerText = totalPoints;


        this.lastNonNullTarget = 0;
        for (let i = 0; i < this.pointsArray.length; i++) {
            if (this.pointsArray[i] != null) this.lastNonNullTarget = i;
        }

        let average = totalPoints / (this.lastNonNullTarget + 1 - skippedTargetsAmount);
        if (roundFinished) average = totalPoints / (this.numberOfTargets - skippedTargetsAmount);
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