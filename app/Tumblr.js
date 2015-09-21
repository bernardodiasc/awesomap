import EXIF from "exif-js";
import h from "hyperscript";
import DomUtils from "./DomUtils";
import File from "./File";

export default class Tumblr {

  static fetchPosts () {
    let tumblrFeed = document.createElement("script");

    tumblrFeed.setAttribute("src", "http://api.tumblr.com/v2/blog/snipmint.tumblr.com/posts?api_key=GEVcPQdhe1kIWxnL6yNnSwEmTDogaRKmHE4nkzafwoJStIYwPV&jsonp=callback");
    document.getElementsByTagName("body")[0].appendChild(tumblrFeed);
  }

  static callback (data) {
    var obj = data.response.posts.filter(function(obj) {

      let filterTags = obj.tags.filter(function(tag) {
        if (tag != "minasgerais") {
          return true;
        } else {
          return false;
        }
      });

      if (obj.tags.length === filterTags.length) {
        return true;
      } else {
        return false;
      }
    });


    document.querySelectorAll(".panel.right")[0].appendChild(
      h('div.tumblr',
        h('h1',
          h('a', {href: 'http://snipmint.tumblr.com'}, 'Tumblr Feed')
        ),

        Object.keys(obj).map(function (k) {
          return h('a', {href: obj[k].post_url},
            h('figure',
              h('picture',
                h('img', { src: obj[k].photos[0].alt_sizes[3].url, onclick: Tumblr.imageOnclick })
              ),
              h('figcaption', obj[k].caption)
            )
          ); //return
        }) //Object
      ) //h
    );

    //console.log(data);
  }

  static imageOnclick(event) {
    event.preventDefault();

    console.log(event.srcElement.attributes.src.nodeValue);
    // NOTE:
    // XMLHttpRequest cannot load http://41.media.tumblr.com/....jpg.
    // No 'Access-Control-Allow-Origin' header is present on the requested resource.
    // Origin 'http://localhost' is therefore not allowed access.
    File.getData(this, geoData => {
      File.readURL(this)
        .then(response => {
          Map.placeMarker(response.target.result, geoData.lat, geoData.lng);
        });
    });

    return false;
  }
}
