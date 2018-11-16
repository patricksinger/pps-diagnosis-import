const electron = require('electron');
const { app, BrowserWindow, Menu } = require('electron');
const path = require("path");
const Store = require('electron-store');

app.setPath("userData", path.join(__dirname, "AppData"));
const settings = new Store({cwd:"./"});

const csvParser = require("./csvparser");

// IPC handlers
const {ipcMain} = require('electron');

ipcMain.on("csv-parser-invoke", (event, arg) => {
	try {
		csvParser.parseCSV(arg["sqlText"], arg["csvFileLocation"], arg["xmlFileLocation"],arg["odbcDSN"], arg["odbcUser"], arg["odbcPassword"]);
	} catch (exception) {
		event.sender.send("csv-parser-response", exception);
		return;
	}
	event.sender.send("csv-parser-response", "File Export Complete.");
});

let mainWindow;
let settingsWindow;

function launchWindows() {
	createMainWindow();
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
	settingsWindow = new BrowserWindow({ parent: mainWindow, modal: true, width: 600, height: 600, skipTaskbar : true, resizable: false});
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