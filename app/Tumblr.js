import DomUtils from "./DomUtils";

export default class Tumblr {

  static fetchPosts () {
    let tumblrFeed = document.createElement("script");

    tumblrFeed.setAttribute("src", "http://api.tumblr.com/v2/blog/germchaos.tumblr.com/posts?api_key=GEVcPQdhe1kIWxnL6yNnSwEmTDogaRKmHE4nkzafwoJStIYwPV&jsonp=callback");
    document.getElementsByTagName("body")[0].appendChild(tumblrFeed);
  }

  static callback (data) {
    console.log(data);
    let content = data;

    DomUtils.createElement({
      container: document.querySelectorAll(".panel.right")[0],
      content,
      tag: "div",
      classList: "tumblr",
      single: true
    });
  }
}
