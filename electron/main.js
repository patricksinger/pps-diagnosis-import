const electron = require('electron');
const { app, BrowserWindow, Menu } = require('electron');

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({width: 800, height: 600});
	mainWindow.loadFile('howto.html');
	createMenu();

	mainWindow.webContents.openDevTools();

	mainWindow.on('closed', () => {
		mainWindow = null;
	});

}

function createMenu() {
	const menu = Menu.buildFromTemplate([
		{
			label: "Menu",
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
	let settingsWindow = new BrowserWindow({ width: 400, height: 400, alwaysOnTop: true });
	settingsWindow.on("close", function () { settingsWindow = null });
	settingsWindow.loadFile("settings.html");
	settingsWindow.show();
}

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	};
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});

app.on('ready', createWindow);