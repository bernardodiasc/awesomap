import EXIF from "exif-js";
import GeoUtils from "./GeoUtils";
import Map from "./Map";
import Alert from "./Alert";

/**
 * File - Handle files
 */
export default class File {

  /**
   * On Input Change
   */
  static onInputChange(elem) {
    if (elem.target.files.length === 0) {
      Alert.showMsg("None file detected. Please try again.", "error");
      return false;
    }

    File.getData(elem, geoData => {
      File.readURL(elem.target)
        .then(response => { Map.placeMarker(response.target.result, geoData.lat, geoData.lng); });
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
      } else {
        Alert.showMsg("None EXIF Geo tags found. Please check EXIF tags on that image is correct or try another one.", "error");
      }
    });
  }

  /**
   * Read image file
   */
  static readURL(input) {
    let reader = new FileReader();
    reader.readAsDataURL(input.files[0]);
    return new Promise(resolve => { reader.onload = resolve; });
  }
}
