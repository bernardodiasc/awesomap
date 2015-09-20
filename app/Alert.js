/**
 * Alert - Handle alert messages
 */
export default class Alert {

  /**
   * Display alert message
   */
  static showMsg(msg, type) {
    if (type === "log") {
      console.log(msg);
    } else {
      let body = document.querySelectorAll("body")[0];
      let alert = body.querySelectorAll(".alert")[0] || [];

      if (alert.length > 0) {
        body.removeChild(alert);
      }

      alert = document.createElement("div");
      alert.classList.add("alert");
      body.appendChild(alert);

      let message = `<div class="message ${type}">${msg}</div>`;
      alert.innerHTML = message;

      setTimeout(function(){
        body.removeChild(alert);
      }, 10000);
    }
  }
}
