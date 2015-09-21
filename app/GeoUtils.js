/**
 * GeoUtils - Geographic functions
 */
export default class GeoUtils {

  /**
   * DMS - Degrees, Minutes, Seconds
   */
  static parseDMS (gpsLat, gpsLatRef, gpsLong, gpsLongRef) {
    let lat = this.convertDMSToDD(gpsLat[0], gpsLat[1], gpsLat[2], gpsLatRef);
    let lng = this.convertDMSToDD(gpsLong[0], gpsLong[1], gpsLong[2], gpsLongRef);

    return { lat, lng };
  }

  /**
   * DD - Decimal Degrees
   */
  static convertDMSToDD (degrees, minutes, seconds, direction) {
    let dd = degrees + (minutes / 60) + (seconds / (60 * 60));
    dd = parseFloat(dd);

    if (direction === 'S' || direction === 'W') {
      dd *= -1;
    }

    return dd;
  }
}
