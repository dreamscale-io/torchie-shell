import React, { Component } from "react";
import TimeScrubber from "./TimeScrubber";
import TroubleshootSessionNew from "./TroubleshootSessionNew";
import TroubleshootSessionOpen from "./TroubleshootSessionOpen";
import {
  Button,
  Divider,
  Header,
  Image,
  Grid,
  Segment, Input
} from "semantic-ui-react";

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



  onStartTroubleshooting = (problemStatement) => {
    this.log("onStartTroubleshooting");
    this.props.onStartTroubleshooting(problemStatement);

  };

  onStopTroubleshooting = () => {
    this.log("onStopTroubleshooting");
    this.props.onStopTroubleshooting();

  };

  /// renders the journal layout of the console view
  render() {

    let wtfPanel = null;

    if (this.props.isWTFOpen) {
      wtfPanel = <TroubleshootSessionOpen
        height={this.calculateTroubleshootItemsHeight()}
        onStopTroubleshooting={this.onStopTroubleshooting}
      />
    } else {
      wtfPanel = <TroubleshootSessionNew
        height={this.calculateTroubleshootItemsHeight()}
        onStartTroubleshooting={this.onStartTroubleshooting}
      />
    }

    return (
      <div id="component" className="wtf">
        <div id="wrapper" className="problem-description">
        <Header as="h1" attached="top" inverted>
          Troubleshooting Scrapbook
        </Header>
          {wtfPanel}
        </div>
      </div>
    );
  }
}
