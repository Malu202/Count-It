let menuBlueprint = document.getElementById("menuBlueprint");

class Menu {
    constructor(triggerButton, entries, clickEvents) {
        this.domElement = menuBlueprint.cloneNode(true);
        this.domElement.id = null;
        this.domElement.classList.remove("blueprint");
        this.domElement.classList.add("displayNone");

        let entry = this.domElement.firstElementChild.firstElementChild.cloneNode(true);
        let divider = this.domElement.firstElementChild.children[1].cloneNode(true);

        this.domElement.firstElementChild.removeChild(this.domElement.firstElementChild.firstElementChild);
        this.domElement.firstElementChild.removeChild(this.domElement.firstElementChild.firstElementChild);

        let self = this;
        for (let i = 0; i < entries.length; i++) {
            let newNode = entry.cloneNode(true);
            newNode.children[1].innerText = entries[i];
            this.domElement.firstElementChild.appendChild(newNode);

            if (i < entries.length - 1) this.domElement.firstElementChild.appendChild(divider.cloneNode(true));

            if (clickEvents[i] != null) {
                newNode.addEventListener("click", function () {
                    self.hide();
                    deactivateFocusTrap();
                    clickEvents[i]();
                });
            }
        }
        if (triggerButton != null) {
            triggerButton.addEventListener("click", function () {
                self.domElement.classList.remove("displayNone");
                activateFocusTrap(function () {
                    self.domElement.classList.add("displayNone");
                    deactivateFocusTrap();
                }, self.domElement);
            });
            triggerButton.parentElement.classList.add("mdc-menu-surface--anchor");
            triggerButton.parentElement.appendChild(this.domElement);
        }
    }
    hide() {
        this.domElement.classList.add("displayNone");
    }
}

let focusTrapActive = false;
let onFocusTraped = function () { };
let focusTrapedElement = null;

function activateFocusTrap(onFocusTrapClicked, trapedElement) {
    focusTrapActive = true;
    onFocusTraped = onFocusTrapClicked;
    focusTrapedElement = trapedElement;
}
function deactivateFocusTrap() {
    focusTrapActive = false;
}

document.addEventListener("click", function (evt) {
    if (focusTrapActive && !focusTrapedElement.contains(evt.srcElement)) {
        evt.stopPropagation();
        onFocusTraped();
        return false;
    }
}, true);

