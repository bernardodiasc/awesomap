import Map from './Map';
import File from './File';
import Alert from './Alert';
import Tumblr from './Tumblr';

window.callback = Tumblr.callback;
var fileInput = document.getElementById('file-input');

Map.buildMap();
fileInput.onchange = File.onInputChange;
Tumblr.fetchPosts();
