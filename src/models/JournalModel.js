import {DataModel} from "./DataModel";
import moment from "moment";
import {AltMemberJournalExtension} from "./AltMemberJournalExtension";

const {remote} = window.require("electron"),
  RecentJournalDto = remote.require("./dto/RecentJournalDto"),
  JournalEntryDto = remote.require("./dto/JournalEntryDto"),
  RecentTasksSummaryDto = remote.require("./dto/RecentTasksSummaryDto");


export class JournalModel extends DataModel {
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

    this.isAltMemberSelected = false;
    this.altMemberId = null;
    this.altMemberJournalExtension = new AltMemberJournalExtension(scope);
  }

  static get CallbackEvent() {
    return {
      ACTIVE_ITEM_UPDATE: "active-item-update",
      RECENT_TASKS_UPDATE: "recent-tasks-update",
      JOURNAL_HISTORY_UPDATE: "journal-history-update"
    };
  }

  isNeverLoaded = () => {
    return this.isInitialized === false;
  };


  /**
   * Show an alt member's journal
   * @param meId
   * @param memberId
   */
  setMemberSelection = (meId, memberId) => {
    console.log("JournalModel - Request - setMemberSelection");
     if (meId == memberId) {
       console.log("show default journal");
       this.isAltMemberSelected = false;
       this.altMemberId = null;
     } else {
       console.log("show journal for member: "+memberId);
       this.isAltMemberSelected = true;
       this.altMemberId = memberId;
     }

  };

  /**
   * Restore the showing of the default journal
   */
  resetMemberSelection = () => {
     this.isAltMemberSelected = false;
     this.altMemberId = null;
  };

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

    this.notifyListeners(JournalModel.CallbackEvent.ACTIVE_ITEM_UPDATE);
  };

  /**
   * Set the active selected item to a specific item in the journal
   * @param journalItem
   */
  setActiveJournalItem = (journalItem) => {
    this.activeIndex = journalItem.index;
    this.activeJournalItem = journalItem;
    this.activeFlame = journalItem;

    this.notifyListeners(JournalModel.CallbackEvent.ACTIVE_ITEM_UPDATE);
  };

  /**
   * Add a new task reference on the server, so intentions can be added for this task
   */
  addTaskRef = (taskName) => {
    console.log("JournalModel - Request - addTaskRef: "+taskName);
    let remoteUrn = "/journal/taskref";
    let loadRequestType = DataModel.RequestTypes.POST;
    let args = { taskName: taskName };

    this.remoteFetch(args, remoteUrn, loadRequestType, RecentTasksSummaryDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onAddTaskRefCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      });
  };

  /**
   * Add a new Journal Entry to the Journal history
   */

  addJournalEntry = (projectId, taskId, description) => {
    console.log("JournalModel - Request - addTaskRef");

    let remoteUrn = "/journal/intention";
    let loadRequestType = DataModel.RequestTypes.POST;
    let args = { projectId: projectId, taskId: taskId, description: description };

    this.remoteFetch(args, remoteUrn, loadRequestType, JournalEntryDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onAddJournalEntryCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      });
  };

  /**
   * Update the finish status of an existing intention
   */

  finishIntention = (intentionId, finishStatus) => {
    console.log("JournalModel - Request - finishIntention");

    let remoteUrn = "/journal/intention/"+intentionId+ "/transition/finish";
    let loadRequestType = DataModel.RequestTypes.POST;
    let args = { finishStatus: finishStatus };

    this.remoteFetch(args, remoteUrn, loadRequestType, JournalEntryDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onFinishJournalEntryCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      });

  };


  /**
   * Update the finish status of an existing intention
   */

  updateFlameRating = (journalItem, flameRating) => {
    console.log("JournalModel - Request - updateFlameRating");

    let remoteUrn = "/journal/intention/"+journalItem.id+ "/transition/flame";
    let loadRequestType = DataModel.RequestTypes.POST;
    let args = { flameRating: flameRating };

    journalItem.flameRating = flameRating;

    this.remoteFetch(args, remoteUrn, loadRequestType, JournalEntryDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onUpdateFlameRatingCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      });

  };

  /**
   * Refresh recent task references for the journal drop down
   */
  refreshRecentTaskReferences = () => {
    console.log("JournalModel - Request - refreshTaskReferences");

    let remoteUrn = "/journal/taskref/recent";
    let loadRequestType = DataModel.RequestTypes.GET;

    this.remoteFetch(null, remoteUrn, loadRequestType, RecentTasksSummaryDto,
      (dtoResults, err) => {
        setTimeout(() => {
          this.onRefreshRecentTaskRefsCb(dtoResults, err);
        }, DataModel.activeWaitDelay);
      });
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

    this.notifyListeners(JournalModel.CallbackEvent.RECENT_TASKS_UPDATE);
    this.notifyListeners(JournalModel.CallbackEvent.JOURNAL_HISTORY_UPDATE);
  };

  onAddTaskRefCb = (recentTasksSummary, err) => {
    console.log("JournalModel : onAddTaskRefCb");
    if (err) {
      console.log("error:" + err);
    } else {

      let activeTask = recentTasksSummary.activeTask;
      if (activeTask) {

        this.recentEntry = {
          projectId: activeTask.projectId,
          taskId: activeTask.id,
          description: activeTask.summary
        };

        this.recentTasksByProjectId = recentTasksSummary.recentTasksByProjectId;
      }
    }
    this.notifyListeners(JournalModel.CallbackEvent.RECENT_TASKS_UPDATE);

  };

  onRefreshRecentTaskRefsCb = (recentTasksSummary, err) => {
    console.log("JournalModel : onRefreshRecentTaskRefsCb");
    if (err) {
      console.log("error:" + err);
    } else {
      this.recentTasksByProjectId = recentTasksSummary.recentTasksByProjectId;

    }
    this.notifyListeners(JournalModel.CallbackEvent.RECENT_TASKS_UPDATE);
  };

  onAddJournalEntryCb = (savedEntry, err) => {
    console.log("JournalModel : onAddJournalEntryCb");
    if (err) {
      console.log("error:" + err);
    } else {

      let recentEntry = {
        projectId: savedEntry.projectId,
        taskId: savedEntry.taskId,
        description: savedEntry.description
      };

      let journalItem = this.createJournalItem(this.allJournalItems.length, savedEntry);

      this.updateFinishStatusOfLastJournalItem();

      this.allJournalItems = [...this.allJournalItems, journalItem];
      this.activeSize = this.allJournalItems.length;
      this.recentEntry = recentEntry;

      this.activeIndex = journalItem.index;
      this.activeJournalItem = journalItem;
      this.activeFlame = journalItem;

      this.notifyListeners(JournalModel.CallbackEvent.JOURNAL_HISTORY_UPDATE);

      this.refreshRecentTaskReferences();
    }
  };

  onFinishJournalEntryCb = (savedEntry, err) => {
    console.log("JournalModel : onFinishJournalEntryCb");
    if (err) {
      console.log("error:" + err);
    }
  };

  onUpdateFlameRatingCb = (savedEntry, err) => {
    console.log("JournalModel : onUpdateFlameRatingCb");
    if (err) {
      console.log("error:" + err);
    }
  };


  updateFinishStatusOfLastJournalItem = () => {
    //this is to be consistent with the server, which auto-updates the last item status

    if (this.allJournalItems.length > 0) {
      let lastItem = this.allJournalItems[this.allJournalItems.length - 1];

      if (!lastItem.finishStatus) {
        lastItem.finishStatus = "done";
      }
    }
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