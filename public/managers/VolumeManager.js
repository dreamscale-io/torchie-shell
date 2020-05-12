const log = require("electron-log"),
  Util = require("../Util"),
  EventFactory = require("../events/EventFactory"),
  { EventManager } = require("../events/EventManager"),
  DatabaseFactory = require("../database/DatabaseFactory");

/**
 * this is used to store a database of references to our in memory databases
 * @type {VolumeManager}
 */
module.exports = class VolumeManager {
  /**
   * global static array we store our database volumes in
   * @returns {map}
   * @constructor
   */
  static get Volumes() {
    return VolumeManager.volumes;
  }

  /**
   * builds our volume manager class and volume array
   */
  constructor() {
    VolumeManager.volumes = new Map();
    VolumeManager.initializedVolumes = 0;
    this.name = "[VolumeManager]";
    this.guid = Util.getGuid();
  }

  /**
   * initialize our databases for our system. NOTEL talk manager does not have an init
   * function so it is not counted towards any setup time.
   */
  init() {
    log.info(this.name + " initialize memonic databases");
    VolumeManager.initializedVolumes = 1;
    VolumeManager.createDatabaseVolume(
      DatabaseFactory.Names.TALK
    );
    VolumeManager.createDatabaseVolume(
      DatabaseFactory.Names.JOURNAL
    );
    VolumeManager.createDatabaseVolume(
      DatabaseFactory.Names.CIRCUIT
    );
    VolumeManager.createDatabaseVolume(
      DatabaseFactory.Names.TEAM
    );
    VolumeManager.createDatabaseVolume(
      DatabaseFactory.Names.MEMBER
    );
    VolumeManager.loadDefaultJournalDatabase();
    VolumeManager.loadDefaultCircuitDatabase();
    VolumeManager.loadDefaultTeamDatabase();
    VolumeManager.loadDefaultMemberDatabase();
  }

  /**
   * creates a database inside of a volume that we can manage on the system
   * @param name
   */
  static createDatabaseVolume(name) {
    let db = DatabaseFactory.createDatabase(name);
    VolumeManager.Volumes.set(name, db);
    log.info(
      `[VolumeManager] database volume '${name}' created -> okay`
    );
  }

  /**
   * gets my database volume by name
   * @param name
   * @returns {*}
   */
  getVolumeByName(name) {
    return VolumeManager.Volumes.get(name);
  }

  /**
   * loads our journal database into memory
   */
  static loadDefaultJournalDatabase() {
    global.App.JournalManager.init(() => {
      VolumeManager.handleFinishLoadingVolumes();
    });
  }

  /**
   * loads our circuit database into memory
   */
  static loadDefaultCircuitDatabase() {
    global.App.CircuitManager.init(() => {
      VolumeManager.handleFinishLoadingVolumes();
    });
  }

  /**
   * loads our team database into our memory
   */
  static loadDefaultTeamDatabase() {
    global.App.TeamManager.init(() => {
      VolumeManager.handleFinishLoadingVolumes();
    });
  }

  /**
   * loads our member database into our memory
   */
  static loadDefaultMemberDatabase() {
    global.App.MemberManager.init(() => {
      VolumeManager.handleFinishLoadingVolumes();
    });
  }

  /**
   * do this when we finish loading all of our databases
   */
  static handleFinishLoadingVolumes() {
    VolumeManager.initializedVolumes++;
    if (VolumeManager.initializedVolumes >= 4) {
      EventManager.dispatch(
        EventFactory.Types.DATABASE_VOLUMES_READY
      );
    }
  }
};
