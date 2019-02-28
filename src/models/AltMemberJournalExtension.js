import {DataModel} from "./DataModel";
import moment from "moment";

const {remote} = window.require("electron"),
  RecentJournalDto = remote.require("./dto/RecentJournalDto"),
  JournalEntryDto = remote.require("./dto/JournalEntryDto"),
  RecentTasksSummaryDto = remote.require("./dto/RecentTasksSummaryDto");


export class AltMemberJournalExtension extends DataModel {
  constructor(scope) {
    super(scope);

    this.allJournalItems = [];
    this.allIntentions = [];
    this.activeSize = 0;

    this.activeJournalItem = null;
    this.activeIndex = 0;
    this.activeFlame = 0;

    this.recentProjects = [];
    this.recentTasksByProjectId = [];
    this.recentEntry = {};

    this.isInitialized = false;

  }

  /**
   * Loads the most recent Journal with X number of entries,
   * which should ultimately be a configurable setting
   * but hardcoded on the server for now
   */

  loadDefaultJournal = () => {
    console.log("JournalModel - Request - loadDefaultJournal");
    let remoteUrn = "/journal";
    let loadRequestType = DataModel.RequestTypes.GET;

    this.remoteFetch(null, remoteUrn, loadRequestType, RecentJournalDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onLoadDefaultJournalCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      });
  };

  /**
   * Reset the active selected item to the last item in the journal
   */
  resetActiveToLastJournalItem = () => {
    if (this.allJournalItems.length > 0) {
      let lastItem = this.allJournalItems[this.allJournalItems.length - 1];

      this.activeJournalItem = lastItem;
      this.activeIndex = lastItem.index;
      this.activeFlame = lastItem.flameRating;
    } else {
      this.activeIndex = 0;
      this.activeJournalItem = null;
    }

  };

  /**
   * Set the active selected item to a specific item in the journal
   * @param journalItem
   */
  setActiveJournalItem = (journalItem) => {
    this.activeIndex = journalItem.index;
    this.activeJournalItem = journalItem;
    this.activeFlame = journalItem;

  };


  //////////// REMOTE CALLBACK HANDLERS  ////////////

  onLoadDefaultJournalCb = (defaultJournal, err) => {
    console.log("JournalModel : onLoadDefaultJournalCb");
    if (err) {
      console.log("error:" + err);
    } else {
      this.initFromDefaultJournal(defaultJournal);
    }
    this.isInitialized = true;

  };

  initFromDefaultJournal = (defaultJournal) => {
    console.log("JournalModel : initFromDefaultJournal");

    var journalItems = this.createJournalItems(defaultJournal.recentIntentions);
    let recentIntentionKeys = this.extractRecentIntentionKeys(defaultJournal.recentIntentions);

    let activeJournalItem = null;
    let activeIndex = 0;

    if (journalItems.length > 0) {
      activeJournalItem = journalItems[journalItems.length - 1];
      activeIndex = activeJournalItem.index;
    }

    this.allJournalItems = journalItems;
    this.activeJournalItem = activeJournalItem;
    this.activeIndex = activeIndex;

    this.recentProjects = defaultJournal.recentProjects;
    this.recentTasksByProjectId = defaultJournal.recentTasksByProjectId;
    this.recentEntry = recentIntentionKeys;

    this.allIntentions = defaultJournal.recentIntentions;
    this.activeSize = defaultJournal.recentIntentions.length;

    console.log("JournalModel : Loaded " + this.activeSize + " journal items!");

  };

  extractRecentIntentionKeys = (allIntentions) => {
    let latestKeys = {};

    if (allIntentions.length > 0) {
      let latestIntention = allIntentions[allIntentions.length - 1];

      latestKeys = {
        projectId: latestIntention.projectId,
        taskId: latestIntention.taskId,
        description: latestIntention.description
      };
    }
    return latestKeys;
  };

  createJournalItems = (allIntentions) => {
    let journalItems = [];

    for (var i in allIntentions) {
      journalItems[i] = this.createJournalItem(i, allIntentions[i]);
    }

    return journalItems;
  };

  createJournalItem = (index, intention) => {
    let d = intention.position;
    let dateObj = new Date(d[0], d[1] - 1, d[2], d[3], d[4], d[5]);

    return {
      index: index,
      id: intention.id,
      flameRating: intention.flameRating,
      projectName: intention.projectName,
      taskName: intention.taskName,
      taskSummary: intention.taskSummary,
      description: intention.description,
      finishStatus: intention.finishStatus,
      position: moment(dateObj).format("ddd, MMM Do 'YY, h:mm a"),
      rawDate: dateObj
    };
  };


}