/*
 * Electron Node Required Packages
 */

const { app, BrowserWindow, ipcMain, Tray } = require("electron");
const autoUpdater = require("electron-updater").autoUpdater;
const path = require("path");
const isDev = require("electron-is-dev");
const notifier = require("node-notifier");
const log = require("electron-log");

/*
 * Project Required Packages
 */
const { EventManager } = require("./EventManager");
const WindowManager = require("./WindowManager");
const ViewManagerHelper = require("./ViewManagerHelper");

/*
 * Global Constants
 */
const assetsDirectory = path.join(__dirname, "assets");
const applicationIcon = assetsDirectory + "/icons/icon.ico";
const trayIcon = assetsDirectory + "/icons/icon.png";

/*
 * Global Objects
 */
let tray;

/*
 * Application Events
 */
// TODO move to its own app Class, and call one function to start
// TODO implement https://electron.atom.io/docs/all/#appmakesingleinstancecallback
app.on("ready", onAppReadyCb);
app.on("activate", onAppActivateCb); // macOS
app.on("window-all-closed", onAppWindowAllCloseCb);

/*
 * Event Callback Functions
 */
function onAppReadyCb() {
  initLogger();
  // createTray();
  WindowManager.init();
  EventManager.init();
  WindowManager.createWindowLoading();
  EventManager.test();
  // initAutoUpdate();
}

// FIXME doesn't work, untested
function onAppActivateCb() {}

// FIXME dont think we want to do this, quit done from tray or app menu
function onAppWindowAllCloseCb() {
  if (process.platform !== "darwin") {
    app.quit();
  }
}

// TODO move tray stuff to its own AppTray Class
function onTrayRightClickCb() {}

function onTrayDoubleClickCb() {}

function onTrayClickCb(event) {}

/*
 * Creates the system tray object and icon. Called by onAppReadyCb()
 */
function createTray() {
  tray = new Tray(trayIcon);
  tray.on("right-click", onTrayRightClickCb);
  tray.on("double-click", onTrayDoubleClickCb);
  tray.on("click", onTrayClickCb);
}

/*
 * configures our logging utility on startup
 */
function initLogger() {
  let level = "info";
  if (isDev) {
    level = "debug";
    log.transports.file.file = `${path.join(app.getAppPath() + "/debug.log")}`;
  }
  log.transports.file.level = level;
  log.transports.console.level = level;
}

/*
 * setup auto-update and check for updates. Called from createWindow()
 * see -> https://electron.atom.io/docs/all/#apprelaunchoptions
*/
// TODO move to its own AppUpdater Class
function initAutoUpdate() {
  // skip update if we are in linux or dev mode
  if (isDev) {
    return;
  }
  if (process.platform === "linux") {
    return;
  }

  autoUpdater.autoDownload = false;

  // configure update logging to file
  autoUpdater.log = log;
  autoUpdater.log.transports.file.level = "info";

  autoUpdater.on("checking-for-update", () => {
    autoUpdater.log.info("Checking for update...");
  });
  autoUpdater.on("update-available", info => {
    autoUpdater.log.info("Update available.");
  });
  autoUpdater.on("update-not-available", info => {
    autoUpdater.log.info("Update not available.");
  });
  autoUpdater.on("error", err => {
    autoUpdater.log.error("Error in auto-updater.");
  });
  autoUpdater.on("download-progress", progressObj => {
    let logMsg = "Download speed: " + progressObj.bytesPerSecond;
    logMsg = logMsg + " - Downloaded " + progressObj.percent + "%";
    logMsg =
      logMsg + " (" + progressObj.transferred + "/" + progressObj.total + ")";
    autoUpdater.log.info(logMsg);
  });
  autoUpdater.on("update-downloaded", info => {
    autoUpdater.log.info("Update downloaded");
  });

  // check for updates and notify if we have a new version
  autoUpdater.checkForUpdates();
}
