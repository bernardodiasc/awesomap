import EXIF from "exif-js";
import GeoUtils from "./GeoUtils";
import Map from "./Map";

/**
 * File - Handle files
 */
export default class File {

  /**
   * On Input Change
   */
  static onInputChange(elem) {
    File.getData(elem, geoData => {
      if (geoData) {
        File.readURL(elem.target)
          .then(response => { Map.placeMarker(response.target.result, geoData.lat, geoData.lng); });
      } else {
        console.log("No exif information found. Please check exif tags on that image or try another one.");
      }
    });
  }

  /**
   * Get Geo Data
   */
  static getData(elem, callback) {
    EXIF.getData(elem.target.files[0], function() {
      let { GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef } = EXIF.getAllTags(this);

      if (GPSLatitude && GPSLatitudeRef && GPSLongitude && GPSLongitudeRef) {
        let { lat, lng } = GeoUtils.parseDMS(GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef);
        callback({ lat, lng });
      }
    });
  }

  /**
   * Read image file
   */
  static readURL(input) {
    if (input.files && input.files[0]) {
      let reader = new FileReader();
      reader.readAsDataURL(input.files[0]);
      return new Promise(resolve => { reader.onload = resolve; });
    }
  }
}
