import Map from "./Map";
import File from "./File";

var fileInput = document.getElementById("file-input");

Map.buildMap();
fileInput.onchange = File.onInputChange;
