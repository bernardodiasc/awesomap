import EXIF from 'exif-js';
import h from 'hyperscript';
import DomUtils from './DomUtils';
import File from './File';

export default class Tumblr {
  static fetchPosts () {
    var BLOG_URL = 'snipmint.tumblr.com';
    var API_KEY = 'GEVcPQdhe1kIWxnL6yNnSwEmTDogaRKmHE4nkzafwoJStIYwPV';
    var GET_POSTS_URL = 'http://api.tumblr.com/v2/blog/' + BLOG_URL + '/posts?api_key=' + API_KEY + '&jsonp=callback';

    let tumblrFeed = document.createElement('script');
    tumblrFeed.setAttribute('src', GET_POSTS_URL);
    document.getElementsByTagName('body')[0].appendChild(tumblrFeed);
  }

  static callback (data) {
    Tumblr.filterPosts(data);
  }

  static filterPosts (data) {
    var postsObj = {};
    //console.log('data.response.posts', data.response.posts);
    postsObj = data.response.posts.filter(obj => {
      let filterTags = obj.tags.filter(tag => {
        if (tag !== 'minasgerais') {
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

    Tumblr.postsTemplate(postsObj);
  }

  /*
  Sample output (HTML):
  <div class="tumblr post">
    <h1><a href="http://snipmint.tumblr.com">Tumblr Feed</a></h1>
    <a href="#">
      <figure>
        <picture>
          <img src="" onclick="Tumblr.imageOnclick" />
        </picture>
        <figcaption>Caption</figcaption>
      </figure>
    </a>
  </div>
  */
  static postsTemplate (data) {
    //console.log('data.response.postsfilter()', data);
    return document.querySelectorAll('.panel.right')[0].appendChild(
      h('div.tumblr.posts', [
        h('h1', [
          h('a', { href: 'http://'+ Tumblr.BLOG_URL }, 'Tumblr Feed')
        ]),

        Object.keys(data).map(function (k) {
          return (
            h('a', { href: data[k].post_url, title: '' }, [
              h('figure', [
                h('picture', [
                  h('img', { src: data[k].photos[0].alt_sizes[3].url, onclick: Tumblr.imageOnclick })
                ]),
                h('figcaption', [ data[k].caption ])
              ])
            ])
          );
        })
      ])
    );
  }

  static imageOnclick (event) {
    event.preventDefault();

    //console.log(event.srcElement.attributes.src.nodeValue);

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

