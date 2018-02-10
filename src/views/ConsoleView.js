import React, { Component } from "react";
import { RendererEventFactory } from "../RendererEventFactory";
import ConsoleLayout from "../components/ConsoleLayout";

const fs = window.require('fs');
const os = window.require('os');
const path = window.require('path');

const { remote, desktopCapturer, screen } = window.require("electron"),
  log = remote.require("electron-log");

const screenshotName = 'metaos-screenshot.png';
//
// This View will contain logic to inject the various tabs of the
// console into the view. It will also manage the states of these
// views in an array.
//
export default class ConsoleView extends Component {
  /// sets up the event to listen for if the window is shown or hiden.
  /// Activates animation according
  constructor(props) {
    super(props);
    this.screenshotPath = "";
    this.events = {
      load: RendererEventFactory.createEvent(
        RendererEventFactory.Events.WINDOW_CONSOLE_SHOW_HIDE,
        this,
        this.onLoadCb
      ),
      screenshot: new RendererEvent(
        RendererEventFactory.Events.SCREENSHOT,
        this,
        () => {
          this.takeScreenshot();
        }
      )
    };
  }

  onLoadCb(event, arg) {
    log.info("[ConsoleView] event -> WINDOW_CONSOLE_SHOW_HIDE : " + arg);
    let root = document.getElementById("root");
    if (arg === 0) {
      this.setTransparency(root, 0);
      this.animateShow(root, 20, 14, 0);
    } else {
      this.setTransparency(root, 0.96);
      this.animateHide(root, 20, 14, 0.96);
    }
  }

  /// animates the window being shown
  /// @param {dom} the dom element that is the root of the document
  /// @param {integer} the amount to increment the animation by
  /// @param {integer} the amount of time to step the animation by
  /// @param {float} a float value of the current opacity. (circular ref.)
  animateShow(root, i, t, o) {
    setTimeout(() => {
      if (o > 0 && o < 0.16) {
        o = Math.round((o + i * 0.001) * 100) / 100;
      } else if (o >= 0.16 && o < 0.5) {
        o = Math.round((o + i * 0.002) * 100) / 100;
      } else {
        o = Math.round((o + i * 0.004) * 100) / 100;
      }
      this.setTransparency(root, o);
      if (o < 0.96) {
        this.animateShow(root, i, t, o);
      } else {
        this.setTransparency(root, 0.96);
      }
    }, t);
  }

  /// animates the window being hidden
  /// @param {dom} the dom element that is the root of the document
  /// @param {integer} the amount to increment the animation by
  /// @param {integer} the amount of time to step the animation by
  /// @param {float} a float value of the current opacity. (circular ref.)
  animateHide(root, i, t, o) {
    setTimeout(() => {
      if (o > 0.6 && o < 0.96) {
        o = Math.round((o - i * 0.001) * 100) / 100;
      } else if (o > 0.44 && o <= 0.6) {
        o = Math.round((o - i * 0.002) * 100) / 100;
      } else {
        o = Math.round((o - i * 0.004) * 100) / 100;
      }
      this.setTransparency(root, o);
      if (o > 0) {
        this.animateHide(root, i, t, o);
      } else {
        this.setTransparency(root, 0);
      }
    }, t);
  }

  /// sets the transparency of a dom object
  /// @param {dom} the dom object to apply this to
  /// @param {value} the amount to set the trans. to
  setTransparency(obj, value) {
    obj.style.background = "rgba(0, 0, 0, " + value + ")";
    obj.style.opacity = value + "";
  }

  /// renders the component in the view
  render() {
    return (
      <div id="wrapper" className="console">
        <ConsoleLayout />
      </div>
    );
  }

  takeScreenshot() {
    let options = {
      types: ['screen'],
      thumbnailSize: this._getScreenshotDimensions()
    };
    desktopCapturer.getSources(options, (error, sources) => {
      if (error) {
        return console.log(error.message);
      }
      sources.forEach(source => {
        if (source.name.toLowerCase() === 'entire screen' || source.name === 'Screen 1') {
          if (this.screenshotPath === '') {
            const tmpdir = os.tmpdir();
            this.log(`takeScreenshot() - os.tmpdir()="${tmpdir}"`);
            this.log(`takeScreenshot() - screenshotName="${screenshotName}"`);
            this.screenshotPath = path.join(tmpdir, screenshotName);
          }
          fs.writeFile(this.screenshotPath, source.thumbnail.toPng(), error => {
            this.events.consoleShowHide.dispatch();
            if (error) {
              return this.log(`takeScreenshot() - error,message="${error.message}"`);
            }
            this.log(`takeScreenshot() - Saved screenshot to "${this.screenshotPath}"`);
          })
        }
      })
    })

  }

  _getScreenshotDimensions() {
    const screenSize = screen.getPrimaryDisplay().workAreaSize;
    const maxDimension = Math.max(screenSize.width, screenSize.height);
    return {
      width: maxDimension * window.devicePixelRatio,
      height: maxDimension * window.devicePixelRatio
    }
  }
}
