const electron = require('electron');
const { app, BrowserWindow, Menu } = require('electron');
const path = require("path");
const Store = require('electron-store');

app.setPath("userData", path.join(__dirname, "AppData"));
const settings = new Store({cwd:"./"});

let mainWindow;
let settingsWindow;

function launchWindows() {
	createMainWindow();

	// @TODO check if settings are blank and launch settings window to prompt entry
	// if (!settings.get("OPTION_ID") || !settings.get("MAIN_TABLE") || !settings.get("SPC_TABLE")) {
	// 	createSettingsWindow();
	// }	
}

function createMainWindow() {
	mainWindow = new BrowserWindow({width: 800, height: 800});
	mainWindow.loadFile('howto.html');
	createMenu();

	//mainWindow.webContents.openDevTools();

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

}

function createMenu() {
	const menu = Menu.buildFromTemplate([
		{
			label: "File",
			submenu: [
				{ label: "Settings", click() { createSettingsWindow() }},
				{type:'separator'},
				{ label: "Exit", click() { app.quit(); } }
			]
		}
	]);
	Menu.setApplicationMenu(menu);

}

function createSettingsWindow() {
	settingsWindow = new BrowserWindow({ parent: mainWindow, modal: true, width: 600, height: 400, skipTaskbar : true, resizable: false});
	settingsWindow.on("close", function () { settingsWindow = null });
	settingsWindow.loadFile("settings.html");
	settingsWindow.setMenu(null);
	//settingsWindow.webContents.openDevTools();
	settingsWindow.show();
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	};
});

app.on('activate', () => {
	if (mainWindow === null) {
		createMainWindow();
	}
});

app.on('ready', launchWindows);