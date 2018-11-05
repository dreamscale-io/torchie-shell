import React, { Component } from "react";
import TimeScrubber from "./TimeScrubber";
import TroubleshootPanelNewWTF from "./TroubleshootPanelNewWTF";
import TroubleshootPanelOpenWTF from "./TroubleshootPanelOpenWTF";

const {remote} = window.require("electron");

const electronLog = remote.require("electron-log");

//
// this component is the tab panel wrapper for the console content
//
export default class TroubleshootLayout extends Component {
  constructor(props) {
    super(props);


    this.state = {
        isWTFOpen : false
    };
  }

  log = msg => {
    electronLog.info(`[${this.constructor.name}] ${msg}`);
  };

  /// performs a simple calculation for dynamic height of items, this
  /// is becuase there will be a slight variation in the screen height
  calculateTroubleshootItemsHeight() {
    let heights = {
      rootBorder: 2,
      consoleMenu: 28,
      contentMargin: 8,
      contentPadding: 8,
      timeScrubber: 52,
      journalEntry: 50
    };

    /// subtract the root element's height from total window height that is
    /// half of the clients screen height
    return (
      window.innerHeight -
      heights.rootBorder -
      heights.consoleMenu -
      heights.contentMargin -
      heights.contentPadding -
      heights.timeScrubber -
      heights.journalEntry
    );
  }

  onChangeScrubPosition = (selectedIndex) => {
    this.log("onChangeScrubPosition:" + selectedIndex);
  };

  onStartTroubleshooting = (problemStatement) => {
    this.log("onStartTroubleshooting");
    this.setState({
      isWTFOpen : true
    })
  };

  /// renders the journal layout of the console view
  render() {

    let wtfPanel = null;

    if (this.state.isWTFOpen) {
      wtfPanel = <TroubleshootPanelOpenWTF height={this.calculateTroubleshootItemsHeight()}/>
    } else {
      wtfPanel = <TroubleshootPanelNewWTF
        height={this.calculateTroubleshootItemsHeight()}
        onStartTroubleshooting={this.onStartTroubleshooting}
      />
    }

    return (
      <div id="component" className="troubleshootLayout">
        <div id="wrapper" className="timeScrubber">
          <TimeScrubber onChangeScrubPosition={this.onChangeScrubPosition}  />
        </div>
        <div id="wrapper" className="troubleshootPanelDefault">
          {wtfPanel}
        </div>
      </div>
    );
  }
}
