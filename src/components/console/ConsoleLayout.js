import React, {Component} from "react";
import ConsoleSidebar from "./ConsoleSidebar";
import ConsoleContent from "./ConsoleContent";
import ConsoleMenu from "./ConsoleMenu";
import CircuitsPanel from "../circuits/CircuitsPanel";
import NotificationsPanel from "../notifications/NotificationsPanel";
import TeamPanel from "../team/TeamPanel";
import SpiritPanel from "../spirit/SpiritPanel";
import {DataModelFactory} from "../../models/DataModelFactory";
import {SpiritModel} from "../../models/SpiritModel";
import {TeamModel} from "../../models/TeamModel";
import {ActiveViewControllerFactory} from "../../controllers/ActiveViewControllerFactory";
import {SidePanelViewController} from "../../controllers/SidePanelViewController";
import {DimensionController} from "../../controllers/DimensionController";

/**
 * this component is the tab panel wrapper for the console content
 * @author ZoeDreams
 */
export default class ConsoleLayout extends Component {
  /**
   * the costructor for the root console layout. This calls other child layouts
   * @param props - the properties of the component to render
   */
  constructor(props) {
    super(props);
    this.name = "[ConsoleLayout]";
    this.state = {
      sidebarPanelVisible: false,
      sidebarPanelWidth: 0,
      sidebarPanelOpacity: 0,
      xpSummary: {},
      totalXP: 0,
      flameRating: 0,
      activePanel: SidePanelViewController.MenuSelection.PROFILE,
      consoleIsCollapsed: 0,
      me: {shortName: "Me", id: "id"},
      teamMembers: [],
      activeTeamMember: {shortName: "Me", id: "id"},
      isMe: true
    };
    this.animationTime = 555;

    // TODO move this stuff into the controller class

    this.sidePanelController = ActiveViewControllerFactory.createViewController(
      ActiveViewControllerFactory.Views.SIDE_PANEL,
      this
    );
    this.teamModel = DataModelFactory.createModel(
      DataModelFactory.Models.MEMBER_STATUS,
      this
    );
    this.teamModel.registerListener(
      "consoleLayout",
      TeamModel.CallbackEvent.MEMBERS_UPDATE,
      this.onTeamModelUpdateCb
    );
    this.teamModel.registerListener(
      "consoleLayout",
      TeamModel.CallbackEvent.ACTIVE_MEMBER_UPDATE,
      this.onActiveMemberUpdateCb
    );
    this.activeCircleModel = DataModelFactory.createModel(
      DataModelFactory.Models.ACTIVE_CIRCLE,
      this
    );

    this.spiritModel = DataModelFactory.createModel(
      DataModelFactory.Models.SPIRIT,
      this
    );
    this.spiritModel.registerListener(
      "consoleLayout",
      SpiritModel.CallbackEvent.XP_UPDATE,
      this.onXPUpdate
    );
    this.spiritModel.registerListener(
      "consoleLayout",
      SpiritModel.CallbackEvent.RESET_FLAME,
      this.onActiveFlameUpdate
    );
    this.spiritModel.registerListener(
      "consoleLayout",
      SpiritModel.CallbackEvent.DIRTY_FLAME_UPDATE,
      this.onActiveFlameUpdate
    );
  }

  /**
   * called right after when the component is finished rendering
   */
  componentDidMount = () => {
    this.sidePanelController.configureContentListener(
      this,
      this.onRefreshActivePerspective
    );
    this.onRefreshActivePerspective();
  };

  /**
   * called right before when the component will unmount
   */
  componentWillUnmount = () => {
    console.log(this.name + " - componentWillUnmount");

    this.teamModel.unregisterAllListeners("consoleLayout");
    this.activeCircleModel.unregisterAllListeners("consoleLayout");
    this.spiritModel.unregisterAllListeners("consoleLayout");

    this.sidePanelController.configureContentListener(this, null);
  };

  /**
   * the event callback handler for when the xp's user changes
   */
  onXPUpdate = () => {
    this.setState({
      torchieOwner: this.spiritModel.getActiveScope().torchieOwner,
      spiritId: this.spiritModel.getActiveScope().spiritId,
      xpSummary: this.spiritModel.getActiveScope().xpSummary,
      activeSpiritLinks: this.spiritModel.getActiveScope().activeSpiritLinks,
      level: this.spiritModel.getActiveScope().level,
      percentXP: this.spiritModel.getActiveScope().percentXP,
      totalXP: this.spiritModel.getActiveScope().totalXP,
      remainingToLevel: this.spiritModel.getActiveScope().remainingToLevel,
      title: this.spiritModel.getActiveScope().title
    });
  };

  /**
   * the event callback handler for when the flame rating changes on the gui
   */
  onActiveFlameUpdate = () => {
    this.setState({
      flameRating: this.spiritModel.getActiveScope().activeFlameRating
    });
  };

  /**
   * the event callback handler for when the TeamModel updates
   */
  onTeamModelUpdateCb = () => {
    this.setState({
      isMe: this.teamModel.isMeActive(),
      me: this.teamModel.me,
      teamMembers: this.teamModel.teamMembers,
      activeTeamMember: this.teamModel.activeTeamMember
    });
  };

  /**
   * callback handler function for when the active memmber model updates
   */
  onActiveMemberUpdateCb = () => {
    console.log(this.name + " - onActiveMemberUpdateCb");
    this.setState({
      isMe: this.teamModel.isMeActive(),
      activeTeamMember: this.teamModel.activeTeamMember
    });
  };

  /**
   * the callback handler for when the flame rating changes
   * @param flameRating - the intensity of the flame to change
   */
  onFlameChangeCb = flameRating => {
    console.log(this.name + " - onFlameChangeCb: " + flameRating);

    this.setState({
      flameRating: flameRating
    });
  };

  /**
   * click the flame button, which either tries to do a +1 or -1
   * @param flameDelta - the amount of the flame to change
   */
  adjustFlameCb = flameDelta => {
    console.log(this.name + " - Flame change: " + flameDelta);

    let flameRating = Number(this.state.flameRating) + flameDelta;
    if (flameRating > 5) {
      flameRating = 5;
    }
    else if (flameRating < -5) {
      flameRating = -5;
    }

    if (this.state.flameRating > 0 && flameDelta < 0) {
      flameRating = 0;
    }

    if (this.state.flameRating < 0 && flameDelta > 0) {
      flameRating = 0;
    }

    console.log(
      this.name +
      " - adjustFlameCb, Old/New Flame rating: " +
      this.state.flameRating +
      "/" +
      flameRating
    );
    this.setState({
      flameRating: flameRating
    });
  };

  /**
   * called when refreshing the active perspective window
   */
  onRefreshActivePerspective() {
    let show = this.sidePanelController.show;
    if (show) {
      this.setState({
        sidebarPanelVisible: true,
        activePanel: this.sidePanelController.activeMenuSelection
      });
      setTimeout(() => {
        this.setState({
          sidebarPanelWidth: "23em",
          sidebarPanelOpacity: 1
        });
      }, 0);
    }
    else {
      this.setState({
        sidebarPanelWidth: 0,
        sidebarPanelOpacity: 0
      });
      setTimeout(() => {
        this.setState({
          sidebarPanelVisible: false,
          activePanel: this.sidePanelController.activeMenuSelection
        });
      }, 420);
    }
  }

  /**
   * store child component for future reloading
   * @param state - the current state of the object
   */
  saveStateSidebarPanelCb = state => {
    this.setState({sidebarPanelState: state});
  };

  /**
   *  load the child components state from this state
   * @returns {*}
   */
  loadStateSidebarPanelCb = () => {
    return this.state.sidebarPanelState;
  };

  /**
   * the name of the users torchie spirit
   * @returns {string}
   */
  getTorchieName = () => {
    let torchieName = "Member";
    if (this.state.activeTeamMember) {
      torchieName = this.state.activeTeamMember.shortName;
    }
    return torchieName;
  };

  /**
   * the spirit panel that gets displayed in the side panel
   * @returns {*}
   */
  getSpiritPanelContent = () => {
    return (
      <SpiritPanel
        me={this.state.me}
        isMe={this.state.isMe}
        torchieOwner={this.getTorchieName()}
        spiritId={this.state.spiritId}
        xpSummary={this.state.xpSummary}
        activeSpiritLinks={this.state.activeSpiritLinks}
        level={this.state.level}
        percentXP={this.state.percentXP}
        remainingToLevel={this.state.remainingToLevel}
        totalXP={this.state.totalXP}
        title={this.state.title}
        flameRating={this.state.flameRating}
        loadStateCb={this.loadStateSidebarPanelCb}
        saveStateCb={this.saveStateSidebarPanelCb}
        width={this.state.sidebarPanelWidth}
        height={DimensionController.getHeightFor(
          DimensionController.Components.CONSOLE_LAYOUT
        )}
        opacity={this.state.sidebarPanelOpacity}
      />
    );
  };

  /**
   * the team panel that gets displayed to the user
   * @returns {*}
   */
  getTeamPanelContent = () => {
    return (
      <TeamPanel
        xpSummary={this.state.xpSummary}
        width={this.state.sidebarPanelWidth}
        opacity={this.state.sidebarPanelOpacity}
        loadStateCb={this.loadStateSidebarPanelCb}
        saveStateCb={this.saveStateSidebarPanelCb}
        me={this.state.me}
        teamMembers={this.state.teamMembers}
        activeTeamMember={this.state.activeTeamMember}
      />
    );
  };

  getCircuitsContent = () => {
    return (
      <CircuitsPanel
        width={this.state.sidebarPanelWidth}
        opacity={this.state.sidebarPanelOpacity}
        loadStateCb={this.loadStateSidebarPanelCb}
        saveStateCb={this.saveStateSidebarPanelCb}
      />
    );
  };

  getNotificationsContent = () => {
    return (
      <NotificationsPanel
        width={this.state.sidebarPanelWidth}
        opacity={this.state.sidebarPanelOpacity}
        loadStateCb={this.loadStateSidebarPanelCb}
        saveStateCb={this.saveStateSidebarPanelCb}
        me={this.state.me}
      />
    );
  };

  /**
   * gets the sidebar panel content
   * @returns {*}
   */
  getSidebarPanelConent = () => {
    return (
      <div
        id="wrapper"
        className="consoleSidebarPanel"
        style={{
          width: this.state.sidebarPanelWidth,
          height: DimensionController.getHeightFor(
            DimensionController.Components.CONSOLE_LAYOUT
          )
        }}
      >
        {this.getActivePanelContent()}
      </div>
    );
  };

  // TODO use boolean to show content for transitions

  /**
   * gets the active panel we should display
   * @returns {*}
   */
  getActivePanelContent = () => {
    switch (this.state.activePanel) {
      case SidePanelViewController.MenuSelection.PROFILE:
        return this.getSpiritPanelContent();
      case SidePanelViewController.MenuSelection.MESSAGES:
        return this.getTeamPanelContent();
      case SidePanelViewController.MenuSelection.CIRCUITS:
        return this.getCircuitsContent();
      case SidePanelViewController.MenuSelection.NOTIFICATIONS:
        return this.getNotificationsContent()
    }
  };

  /**
   * gets the main console content component
   * @returns {*}
   */
  getConsoleContent = () => {
    return (
      <div
        id="wrapper"
        className="consoleContent"
        style={{
          height: DimensionController.getHeightFor(
            DimensionController.Components.CONSOLE_LAYOUT
          )
        }}
      >
        <ConsoleContent
          onFlameChange={this.onFlameChangeCb}
          onAdjustFlame={this.adjustFlameCb}
          animationTime={this.animationTime}
        />
      </div>
    );
  };

  /**
   * gets the sidebar to display in the console
   * @returns {*}
   */
  getConsoleSidebar = () => {
    return (
      <div id="wrapper" className="consoleSidebar">
        <ConsoleSidebar/>
      </div>
    );
  };

  /**
   * gets the console menu that is is rendered at the bottom of the screen
   * @returns {*}
   */
  getConsoleMenu = () => {
    return (
      <div id="wrapper" className="consoleMenu">
        <ConsoleMenu animationTime={this.animationTime}/>
      </div>
    );
  };

  /**
   * renders the root console layout of the console view
   * @returns {*} - the JSX to render
   */
  render() {
    return (
      <div id="component" className="consoleLayout">
        {this.getConsoleSidebar()}
        {this.state.sidebarPanelVisible && this.getSidebarPanelConent()}
        {this.getConsoleContent()}
        {this.getConsoleMenu()}
      </div>
    );
  }
}
