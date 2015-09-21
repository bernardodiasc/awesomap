import DomUtils from "./DomUtils";

/**
 * Alert - Handle alert messages
 *
 * To do:
 * - append messages instead of replace
 * - fade in and fade out
 * - close button
 */
export default class Alert {

  /**
   * Display alert message
   */
  static showMsg (msg, type) {
    if (!type) {
      console.log(msg);
    } else {
      DomUtils.createElement({
        content: `<div class="message ${type}">${msg}</div>`,
        tag: "div",
        classList: "alert",
        timer: 10000
      });
    }
  }
}
