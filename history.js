let importHistoryDialog = document.getElementById("importHistoryDialog");
let cancelImportHistoryButton = document.getElementById("cancelImportHistory");
let importHistoryButton = document.getElementById("importHistoryButton");
let importHistoryTextArea = document.getElementById("importHistoryTextArea");

let historyMenuButton = document.getElementById("historyMenuButton");
let historyMenu = new Menu(historyMenuButton, ["Import History", "Export History", "Delete History"], [
    importHistory,
    exportHistory,
    deleteHistory
]);

function importHistory() {
    showDialog(importHistoryDialog);
}
function exportHistory() {
    copyTextToClipboard(localStorage.getItem(PREVIOUS_ROUNDS_STORAGE_ID));
}
function deleteHistory() {
    showDialog(deletionFailsafe);
    deleteFailsafeButton.onclick = function () {
        if (deletionFailsafeInput.value == "DELETE") {
            localStorage.removeItem(PREVIOUS_ROUNDS_STORAGE_ID);
            window.location.reload(false);
        }
    };
}

cancelImportHistoryButton.addEventListener("click", function () {
    hideDialog(importHistoryDialog);
});
importHistoryButton.addEventListener("click", function () {
    let newHistoryString = importHistoryTextArea.value;
    hideDialog(importHistoryDialog);

    previousRoundsString = localStorage.getItem(PREVIOUS_ROUNDS_STORAGE_ID);
    if (previousRoundsString == null) previousRoundsString = "";
    let previousRounds = previousRoundsString.split(PREVIOUS_ROUNDS_STORAGE_SEPERATOR);
    let newHistory = newHistoryString.split(PREVIOUS_ROUNDS_STORAGE_SEPERATOR);

    for (let i = 0; i < newHistory.length; i++) {
        let possibleNewRound = createRoundFromString(newHistory[i]);
        if (possibleNewRound != null) {
            let alreadyOnDevice = false;
            for (let j = 0; j < previousRounds.length; j++) {
                if (newHistory[i] == previousRounds[j]) {
                    alreadyOnDevice = true;
                    break;
                }
            }
            if (!alreadyOnDevice) {
                if (previousRoundsString.length > 0) previousRoundsString += PREVIOUS_ROUNDS_STORAGE_SEPERATOR;
                previousRoundsString += possibleNewRound.toTextOutput();

            }
        }
    }
    if (previousRoundsString != "") {
        localStorage.setItem(PREVIOUS_ROUNDS_STORAGE_ID, previousRoundsString);
        window.location.reload(false);
    }
})


function showDialog(dialog) {
    dialog.classList.add("mdc-dialog--open");
}
function hideDialog(dialog, dontClear) {
    dialog.classList.remove("mdc-dialog--open");
    if (!dontClear) {
        let inputs = dialog.getElementsByTagName("input");
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = "";
        }
        let textareas = dialog.getElementsByTagName("textarea");
        for (let i = 0; i < textareas.length; i++) {
            textareas[i].value = "";
        }
    }
}