// global variables for scope
const Store = require('electron-store');
const settings = new Store({cwd:"./"});

// event handlers
document.getElementById("settings-save-btn").addEventListener("click", settingsSaveHandler);
document.getElementById("settings-exit-btn").addEventListener("click", settingsExitHandler);

function loadSettingsHandler() {
    document.getElementById("option-id-inpt").value = settings.get("OPTION_ID") === undefined ? "" : settings.get("OPTION_ID");
    document.getElementById("main-table-inpt").value = settings.get("MAIN_TABLE") === undefined ? "" : settings.get("MAIN_TABLE");
    document.getElementById("spc-table-inpt").value = settings.get("SPC_TABLE") === undefined  ? "" : settings.get("SPC_TABLE");
}

function settingsSaveHandler() {
    // @TODO check if blank and error

    settings.set("OPTION_ID", document.getElementById("option-id-inpt").value);
    settings.set("MAIN_TABLE", document.getElementById("main-table-inpt").value);
    settings.set("SPC_TABLE", document.getElementById("spc-table-inpt").value);  
    
    settingsExitHandler();
}

function settingsExitHandler() {
    const remote = require('electron').remote;
    const window = remote.getCurrentWindow();
    window.close();
}

loadSettingsHandler();