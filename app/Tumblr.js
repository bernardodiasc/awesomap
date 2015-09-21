import DomUtils from "./DomUtils";

export default class Tumblr {

  static fetchPosts () {
    let tumblrFeed = document.createElement("script");

    tumblrFeed.setAttribute("src", "http://api.tumblr.com/v2/blog/snipmint.tumblr.com/posts?api_key=GEVcPQdhe1kIWxnL6yNnSwEmTDogaRKmHE4nkzafwoJStIYwPV&jsonp=callback");
    document.getElementsByTagName("body")[0].appendChild(tumblrFeed);
  }

  static callback (data) {
    let content = [];

    DomUtils.createElement({
      container: document.querySelectorAll(".panel.right")[0],
      content: content,
      tag: "div",
      classList: "tumblr",
      single: true
    });

    for (let post of data.response.posts) {
      content.push(Tumblr.postTemplate(post, template => {
        DomUtils.createElement(template);
      }));
    }
  }

  static postTemplate (post, template) {
    console.log(post);
    template({
      container: document.querySelectorAll(".tumblr")[0],
      content: post.photos[0].alt_sizes[4].url,
      tag: "img",
      classList: "post"
    });

    return this;
  }
}
