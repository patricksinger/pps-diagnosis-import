// global variables for scope
const Store = require('electron-store');
const settings = new Store({cwd:"./"});

// event handlers
document.getElementById("settings-save-btn").addEventListener("click", settingsSaveHandler);
document.getElementById("settings-exit-btn").addEventListener("click", settingsExitHandler);

function loadSettingsHandler() {
    document.getElementById("option-id-inpt").value = settings.get("OPTION_ID") === undefined ? "" : settings.get("OPTION_ID");
    document.getElementById("main-table-inpt").value = settings.get("MAIN_TABLE") === undefined ? "" : settings.get("MAIN_TABLE");
    document.getElementById("main-pkey-inpt").value = settings.get("MAIN_PK_FIELD") === undefined  ? "" : settings.get("MAIN_PK_FIELD");
    document.getElementById("spc-table-inpt").value = settings.get("SPC_TABLE") === undefined  ? "" : settings.get("SPC_TABLE");
    document.getElementById("spc-pkey-inpt").value = settings.get("SPC_PK_FIELD") === undefined  ? "" : settings.get("SPC_PK_FIELD");
    document.getElementById("open-pps-chck").checked = settings.get("OPEN_PPS_ONLY") === undefined ? "" : settings.get("OPEN_PPS_ONLY");
    document.getElementById("expand-sql-chck").checked = settings.get("EXPAND_SQL_TEXT") === undefined ? "" : settings.get("EXPAND_SQL_TEXT");
}

function settingsSaveHandler() {
    // @TODO check if blank and error

    if (!document.getElementById("option-id-inpt").value || !document.getElementById("main-table-inpt").value || !document.getElementById("main-pkey-inpt").value || !document.getElementById("spc-table-inpt").value || !document.getElementById("spc-pkey-inpt").value) {
        displayMessage("message-center-settings", "All Settings Must Be Entered Prior to Saving");
    } else {
        settings.set("OPTION_ID", document.getElementById("option-id-inpt").value);
        settings.set("MAIN_TABLE", document.getElementById("main-table-inpt").value);
        settings.set("MAIN_PK_FIELD", document.getElementById("main-pkey-inpt").value);
        settings.set("SPC_TABLE", document.getElementById("spc-table-inpt").value);
        settings.set("SPC_PK_FIELD", document.getElementById("spc-pkey-inpt").value);
        settings.set("OPEN_PPS_ONLY", document.getElementById("open-pps-chck").checked);
        settings.set("EXPAND_SQL_TEXT", document.getElementById("expand-sql-chck").checked);
        settingsExitHandler();
    }
}

function settingsExitHandler() {
    const remote = require('electron').remote;
    const window = remote.getCurrentWindow();
    window.close();
}

loadSettingsHandler();