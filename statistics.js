let colorCycle = ['Red', 'Blue', 'Green', 'Purple', 'Orange', 'Yellow'];

let statisticsButton = document.getElementById("statisticsButton");
let canvas = document.getElementById("statisticsCanvas");
let ctx = canvas.getContext("2d");

let statisticSettingRound = document.getElementById("statisticSettingRound");
let statisticSettingValue = document.getElementById("statisticSettingValue");

statisticsButton.addEventListener("click", loadStatistics);

function loadStatistics() {
    fillHistoryDropdown();
    drawStatistic();
}

function fillHistoryDropdown() {
    statisticSettingRound.innerText = ""
    for (let i = 0; i < previousRounds.length; i++) {
        let option = document.createElement("option");
        option.innerText = previousRounds[i].date.toLocaleDateString() + ": " + previousRounds[i].name;
        statisticSettingRound.appendChild(option);
    }
    let uniqueParcours = getUniqueParcours(previousRounds);
    for (let i = 0; i < uniqueParcours.length; i++) {
        let option = document.createElement("option");
        option.innerText = uniqueParcours[i];
        option.value = uniqueParcours[i];
        statisticSettingRound.appendChild(option);
    }
    let option = document.createElement("option");
    option.innerText = "All";
    option.value = "All";
    statisticSettingRound.appendChild(option);
}
statisticSettingRound.addEventListener("change", drawStatistic);
statisticSettingValue.addEventListener("change", drawStatistic);


let myChart;
function drawStatistic() {
    let roundIndex = statisticSettingRound.selectedIndex;
    let valueIndex = statisticSettingValue.selectedIndex;
    let plottedValue = statisticSettingValue.value;
    let roundValue = statisticSettingRound.value;
    let round;
    if (roundValue == "All") round = mergeAllRoundsWithName(null);
    else if (roundIndex >= previousRounds.length) round = mergeAllRoundsWithName(statisticSettingRound.value);
    else {
        round = previousRounds[roundIndex];
        for (let i = 0; i < round.persons.length; i++) {
            round.persons[i].averages = [round.persons[i].average];
        }
    };
    let personDatasets = [];

    for (let i = round.persons.length - 1; i >= 0; i--) {
        let plottedData;
        if (plottedValue == "totalPoints") plottedData = pointsArrayToTotalArray(round.persons[i].pointsArray);
        else if (plottedValue == "averages") plottedData = removeZeros(round.persons[i].averages);

        personDatasets.push({
            data: plottedData,
            label: round.persons[i].name,
            borderColor: colorCycle[i % colorCycle.length],
            backgroundColor: colorCycle[i % colorCycle.length],
            spanGaps: true
        });
    }
    let max = 0;
    for (let i = 0; i < personDatasets.length; i++) {
        if (personDatasets[i].data.length > max) max = personDatasets[i].data.length;
    }
    let targets = [];
    for (let i = 1; i <= max; i++) {
        targets.push(i);
    }

    if (myChart == null) {

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: targets,
                datasets: personDatasets
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } else {
        myChart.data.labels = targets;
        myChart.data.datasets = personDatasets;
        myChart.update();
    }
}



function pointsArrayToTotalArray(points) {
    let totalArray
    if (!isNaN(points[0])) totalArray = [points[0]];
    else totalArray = [0]
    for (let i = 1; i < points.length; i++) {
        let addedValue = points[i];
        if (isNaN(addedValue)) addedValue = 0;
        totalArray[i] = addedValue + totalArray[i - 1];
    }
    return totalArray;
}
function getUniqueParcours(previousRounds) {
    let uniqueParcours = [];
    for (let i = 0; i < previousRounds.length; i++) {
        if (!uniqueParcours.includes(previousRounds[i].name)) uniqueParcours.push(previousRounds[i].name);
    }
    uniqueParcours.sort();
    return uniqueParcours;
}
function mergeAllRoundsWithName(name) {
    let mergedRound = { persons: [] };
    let targetIndex = 0;
    let roundIndex = 0;
    for (let i = previousRounds.length - 1; i >= 0; i--) {
        if (previousRounds[i].name == name || name == null) {
            for (let j = 0; j < previousRounds[i].persons.length; j++) {
                let personAlreadyAdded = false;
                for (let l = 0; l < mergedRound.persons.length; l++) {
                    if (previousRounds[i].persons[j].name == mergedRound.persons[l].name) personAlreadyAdded = true;
                }
                if (!personAlreadyAdded) mergedRound.persons.push({ name: previousRounds[i].persons[j].name, pointsArray: [], averages: [] });
                let personIndex = null;
                for (let m = 0; m < mergedRound.persons.length; m++) {
                    if (mergedRound.persons[m].name == previousRounds[i].persons[j].name) personIndex = m;
                }

                for (let k = 0; k < previousRounds[i].persons[j].pointsArray.length; k++) {
                    mergedRound.persons[personIndex].pointsArray[targetIndex + k] = previousRounds[i].persons[j].pointsArray[k];
                }
                mergedRound.persons[personIndex].averages[roundIndex] = (previousRounds[i].persons[j].average);
            }
            targetIndex += previousRounds[i].numberOfTargets;
            roundIndex++;
        }
    }
    mergedRound.numberOfTargets = targetIndex;
    return mergedRound;
}

function removeZeros(array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] == 0) array[i] = null;
    }
    return array;
}