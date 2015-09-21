import EXIF from 'exif-js';
import GeoUtils from './GeoUtils';
import Map from './Map';
import Alert from './Alert';

/**
 * File - Handle files
 */
export default class File {

  /**
   * On Input Change
   */
  static onInputChange (elem) {
    let files = elem.target.files;

    if (files.length === 0) {
      Alert.showMsg('None file detected. Please try again.');
      return false;
    }

    for (let file of Array.from(files)) {
      File.getData(file, geoData => {
        File.readURL(file)
          .then(response => {
            Map.placeMarker(response.target.result, geoData.lat, geoData.lng);
          });
      });
    }
  }

  /**
   * Get Geo Data
   */
  static getData (file, callback) {
    EXIF.getData(file, function() {
      let { GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef } = EXIF.getAllTags(this);
      if (GPSLatitude && GPSLatitudeRef && GPSLongitude && GPSLongitudeRef) {
        let { lat, lng } = GeoUtils.parseDMS(GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef);
        callback({ lat, lng });
      } else {
        Alert.showMsg(`None EXIF Geo tags found in the file <strong>${file.name}</strong>.<br/>Please check EXIF tags on that image is correct or try another one.`, 'error');
      }
    });
  }

  /**
   * Read image file
   */
  static readURL (file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise(resolve => { reader.onload = resolve; });
  }
}
