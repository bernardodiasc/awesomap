var EXIF = require('exif-js').EXIF;

document.getElementById("file-input").onchange = function(e) {
  EXIF.getData(e.target.files[0], function() {
    var { GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef } = EXIF.getAllTags(this);

    if (GPSLatitude && GPSLatitudeRef && GPSLongitude && GPSLongitudeRef) {
      var { lat, lng } = parseDMS(GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef);
      var imgURL = readURL(e.target).then(function(response) {
        buildMap(response.target.result, lat, lng)
      });

    } else {
      alert('No exif information found. Please check exif tags on that image or try another one.');
    }
  });
}

/**
 * Build map with MapBox, create a marker with the given image in the exif geolocation
 */
function buildMap(img, lat, lng) {
  L.mapbox.accessToken = 'pk.eyJ1IjoiYmVybmFyZG9kaWFzYyIsImEiOiJlZGFiZmUwOTUzZGM5MWIwOTgwMDhmY2ZkMGJlMzQ1OCJ9.tR40g6DTOsTyi101mxSWJg';
  var map = L.mapbox.map('map', 'mapbox.streets');

  var myLayer = L.mapbox.featureLayer().addTo(map);

  var geoJson = [{
    type: 'Feature',
    "geometry": {
      "type": "Point",
      "coordinates": [lng, lat]
    },
    "properties": {
      'marker-color': '#3c4e5a',
      'marker-size': 'large',
      'image': img
    }
  }];

  myLayer.on('layeradd', function(e) {
    var marker = e.layer;
    var feature = marker.feature;
    var image = feature.properties.image

    // Create custom popup content
    var popupContent = `<div class="popup"><img src="${image}" width="300" /></div>`;

    // http://leafletjs.com/reference.html#popup
    marker.bindPopup(popupContent, {
      closeButton: false,
      minWidth: 320
    });
  });

  // Add features to the map
  myLayer.setGeoJSON(geoJson);

  map.setView([lat, lng], 6);
}

/**
 * Read image file
 */
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.readAsDataURL(input.files[0]);

    return new Promise(function(resolve, reject) {
      reader.onload = resolve;
    });
  }
}

/**
 * DMS - Degrees, Minutes, Seconds
 */
function parseDMS(gpsLat, gpsLatRef, gpsLong, gpsLongRef) {
  var lat = convertDMSToDD(gpsLat[0], gpsLat[1], gpsLat[2], gpsLatRef);
  var lng = convertDMSToDD(gpsLong[0], gpsLong[1], gpsLong[2], gpsLongRef);

  return { lat, lng }
}

/**
 * DD - Decimal Degrees
 */
function convertDMSToDD(degrees, minutes, seconds, direction) {
  var dd = degrees + (minutes / 60) + (seconds / (60 * 60));
  dd = parseFloat(dd);

  if (direction == "S" || direction == "W") {
    dd *= -1;
  }

  return dd;
}
