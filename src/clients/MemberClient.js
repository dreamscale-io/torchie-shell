import { BaseClient } from "./BaseClient";
import { RendererEventFactory } from "../events/RendererEventFactory";

/**
 * This is our class that pulls data from our team service
 */
export class MemberClient extends BaseClient {
  /**
   * stores the event replies for client events
   * @type {Map<any, any>}
   */
  static replies = new Map();

  /**
   * our team event listeners that other classes use
   * @type {*}
   */
  static listeners = [];

  /**
   * stores a static reference of our current user logged in
   * @type {MemberWorkStatusDto}
   */
  static me = null;

  /**
   * builds the Client for a Team in Gridtime
   * @param scope
   */
  constructor(scope) {
    super(scope, "[MemberClient]");
    this.event = RendererEventFactory.createEvent(
      RendererEventFactory.Events.MEMBER_CLIENT,
      this,
      null,
      this.onMemberEventReply
    );
  }

  /**
   * general enum list of all of our possible circuit events
   * @returns {{LOAD_ME: string, GET_ME: string}}
   * @constructor
   */
  static get Events() {
    return {
      LOAD_ME: "load-me",
      GET_ME: "get-me"
    };
  }

  /**
   * initializes the class in the current application context
   * @param scope
   */
  static init(scope) {
    if (!MemberClient.instance) {
      MemberClient.instance = new MemberClient(scope);
      MemberClient.getMe(this, arg => {
        MemberClient.me = arg.data;
      });
    }
  }

  static loadMe(scope, callback) {
    let event = MemberClient.instance.createClientEvent(
      MemberClient.Events.LOAD_ME,
      {},
      scope,
      callback
    );
    MemberClient.instance.notifyMember(event);
    return event;
  }

  static getMe(scope, callback) {
    let event = MemberClient.instance.createClientEvent(
      MemberClient.Events.GET_ME,
      {},
      scope,
      callback
    );
    MemberClient.instance.notifyMember(event);
    return event;
  }

  /**
   * the event callback used by the event manager. removes the event from
   * the local map when its received the response from the main process. the
   * callback it's bound to the scope of what was pass into the api of this client
   * @param event
   * @param arg
   */
  onMemberEventReply = (event, arg) => {
    let clientEvent = MemberClient.replies.get(arg.id);
    this.logReply(
      MemberClient.name,
      MemberClient.replies.size,
      arg.id,
      arg.type
    );
    if (clientEvent) {
      MemberClient.replies.delete(arg.id);
      clientEvent.callback(event, arg);
    }
  };

  /**
   * notifies the main process member that we have a new event to process. This
   * function will add the client event and callback into a map to look up when
   * this events reply is ready from the main process thread
   * @param clientEvent
   */
  notifyMember(clientEvent) {
    console.log(
      "[" +
        MemberClient.name +
        "] notify -> " +
        JSON.stringify(clientEvent)
    );
    MemberClient.replies.set(clientEvent.id, clientEvent);
    this.event.dispatch(clientEvent, true);
  }
}