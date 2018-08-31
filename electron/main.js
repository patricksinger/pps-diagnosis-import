const electron = require('electron');
const {app, BrowserWindow} = require('electron');

const {ipcMain} = require('electron');

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({width: 800, height: 600});
	mainWindow.loadFile('index.html');

	mainWindow.webContents.openDevTools();

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
	
}

ipcMain.on('openTargetFile', (event, path) => {
	const {dialog} = require('electron');
	const fs = require('fs');
	dialog.showOpenDialog(function(fileNames) {
		if (fileNames === undefined) {
			console.log('no file selected');
		} else {
			console.log(fileNames[0]);
		}
	});
});

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