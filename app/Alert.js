import h from 'hyperscript';
import parser from 'html2hscript';

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
  static showMsg ({ msg, type, container }) {
    if (!type) {
      console.log(msg);
      return msg;
    } else {
      let alert = container.appendChild(
        parser(msg, function(err, hscript) {
          h('div.Alert.' + type, hscript);
        })
      );

      setTimeout(function(){
        container.removeChild(alert);
      }, 10000);

      return alert;
    }
  }
}
