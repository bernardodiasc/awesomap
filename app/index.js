import Map from "./Map";
import File from "./File";
import Alert from "./Alert";

var fileInput = document.getElementById("file-input");

Map.buildMap();
fileInput.onchange = File.onInputChange;
