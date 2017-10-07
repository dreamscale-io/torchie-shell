/*
 * Electron Node Required Packages
 */

const { app, BrowserWindow, ipcMain, Tray } = require('electron');
const autoUpdater = require('electron-updater').autoUpdater;
const path = require('path');
const isDev = require('electron-is-dev');
const notifier = require('node-notifier');
const logger = require('electron-log');

/*
 * Project Required Packages
 */

const WindowManager = require('./WindowManager');
const ViewManagerHelper = require('./ViewManagerHelper');

/*
 * Global Constants
 */

const assetsDirectory = path.join(__dirname, 'assets');
const applicationIcon = assetsDirectory + '/icons/icon.ico';
const trayIcon = assetsDirectory + '/icons/icon.png';

/*
 * Global Objects
 */

let tray = undefined;

/*
 * Application Events
 */

// TODO move to its own App Class, and call one function to start

app.on('ready', onAppReadyCb);
app.on('activate', onAppActivateCb);  //macOS
app.on('window-all-closed', onAppWindowAllCloseCb);

/*
 * Event Callback Functions
 */

function onAppReadyCb() {
  // createTray();
  WindowManager.createWindowLoading();
  // initAutoUpdate();
}

// FIXME doesn't work, untested
function onAppActivateCb() {
  // should show or create a console window
  // createWindow();
}

// FIXME dont think we want to do this, quit done from tray or app menu
function onAppWindowAllCloseCb() {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}

// TODO move tray stuff to its own AppTray Class
function onTrayRightClickCb() {
  // TODO toggle console window
}

function onTrayDoubleClickCb() {
  // TODO toggle console window
}

function onTrayClickCb(event) {
    // TODO toggle console window
}

/*
 * Creates the system tray object and icon. Called by onAppReadyCb()
 */
function createTray() {
  tray = new Tray(trayIcon);
  tray.on('right-click', onTrayRightClickCb);
  tray.on('double-click', onTrayDoubleClickCb);
  tray.on('click', onTrayClickCb);
}

/*
 * setup auto-update and check for updates. Called from createWindow()
*/

// TODO move to its own AppUpdater Class
function initAutoUpdate() {

  // skip update if we are in linux or dev mode
  if (isDev) {
    return;
  }
  if (process.platform === 'linux') {
    return;
  }

  autoUpdater.autoDownload = false;

  // configure update logging to file
  autoUpdater.logger = logger;
  autoUpdater.logger.transports.file.level = 'info';

  autoUpdater.on('checking-for-update', () => {
    autoUpdater.logger.info('Checking for update...');
  })
  autoUpdater.on('update-available', (info) => {
    autoUpdater.logger.info('Update available.');
  })
  autoUpdater.on('update-not-available', (info) => {
    autoUpdater.logger.info('Update not available.');
  })
  autoUpdater.on('error', (err) => {
    autoUpdater.logger.error('Error in auto-updater.');
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let logMsg = "Download speed: " + progressObj.bytesPerSecond;
    logMsg = logMsg + ' - Downloaded ' + progressObj.percent + '%';
    logMsg = logMsg + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    autoUpdater.logger.info(logMsg);
  })
  autoUpdater.on('update-downloaded', (info) => {
    autoUpdater.logger.info('Update downloaded');
  });

  // check for updates and notify if we have a new version
  autoUpdater.checkForUpdates();
}