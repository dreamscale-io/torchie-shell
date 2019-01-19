import React, {Component} from "react";
// import { RendererEventFactory } from "../RendererEventFactory";
import {
  Button,
  Divider,
  Header,
  Image,
  Grid,
  Segment, Input
} from "semantic-ui-react";
import {RendererEventFactory} from "../RendererEventFactory";

const electron = window.require('electron');
const desktopCapturer = electron.desktopCapturer;
const electronScreen = electron.screen;
const shell = electron.shell;

const {remote} = window.require("electron");

const electronLog = remote.require("electron-log");


const fs = window.require('fs');
const os = window.require('os');
const path = window.require('path');
//
// this component is the tab panel wrapper for the console content
//
export default class TroubleshootSessionNew extends Component {
  constructor(props) {
    super(props);

    this.state = {
      screenPath: "./assets/images/screenshot.png"
    };

    this.events = {
      prepareForScreenShot: RendererEventFactory.createEvent(
        RendererEventFactory.Events.PREPARE_FOR_SCREENSHOT,
        this
      ),
      readyForScreenShot: RendererEventFactory.createEvent(
        RendererEventFactory.Events.READY_FOR_SCREENSHOT,
        this,
        (event, arg) => this.onReadyForScreenShot(event, arg)
      ),
      screenShotComplete: RendererEventFactory.createEvent(
        RendererEventFactory.Events.SCREENSHOT_COMPLETE,
        this
      ),
      screenReadyForDisplay: RendererEventFactory.createEvent(
        RendererEventFactory.Events.SCREENSHOT_READY_FOR_DISPLAY,
        this,
        (event, arg) => this.onScreenShotReadyForDisplay(event, arg)
      ),
    };
  }

  //so the thing we want to do, is everytime the console opens, before it automatically opens,
  //there's an async call made to capture a screenshot, and write it to .flow/latest_capture.png

  //then the torchie app here, should display whatever is in latest screen
  //the content of latest screen should be refreshed whenever the troubleshooting window is re-rendered
  //if no SS is available, will be black, hopefully there will be a SS in the directory

  //these files are only sent to the server if "start troubleshooting is pressed"

  //opening the expanded window... should open the SS in a shell

  //so I can probably put this code in the console window itself, and make a SS helper object
  //that I can import?  I'll refactor this out later, first just make it work

  // then want to make it so clicking "start troubleshooting" sets an alarm on the server that starts a counter

  onScreenShotReadyForDisplay = (event, screenPath) => {
    electronLog.info("ready for display:" + screenPath);

    this.setState({
      screenPath : "file://"+screenPath
    });

  };

  onReadyForScreenShot = (event, arg) => {
    console.log("ready for ss");
    electronLog.info("ready for ss:" + arg);

    this.takeScreenShot(arg);

  };

  onClickStartTroubleshooting = () => {
    console.log("on click start troubleshooting");

    this.props.onStartTroubleshooting("pass in [what's the problem] input contents");
  };

  onClickScreenshot = () => {
    console.log("screenshot clicked on");

    this.events.prepareForScreenShot.dispatch(0, true);
  };

  takeScreenShot = (screenPath) => {
    let thumbSize = this.determineScreenShotSize();
    let options = {types: ['screen'], thumbnailSize: thumbSize};

    desktopCapturer.getSources(options, (error, sources) => {
      if (error) return console.log(error.message);

      sources.forEach((source) => {

        console.log("Saved!");

        console.log("Saved! : " + source.name);
        if (source.name === 'Entire screen' || source.name === 'Screen 1') {

          //const screenPath = path.join(os.tmpdir(), 'screenshot.png');

          fs.writeFile(screenPath, source.thumbnail.toPNG(), (err) => {
            if (err) return console.log(err.message);

            //shell.openExternal('file://' + screenPath);


            electronLog.info("saved");
            this.events.screenShotComplete.dispatch(screenPath, true);

            console.log("Saved to " + screenPath);
          })
        }
      })
    });
  };

  determineScreenShotSize = () => {
    const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
    const maxDimension = Math.max(screenSize.width, screenSize.height);

    return {
      width: maxDimension * window.devicePixelRatio,
      height: maxDimension * window.devicePixelRatio
    }
  };






  /// renders the default troubleshoot component in the console view
  render() {
    return (
      <div id="component" className="content">
        <Divider hidden fitted clearing/>
        <Grid textAlign="center" verticalAlign="middle" inverted>
          <Grid.Column width={10} className="rootLayout">
            <Segment className="troubleshoot-start" inverted>
                    <Segment attached basic inverted>
                      Let's solve a problem!  Take a screenshot and describe the situation below.
                      Once you start the session, a timer will begin on the next screen.
                      Look for clues to collect in your scrapbook, and get help from your team!
                    </Segment>

                    <Segment className="add-problem" attached basic inverted>
                    <Input
                      id="problemStatement"
                      className="intentionText"
                      fluid
                      inverted
                      placeholder="What's the problem?"
                    />
                    </Segment>
                    <Button onClick={this.onClickStartTroubleshooting}
                            size="big"
                            color="red"
                            animated="fade"
                            attached="bottom"
                    >
                      <Button.Content visible>
                        Start Troubleshooting...
                      </Button.Content>
                      <Button.Content hidden>
                        Go!
                      </Button.Content>
                    </Button>
            </Segment>
          </Grid.Column>
          <Grid.Column width={6} className="rootLayout screenshot">
            <Segment inverted>
              <Image
                fluid
                className="screenshot"
                label={{
                  as: "a",
                  color: "red",
                  corner: "right",
                  icon: "external"
                }}
                src={this.state.screenPath}
                onClick={this.onClickScreenshot}
              />
            </Segment>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}
