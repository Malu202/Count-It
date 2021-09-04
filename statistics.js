let colorCycle = ['Red', 'Blue', 'Green', 'Purple', 'Orange', 'Yellow'];

let statisticsButton = document.getElementById("statisticsButton");
let canvas = document.getElementById("statisticsCanvas");
let ctx = canvas.getContext("2d");

let statisticSettingRound = document.getElementById("statisticSettingRound");
let statisticSettingValue = document.getElementById("statisticSettingValue");


statisticsButton.addEventListener("click", loadStatistics);

function loadStatistics() {
    fillHistoryDropdown();
    drawSelectedStatistic();
}

function fillHistoryDropdown() {
    statisticSettingRound.innerText = ""
    for (let i = 0; i < previousRounds.length; i++) {
        let option = document.createElement("option");
        option.innerText = previousRounds[i].date.toLocaleDateString() + ": " + previousRounds[i].name;
        statisticSettingRound.appendChild(option);
    }
}
statisticSettingRound.addEventListener("change", drawSelectedStatistic);
statisticSettingValue.addEventListener("change", drawSelectedStatistic);

function drawSelectedStatistic() {
    let roundIndex = statisticSettingRound.selectedIndex
    drawStatistic(previousRounds[roundIndex]);
}

let myChart;
function drawStatistic(round) {
    let datasets = [];
    for (let i = round.persons.length - 1; i >= 0; i--) {
        datasets.push({
            data: pointsArrayToTotalArray(round.persons[i].pointsArray),
            label: round.persons[i].name,
            borderColor: colorCycle[i % colorCycle.length],
            backgroundColor: colorCycle[i % colorCycle.length]
        });
    }

    let targets = [];
    for (let i = 1; i <= round.numberOfTargets + 1; i++) {
        targets.push(i);
    }

    if (myChart == null) {
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: targets,
                datasets: datasets
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
        myChart.data.datasets = datasets;
        myChart.update();
    }
}



function pointsArrayToTotalArray(points) {
    let totalArray = [points[0]];
    for (let i = 1; i < points.length; i++) {
        totalArray[i] = points[i] + totalArray[i - 1];
    }
    return totalArray;
}