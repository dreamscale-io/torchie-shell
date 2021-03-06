import { BrowserRequestFactory } from "./controllers/BrowserRequestFactory";
import { BaseClient } from "./clients/BaseClient";
import moment from "moment";
import randomQuotes from "random-quotes";

export default class UtilRenderer {
  /**
   * the string prefix that is used to create our WTF timer string.
   * @type {string}
   */
  static wtfTimePrefixStr = "T + ";

  /**
   * our moment UTC format string that gridtime uses. This must match the
   * format schema that is set on gridtime server that you are accessing. DO
   * NOT CHANGE, EVEN IF YOU THINK THIS DOESN'T LOOK RIGHT; IT DOES.
   * @type {string}
   */
  static wtfTimeFormatStr = "MMM Do YYYY, h:mm:ss a";

  /**
   * helper function to return a date time string from a date object that is localized
   * to our current timezone
   * @param date - moment js date object
   * @returns {string} -  the utc string
   */
  static getDateTimeString(date) {
    return (
      date.toLocaleTimeString() +
      " " +
      date.toLocaleDateString()
    );
  }

  /**
   * checks if an object is empty but not null
   * @param obj
   * @returns {boolean|boolean}
   */
  static isObjEmpty(obj) {
    return (
      Object.keys(obj).length === 0 &&
      obj.constructor === Object
    );
  }

  /**
   * gets a static string of a random quote used for placeholder default
   * text in the gui.
   * @returns {string} - the formatted string with the quote body and author
   */
  static getRandomQuoteText() {
    let quote = randomQuotes();
    return '"' + quote.body + '" ~' + quote.author;
  }

  /**
   * clears a interval timer from our global scope. fast timers rock
   * @param timer - our window timer to clear
   */
  static clearIntervalTimer(timer) {
    if (timer) {
      window.clearInterval(timer);
    }
    return null;
  }

  /**
   * formats our circuit name string with _ and capitalizes the first character
   * @param circuitName
   * @returns {string}
   */
  static getFormattedCircuitName(circuitName) {
    return circuitName
      .split("_")
      .map(t => {
        if (t.length > 1) {
          return t.charAt(0).toUpperCase() + t.slice(1);
        }
        return t.charAt(0).toUpperCase();
      })
      .join(" ");
  }

  /**
   * gets our timer string from the time now see getWtfTimerStringFromSeconds
   * @param openUtcTime
   * @param pausedNanoTime
   * @returns {string}
   */
  static getWtfTimerStringFromOpenMinusPausedTime(
    openUtcTime,
    pausedNanoTime
  ) {
    let t =
      moment().diff(openUtcTime, "s") -
      UtilRenderer.getSecondsFromNanoseconds(
        pausedNanoTime
      );

    return UtilRenderer.getWtfTimerString(
      (t / 86400) | 0,
      ((t / 3600) | 0) % 24,
      ((t / 60) | 0) % 60,
      t % 60
    );
  }

  /**
   * gets our wtf timer string for other functions that the gui uses.
   * @param days
   * @param hours
   * @param minutes
   * @param seconds
   * @returns {string}
   */
  static getWtfTimerString(days, hours, minutes, seconds) {
    return (
      UtilRenderer.wtfTimePrefixStr +
      (days < 10 ? "0" + days : days) +
      ":" +
      (hours < 10 ? "0" + hours : hours) +
      ":" +
      (minutes < 10 ? "0" + minutes : minutes) +
      ":" +
      (seconds < 10 ? "0" + seconds : seconds) +
      "s"
    );
  }

  /**
   * returns our the total amount of time that has elapsed, excluding pause
   * time which is precompiled by gridtime.
   * @param seconds
   */
  static getWtfTimerStringFromTimeDurationSeconds(seconds) {
    return UtilRenderer.getWtfTimerString(
      (seconds / 86400) | 0,
      ((seconds / 3600) | 0) % 24,
      ((seconds / 60) | 0) % 60,
      seconds % 60
    );
  }

  /**
   * calculates a string representation of a total amount of nanoseconds. This
   * is commonly used to calculate the total elapsed paused time for example.
   * @param nanoseconds
   */
  static getSecondsFromNanoseconds(nanoseconds) {
    return (nanoseconds / 1000000000) | 0;
  }

  /**
   * gets a date time string from an array of time values
   * @param array
   * @returns {string}
   */
  static getTimeStringFromTimeArray(array) {
    // console.log(array);
    return "5 min";
  }

  /**
   * figured out what our open time string is given a utc array
   * of date time numbers in central timezone
   * @param array
   * @returns {string}
   */
  static getOpenTimeStringFromOpenTimeArray(array) {
    if (array) {
      let t = moment.utc([
        array[0],
        array[1] - 1,
        array[2],
        array[3],
        array[4],
        array[5]
      ]);
      return t.format(UtilRenderer.wtfTimeFormatStr);
    }
    return "";
  }

  static getChatMessageTimeString(dateTimeString) {
    let referenceDay = moment.utc(dateTimeString);
    return moment().calendar(referenceDay);
  }

  /**
   * gets the browser resource from a given request
   * @param request
   * @returns {{action: string, uriArr: string[], uri: string}}
   */
  static getResourceFromRequest(request) {
    if (!request) {
      return {
        action: BrowserRequestFactory.ACTION_ERROR,
        uri: BrowserRequestFactory.URI_ERROR,
        uriArr: [BrowserRequestFactory.URI_ERROR]
      };
    }
    let req = request
      .toLowerCase()
      .split(BrowserRequestFactory.URI_SEPARATOR);
    let res = req[1].split(
      BrowserRequestFactory.PATH_SEPARATOR
    );
    if (res[0] === "/" || res[0] === "") {
      res.shift();
    }
    if (!req[1].startsWith("/")) {
      req[1] += "/" + req[1];
    }
    return {
      action: req[0],
      uri: req[1],
      uriArr: res
    };
  }

  /**
   * iterates over an array to see if we alread have the message. simple
   * shit right?
   * @param arr - our array to search in
   * @param message - our message we are looking for
   * @returns {boolean}
   */
  static hasMessageByIdInArray(arr, message) {
    let length = arr.length;
    for (let i = 0, m = null; i < length; i++) {
      m = arr[i];
      if (m.id === message.id) {
        return true;
      }
    }
    return false;
  }

  /**
   * searches an array for a message which id equals the
   * parameter id's
   * @param arr
   * @param message
   */
  static updateMessageInArrayById(arr, message) {
    let length = arr.length;
    for (let i = 0, m = null; i < length; i++) {
      m = arr[i];
      if (m.id === message.id) {
        arr[i] = message;
        break;
      }
    }
    return arr;
  }

  /**
   * a simple check to see if a talk message is a status message
   * @param message
   * @returns {boolean}
   */
  static isStatusMessage(message) {
    return (
      message.messageType ===
        BaseClient.MessageTypes.ROOM_MEMBER_STATUS_EVENT ||
      message.messageType ===
        BaseClient.MessageTypes.CIRCUIT_STATUS
    );
  }

  /**
   * determines if this should be a wtf session or new start session componet
   * @param resource
   * @returns {boolean}
   */
  static isWTFResource(resource) {
    let arr = resource.uriArr;
    if (arr.length > 1) {
      if (arr[1] === BrowserRequestFactory.Locations.WTF) {
        if (arr.length > 2) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * gets an epoch unix timestamp from a given UTC string with a timezone
   * @param utcStr
   * @returns {number}
   */
  static getTimestampFromUTCStr(utcStr) {
    return moment(utcStr).valueOf();
  }

  /**
   * gets the name of our room from a given circuit resource
   * @param resource
   * @returns {string|null}
   */
  static getRoomNameFromResource(resource) {
    let arr = resource.uriArr;
    if (arr.length > 1) {
      if (arr[1] === BrowserRequestFactory.Locations.WTF) {
        if (arr.length > 2) {
          return (
            arr[2] +
            "-" +
            BrowserRequestFactory.Locations.WTF
          );
        }
      }
    }
    return null;
  }

  /**
   * gets a decimal percent of our relative xp towards the next level.
   * @param xpProgress
   * @param xpRequiredToLevel
   * @returns {number}
   */
  static getXpPercent(xpProgress, xpRequiredToLevel) {
    return ((xpProgress / xpRequiredToLevel) * 100) | 0;
  }

  /**
   * checks of our member is online by their online status field
   * @param member
   * @returns {boolean}
   */
  static isMemberOnline(member) {
    return member.onlineStatus === "Online";
  }

  static isEveryoneTeam(team) {
    return team.name === "Everyone";
  }

  /**
   * checks our member dto to see if we have an active circuit
   * and if we do then we need ot set the alarm flag to true.
   * @param member
   * @returns {boolean}
   */
  static isMemberAlarm(member) {
    return !!member.activeCircuit;
  }

  /**
   * checks a circuit to see if its state is on_hold (paused)
   * @param circuit
   * @returns {boolean}
   */
  static isCircuitPaused(circuit) {
    return (
      circuit &&
      circuit.circuitState ===
        BaseClient.CircuitStates.ON_HOLD
    );
  }

  /**
   * helper function that given a specific user and a circuit, it will
   * return true if the member created it or is a moderator. This
   * is done by comparing the id's of the member in the circuit.
   * see the Util's version of this, which is identical.
   * @param member
   * @param circuit
   * @returns {boolean}
   */
  static isCircuitOwnerModerator(member, circuit) {
    return (
      member &&
      circuit &&
      member.id === (circuit.ownerId || circuit.moderatorId)
    );
  }

  /**
   * a helper function which is used to look up a specific memberId (NOT
   * doc.id like everything else.), to see if it is part of the participants
   * array, and is also actually joined, not as a guest (which hasn't called
   * joinWTF on the circuit yet)
   * @param member
   * @param participants
   * @returns {boolean}
   */
  static isCircuitParticipant(member, participants) {
    let memberId = member.id;
    for (
      let i = 0, participant = null;
      i < participants.length;
      i++
    ) {
      participant = participants[i];
      if (participant.memberId === memberId) {
        return true;
      }
    }
    return false;
  }

  /**
   * useful helper to detect if we have a sql injection attack. Should
   * implement this anywhere we are sending data or receiving data.
   *
   * sql regex reference: http://www.symantec.com/connect/articles/detection-sql-injection-and-cross-site-scripting-attacks
   * @param value
   * @returns {boolean}
   */
  static hasSQL(value) {
    if (value === null || value === undefined) {
      return false;
    }

    let sql_meta = new RegExp(
      "(%27)|(')|(--)|(%23)|(#)",
      "i"
    );
    if (sql_meta.test(value)) {
      return true;
    }

    /* eslint no-control-regex: "off" */
    let sql_meta2 = new RegExp(
      "((%3D)|(=))[^\n]*((%27)|(')|(--)|(%3B)|(;))",
      "i"
    );
    if (sql_meta2.test(value)) {
      return true;
    }

    let sql_typical = new RegExp(
      "w*((%27)|('))((%6F)|o|(%4F))((%72)|r|(%52))",
      "i"
    );
    if (sql_typical.test(value)) {
      return true;
    }

    let sql_union = new RegExp("((%27)|('))union", "i");
    return sql_union.test(value);
  }

  /**
   * gets a unique id in a ISO GUID format based off random number
   * @returns {string}
   */
  static getGuid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    return (
      s4() +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      "-" +
      s4() +
      s4() +
      s4()
    );
  }
}
