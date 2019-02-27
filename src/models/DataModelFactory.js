
import { TeamMembersModel } from "./TeamMembersModel";
import { ActiveCircleModel } from "./ActiveCircleModel";
import { JournalModel } from "./JournalModel";

//
// this class is used to manage DataClient requests for Stores
//
export class DataModelFactory {
  static modelsByName = {};

  static createModel(name, scope) {
    return DataModelFactory.findOrCreateModel(name, scope);
  }

  static findOrCreateModel(name, scope) {
    let storeFound = null;

    if (DataModelFactory.modelsByName[name] != null) {
      storeFound = DataModelFactory.modelsByName[name];
    } else {
      storeFound = DataModelFactory.initializeNewModel(name, scope);
      DataModelFactory.modelsByName[name] = storeFound;
    }

    return storeFound;
  }

  static initializeNewModel(name, scope) {
    switch (name) {
      case DataModelFactory.Models.MEMBER_STATUS:
        return new TeamMembersModel(scope);
      case DataModelFactory.Models.ACTIVE_CIRCLE:
        return new ActiveCircleModel(scope);
      case DataModelFactory.Models.ACTIVE_JOURNAL:
        return new JournalModel(scope);
      default:
        return null;
    }
  }

  static get Models() {
    return {
      MEMBER_STATUS: "member-status",
      ACTIVE_CIRCLE: "active-circle",
      ACTIVE_JOURNAL: "active-journal"
    };
  }
}
