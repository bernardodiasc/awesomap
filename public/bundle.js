(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * geoUtils - Geographic functions
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GeoUtils = (function () {
  function GeoUtils() {
    _classCallCheck(this, GeoUtils);
  }

  _createClass(GeoUtils, null, [{
    key: "parseDMS",

    /**
     * DMS - Degrees, Minutes, Seconds
     */
    value: function parseDMS(gpsLat, gpsLatRef, gpsLong, gpsLongRef) {
      var lat = this.convertDMSToDD(gpsLat[0], gpsLat[1], gpsLat[2], gpsLatRef);
      var lng = this.convertDMSToDD(gpsLong[0], gpsLong[1], gpsLong[2], gpsLongRef);

      return { lat: lat, lng: lng };
    }

    /**
     * DD - Decimal Degrees
     */
  }, {
    key: "convertDMSToDD",
    value: function convertDMSToDD(degrees, minutes, seconds, direction) {
      var dd = degrees + minutes / 60 + seconds / (60 * 60);
      dd = parseFloat(dd);

      if (direction === "S" || direction === "W") {
        dd *= -1;
      }

      return dd;
    }
  }]);

  return GeoUtils;
})();

exports["default"] = GeoUtils;
module.exports = exports["default"];

},{}],2:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _exifJs = require("exif-js");

var _exifJs2 = _interopRequireDefault(_exifJs);

var _GeoUtils = require("./GeoUtils");

var _GeoUtils2 = _interopRequireDefault(_GeoUtils);

document.getElementById("file-input").onchange = function (e) {
  _exifJs2["default"].getData(e.target.files[0], function () {
    var _EXIF$getAllTags = _exifJs2["default"].getAllTags(this);

    var GPSLatitude = _EXIF$getAllTags.GPSLatitude;
    var GPSLatitudeRef = _EXIF$getAllTags.GPSLatitudeRef;
    var GPSLongitude = _EXIF$getAllTags.GPSLongitude;
    var GPSLongitudeRef = _EXIF$getAllTags.GPSLongitudeRef;

    if (GPSLatitude && GPSLatitudeRef && GPSLongitude && GPSLongitudeRef) {
      var _GeoUtils$parseDMS = _GeoUtils2["default"].parseDMS(GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef);

      var lat = _GeoUtils$parseDMS.lat;
      var lng = _GeoUtils$parseDMS.lng;

      var imgURL = readURL(e.target).then(function (response) {
        buildMap(response.target.result, lat, lng);
      });
    } else {
      alert("No exif information found. Please check exif tags on that image or try another one.");
    }
  });
};

/**
 * Build map with MapBox, create a marker with the given image in the exif geolocation
 */
function buildMap(img, lat, lng) {
  L.mapbox.accessToken = "pk.eyJ1IjoiYmVybmFyZG9kaWFzYyIsImEiOiJlZGFiZmUwOTUzZGM5MWIwOTgwMDhmY2ZkMGJlMzQ1OCJ9.tR40g6DTOsTyi101mxSWJg";
  var map = L.mapbox.map("map", "mapbox.streets");

  var myLayer = L.mapbox.featureLayer().addTo(map);

  var geoJson = [{
    type: "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [lng, lat]
    },
    "properties": {
      "marker-color": "#3c4e5a",
      "marker-size": "large",
      "image": img
    }
  }];

  myLayer.on("layeradd", function (e) {
    var marker = e.layer;
    var feature = marker.feature;
    var image = feature.properties.image;

    // Create custom popup content
    var popupContent = "<div class=\"popup\"><img src=\"" + image + "\" width=\"300\" /></div>";

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

    return new Promise(function (resolve, reject) {
      reader.onload = resolve;
    });
  }
}

},{"./GeoUtils":1,"exif-js":3}],3:[function(require,module,exports){
(function() {

    var debug = false;

    var root = this;

    var EXIF = function(obj) {
        if (obj instanceof EXIF) return obj;
        if (!(this instanceof EXIF)) return new EXIF(obj);
        this.EXIFwrapped = obj;
    };

    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = EXIF;
        }
        exports.EXIF = EXIF;
    } else {
        root.EXIF = EXIF;
    }

    var ExifTags = EXIF.Tags = {

        // version tags
        0x9000 : "ExifVersion",             // EXIF version
        0xA000 : "FlashpixVersion",         // Flashpix format version

        // colorspace tags
        0xA001 : "ColorSpace",              // Color space information tag

        // image configuration
        0xA002 : "PixelXDimension",         // Valid width of meaningful image
        0xA003 : "PixelYDimension",         // Valid height of meaningful image
        0x9101 : "ComponentsConfiguration", // Information about channels
        0x9102 : "CompressedBitsPerPixel",  // Compressed bits per pixel

        // user information
        0x927C : "MakerNote",               // Any desired information written by the manufacturer
        0x9286 : "UserComment",             // Comments by user

        // related file
        0xA004 : "RelatedSoundFile",        // Name of related sound file

        // date and time
        0x9003 : "DateTimeOriginal",        // Date and time when the original image was generated
        0x9004 : "DateTimeDigitized",       // Date and time when the image was stored digitally
        0x9290 : "SubsecTime",              // Fractions of seconds for DateTime
        0x9291 : "SubsecTimeOriginal",      // Fractions of seconds for DateTimeOriginal
        0x9292 : "SubsecTimeDigitized",     // Fractions of seconds for DateTimeDigitized

        // picture-taking conditions
        0x829A : "ExposureTime",            // Exposure time (in seconds)
        0x829D : "FNumber",                 // F number
        0x8822 : "ExposureProgram",         // Exposure program
        0x8824 : "SpectralSensitivity",     // Spectral sensitivity
        0x8827 : "ISOSpeedRatings",         // ISO speed rating
        0x8828 : "OECF",                    // Optoelectric conversion factor
        0x9201 : "ShutterSpeedValue",       // Shutter speed
        0x9202 : "ApertureValue",           // Lens aperture
        0x9203 : "BrightnessValue",         // Value of brightness
        0x9204 : "ExposureBias",            // Exposure bias
        0x9205 : "MaxApertureValue",        // Smallest F number of lens
        0x9206 : "SubjectDistance",         // Distance to subject in meters
        0x9207 : "MeteringMode",            // Metering mode
        0x9208 : "LightSource",             // Kind of light source
        0x9209 : "Flash",                   // Flash status
        0x9214 : "SubjectArea",             // Location and area of main subject
        0x920A : "FocalLength",             // Focal length of the lens in mm
        0xA20B : "FlashEnergy",             // Strobe energy in BCPS
        0xA20C : "SpatialFrequencyResponse",    //
        0xA20E : "FocalPlaneXResolution",   // Number of pixels in width direction per FocalPlaneResolutionUnit
        0xA20F : "FocalPlaneYResolution",   // Number of pixels in height direction per FocalPlaneResolutionUnit
        0xA210 : "FocalPlaneResolutionUnit",    // Unit for measuring FocalPlaneXResolution and FocalPlaneYResolution
        0xA214 : "SubjectLocation",         // Location of subject in image
        0xA215 : "ExposureIndex",           // Exposure index selected on camera
        0xA217 : "SensingMethod",           // Image sensor type
        0xA300 : "FileSource",              // Image source (3 == DSC)
        0xA301 : "SceneType",               // Scene type (1 == directly photographed)
        0xA302 : "CFAPattern",              // Color filter array geometric pattern
        0xA401 : "CustomRendered",          // Special processing
        0xA402 : "ExposureMode",            // Exposure mode
        0xA403 : "WhiteBalance",            // 1 = auto white balance, 2 = manual
        0xA404 : "DigitalZoomRation",       // Digital zoom ratio
        0xA405 : "FocalLengthIn35mmFilm",   // Equivalent foacl length assuming 35mm film camera (in mm)
        0xA406 : "SceneCaptureType",        // Type of scene
        0xA407 : "GainControl",             // Degree of overall image gain adjustment
        0xA408 : "Contrast",                // Direction of contrast processing applied by camera
        0xA409 : "Saturation",              // Direction of saturation processing applied by camera
        0xA40A : "Sharpness",               // Direction of sharpness processing applied by camera
        0xA40B : "DeviceSettingDescription",    //
        0xA40C : "SubjectDistanceRange",    // Distance to subject

        // other tags
        0xA005 : "InteroperabilityIFDPointer",
        0xA420 : "ImageUniqueID"            // Identifier assigned uniquely to each image
    };

    var TiffTags = EXIF.TiffTags = {
        0x0100 : "ImageWidth",
        0x0101 : "ImageHeight",
        0x8769 : "ExifIFDPointer",
        0x8825 : "GPSInfoIFDPointer",
        0xA005 : "InteroperabilityIFDPointer",
        0x0102 : "BitsPerSample",
        0x0103 : "Compression",
        0x0106 : "PhotometricInterpretation",
        0x0112 : "Orientation",
        0x0115 : "SamplesPerPixel",
        0x011C : "PlanarConfiguration",
        0x0212 : "YCbCrSubSampling",
        0x0213 : "YCbCrPositioning",
        0x011A : "XResolution",
        0x011B : "YResolution",
        0x0128 : "ResolutionUnit",
        0x0111 : "StripOffsets",
        0x0116 : "RowsPerStrip",
        0x0117 : "StripByteCounts",
        0x0201 : "JPEGInterchangeFormat",
        0x0202 : "JPEGInterchangeFormatLength",
        0x012D : "TransferFunction",
        0x013E : "WhitePoint",
        0x013F : "PrimaryChromaticities",
        0x0211 : "YCbCrCoefficients",
        0x0214 : "ReferenceBlackWhite",
        0x0132 : "DateTime",
        0x010E : "ImageDescription",
        0x010F : "Make",
        0x0110 : "Model",
        0x0131 : "Software",
        0x013B : "Artist",
        0x8298 : "Copyright"
    };

    var GPSTags = EXIF.GPSTags = {
        0x0000 : "GPSVersionID",
        0x0001 : "GPSLatitudeRef",
        0x0002 : "GPSLatitude",
        0x0003 : "GPSLongitudeRef",
        0x0004 : "GPSLongitude",
        0x0005 : "GPSAltitudeRef",
        0x0006 : "GPSAltitude",
        0x0007 : "GPSTimeStamp",
        0x0008 : "GPSSatellites",
        0x0009 : "GPSStatus",
        0x000A : "GPSMeasureMode",
        0x000B : "GPSDOP",
        0x000C : "GPSSpeedRef",
        0x000D : "GPSSpeed",
        0x000E : "GPSTrackRef",
        0x000F : "GPSTrack",
        0x0010 : "GPSImgDirectionRef",
        0x0011 : "GPSImgDirection",
        0x0012 : "GPSMapDatum",
        0x0013 : "GPSDestLatitudeRef",
        0x0014 : "GPSDestLatitude",
        0x0015 : "GPSDestLongitudeRef",
        0x0016 : "GPSDestLongitude",
        0x0017 : "GPSDestBearingRef",
        0x0018 : "GPSDestBearing",
        0x0019 : "GPSDestDistanceRef",
        0x001A : "GPSDestDistance",
        0x001B : "GPSProcessingMethod",
        0x001C : "GPSAreaInformation",
        0x001D : "GPSDateStamp",
        0x001E : "GPSDifferential"
    };

    var StringValues = EXIF.StringValues = {
        ExposureProgram : {
            0 : "Not defined",
            1 : "Manual",
            2 : "Normal program",
            3 : "Aperture priority",
            4 : "Shutter priority",
            5 : "Creative program",
            6 : "Action program",
            7 : "Portrait mode",
            8 : "Landscape mode"
        },
        MeteringMode : {
            0 : "Unknown",
            1 : "Average",
            2 : "CenterWeightedAverage",
            3 : "Spot",
            4 : "MultiSpot",
            5 : "Pattern",
            6 : "Partial",
            255 : "Other"
        },
        LightSource : {
            0 : "Unknown",
            1 : "Daylight",
            2 : "Fluorescent",
            3 : "Tungsten (incandescent light)",
            4 : "Flash",
            9 : "Fine weather",
            10 : "Cloudy weather",
            11 : "Shade",
            12 : "Daylight fluorescent (D 5700 - 7100K)",
            13 : "Day white fluorescent (N 4600 - 5400K)",
            14 : "Cool white fluorescent (W 3900 - 4500K)",
            15 : "White fluorescent (WW 3200 - 3700K)",
            17 : "Standard light A",
            18 : "Standard light B",
            19 : "Standard light C",
            20 : "D55",
            21 : "D65",
            22 : "D75",
            23 : "D50",
            24 : "ISO studio tungsten",
            255 : "Other"
        },
        Flash : {
            0x0000 : "Flash did not fire",
            0x0001 : "Flash fired",
            0x0005 : "Strobe return light not detected",
            0x0007 : "Strobe return light detected",
            0x0009 : "Flash fired, compulsory flash mode",
            0x000D : "Flash fired, compulsory flash mode, return light not detected",
            0x000F : "Flash fired, compulsory flash mode, return light detected",
            0x0010 : "Flash did not fire, compulsory flash mode",
            0x0018 : "Flash did not fire, auto mode",
            0x0019 : "Flash fired, auto mode",
            0x001D : "Flash fired, auto mode, return light not detected",
            0x001F : "Flash fired, auto mode, return light detected",
            0x0020 : "No flash function",
            0x0041 : "Flash fired, red-eye reduction mode",
            0x0045 : "Flash fired, red-eye reduction mode, return light not detected",
            0x0047 : "Flash fired, red-eye reduction mode, return light detected",
            0x0049 : "Flash fired, compulsory flash mode, red-eye reduction mode",
            0x004D : "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
            0x004F : "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
            0x0059 : "Flash fired, auto mode, red-eye reduction mode",
            0x005D : "Flash fired, auto mode, return light not detected, red-eye reduction mode",
            0x005F : "Flash fired, auto mode, return light detected, red-eye reduction mode"
        },
        SensingMethod : {
            1 : "Not defined",
            2 : "One-chip color area sensor",
            3 : "Two-chip color area sensor",
            4 : "Three-chip color area sensor",
            5 : "Color sequential area sensor",
            7 : "Trilinear sensor",
            8 : "Color sequential linear sensor"
        },
        SceneCaptureType : {
            0 : "Standard",
            1 : "Landscape",
            2 : "Portrait",
            3 : "Night scene"
        },
        SceneType : {
            1 : "Directly photographed"
        },
        CustomRendered : {
            0 : "Normal process",
            1 : "Custom process"
        },
        WhiteBalance : {
            0 : "Auto white balance",
            1 : "Manual white balance"
        },
        GainControl : {
            0 : "None",
            1 : "Low gain up",
            2 : "High gain up",
            3 : "Low gain down",
            4 : "High gain down"
        },
        Contrast : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        Saturation : {
            0 : "Normal",
            1 : "Low saturation",
            2 : "High saturation"
        },
        Sharpness : {
            0 : "Normal",
            1 : "Soft",
            2 : "Hard"
        },
        SubjectDistanceRange : {
            0 : "Unknown",
            1 : "Macro",
            2 : "Close view",
            3 : "Distant view"
        },
        FileSource : {
            3 : "DSC"
        },

        Components : {
            0 : "",
            1 : "Y",
            2 : "Cb",
            3 : "Cr",
            4 : "R",
            5 : "G",
            6 : "B"
        }
    };

    function addEvent(element, event, handler) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, false);
        } else if (element.attachEvent) {
            element.attachEvent("on" + event, handler);
        }
    }

    function imageHasData(img) {
        return !!(img.exifdata);
    }


    function base64ToArrayBuffer(base64, contentType) {
        contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/mi)[1] || ''; // e.g. 'data:image/jpeg;base64,...' => 'image/jpeg'
        base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
        var binary = atob(base64);
        var len = binary.length;
        var buffer = new ArrayBuffer(len);
        var view = new Uint8Array(buffer);
        for (var i = 0; i < len; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return buffer;
    }

    function objectURLToBlob(url, callback) {
        var http = new XMLHttpRequest();
        http.open("GET", url, true);
        http.responseType = "blob";
        http.onload = function(e) {
            if (this.status == 200 || this.status === 0) {
                callback(this.response);
            }
        };
        http.send();
    }

    function getImageData(img, callback) {
        function handleBinaryFile(binFile) {
            var data = findEXIFinJPEG(binFile);
            var iptcdata = findIPTCinJPEG(binFile);
            img.exifdata = data || {};
            img.iptcdata = iptcdata || {};
            if (callback) {
                callback.call(img);
            }
        }

        if (img.src) {
            if (/^data\:/i.test(img.src)) { // Data URI
                var arrayBuffer = base64ToArrayBuffer(img.src);
                handleBinaryFile(arrayBuffer);

            } else if (/^blob\:/i.test(img.src)) { // Object URL
                var fileReader = new FileReader();
                fileReader.onload = function(e) {
                    handleBinaryFile(e.target.result);
                };
                objectURLToBlob(img.src, function (blob) {
                    fileReader.readAsArrayBuffer(blob);
                });
            } else {
                var http = new XMLHttpRequest();
                http.onload = function() {
                    if (this.status == 200 || this.status === 0) {
                        handleBinaryFile(http.response);
                    } else {
                        throw "Could not load image";
                    }
                    http = null;
                };
                http.open("GET", img.src, true);
                http.responseType = "arraybuffer";
                http.send(null);
            }
        } else if (window.FileReader && (img instanceof window.Blob || img instanceof window.File)) {
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                if (debug) console.log("Got file of length " + e.target.result.byteLength);
                handleBinaryFile(e.target.result);
            };

            fileReader.readAsArrayBuffer(img);
        }
    }

    function findEXIFinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength,
            marker;

        while (offset < length) {
            if (dataView.getUint8(offset) != 0xFF) {
                if (debug) console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset));
                return false; // not a valid marker, something is wrong
            }

            marker = dataView.getUint8(offset + 1);
            if (debug) console.log(marker);

            // we could implement handling for other markers here,
            // but we're only looking for 0xFFE1 for EXIF data

            if (marker == 225) {
                if (debug) console.log("Found 0xFFE1 marker");

                return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);

                // offset += 2 + file.getShortAt(offset+2, true);

            } else {
                offset += 2 + dataView.getUint16(offset+2);
            }

        }

    }

    function findIPTCinJPEG(file) {
        var dataView = new DataView(file);

        if (debug) console.log("Got file of length " + file.byteLength);
        if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
            if (debug) console.log("Not a valid JPEG");
            return false; // not a valid jpeg
        }

        var offset = 2,
            length = file.byteLength;


        var isFieldSegmentStart = function(dataView, offset){
            return (
                dataView.getUint8(offset) === 0x38 &&
                dataView.getUint8(offset+1) === 0x42 &&
                dataView.getUint8(offset+2) === 0x49 &&
                dataView.getUint8(offset+3) === 0x4D &&
                dataView.getUint8(offset+4) === 0x04 &&
                dataView.getUint8(offset+5) === 0x04
            );
        };

        while (offset < length) {

            if ( isFieldSegmentStart(dataView, offset )){

                // Get the length of the name header (which is padded to an even number of bytes)
                var nameHeaderLength = dataView.getUint8(offset+7);
                if(nameHeaderLength % 2 !== 0) nameHeaderLength += 1;
                // Check for pre photoshop 6 format
                if(nameHeaderLength === 0) {
                    // Always 4
                    nameHeaderLength = 4;
                }

                var startOffset = offset + 8 + nameHeaderLength;
                var sectionLength = dataView.getUint16(offset + 6 + nameHeaderLength);

                return readIPTCData(file, startOffset, sectionLength);

                break;

            }


            // Not the marker, continue searching
            offset++;

        }

    }
    var IptcFieldMap = {
        0x78 : 'caption',
        0x6E : 'credit',
        0x19 : 'keywords',
        0x37 : 'dateCreated',
        0x50 : 'byline',
        0x55 : 'bylineTitle',
        0x7A : 'captionWriter',
        0x69 : 'headline',
        0x74 : 'copyright',
        0x0F : 'category'
    };
    function readIPTCData(file, startOffset, sectionLength){
        var dataView = new DataView(file);
        var data = {};
        var fieldValue, fieldName, dataSize, segmentType, segmentSize;
        var segmentStartPos = startOffset;
        while(segmentStartPos < startOffset+sectionLength) {
            if(dataView.getUint8(segmentStartPos) === 0x1C && dataView.getUint8(segmentStartPos+1) === 0x02){
                segmentType = dataView.getUint8(segmentStartPos+2);
                if(segmentType in IptcFieldMap) {
                    dataSize = dataView.getInt16(segmentStartPos+3);
                    segmentSize = dataSize + 5;
                    fieldName = IptcFieldMap[segmentType];
                    fieldValue = getStringFromDB(dataView, segmentStartPos+5, dataSize);
                    // Check if we already stored a value with this name
                    if(data.hasOwnProperty(fieldName)) {
                        // Value already stored with this name, create multivalue field
                        if(data[fieldName] instanceof Array) {
                            data[fieldName].push(fieldValue);
                        }
                        else {
                            data[fieldName] = [data[fieldName], fieldValue];
                        }
                    }
                    else {
                        data[fieldName] = fieldValue;
                    }
                }

            }
            segmentStartPos++;
        }
        return data;
    }



    function readTags(file, tiffStart, dirStart, strings, bigEnd) {
        var entries = file.getUint16(dirStart, !bigEnd),
            tags = {},
            entryOffset, tag,
            i;

        for (i=0;i<entries;i++) {
            entryOffset = dirStart + i*12 + 2;
            tag = strings[file.getUint16(entryOffset, !bigEnd)];
            if (!tag && debug) console.log("Unknown tag: " + file.getUint16(entryOffset, !bigEnd));
            tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
        }
        return tags;
    }


    function readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd) {
        var type = file.getUint16(entryOffset+2, !bigEnd),
            numValues = file.getUint32(entryOffset+4, !bigEnd),
            valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
            offset,
            vals, val, n,
            numerator, denominator;

        switch (type) {
            case 1: // byte, 8-bit unsigned int
            case 7: // undefined, 8-bit byte, value depending on field
                if (numValues == 1) {
                    return file.getUint8(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint8(offset + n);
                    }
                    return vals;
                }

            case 2: // ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return getStringFromDB(file, offset, numValues-1);

            case 3: // short, 16 bit int
                if (numValues == 1) {
                    return file.getUint16(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint16(offset + 2*n, !bigEnd);
                    }
                    return vals;
                }

            case 4: // long, 32 bit int
                if (numValues == 1) {
                    return file.getUint32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 5:    // rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getUint32(valueOffset, !bigEnd);
                    denominator = file.getUint32(valueOffset+4, !bigEnd);
                    val = new Number(numerator / denominator);
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
                        denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
                        vals[n] = new Number(numerator / denominator);
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }

            case 9: // slong, 32 bit signed int
                if (numValues == 1) {
                    return file.getInt32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 10: // signed rational, two slongs, first is numerator, second is denominator
                if (numValues == 1) {
                    return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
                    }
                    return vals;
                }
        }
    }

    function getStringFromDB(buffer, start, length) {
        var outstr = "";
        for (n = start; n < start+length; n++) {
            outstr += String.fromCharCode(buffer.getUint8(n));
        }
        return outstr;
    }

    function readEXIFData(file, start) {
        if (getStringFromDB(file, start, 4) != "Exif") {
            if (debug) console.log("Not valid EXIF data! " + getStringFromDB(file, start, 4));
            return false;
        }

        var bigEnd,
            tags, tag,
            exifData, gpsData,
            tiffOffset = start + 6;

        // test for TIFF validity and endianness
        if (file.getUint16(tiffOffset) == 0x4949) {
            bigEnd = false;
        } else if (file.getUint16(tiffOffset) == 0x4D4D) {
            bigEnd = true;
        } else {
            if (debug) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)");
            return false;
        }

        if (file.getUint16(tiffOffset+2, !bigEnd) != 0x002A) {
            if (debug) console.log("Not valid TIFF data! (no 0x002A)");
            return false;
        }

        var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

        if (firstIFDOffset < 0x00000008) {
            if (debug) console.log("Not valid TIFF data! (First offset less than 8)", file.getUint32(tiffOffset+4, !bigEnd));
            return false;
        }

        tags = readTags(file, tiffOffset, tiffOffset + firstIFDOffset, TiffTags, bigEnd);

        if (tags.ExifIFDPointer) {
            exifData = readTags(file, tiffOffset, tiffOffset + tags.ExifIFDPointer, ExifTags, bigEnd);
            for (tag in exifData) {
                switch (tag) {
                    case "LightSource" :
                    case "Flash" :
                    case "MeteringMode" :
                    case "ExposureProgram" :
                    case "SensingMethod" :
                    case "SceneCaptureType" :
                    case "SceneType" :
                    case "CustomRendered" :
                    case "WhiteBalance" :
                    case "GainControl" :
                    case "Contrast" :
                    case "Saturation" :
                    case "Sharpness" :
                    case "SubjectDistanceRange" :
                    case "FileSource" :
                        exifData[tag] = StringValues[tag][exifData[tag]];
                        break;

                    case "ExifVersion" :
                    case "FlashpixVersion" :
                        exifData[tag] = String.fromCharCode(exifData[tag][0], exifData[tag][1], exifData[tag][2], exifData[tag][3]);
                        break;

                    case "ComponentsConfiguration" :
                        exifData[tag] =
                            StringValues.Components[exifData[tag][0]] +
                            StringValues.Components[exifData[tag][1]] +
                            StringValues.Components[exifData[tag][2]] +
                            StringValues.Components[exifData[tag][3]];
                        break;
                }
                tags[tag] = exifData[tag];
            }
        }

        if (tags.GPSInfoIFDPointer) {
            gpsData = readTags(file, tiffOffset, tiffOffset + tags.GPSInfoIFDPointer, GPSTags, bigEnd);
            for (tag in gpsData) {
                switch (tag) {
                    case "GPSVersionID" :
                        gpsData[tag] = gpsData[tag][0] +
                            "." + gpsData[tag][1] +
                            "." + gpsData[tag][2] +
                            "." + gpsData[tag][3];
                        break;
                }
                tags[tag] = gpsData[tag];
            }
        }

        return tags;
    }

    EXIF.getData = function(img, callback) {
        if ((img instanceof Image || img instanceof HTMLImageElement) && !img.complete) return false;

        if (!imageHasData(img)) {
            getImageData(img, callback);
        } else {
            if (callback) {
                callback.call(img);
            }
        }
        return true;
    }

    EXIF.getTag = function(img, tag) {
        if (!imageHasData(img)) return;
        return img.exifdata[tag];
    }

    EXIF.getAllTags = function(img) {
        if (!imageHasData(img)) return {};
        var a,
            data = img.exifdata,
            tags = {};
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                tags[a] = data[a];
            }
        }
        return tags;
    }

    EXIF.pretty = function(img) {
        if (!imageHasData(img)) return "";
        var a,
            data = img.exifdata,
            strPretty = "";
        for (a in data) {
            if (data.hasOwnProperty(a)) {
                if (typeof data[a] == "object") {
                    if (data[a] instanceof Number) {
                        strPretty += a + " : " + data[a] + " [" + data[a].numerator + "/" + data[a].denominator + "]\r\n";
                    } else {
                        strPretty += a + " : [" + data[a].length + " values]\r\n";
                    }
                } else {
                    strPretty += a + " : " + data[a] + "\r\n";
                }
            }
        }
        return strPretty;
    }

    EXIF.readFromBinaryFile = function(file) {
        return findEXIFinJPEG(file);
    }

    if (typeof define === 'function' && define.amd) {
        define('exif-js', [], function() {
            return EXIF;
        });
    }
}.call(this));


},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL3Zhci93d3cvaHRtbC9leGlmL2FwcC9HZW9VdGlscy5qcyIsIi92YXIvd3d3L2h0bWwvZXhpZi9hcHAvaW5kZXguanMiLCJub2RlX21vZHVsZXMvZXhpZi1qcy9leGlmLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7OztJQ0dxQixRQUFRO1dBQVIsUUFBUTswQkFBUixRQUFROzs7ZUFBUixRQUFROzs7Ozs7V0FLWixrQkFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUU7QUFDdEQsVUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUMxRSxVQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDOztBQUU5RSxhQUFPLEVBQUUsR0FBRyxFQUFILEdBQUcsRUFBRSxHQUFHLEVBQUgsR0FBRyxFQUFFLENBQUM7S0FDckI7Ozs7Ozs7V0FLb0Isd0JBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFO0FBQzFELFVBQUksRUFBRSxHQUFHLE9BQU8sR0FBSSxPQUFPLEdBQUcsRUFBRSxBQUFDLEdBQUksT0FBTyxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUEsQUFBQyxBQUFDLENBQUM7QUFDMUQsUUFBRSxHQUFHLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQzs7QUFFcEIsVUFBSSxTQUFTLEtBQUssR0FBRyxJQUFJLFNBQVMsS0FBSyxHQUFHLEVBQUU7QUFDMUMsVUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO09BQ1Y7O0FBRUQsYUFBTyxFQUFFLENBQUM7S0FDWDs7O1NBeEJrQixRQUFROzs7cUJBQVIsUUFBUTs7Ozs7Ozs7c0JDSFosU0FBUzs7Ozt3QkFDTCxZQUFZOzs7O0FBRWpDLFFBQVEsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUMsUUFBUSxHQUFHLFVBQVMsQ0FBQyxFQUFFO0FBQzNELHNCQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxZQUFXOzJCQUM0QixvQkFBSyxVQUFVLENBQUMsSUFBSSxDQUFDOztRQUFwRixXQUFXLG9CQUFYLFdBQVc7UUFBRSxjQUFjLG9CQUFkLGNBQWM7UUFBRSxZQUFZLG9CQUFaLFlBQVk7UUFBRSxlQUFlLG9CQUFmLGVBQWU7O0FBRWhFLFFBQUksV0FBVyxJQUFJLGNBQWMsSUFBSSxZQUFZLElBQUksZUFBZSxFQUFFOytCQUNqRCxzQkFBUyxRQUFRLENBQUMsV0FBVyxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsZUFBZSxDQUFDOztVQUExRixHQUFHLHNCQUFILEdBQUc7VUFBRSxHQUFHLHNCQUFILEdBQUc7O0FBQ2QsVUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFBRSxnQkFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtPQUFFLENBQUMsQ0FBQztLQUNqRyxNQUFNO0FBQ0wsV0FBSyxDQUFDLHFGQUFxRixDQUFDLENBQUM7S0FDOUY7R0FDRixDQUFDLENBQUM7Q0FDSixDQUFBOzs7OztBQUtELFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFO0FBQy9CLEdBQUMsQ0FBQyxNQUFNLENBQUMsV0FBVyxHQUFHLDRHQUE0RyxDQUFDO0FBQ3BJLE1BQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDOztBQUVoRCxNQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFakQsTUFBSSxPQUFPLEdBQUcsQ0FBQztBQUNiLFFBQUksRUFBRSxTQUFTO0FBQ2YsY0FBVSxFQUFFO0FBQ1YsWUFBTSxFQUFFLE9BQU87QUFDZixtQkFBYSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQztLQUMxQjtBQUNELGdCQUFZLEVBQUU7QUFDWixvQkFBYyxFQUFFLFNBQVM7QUFDekIsbUJBQWEsRUFBRSxPQUFPO0FBQ3RCLGFBQU8sRUFBRSxHQUFHO0tBQ2I7R0FDRixDQUFDLENBQUM7O0FBRUgsU0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBUyxDQUFDLEVBQUU7QUFDakMsUUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUNyQixRQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQzdCLFFBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFBOzs7QUFHcEMsUUFBSSxZQUFZLHdDQUFtQyxLQUFLLDhCQUF3QixDQUFDOzs7QUFHakYsVUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUU7QUFDN0IsaUJBQVcsRUFBRSxLQUFLO0FBQ2xCLGNBQVEsRUFBRSxHQUFHO0tBQ2QsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDOzs7QUFHSCxTQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUU1QixLQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzVCOzs7OztBQUtELFNBQVMsT0FBTyxDQUFDLEtBQUssRUFBRTtBQUN0QixNQUFJLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNqQyxRQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO0FBQzlCLFVBQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVyQyxXQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMzQyxZQUFNLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztLQUN6QixDQUFDLENBQUM7R0FDSjtDQUNGOzs7QUN2RUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIGdlb1V0aWxzIC0gR2VvZ3JhcGhpYyBmdW5jdGlvbnNcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2VvVXRpbHMge1xuXG4gIC8qKlxuICAgKiBETVMgLSBEZWdyZWVzLCBNaW51dGVzLCBTZWNvbmRzXG4gICAqL1xuICBzdGF0aWMgcGFyc2VETVMoZ3BzTGF0LCBncHNMYXRSZWYsIGdwc0xvbmcsIGdwc0xvbmdSZWYpIHtcbiAgICBsZXQgbGF0ID0gdGhpcy5jb252ZXJ0RE1TVG9ERChncHNMYXRbMF0sIGdwc0xhdFsxXSwgZ3BzTGF0WzJdLCBncHNMYXRSZWYpO1xuICAgIGxldCBsbmcgPSB0aGlzLmNvbnZlcnRETVNUb0REKGdwc0xvbmdbMF0sIGdwc0xvbmdbMV0sIGdwc0xvbmdbMl0sIGdwc0xvbmdSZWYpO1xuXG4gICAgcmV0dXJuIHsgbGF0LCBsbmcgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBERCAtIERlY2ltYWwgRGVncmVlc1xuICAgKi9cbiAgc3RhdGljIGNvbnZlcnRETVNUb0REKGRlZ3JlZXMsIG1pbnV0ZXMsIHNlY29uZHMsIGRpcmVjdGlvbikge1xuICAgIGxldCBkZCA9IGRlZ3JlZXMgKyAobWludXRlcyAvIDYwKSArIChzZWNvbmRzIC8gKDYwICogNjApKTtcbiAgICBkZCA9IHBhcnNlRmxvYXQoZGQpO1xuXG4gICAgaWYgKGRpcmVjdGlvbiA9PT0gXCJTXCIgfHwgZGlyZWN0aW9uID09PSBcIldcIikge1xuICAgICAgZGQgKj0gLTE7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRkO1xuICB9XG59XG4iLCJpbXBvcnQgRVhJRiBmcm9tIFwiZXhpZi1qc1wiO1xuaW1wb3J0IEdlb1V0aWxzIGZyb20gXCIuL0dlb1V0aWxzXCI7XG5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmlsZS1pbnB1dFwiKS5vbmNoYW5nZSA9IGZ1bmN0aW9uKGUpIHtcbiAgRVhJRi5nZXREYXRhKGUudGFyZ2V0LmZpbGVzWzBdLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgeyBHUFNMYXRpdHVkZSwgR1BTTGF0aXR1ZGVSZWYsIEdQU0xvbmdpdHVkZSwgR1BTTG9uZ2l0dWRlUmVmIH0gPSBFWElGLmdldEFsbFRhZ3ModGhpcyk7XG5cbiAgICBpZiAoR1BTTGF0aXR1ZGUgJiYgR1BTTGF0aXR1ZGVSZWYgJiYgR1BTTG9uZ2l0dWRlICYmIEdQU0xvbmdpdHVkZVJlZikge1xuICAgICAgdmFyIHsgbGF0LCBsbmcgfSA9IEdlb1V0aWxzLnBhcnNlRE1TKEdQU0xhdGl0dWRlLCBHUFNMYXRpdHVkZVJlZiwgR1BTTG9uZ2l0dWRlLCBHUFNMb25naXR1ZGVSZWYpO1xuICAgICAgdmFyIGltZ1VSTCA9IHJlYWRVUkwoZS50YXJnZXQpLnRoZW4ocmVzcG9uc2UgPT4geyBidWlsZE1hcChyZXNwb25zZS50YXJnZXQucmVzdWx0LCBsYXQsIGxuZykgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFsZXJ0KFwiTm8gZXhpZiBpbmZvcm1hdGlvbiBmb3VuZC4gUGxlYXNlIGNoZWNrIGV4aWYgdGFncyBvbiB0aGF0IGltYWdlIG9yIHRyeSBhbm90aGVyIG9uZS5cIik7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBCdWlsZCBtYXAgd2l0aCBNYXBCb3gsIGNyZWF0ZSBhIG1hcmtlciB3aXRoIHRoZSBnaXZlbiBpbWFnZSBpbiB0aGUgZXhpZiBnZW9sb2NhdGlvblxuICovXG5mdW5jdGlvbiBidWlsZE1hcChpbWcsIGxhdCwgbG5nKSB7XG4gIEwubWFwYm94LmFjY2Vzc1Rva2VuID0gXCJway5leUoxSWpvaVltVnlibUZ5Wkc5a2FXRnpZeUlzSW1FaU9pSmxaR0ZpWm1Vd09UVXpaR001TVdJd09UZ3dNRGhtWTJaa01HSmxNelExT0NKOS50UjQwZzZEVE9zVHlpMTAxbXhTV0pnXCI7XG4gIHZhciBtYXAgPSBMLm1hcGJveC5tYXAoXCJtYXBcIiwgXCJtYXBib3guc3RyZWV0c1wiKTtcblxuICB2YXIgbXlMYXllciA9IEwubWFwYm94LmZlYXR1cmVMYXllcigpLmFkZFRvKG1hcCk7XG5cbiAgdmFyIGdlb0pzb24gPSBbe1xuICAgIHR5cGU6IFwiRmVhdHVyZVwiLFxuICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgIFwiY29vcmRpbmF0ZXNcIjogW2xuZywgbGF0XVxuICAgIH0sXG4gICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgIFwibWFya2VyLWNvbG9yXCI6IFwiIzNjNGU1YVwiLFxuICAgICAgXCJtYXJrZXItc2l6ZVwiOiBcImxhcmdlXCIsXG4gICAgICBcImltYWdlXCI6IGltZ1xuICAgIH1cbiAgfV07XG5cbiAgbXlMYXllci5vbihcImxheWVyYWRkXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICB2YXIgbWFya2VyID0gZS5sYXllcjtcbiAgICB2YXIgZmVhdHVyZSA9IG1hcmtlci5mZWF0dXJlO1xuICAgIHZhciBpbWFnZSA9IGZlYXR1cmUucHJvcGVydGllcy5pbWFnZVxuXG4gICAgLy8gQ3JlYXRlIGN1c3RvbSBwb3B1cCBjb250ZW50XG4gICAgdmFyIHBvcHVwQ29udGVudCA9IGA8ZGl2IGNsYXNzPVwicG9wdXBcIj48aW1nIHNyYz1cIiR7aW1hZ2V9XCIgd2lkdGg9XCIzMDBcIiAvPjwvZGl2PmA7XG5cbiAgICAvLyBodHRwOi8vbGVhZmxldGpzLmNvbS9yZWZlcmVuY2UuaHRtbCNwb3B1cFxuICAgIG1hcmtlci5iaW5kUG9wdXAocG9wdXBDb250ZW50LCB7XG4gICAgICBjbG9zZUJ1dHRvbjogZmFsc2UsXG4gICAgICBtaW5XaWR0aDogMzIwXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIEFkZCBmZWF0dXJlcyB0byB0aGUgbWFwXG4gIG15TGF5ZXIuc2V0R2VvSlNPTihnZW9Kc29uKTtcblxuICBtYXAuc2V0VmlldyhbbGF0LCBsbmddLCA2KTtcbn1cblxuLyoqXG4gKiBSZWFkIGltYWdlIGZpbGVcbiAqL1xuZnVuY3Rpb24gcmVhZFVSTChpbnB1dCkge1xuICBpZiAoaW5wdXQuZmlsZXMgJiYgaW5wdXQuZmlsZXNbMF0pIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICByZWFkZXIucmVhZEFzRGF0YVVSTChpbnB1dC5maWxlc1swXSk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gcmVzb2x2ZTtcbiAgICB9KTtcbiAgfVxufVxuIiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGRlYnVnID0gZmFsc2U7XG5cbiAgICB2YXIgcm9vdCA9IHRoaXM7XG5cbiAgICB2YXIgRVhJRiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRVhJRikgcmV0dXJuIG9iajtcbiAgICAgICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIEVYSUYpKSByZXR1cm4gbmV3IEVYSUYob2JqKTtcbiAgICAgICAgdGhpcy5FWElGd3JhcHBlZCA9IG9iajtcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IEVYSUY7XG4gICAgICAgIH1cbiAgICAgICAgZXhwb3J0cy5FWElGID0gRVhJRjtcbiAgICB9IGVsc2Uge1xuICAgICAgICByb290LkVYSUYgPSBFWElGO1xuICAgIH1cblxuICAgIHZhciBFeGlmVGFncyA9IEVYSUYuVGFncyA9IHtcblxuICAgICAgICAvLyB2ZXJzaW9uIHRhZ3NcbiAgICAgICAgMHg5MDAwIDogXCJFeGlmVmVyc2lvblwiLCAgICAgICAgICAgICAvLyBFWElGIHZlcnNpb25cbiAgICAgICAgMHhBMDAwIDogXCJGbGFzaHBpeFZlcnNpb25cIiwgICAgICAgICAvLyBGbGFzaHBpeCBmb3JtYXQgdmVyc2lvblxuXG4gICAgICAgIC8vIGNvbG9yc3BhY2UgdGFnc1xuICAgICAgICAweEEwMDEgOiBcIkNvbG9yU3BhY2VcIiwgICAgICAgICAgICAgIC8vIENvbG9yIHNwYWNlIGluZm9ybWF0aW9uIHRhZ1xuXG4gICAgICAgIC8vIGltYWdlIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgMHhBMDAyIDogXCJQaXhlbFhEaW1lbnNpb25cIiwgICAgICAgICAvLyBWYWxpZCB3aWR0aCBvZiBtZWFuaW5nZnVsIGltYWdlXG4gICAgICAgIDB4QTAwMyA6IFwiUGl4ZWxZRGltZW5zaW9uXCIsICAgICAgICAgLy8gVmFsaWQgaGVpZ2h0IG9mIG1lYW5pbmdmdWwgaW1hZ2VcbiAgICAgICAgMHg5MTAxIDogXCJDb21wb25lbnRzQ29uZmlndXJhdGlvblwiLCAvLyBJbmZvcm1hdGlvbiBhYm91dCBjaGFubmVsc1xuICAgICAgICAweDkxMDIgOiBcIkNvbXByZXNzZWRCaXRzUGVyUGl4ZWxcIiwgIC8vIENvbXByZXNzZWQgYml0cyBwZXIgcGl4ZWxcblxuICAgICAgICAvLyB1c2VyIGluZm9ybWF0aW9uXG4gICAgICAgIDB4OTI3QyA6IFwiTWFrZXJOb3RlXCIsICAgICAgICAgICAgICAgLy8gQW55IGRlc2lyZWQgaW5mb3JtYXRpb24gd3JpdHRlbiBieSB0aGUgbWFudWZhY3R1cmVyXG4gICAgICAgIDB4OTI4NiA6IFwiVXNlckNvbW1lbnRcIiwgICAgICAgICAgICAgLy8gQ29tbWVudHMgYnkgdXNlclxuXG4gICAgICAgIC8vIHJlbGF0ZWQgZmlsZVxuICAgICAgICAweEEwMDQgOiBcIlJlbGF0ZWRTb3VuZEZpbGVcIiwgICAgICAgIC8vIE5hbWUgb2YgcmVsYXRlZCBzb3VuZCBmaWxlXG5cbiAgICAgICAgLy8gZGF0ZSBhbmQgdGltZVxuICAgICAgICAweDkwMDMgOiBcIkRhdGVUaW1lT3JpZ2luYWxcIiwgICAgICAgIC8vIERhdGUgYW5kIHRpbWUgd2hlbiB0aGUgb3JpZ2luYWwgaW1hZ2Ugd2FzIGdlbmVyYXRlZFxuICAgICAgICAweDkwMDQgOiBcIkRhdGVUaW1lRGlnaXRpemVkXCIsICAgICAgIC8vIERhdGUgYW5kIHRpbWUgd2hlbiB0aGUgaW1hZ2Ugd2FzIHN0b3JlZCBkaWdpdGFsbHlcbiAgICAgICAgMHg5MjkwIDogXCJTdWJzZWNUaW1lXCIsICAgICAgICAgICAgICAvLyBGcmFjdGlvbnMgb2Ygc2Vjb25kcyBmb3IgRGF0ZVRpbWVcbiAgICAgICAgMHg5MjkxIDogXCJTdWJzZWNUaW1lT3JpZ2luYWxcIiwgICAgICAvLyBGcmFjdGlvbnMgb2Ygc2Vjb25kcyBmb3IgRGF0ZVRpbWVPcmlnaW5hbFxuICAgICAgICAweDkyOTIgOiBcIlN1YnNlY1RpbWVEaWdpdGl6ZWRcIiwgICAgIC8vIEZyYWN0aW9ucyBvZiBzZWNvbmRzIGZvciBEYXRlVGltZURpZ2l0aXplZFxuXG4gICAgICAgIC8vIHBpY3R1cmUtdGFraW5nIGNvbmRpdGlvbnNcbiAgICAgICAgMHg4MjlBIDogXCJFeHBvc3VyZVRpbWVcIiwgICAgICAgICAgICAvLyBFeHBvc3VyZSB0aW1lIChpbiBzZWNvbmRzKVxuICAgICAgICAweDgyOUQgOiBcIkZOdW1iZXJcIiwgICAgICAgICAgICAgICAgIC8vIEYgbnVtYmVyXG4gICAgICAgIDB4ODgyMiA6IFwiRXhwb3N1cmVQcm9ncmFtXCIsICAgICAgICAgLy8gRXhwb3N1cmUgcHJvZ3JhbVxuICAgICAgICAweDg4MjQgOiBcIlNwZWN0cmFsU2Vuc2l0aXZpdHlcIiwgICAgIC8vIFNwZWN0cmFsIHNlbnNpdGl2aXR5XG4gICAgICAgIDB4ODgyNyA6IFwiSVNPU3BlZWRSYXRpbmdzXCIsICAgICAgICAgLy8gSVNPIHNwZWVkIHJhdGluZ1xuICAgICAgICAweDg4MjggOiBcIk9FQ0ZcIiwgICAgICAgICAgICAgICAgICAgIC8vIE9wdG9lbGVjdHJpYyBjb252ZXJzaW9uIGZhY3RvclxuICAgICAgICAweDkyMDEgOiBcIlNodXR0ZXJTcGVlZFZhbHVlXCIsICAgICAgIC8vIFNodXR0ZXIgc3BlZWRcbiAgICAgICAgMHg5MjAyIDogXCJBcGVydHVyZVZhbHVlXCIsICAgICAgICAgICAvLyBMZW5zIGFwZXJ0dXJlXG4gICAgICAgIDB4OTIwMyA6IFwiQnJpZ2h0bmVzc1ZhbHVlXCIsICAgICAgICAgLy8gVmFsdWUgb2YgYnJpZ2h0bmVzc1xuICAgICAgICAweDkyMDQgOiBcIkV4cG9zdXJlQmlhc1wiLCAgICAgICAgICAgIC8vIEV4cG9zdXJlIGJpYXNcbiAgICAgICAgMHg5MjA1IDogXCJNYXhBcGVydHVyZVZhbHVlXCIsICAgICAgICAvLyBTbWFsbGVzdCBGIG51bWJlciBvZiBsZW5zXG4gICAgICAgIDB4OTIwNiA6IFwiU3ViamVjdERpc3RhbmNlXCIsICAgICAgICAgLy8gRGlzdGFuY2UgdG8gc3ViamVjdCBpbiBtZXRlcnNcbiAgICAgICAgMHg5MjA3IDogXCJNZXRlcmluZ01vZGVcIiwgICAgICAgICAgICAvLyBNZXRlcmluZyBtb2RlXG4gICAgICAgIDB4OTIwOCA6IFwiTGlnaHRTb3VyY2VcIiwgICAgICAgICAgICAgLy8gS2luZCBvZiBsaWdodCBzb3VyY2VcbiAgICAgICAgMHg5MjA5IDogXCJGbGFzaFwiLCAgICAgICAgICAgICAgICAgICAvLyBGbGFzaCBzdGF0dXNcbiAgICAgICAgMHg5MjE0IDogXCJTdWJqZWN0QXJlYVwiLCAgICAgICAgICAgICAvLyBMb2NhdGlvbiBhbmQgYXJlYSBvZiBtYWluIHN1YmplY3RcbiAgICAgICAgMHg5MjBBIDogXCJGb2NhbExlbmd0aFwiLCAgICAgICAgICAgICAvLyBGb2NhbCBsZW5ndGggb2YgdGhlIGxlbnMgaW4gbW1cbiAgICAgICAgMHhBMjBCIDogXCJGbGFzaEVuZXJneVwiLCAgICAgICAgICAgICAvLyBTdHJvYmUgZW5lcmd5IGluIEJDUFNcbiAgICAgICAgMHhBMjBDIDogXCJTcGF0aWFsRnJlcXVlbmN5UmVzcG9uc2VcIiwgICAgLy9cbiAgICAgICAgMHhBMjBFIDogXCJGb2NhbFBsYW5lWFJlc29sdXRpb25cIiwgICAvLyBOdW1iZXIgb2YgcGl4ZWxzIGluIHdpZHRoIGRpcmVjdGlvbiBwZXIgRm9jYWxQbGFuZVJlc29sdXRpb25Vbml0XG4gICAgICAgIDB4QTIwRiA6IFwiRm9jYWxQbGFuZVlSZXNvbHV0aW9uXCIsICAgLy8gTnVtYmVyIG9mIHBpeGVscyBpbiBoZWlnaHQgZGlyZWN0aW9uIHBlciBGb2NhbFBsYW5lUmVzb2x1dGlvblVuaXRcbiAgICAgICAgMHhBMjEwIDogXCJGb2NhbFBsYW5lUmVzb2x1dGlvblVuaXRcIiwgICAgLy8gVW5pdCBmb3IgbWVhc3VyaW5nIEZvY2FsUGxhbmVYUmVzb2x1dGlvbiBhbmQgRm9jYWxQbGFuZVlSZXNvbHV0aW9uXG4gICAgICAgIDB4QTIxNCA6IFwiU3ViamVjdExvY2F0aW9uXCIsICAgICAgICAgLy8gTG9jYXRpb24gb2Ygc3ViamVjdCBpbiBpbWFnZVxuICAgICAgICAweEEyMTUgOiBcIkV4cG9zdXJlSW5kZXhcIiwgICAgICAgICAgIC8vIEV4cG9zdXJlIGluZGV4IHNlbGVjdGVkIG9uIGNhbWVyYVxuICAgICAgICAweEEyMTcgOiBcIlNlbnNpbmdNZXRob2RcIiwgICAgICAgICAgIC8vIEltYWdlIHNlbnNvciB0eXBlXG4gICAgICAgIDB4QTMwMCA6IFwiRmlsZVNvdXJjZVwiLCAgICAgICAgICAgICAgLy8gSW1hZ2Ugc291cmNlICgzID09IERTQylcbiAgICAgICAgMHhBMzAxIDogXCJTY2VuZVR5cGVcIiwgICAgICAgICAgICAgICAvLyBTY2VuZSB0eXBlICgxID09IGRpcmVjdGx5IHBob3RvZ3JhcGhlZClcbiAgICAgICAgMHhBMzAyIDogXCJDRkFQYXR0ZXJuXCIsICAgICAgICAgICAgICAvLyBDb2xvciBmaWx0ZXIgYXJyYXkgZ2VvbWV0cmljIHBhdHRlcm5cbiAgICAgICAgMHhBNDAxIDogXCJDdXN0b21SZW5kZXJlZFwiLCAgICAgICAgICAvLyBTcGVjaWFsIHByb2Nlc3NpbmdcbiAgICAgICAgMHhBNDAyIDogXCJFeHBvc3VyZU1vZGVcIiwgICAgICAgICAgICAvLyBFeHBvc3VyZSBtb2RlXG4gICAgICAgIDB4QTQwMyA6IFwiV2hpdGVCYWxhbmNlXCIsICAgICAgICAgICAgLy8gMSA9IGF1dG8gd2hpdGUgYmFsYW5jZSwgMiA9IG1hbnVhbFxuICAgICAgICAweEE0MDQgOiBcIkRpZ2l0YWxab29tUmF0aW9uXCIsICAgICAgIC8vIERpZ2l0YWwgem9vbSByYXRpb1xuICAgICAgICAweEE0MDUgOiBcIkZvY2FsTGVuZ3RoSW4zNW1tRmlsbVwiLCAgIC8vIEVxdWl2YWxlbnQgZm9hY2wgbGVuZ3RoIGFzc3VtaW5nIDM1bW0gZmlsbSBjYW1lcmEgKGluIG1tKVxuICAgICAgICAweEE0MDYgOiBcIlNjZW5lQ2FwdHVyZVR5cGVcIiwgICAgICAgIC8vIFR5cGUgb2Ygc2NlbmVcbiAgICAgICAgMHhBNDA3IDogXCJHYWluQ29udHJvbFwiLCAgICAgICAgICAgICAvLyBEZWdyZWUgb2Ygb3ZlcmFsbCBpbWFnZSBnYWluIGFkanVzdG1lbnRcbiAgICAgICAgMHhBNDA4IDogXCJDb250cmFzdFwiLCAgICAgICAgICAgICAgICAvLyBEaXJlY3Rpb24gb2YgY29udHJhc3QgcHJvY2Vzc2luZyBhcHBsaWVkIGJ5IGNhbWVyYVxuICAgICAgICAweEE0MDkgOiBcIlNhdHVyYXRpb25cIiwgICAgICAgICAgICAgIC8vIERpcmVjdGlvbiBvZiBzYXR1cmF0aW9uIHByb2Nlc3NpbmcgYXBwbGllZCBieSBjYW1lcmFcbiAgICAgICAgMHhBNDBBIDogXCJTaGFycG5lc3NcIiwgICAgICAgICAgICAgICAvLyBEaXJlY3Rpb24gb2Ygc2hhcnBuZXNzIHByb2Nlc3NpbmcgYXBwbGllZCBieSBjYW1lcmFcbiAgICAgICAgMHhBNDBCIDogXCJEZXZpY2VTZXR0aW5nRGVzY3JpcHRpb25cIiwgICAgLy9cbiAgICAgICAgMHhBNDBDIDogXCJTdWJqZWN0RGlzdGFuY2VSYW5nZVwiLCAgICAvLyBEaXN0YW5jZSB0byBzdWJqZWN0XG5cbiAgICAgICAgLy8gb3RoZXIgdGFnc1xuICAgICAgICAweEEwMDUgOiBcIkludGVyb3BlcmFiaWxpdHlJRkRQb2ludGVyXCIsXG4gICAgICAgIDB4QTQyMCA6IFwiSW1hZ2VVbmlxdWVJRFwiICAgICAgICAgICAgLy8gSWRlbnRpZmllciBhc3NpZ25lZCB1bmlxdWVseSB0byBlYWNoIGltYWdlXG4gICAgfTtcblxuICAgIHZhciBUaWZmVGFncyA9IEVYSUYuVGlmZlRhZ3MgPSB7XG4gICAgICAgIDB4MDEwMCA6IFwiSW1hZ2VXaWR0aFwiLFxuICAgICAgICAweDAxMDEgOiBcIkltYWdlSGVpZ2h0XCIsXG4gICAgICAgIDB4ODc2OSA6IFwiRXhpZklGRFBvaW50ZXJcIixcbiAgICAgICAgMHg4ODI1IDogXCJHUFNJbmZvSUZEUG9pbnRlclwiLFxuICAgICAgICAweEEwMDUgOiBcIkludGVyb3BlcmFiaWxpdHlJRkRQb2ludGVyXCIsXG4gICAgICAgIDB4MDEwMiA6IFwiQml0c1BlclNhbXBsZVwiLFxuICAgICAgICAweDAxMDMgOiBcIkNvbXByZXNzaW9uXCIsXG4gICAgICAgIDB4MDEwNiA6IFwiUGhvdG9tZXRyaWNJbnRlcnByZXRhdGlvblwiLFxuICAgICAgICAweDAxMTIgOiBcIk9yaWVudGF0aW9uXCIsXG4gICAgICAgIDB4MDExNSA6IFwiU2FtcGxlc1BlclBpeGVsXCIsXG4gICAgICAgIDB4MDExQyA6IFwiUGxhbmFyQ29uZmlndXJhdGlvblwiLFxuICAgICAgICAweDAyMTIgOiBcIllDYkNyU3ViU2FtcGxpbmdcIixcbiAgICAgICAgMHgwMjEzIDogXCJZQ2JDclBvc2l0aW9uaW5nXCIsXG4gICAgICAgIDB4MDExQSA6IFwiWFJlc29sdXRpb25cIixcbiAgICAgICAgMHgwMTFCIDogXCJZUmVzb2x1dGlvblwiLFxuICAgICAgICAweDAxMjggOiBcIlJlc29sdXRpb25Vbml0XCIsXG4gICAgICAgIDB4MDExMSA6IFwiU3RyaXBPZmZzZXRzXCIsXG4gICAgICAgIDB4MDExNiA6IFwiUm93c1BlclN0cmlwXCIsXG4gICAgICAgIDB4MDExNyA6IFwiU3RyaXBCeXRlQ291bnRzXCIsXG4gICAgICAgIDB4MDIwMSA6IFwiSlBFR0ludGVyY2hhbmdlRm9ybWF0XCIsXG4gICAgICAgIDB4MDIwMiA6IFwiSlBFR0ludGVyY2hhbmdlRm9ybWF0TGVuZ3RoXCIsXG4gICAgICAgIDB4MDEyRCA6IFwiVHJhbnNmZXJGdW5jdGlvblwiLFxuICAgICAgICAweDAxM0UgOiBcIldoaXRlUG9pbnRcIixcbiAgICAgICAgMHgwMTNGIDogXCJQcmltYXJ5Q2hyb21hdGljaXRpZXNcIixcbiAgICAgICAgMHgwMjExIDogXCJZQ2JDckNvZWZmaWNpZW50c1wiLFxuICAgICAgICAweDAyMTQgOiBcIlJlZmVyZW5jZUJsYWNrV2hpdGVcIixcbiAgICAgICAgMHgwMTMyIDogXCJEYXRlVGltZVwiLFxuICAgICAgICAweDAxMEUgOiBcIkltYWdlRGVzY3JpcHRpb25cIixcbiAgICAgICAgMHgwMTBGIDogXCJNYWtlXCIsXG4gICAgICAgIDB4MDExMCA6IFwiTW9kZWxcIixcbiAgICAgICAgMHgwMTMxIDogXCJTb2Z0d2FyZVwiLFxuICAgICAgICAweDAxM0IgOiBcIkFydGlzdFwiLFxuICAgICAgICAweDgyOTggOiBcIkNvcHlyaWdodFwiXG4gICAgfTtcblxuICAgIHZhciBHUFNUYWdzID0gRVhJRi5HUFNUYWdzID0ge1xuICAgICAgICAweDAwMDAgOiBcIkdQU1ZlcnNpb25JRFwiLFxuICAgICAgICAweDAwMDEgOiBcIkdQU0xhdGl0dWRlUmVmXCIsXG4gICAgICAgIDB4MDAwMiA6IFwiR1BTTGF0aXR1ZGVcIixcbiAgICAgICAgMHgwMDAzIDogXCJHUFNMb25naXR1ZGVSZWZcIixcbiAgICAgICAgMHgwMDA0IDogXCJHUFNMb25naXR1ZGVcIixcbiAgICAgICAgMHgwMDA1IDogXCJHUFNBbHRpdHVkZVJlZlwiLFxuICAgICAgICAweDAwMDYgOiBcIkdQU0FsdGl0dWRlXCIsXG4gICAgICAgIDB4MDAwNyA6IFwiR1BTVGltZVN0YW1wXCIsXG4gICAgICAgIDB4MDAwOCA6IFwiR1BTU2F0ZWxsaXRlc1wiLFxuICAgICAgICAweDAwMDkgOiBcIkdQU1N0YXR1c1wiLFxuICAgICAgICAweDAwMEEgOiBcIkdQU01lYXN1cmVNb2RlXCIsXG4gICAgICAgIDB4MDAwQiA6IFwiR1BTRE9QXCIsXG4gICAgICAgIDB4MDAwQyA6IFwiR1BTU3BlZWRSZWZcIixcbiAgICAgICAgMHgwMDBEIDogXCJHUFNTcGVlZFwiLFxuICAgICAgICAweDAwMEUgOiBcIkdQU1RyYWNrUmVmXCIsXG4gICAgICAgIDB4MDAwRiA6IFwiR1BTVHJhY2tcIixcbiAgICAgICAgMHgwMDEwIDogXCJHUFNJbWdEaXJlY3Rpb25SZWZcIixcbiAgICAgICAgMHgwMDExIDogXCJHUFNJbWdEaXJlY3Rpb25cIixcbiAgICAgICAgMHgwMDEyIDogXCJHUFNNYXBEYXR1bVwiLFxuICAgICAgICAweDAwMTMgOiBcIkdQU0Rlc3RMYXRpdHVkZVJlZlwiLFxuICAgICAgICAweDAwMTQgOiBcIkdQU0Rlc3RMYXRpdHVkZVwiLFxuICAgICAgICAweDAwMTUgOiBcIkdQU0Rlc3RMb25naXR1ZGVSZWZcIixcbiAgICAgICAgMHgwMDE2IDogXCJHUFNEZXN0TG9uZ2l0dWRlXCIsXG4gICAgICAgIDB4MDAxNyA6IFwiR1BTRGVzdEJlYXJpbmdSZWZcIixcbiAgICAgICAgMHgwMDE4IDogXCJHUFNEZXN0QmVhcmluZ1wiLFxuICAgICAgICAweDAwMTkgOiBcIkdQU0Rlc3REaXN0YW5jZVJlZlwiLFxuICAgICAgICAweDAwMUEgOiBcIkdQU0Rlc3REaXN0YW5jZVwiLFxuICAgICAgICAweDAwMUIgOiBcIkdQU1Byb2Nlc3NpbmdNZXRob2RcIixcbiAgICAgICAgMHgwMDFDIDogXCJHUFNBcmVhSW5mb3JtYXRpb25cIixcbiAgICAgICAgMHgwMDFEIDogXCJHUFNEYXRlU3RhbXBcIixcbiAgICAgICAgMHgwMDFFIDogXCJHUFNEaWZmZXJlbnRpYWxcIlxuICAgIH07XG5cbiAgICB2YXIgU3RyaW5nVmFsdWVzID0gRVhJRi5TdHJpbmdWYWx1ZXMgPSB7XG4gICAgICAgIEV4cG9zdXJlUHJvZ3JhbSA6IHtcbiAgICAgICAgICAgIDAgOiBcIk5vdCBkZWZpbmVkXCIsXG4gICAgICAgICAgICAxIDogXCJNYW51YWxcIixcbiAgICAgICAgICAgIDIgOiBcIk5vcm1hbCBwcm9ncmFtXCIsXG4gICAgICAgICAgICAzIDogXCJBcGVydHVyZSBwcmlvcml0eVwiLFxuICAgICAgICAgICAgNCA6IFwiU2h1dHRlciBwcmlvcml0eVwiLFxuICAgICAgICAgICAgNSA6IFwiQ3JlYXRpdmUgcHJvZ3JhbVwiLFxuICAgICAgICAgICAgNiA6IFwiQWN0aW9uIHByb2dyYW1cIixcbiAgICAgICAgICAgIDcgOiBcIlBvcnRyYWl0IG1vZGVcIixcbiAgICAgICAgICAgIDggOiBcIkxhbmRzY2FwZSBtb2RlXCJcbiAgICAgICAgfSxcbiAgICAgICAgTWV0ZXJpbmdNb2RlIDoge1xuICAgICAgICAgICAgMCA6IFwiVW5rbm93blwiLFxuICAgICAgICAgICAgMSA6IFwiQXZlcmFnZVwiLFxuICAgICAgICAgICAgMiA6IFwiQ2VudGVyV2VpZ2h0ZWRBdmVyYWdlXCIsXG4gICAgICAgICAgICAzIDogXCJTcG90XCIsXG4gICAgICAgICAgICA0IDogXCJNdWx0aVNwb3RcIixcbiAgICAgICAgICAgIDUgOiBcIlBhdHRlcm5cIixcbiAgICAgICAgICAgIDYgOiBcIlBhcnRpYWxcIixcbiAgICAgICAgICAgIDI1NSA6IFwiT3RoZXJcIlxuICAgICAgICB9LFxuICAgICAgICBMaWdodFNvdXJjZSA6IHtcbiAgICAgICAgICAgIDAgOiBcIlVua25vd25cIixcbiAgICAgICAgICAgIDEgOiBcIkRheWxpZ2h0XCIsXG4gICAgICAgICAgICAyIDogXCJGbHVvcmVzY2VudFwiLFxuICAgICAgICAgICAgMyA6IFwiVHVuZ3N0ZW4gKGluY2FuZGVzY2VudCBsaWdodClcIixcbiAgICAgICAgICAgIDQgOiBcIkZsYXNoXCIsXG4gICAgICAgICAgICA5IDogXCJGaW5lIHdlYXRoZXJcIixcbiAgICAgICAgICAgIDEwIDogXCJDbG91ZHkgd2VhdGhlclwiLFxuICAgICAgICAgICAgMTEgOiBcIlNoYWRlXCIsXG4gICAgICAgICAgICAxMiA6IFwiRGF5bGlnaHQgZmx1b3Jlc2NlbnQgKEQgNTcwMCAtIDcxMDBLKVwiLFxuICAgICAgICAgICAgMTMgOiBcIkRheSB3aGl0ZSBmbHVvcmVzY2VudCAoTiA0NjAwIC0gNTQwMEspXCIsXG4gICAgICAgICAgICAxNCA6IFwiQ29vbCB3aGl0ZSBmbHVvcmVzY2VudCAoVyAzOTAwIC0gNDUwMEspXCIsXG4gICAgICAgICAgICAxNSA6IFwiV2hpdGUgZmx1b3Jlc2NlbnQgKFdXIDMyMDAgLSAzNzAwSylcIixcbiAgICAgICAgICAgIDE3IDogXCJTdGFuZGFyZCBsaWdodCBBXCIsXG4gICAgICAgICAgICAxOCA6IFwiU3RhbmRhcmQgbGlnaHQgQlwiLFxuICAgICAgICAgICAgMTkgOiBcIlN0YW5kYXJkIGxpZ2h0IENcIixcbiAgICAgICAgICAgIDIwIDogXCJENTVcIixcbiAgICAgICAgICAgIDIxIDogXCJENjVcIixcbiAgICAgICAgICAgIDIyIDogXCJENzVcIixcbiAgICAgICAgICAgIDIzIDogXCJENTBcIixcbiAgICAgICAgICAgIDI0IDogXCJJU08gc3R1ZGlvIHR1bmdzdGVuXCIsXG4gICAgICAgICAgICAyNTUgOiBcIk90aGVyXCJcbiAgICAgICAgfSxcbiAgICAgICAgRmxhc2ggOiB7XG4gICAgICAgICAgICAweDAwMDAgOiBcIkZsYXNoIGRpZCBub3QgZmlyZVwiLFxuICAgICAgICAgICAgMHgwMDAxIDogXCJGbGFzaCBmaXJlZFwiLFxuICAgICAgICAgICAgMHgwMDA1IDogXCJTdHJvYmUgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgICAgICAgMHgwMDA3IDogXCJTdHJvYmUgcmV0dXJuIGxpZ2h0IGRldGVjdGVkXCIsXG4gICAgICAgICAgICAweDAwMDkgOiBcIkZsYXNoIGZpcmVkLCBjb21wdWxzb3J5IGZsYXNoIG1vZGVcIixcbiAgICAgICAgICAgIDB4MDAwRCA6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgICAgICAgMHgwMDBGIDogXCJGbGFzaCBmaXJlZCwgY29tcHVsc29yeSBmbGFzaCBtb2RlLCByZXR1cm4gbGlnaHQgZGV0ZWN0ZWRcIixcbiAgICAgICAgICAgIDB4MDAxMCA6IFwiRmxhc2ggZGlkIG5vdCBmaXJlLCBjb21wdWxzb3J5IGZsYXNoIG1vZGVcIixcbiAgICAgICAgICAgIDB4MDAxOCA6IFwiRmxhc2ggZGlkIG5vdCBmaXJlLCBhdXRvIG1vZGVcIixcbiAgICAgICAgICAgIDB4MDAxOSA6IFwiRmxhc2ggZmlyZWQsIGF1dG8gbW9kZVwiLFxuICAgICAgICAgICAgMHgwMDFEIDogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlLCByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkXCIsXG4gICAgICAgICAgICAweDAwMUYgOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGUsIHJldHVybiBsaWdodCBkZXRlY3RlZFwiLFxuICAgICAgICAgICAgMHgwMDIwIDogXCJObyBmbGFzaCBmdW5jdGlvblwiLFxuICAgICAgICAgICAgMHgwMDQxIDogXCJGbGFzaCBmaXJlZCwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZVwiLFxuICAgICAgICAgICAgMHgwMDQ1IDogXCJGbGFzaCBmaXJlZCwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZSwgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgICAgICAgMHgwMDQ3IDogXCJGbGFzaCBmaXJlZCwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZSwgcmV0dXJuIGxpZ2h0IGRldGVjdGVkXCIsXG4gICAgICAgICAgICAweDAwNDkgOiBcIkZsYXNoIGZpcmVkLCBjb21wdWxzb3J5IGZsYXNoIG1vZGUsIHJlZC1leWUgcmVkdWN0aW9uIG1vZGVcIixcbiAgICAgICAgICAgIDB4MDA0RCA6IFwiRmxhc2ggZmlyZWQsIGNvbXB1bHNvcnkgZmxhc2ggbW9kZSwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZSwgcmV0dXJuIGxpZ2h0IG5vdCBkZXRlY3RlZFwiLFxuICAgICAgICAgICAgMHgwMDRGIDogXCJGbGFzaCBmaXJlZCwgY29tcHVsc29yeSBmbGFzaCBtb2RlLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlLCByZXR1cm4gbGlnaHQgZGV0ZWN0ZWRcIixcbiAgICAgICAgICAgIDB4MDA1OSA6IFwiRmxhc2ggZmlyZWQsIGF1dG8gbW9kZSwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZVwiLFxuICAgICAgICAgICAgMHgwMDVEIDogXCJGbGFzaCBmaXJlZCwgYXV0byBtb2RlLCByZXR1cm4gbGlnaHQgbm90IGRldGVjdGVkLCByZWQtZXllIHJlZHVjdGlvbiBtb2RlXCIsXG4gICAgICAgICAgICAweDAwNUYgOiBcIkZsYXNoIGZpcmVkLCBhdXRvIG1vZGUsIHJldHVybiBsaWdodCBkZXRlY3RlZCwgcmVkLWV5ZSByZWR1Y3Rpb24gbW9kZVwiXG4gICAgICAgIH0sXG4gICAgICAgIFNlbnNpbmdNZXRob2QgOiB7XG4gICAgICAgICAgICAxIDogXCJOb3QgZGVmaW5lZFwiLFxuICAgICAgICAgICAgMiA6IFwiT25lLWNoaXAgY29sb3IgYXJlYSBzZW5zb3JcIixcbiAgICAgICAgICAgIDMgOiBcIlR3by1jaGlwIGNvbG9yIGFyZWEgc2Vuc29yXCIsXG4gICAgICAgICAgICA0IDogXCJUaHJlZS1jaGlwIGNvbG9yIGFyZWEgc2Vuc29yXCIsXG4gICAgICAgICAgICA1IDogXCJDb2xvciBzZXF1ZW50aWFsIGFyZWEgc2Vuc29yXCIsXG4gICAgICAgICAgICA3IDogXCJUcmlsaW5lYXIgc2Vuc29yXCIsXG4gICAgICAgICAgICA4IDogXCJDb2xvciBzZXF1ZW50aWFsIGxpbmVhciBzZW5zb3JcIlxuICAgICAgICB9LFxuICAgICAgICBTY2VuZUNhcHR1cmVUeXBlIDoge1xuICAgICAgICAgICAgMCA6IFwiU3RhbmRhcmRcIixcbiAgICAgICAgICAgIDEgOiBcIkxhbmRzY2FwZVwiLFxuICAgICAgICAgICAgMiA6IFwiUG9ydHJhaXRcIixcbiAgICAgICAgICAgIDMgOiBcIk5pZ2h0IHNjZW5lXCJcbiAgICAgICAgfSxcbiAgICAgICAgU2NlbmVUeXBlIDoge1xuICAgICAgICAgICAgMSA6IFwiRGlyZWN0bHkgcGhvdG9ncmFwaGVkXCJcbiAgICAgICAgfSxcbiAgICAgICAgQ3VzdG9tUmVuZGVyZWQgOiB7XG4gICAgICAgICAgICAwIDogXCJOb3JtYWwgcHJvY2Vzc1wiLFxuICAgICAgICAgICAgMSA6IFwiQ3VzdG9tIHByb2Nlc3NcIlxuICAgICAgICB9LFxuICAgICAgICBXaGl0ZUJhbGFuY2UgOiB7XG4gICAgICAgICAgICAwIDogXCJBdXRvIHdoaXRlIGJhbGFuY2VcIixcbiAgICAgICAgICAgIDEgOiBcIk1hbnVhbCB3aGl0ZSBiYWxhbmNlXCJcbiAgICAgICAgfSxcbiAgICAgICAgR2FpbkNvbnRyb2wgOiB7XG4gICAgICAgICAgICAwIDogXCJOb25lXCIsXG4gICAgICAgICAgICAxIDogXCJMb3cgZ2FpbiB1cFwiLFxuICAgICAgICAgICAgMiA6IFwiSGlnaCBnYWluIHVwXCIsXG4gICAgICAgICAgICAzIDogXCJMb3cgZ2FpbiBkb3duXCIsXG4gICAgICAgICAgICA0IDogXCJIaWdoIGdhaW4gZG93blwiXG4gICAgICAgIH0sXG4gICAgICAgIENvbnRyYXN0IDoge1xuICAgICAgICAgICAgMCA6IFwiTm9ybWFsXCIsXG4gICAgICAgICAgICAxIDogXCJTb2Z0XCIsXG4gICAgICAgICAgICAyIDogXCJIYXJkXCJcbiAgICAgICAgfSxcbiAgICAgICAgU2F0dXJhdGlvbiA6IHtcbiAgICAgICAgICAgIDAgOiBcIk5vcm1hbFwiLFxuICAgICAgICAgICAgMSA6IFwiTG93IHNhdHVyYXRpb25cIixcbiAgICAgICAgICAgIDIgOiBcIkhpZ2ggc2F0dXJhdGlvblwiXG4gICAgICAgIH0sXG4gICAgICAgIFNoYXJwbmVzcyA6IHtcbiAgICAgICAgICAgIDAgOiBcIk5vcm1hbFwiLFxuICAgICAgICAgICAgMSA6IFwiU29mdFwiLFxuICAgICAgICAgICAgMiA6IFwiSGFyZFwiXG4gICAgICAgIH0sXG4gICAgICAgIFN1YmplY3REaXN0YW5jZVJhbmdlIDoge1xuICAgICAgICAgICAgMCA6IFwiVW5rbm93blwiLFxuICAgICAgICAgICAgMSA6IFwiTWFjcm9cIixcbiAgICAgICAgICAgIDIgOiBcIkNsb3NlIHZpZXdcIixcbiAgICAgICAgICAgIDMgOiBcIkRpc3RhbnQgdmlld1wiXG4gICAgICAgIH0sXG4gICAgICAgIEZpbGVTb3VyY2UgOiB7XG4gICAgICAgICAgICAzIDogXCJEU0NcIlxuICAgICAgICB9LFxuXG4gICAgICAgIENvbXBvbmVudHMgOiB7XG4gICAgICAgICAgICAwIDogXCJcIixcbiAgICAgICAgICAgIDEgOiBcIllcIixcbiAgICAgICAgICAgIDIgOiBcIkNiXCIsXG4gICAgICAgICAgICAzIDogXCJDclwiLFxuICAgICAgICAgICAgNCA6IFwiUlwiLFxuICAgICAgICAgICAgNSA6IFwiR1wiLFxuICAgICAgICAgICAgNiA6IFwiQlwiXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gYWRkRXZlbnQoZWxlbWVudCwgZXZlbnQsIGhhbmRsZXIpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZWxlbWVudC5hdHRhY2hFdmVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5hdHRhY2hFdmVudChcIm9uXCIgKyBldmVudCwgaGFuZGxlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbWFnZUhhc0RhdGEoaW1nKSB7XG4gICAgICAgIHJldHVybiAhIShpbWcuZXhpZmRhdGEpO1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQsIGNvbnRlbnRUeXBlKSB7XG4gICAgICAgIGNvbnRlbnRUeXBlID0gY29udGVudFR5cGUgfHwgYmFzZTY0Lm1hdGNoKC9eZGF0YVxcOihbXlxcO10rKVxcO2Jhc2U2NCwvbWkpWzFdIHx8ICcnOyAvLyBlLmcuICdkYXRhOmltYWdlL2pwZWc7YmFzZTY0LC4uLicgPT4gJ2ltYWdlL2pwZWcnXG4gICAgICAgIGJhc2U2NCA9IGJhc2U2NC5yZXBsYWNlKC9eZGF0YVxcOihbXlxcO10rKVxcO2Jhc2U2NCwvZ21pLCAnJyk7XG4gICAgICAgIHZhciBiaW5hcnkgPSBhdG9iKGJhc2U2NCk7XG4gICAgICAgIHZhciBsZW4gPSBiaW5hcnkubGVuZ3RoO1xuICAgICAgICB2YXIgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGxlbik7XG4gICAgICAgIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmlld1tpXSA9IGJpbmFyeS5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBidWZmZXI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb2JqZWN0VVJMVG9CbG9iKHVybCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgaHR0cC5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XG4gICAgICAgIGh0dHAucmVzcG9uc2VUeXBlID0gXCJibG9iXCI7XG4gICAgICAgIGh0dHAub25sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RhdHVzID09IDIwMCB8fCB0aGlzLnN0YXR1cyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHRoaXMucmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBodHRwLnNlbmQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRJbWFnZURhdGEoaW1nLCBjYWxsYmFjaykge1xuICAgICAgICBmdW5jdGlvbiBoYW5kbGVCaW5hcnlGaWxlKGJpbkZpbGUpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gZmluZEVYSUZpbkpQRUcoYmluRmlsZSk7XG4gICAgICAgICAgICB2YXIgaXB0Y2RhdGEgPSBmaW5kSVBUQ2luSlBFRyhiaW5GaWxlKTtcbiAgICAgICAgICAgIGltZy5leGlmZGF0YSA9IGRhdGEgfHwge307XG4gICAgICAgICAgICBpbWcuaXB0Y2RhdGEgPSBpcHRjZGF0YSB8fCB7fTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoaW1nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbWcuc3JjKSB7XG4gICAgICAgICAgICBpZiAoL15kYXRhXFw6L2kudGVzdChpbWcuc3JjKSkgeyAvLyBEYXRhIFVSSVxuICAgICAgICAgICAgICAgIHZhciBhcnJheUJ1ZmZlciA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoaW1nLnNyYyk7XG4gICAgICAgICAgICAgICAgaGFuZGxlQmluYXJ5RmlsZShhcnJheUJ1ZmZlcik7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoL15ibG9iXFw6L2kudGVzdChpbWcuc3JjKSkgeyAvLyBPYmplY3QgVVJMXG4gICAgICAgICAgICAgICAgdmFyIGZpbGVSZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICAgICAgICAgIGZpbGVSZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVCaW5hcnlGaWxlKGUudGFyZ2V0LnJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBvYmplY3RVUkxUb0Jsb2IoaW1nLnNyYywgZnVuY3Rpb24gKGJsb2IpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsZVJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIGh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICBodHRwLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT0gMjAwIHx8IHRoaXMuc3RhdHVzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVCaW5hcnlGaWxlKGh0dHAucmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgXCJDb3VsZCBub3QgbG9hZCBpbWFnZVwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGh0dHAgPSBudWxsO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaHR0cC5vcGVuKFwiR0VUXCIsIGltZy5zcmMsIHRydWUpO1xuICAgICAgICAgICAgICAgIGh0dHAucmVzcG9uc2VUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xuICAgICAgICAgICAgICAgIGh0dHAuc2VuZChudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuRmlsZVJlYWRlciAmJiAoaW1nIGluc3RhbmNlb2Ygd2luZG93LkJsb2IgfHwgaW1nIGluc3RhbmNlb2Ygd2luZG93LkZpbGUpKSB7XG4gICAgICAgICAgICB2YXIgZmlsZVJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICBmaWxlUmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiR290IGZpbGUgb2YgbGVuZ3RoIFwiICsgZS50YXJnZXQucmVzdWx0LmJ5dGVMZW5ndGgpO1xuICAgICAgICAgICAgICAgIGhhbmRsZUJpbmFyeUZpbGUoZS50YXJnZXQucmVzdWx0KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGZpbGVSZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoaW1nKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbmRFWElGaW5KUEVHKGZpbGUpIHtcbiAgICAgICAgdmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGZpbGUpO1xuXG4gICAgICAgIGlmIChkZWJ1ZykgY29uc29sZS5sb2coXCJHb3QgZmlsZSBvZiBsZW5ndGggXCIgKyBmaWxlLmJ5dGVMZW5ndGgpO1xuICAgICAgICBpZiAoKGRhdGFWaWV3LmdldFVpbnQ4KDApICE9IDB4RkYpIHx8IChkYXRhVmlldy5nZXRVaW50OCgxKSAhPSAweEQ4KSkge1xuICAgICAgICAgICAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZyhcIk5vdCBhIHZhbGlkIEpQRUdcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIG5vdCBhIHZhbGlkIGpwZWdcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvZmZzZXQgPSAyLFxuICAgICAgICAgICAgbGVuZ3RoID0gZmlsZS5ieXRlTGVuZ3RoLFxuICAgICAgICAgICAgbWFya2VyO1xuXG4gICAgICAgIHdoaWxlIChvZmZzZXQgPCBsZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChkYXRhVmlldy5nZXRVaW50OChvZmZzZXQpICE9IDB4RkYpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiTm90IGEgdmFsaWQgbWFya2VyIGF0IG9mZnNldCBcIiArIG9mZnNldCArIFwiLCBmb3VuZDogXCIgKyBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7IC8vIG5vdCBhIHZhbGlkIG1hcmtlciwgc29tZXRoaW5nIGlzIHdyb25nXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1hcmtlciA9IGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCArIDEpO1xuICAgICAgICAgICAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZyhtYXJrZXIpO1xuXG4gICAgICAgICAgICAvLyB3ZSBjb3VsZCBpbXBsZW1lbnQgaGFuZGxpbmcgZm9yIG90aGVyIG1hcmtlcnMgaGVyZSxcbiAgICAgICAgICAgIC8vIGJ1dCB3ZSdyZSBvbmx5IGxvb2tpbmcgZm9yIDB4RkZFMSBmb3IgRVhJRiBkYXRhXG5cbiAgICAgICAgICAgIGlmIChtYXJrZXIgPT0gMjI1KSB7XG4gICAgICAgICAgICAgICAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZyhcIkZvdW5kIDB4RkZFMSBtYXJrZXJcIik7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVhZEVYSUZEYXRhKGRhdGFWaWV3LCBvZmZzZXQgKyA0LCBkYXRhVmlldy5nZXRVaW50MTYob2Zmc2V0ICsgMikgLSAyKTtcblxuICAgICAgICAgICAgICAgIC8vIG9mZnNldCArPSAyICsgZmlsZS5nZXRTaG9ydEF0KG9mZnNldCsyLCB0cnVlKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvZmZzZXQgKz0gMiArIGRhdGFWaWV3LmdldFVpbnQxNihvZmZzZXQrMik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmluZElQVENpbkpQRUcoZmlsZSkge1xuICAgICAgICB2YXIgZGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoZmlsZSk7XG5cbiAgICAgICAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZyhcIkdvdCBmaWxlIG9mIGxlbmd0aCBcIiArIGZpbGUuYnl0ZUxlbmd0aCk7XG4gICAgICAgIGlmICgoZGF0YVZpZXcuZ2V0VWludDgoMCkgIT0gMHhGRikgfHwgKGRhdGFWaWV3LmdldFVpbnQ4KDEpICE9IDB4RDgpKSB7XG4gICAgICAgICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiTm90IGEgdmFsaWQgSlBFR1wiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gbm90IGEgdmFsaWQganBlZ1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9mZnNldCA9IDIsXG4gICAgICAgICAgICBsZW5ndGggPSBmaWxlLmJ5dGVMZW5ndGg7XG5cblxuICAgICAgICB2YXIgaXNGaWVsZFNlZ21lbnRTdGFydCA9IGZ1bmN0aW9uKGRhdGFWaWV3LCBvZmZzZXQpe1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICBkYXRhVmlldy5nZXRVaW50OChvZmZzZXQpID09PSAweDM4ICYmXG4gICAgICAgICAgICAgICAgZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0KzEpID09PSAweDQyICYmXG4gICAgICAgICAgICAgICAgZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0KzIpID09PSAweDQ5ICYmXG4gICAgICAgICAgICAgICAgZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0KzMpID09PSAweDREICYmXG4gICAgICAgICAgICAgICAgZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0KzQpID09PSAweDA0ICYmXG4gICAgICAgICAgICAgICAgZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0KzUpID09PSAweDA0XG4gICAgICAgICAgICApO1xuICAgICAgICB9O1xuXG4gICAgICAgIHdoaWxlIChvZmZzZXQgPCBsZW5ndGgpIHtcblxuICAgICAgICAgICAgaWYgKCBpc0ZpZWxkU2VnbWVudFN0YXJ0KGRhdGFWaWV3LCBvZmZzZXQgKSl7XG5cbiAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGxlbmd0aCBvZiB0aGUgbmFtZSBoZWFkZXIgKHdoaWNoIGlzIHBhZGRlZCB0byBhbiBldmVuIG51bWJlciBvZiBieXRlcylcbiAgICAgICAgICAgICAgICB2YXIgbmFtZUhlYWRlckxlbmd0aCA9IGRhdGFWaWV3LmdldFVpbnQ4KG9mZnNldCs3KTtcbiAgICAgICAgICAgICAgICBpZihuYW1lSGVhZGVyTGVuZ3RoICUgMiAhPT0gMCkgbmFtZUhlYWRlckxlbmd0aCArPSAxO1xuICAgICAgICAgICAgICAgIC8vIENoZWNrIGZvciBwcmUgcGhvdG9zaG9wIDYgZm9ybWF0XG4gICAgICAgICAgICAgICAgaWYobmFtZUhlYWRlckxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBbHdheXMgNFxuICAgICAgICAgICAgICAgICAgICBuYW1lSGVhZGVyTGVuZ3RoID0gNDtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgc3RhcnRPZmZzZXQgPSBvZmZzZXQgKyA4ICsgbmFtZUhlYWRlckxlbmd0aDtcbiAgICAgICAgICAgICAgICB2YXIgc2VjdGlvbkxlbmd0aCA9IGRhdGFWaWV3LmdldFVpbnQxNihvZmZzZXQgKyA2ICsgbmFtZUhlYWRlckxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVhZElQVENEYXRhKGZpbGUsIHN0YXJ0T2Zmc2V0LCBzZWN0aW9uTGVuZ3RoKTtcblxuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgLy8gTm90IHRoZSBtYXJrZXIsIGNvbnRpbnVlIHNlYXJjaGluZ1xuICAgICAgICAgICAgb2Zmc2V0Kys7XG5cbiAgICAgICAgfVxuXG4gICAgfVxuICAgIHZhciBJcHRjRmllbGRNYXAgPSB7XG4gICAgICAgIDB4NzggOiAnY2FwdGlvbicsXG4gICAgICAgIDB4NkUgOiAnY3JlZGl0JyxcbiAgICAgICAgMHgxOSA6ICdrZXl3b3JkcycsXG4gICAgICAgIDB4MzcgOiAnZGF0ZUNyZWF0ZWQnLFxuICAgICAgICAweDUwIDogJ2J5bGluZScsXG4gICAgICAgIDB4NTUgOiAnYnlsaW5lVGl0bGUnLFxuICAgICAgICAweDdBIDogJ2NhcHRpb25Xcml0ZXInLFxuICAgICAgICAweDY5IDogJ2hlYWRsaW5lJyxcbiAgICAgICAgMHg3NCA6ICdjb3B5cmlnaHQnLFxuICAgICAgICAweDBGIDogJ2NhdGVnb3J5J1xuICAgIH07XG4gICAgZnVuY3Rpb24gcmVhZElQVENEYXRhKGZpbGUsIHN0YXJ0T2Zmc2V0LCBzZWN0aW9uTGVuZ3RoKXtcbiAgICAgICAgdmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGZpbGUpO1xuICAgICAgICB2YXIgZGF0YSA9IHt9O1xuICAgICAgICB2YXIgZmllbGRWYWx1ZSwgZmllbGROYW1lLCBkYXRhU2l6ZSwgc2VnbWVudFR5cGUsIHNlZ21lbnRTaXplO1xuICAgICAgICB2YXIgc2VnbWVudFN0YXJ0UG9zID0gc3RhcnRPZmZzZXQ7XG4gICAgICAgIHdoaWxlKHNlZ21lbnRTdGFydFBvcyA8IHN0YXJ0T2Zmc2V0K3NlY3Rpb25MZW5ndGgpIHtcbiAgICAgICAgICAgIGlmKGRhdGFWaWV3LmdldFVpbnQ4KHNlZ21lbnRTdGFydFBvcykgPT09IDB4MUMgJiYgZGF0YVZpZXcuZ2V0VWludDgoc2VnbWVudFN0YXJ0UG9zKzEpID09PSAweDAyKXtcbiAgICAgICAgICAgICAgICBzZWdtZW50VHlwZSA9IGRhdGFWaWV3LmdldFVpbnQ4KHNlZ21lbnRTdGFydFBvcysyKTtcbiAgICAgICAgICAgICAgICBpZihzZWdtZW50VHlwZSBpbiBJcHRjRmllbGRNYXApIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVNpemUgPSBkYXRhVmlldy5nZXRJbnQxNihzZWdtZW50U3RhcnRQb3MrMyk7XG4gICAgICAgICAgICAgICAgICAgIHNlZ21lbnRTaXplID0gZGF0YVNpemUgKyA1O1xuICAgICAgICAgICAgICAgICAgICBmaWVsZE5hbWUgPSBJcHRjRmllbGRNYXBbc2VnbWVudFR5cGVdO1xuICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gZ2V0U3RyaW5nRnJvbURCKGRhdGFWaWV3LCBzZWdtZW50U3RhcnRQb3MrNSwgZGF0YVNpemUpO1xuICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB3ZSBhbHJlYWR5IHN0b3JlZCBhIHZhbHVlIHdpdGggdGhpcyBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGlmKGRhdGEuaGFzT3duUHJvcGVydHkoZmllbGROYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVmFsdWUgYWxyZWFkeSBzdG9yZWQgd2l0aCB0aGlzIG5hbWUsIGNyZWF0ZSBtdWx0aXZhbHVlIGZpZWxkXG4gICAgICAgICAgICAgICAgICAgICAgICBpZihkYXRhW2ZpZWxkTmFtZV0gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbZmllbGROYW1lXS5wdXNoKGZpZWxkVmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtmaWVsZE5hbWVdID0gW2RhdGFbZmllbGROYW1lXSwgZmllbGRWYWx1ZV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2ZpZWxkTmFtZV0gPSBmaWVsZFZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWdtZW50U3RhcnRQb3MrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cblxuXG4gICAgZnVuY3Rpb24gcmVhZFRhZ3MoZmlsZSwgdGlmZlN0YXJ0LCBkaXJTdGFydCwgc3RyaW5ncywgYmlnRW5kKSB7XG4gICAgICAgIHZhciBlbnRyaWVzID0gZmlsZS5nZXRVaW50MTYoZGlyU3RhcnQsICFiaWdFbmQpLFxuICAgICAgICAgICAgdGFncyA9IHt9LFxuICAgICAgICAgICAgZW50cnlPZmZzZXQsIHRhZyxcbiAgICAgICAgICAgIGk7XG5cbiAgICAgICAgZm9yIChpPTA7aTxlbnRyaWVzO2krKykge1xuICAgICAgICAgICAgZW50cnlPZmZzZXQgPSBkaXJTdGFydCArIGkqMTIgKyAyO1xuICAgICAgICAgICAgdGFnID0gc3RyaW5nc1tmaWxlLmdldFVpbnQxNihlbnRyeU9mZnNldCwgIWJpZ0VuZCldO1xuICAgICAgICAgICAgaWYgKCF0YWcgJiYgZGVidWcpIGNvbnNvbGUubG9nKFwiVW5rbm93biB0YWc6IFwiICsgZmlsZS5nZXRVaW50MTYoZW50cnlPZmZzZXQsICFiaWdFbmQpKTtcbiAgICAgICAgICAgIHRhZ3NbdGFnXSA9IHJlYWRUYWdWYWx1ZShmaWxlLCBlbnRyeU9mZnNldCwgdGlmZlN0YXJ0LCBkaXJTdGFydCwgYmlnRW5kKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFncztcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIHJlYWRUYWdWYWx1ZShmaWxlLCBlbnRyeU9mZnNldCwgdGlmZlN0YXJ0LCBkaXJTdGFydCwgYmlnRW5kKSB7XG4gICAgICAgIHZhciB0eXBlID0gZmlsZS5nZXRVaW50MTYoZW50cnlPZmZzZXQrMiwgIWJpZ0VuZCksXG4gICAgICAgICAgICBudW1WYWx1ZXMgPSBmaWxlLmdldFVpbnQzMihlbnRyeU9mZnNldCs0LCAhYmlnRW5kKSxcbiAgICAgICAgICAgIHZhbHVlT2Zmc2V0ID0gZmlsZS5nZXRVaW50MzIoZW50cnlPZmZzZXQrOCwgIWJpZ0VuZCkgKyB0aWZmU3RhcnQsXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICB2YWxzLCB2YWwsIG4sXG4gICAgICAgICAgICBudW1lcmF0b3IsIGRlbm9taW5hdG9yO1xuXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAxOiAvLyBieXRlLCA4LWJpdCB1bnNpZ25lZCBpbnRcbiAgICAgICAgICAgIGNhc2UgNzogLy8gdW5kZWZpbmVkLCA4LWJpdCBieXRlLCB2YWx1ZSBkZXBlbmRpbmcgb24gZmllbGRcbiAgICAgICAgICAgICAgICBpZiAobnVtVmFsdWVzID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbGUuZ2V0VWludDgoZW50cnlPZmZzZXQgKyA4LCAhYmlnRW5kKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBudW1WYWx1ZXMgPiA0ID8gdmFsdWVPZmZzZXQgOiAoZW50cnlPZmZzZXQgKyA4KTtcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKG49MDtuPG51bVZhbHVlcztuKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHNbbl0gPSBmaWxlLmdldFVpbnQ4KG9mZnNldCArIG4pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWxzO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2FzZSAyOiAvLyBhc2NpaSwgOC1iaXQgYnl0ZVxuICAgICAgICAgICAgICAgIG9mZnNldCA9IG51bVZhbHVlcyA+IDQgPyB2YWx1ZU9mZnNldCA6IChlbnRyeU9mZnNldCArIDgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBnZXRTdHJpbmdGcm9tREIoZmlsZSwgb2Zmc2V0LCBudW1WYWx1ZXMtMSk7XG5cbiAgICAgICAgICAgIGNhc2UgMzogLy8gc2hvcnQsIDE2IGJpdCBpbnRcbiAgICAgICAgICAgICAgICBpZiAobnVtVmFsdWVzID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbGUuZ2V0VWludDE2KGVudHJ5T2Zmc2V0ICsgOCwgIWJpZ0VuZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gbnVtVmFsdWVzID4gMiA/IHZhbHVlT2Zmc2V0IDogKGVudHJ5T2Zmc2V0ICsgOCk7XG4gICAgICAgICAgICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChuPTA7bjxudW1WYWx1ZXM7bisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxzW25dID0gZmlsZS5nZXRVaW50MTYob2Zmc2V0ICsgMipuLCAhYmlnRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhc2UgNDogLy8gbG9uZywgMzIgYml0IGludFxuICAgICAgICAgICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsZS5nZXRVaW50MzIoZW50cnlPZmZzZXQgKyA4LCAhYmlnRW5kKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YWxzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobj0wO248bnVtVmFsdWVzO24rKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsc1tuXSA9IGZpbGUuZ2V0VWludDMyKHZhbHVlT2Zmc2V0ICsgNCpuLCAhYmlnRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFscztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhc2UgNTogICAgLy8gcmF0aW9uYWwgPSB0d28gbG9uZyB2YWx1ZXMsIGZpcnN0IGlzIG51bWVyYXRvciwgc2Vjb25kIGlzIGRlbm9taW5hdG9yXG4gICAgICAgICAgICAgICAgaWYgKG51bVZhbHVlcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIG51bWVyYXRvciA9IGZpbGUuZ2V0VWludDMyKHZhbHVlT2Zmc2V0LCAhYmlnRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgZGVub21pbmF0b3IgPSBmaWxlLmdldFVpbnQzMih2YWx1ZU9mZnNldCs0LCAhYmlnRW5kKTtcbiAgICAgICAgICAgICAgICAgICAgdmFsID0gbmV3IE51bWJlcihudW1lcmF0b3IgLyBkZW5vbWluYXRvcik7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5udW1lcmF0b3IgPSBudW1lcmF0b3I7XG4gICAgICAgICAgICAgICAgICAgIHZhbC5kZW5vbWluYXRvciA9IGRlbm9taW5hdG9yO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChuPTA7bjxudW1WYWx1ZXM7bisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBudW1lcmF0b3IgPSBmaWxlLmdldFVpbnQzMih2YWx1ZU9mZnNldCArIDgqbiwgIWJpZ0VuZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZW5vbWluYXRvciA9IGZpbGUuZ2V0VWludDMyKHZhbHVlT2Zmc2V0KzQgKyA4Km4sICFiaWdFbmQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsc1tuXSA9IG5ldyBOdW1iZXIobnVtZXJhdG9yIC8gZGVub21pbmF0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsc1tuXS5udW1lcmF0b3IgPSBudW1lcmF0b3I7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxzW25dLmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIDk6IC8vIHNsb25nLCAzMiBiaXQgc2lnbmVkIGludFxuICAgICAgICAgICAgICAgIGlmIChudW1WYWx1ZXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsZS5nZXRJbnQzMihlbnRyeU9mZnNldCArIDgsICFiaWdFbmQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChuPTA7bjxudW1WYWx1ZXM7bisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxzW25dID0gZmlsZS5nZXRJbnQzMih2YWx1ZU9mZnNldCArIDQqbiwgIWJpZ0VuZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjYXNlIDEwOiAvLyBzaWduZWQgcmF0aW9uYWwsIHR3byBzbG9uZ3MsIGZpcnN0IGlzIG51bWVyYXRvciwgc2Vjb25kIGlzIGRlbm9taW5hdG9yXG4gICAgICAgICAgICAgICAgaWYgKG51bVZhbHVlcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWxlLmdldEludDMyKHZhbHVlT2Zmc2V0LCAhYmlnRW5kKSAvIGZpbGUuZ2V0SW50MzIodmFsdWVPZmZzZXQrNCwgIWJpZ0VuZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFscyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKG49MDtuPG51bVZhbHVlcztuKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHNbbl0gPSBmaWxlLmdldEludDMyKHZhbHVlT2Zmc2V0ICsgOCpuLCAhYmlnRW5kKSAvIGZpbGUuZ2V0SW50MzIodmFsdWVPZmZzZXQrNCArIDgqbiwgIWJpZ0VuZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0U3RyaW5nRnJvbURCKGJ1ZmZlciwgc3RhcnQsIGxlbmd0aCkge1xuICAgICAgICB2YXIgb3V0c3RyID0gXCJcIjtcbiAgICAgICAgZm9yIChuID0gc3RhcnQ7IG4gPCBzdGFydCtsZW5ndGg7IG4rKykge1xuICAgICAgICAgICAgb3V0c3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmZmVyLmdldFVpbnQ4KG4pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0c3RyO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlYWRFWElGRGF0YShmaWxlLCBzdGFydCkge1xuICAgICAgICBpZiAoZ2V0U3RyaW5nRnJvbURCKGZpbGUsIHN0YXJ0LCA0KSAhPSBcIkV4aWZcIikge1xuICAgICAgICAgICAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZyhcIk5vdCB2YWxpZCBFWElGIGRhdGEhIFwiICsgZ2V0U3RyaW5nRnJvbURCKGZpbGUsIHN0YXJ0LCA0KSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgYmlnRW5kLFxuICAgICAgICAgICAgdGFncywgdGFnLFxuICAgICAgICAgICAgZXhpZkRhdGEsIGdwc0RhdGEsXG4gICAgICAgICAgICB0aWZmT2Zmc2V0ID0gc3RhcnQgKyA2O1xuXG4gICAgICAgIC8vIHRlc3QgZm9yIFRJRkYgdmFsaWRpdHkgYW5kIGVuZGlhbm5lc3NcbiAgICAgICAgaWYgKGZpbGUuZ2V0VWludDE2KHRpZmZPZmZzZXQpID09IDB4NDk0OSkge1xuICAgICAgICAgICAgYmlnRW5kID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoZmlsZS5nZXRVaW50MTYodGlmZk9mZnNldCkgPT0gMHg0RDREKSB7XG4gICAgICAgICAgICBiaWdFbmQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZyhcIk5vdCB2YWxpZCBUSUZGIGRhdGEhIChubyAweDQ5NDkgb3IgMHg0RDREKVwiKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChmaWxlLmdldFVpbnQxNih0aWZmT2Zmc2V0KzIsICFiaWdFbmQpICE9IDB4MDAyQSkge1xuICAgICAgICAgICAgaWYgKGRlYnVnKSBjb25zb2xlLmxvZyhcIk5vdCB2YWxpZCBUSUZGIGRhdGEhIChubyAweDAwMkEpXCIpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpcnN0SUZET2Zmc2V0ID0gZmlsZS5nZXRVaW50MzIodGlmZk9mZnNldCs0LCAhYmlnRW5kKTtcblxuICAgICAgICBpZiAoZmlyc3RJRkRPZmZzZXQgPCAweDAwMDAwMDA4KSB7XG4gICAgICAgICAgICBpZiAoZGVidWcpIGNvbnNvbGUubG9nKFwiTm90IHZhbGlkIFRJRkYgZGF0YSEgKEZpcnN0IG9mZnNldCBsZXNzIHRoYW4gOClcIiwgZmlsZS5nZXRVaW50MzIodGlmZk9mZnNldCs0LCAhYmlnRW5kKSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0YWdzID0gcmVhZFRhZ3MoZmlsZSwgdGlmZk9mZnNldCwgdGlmZk9mZnNldCArIGZpcnN0SUZET2Zmc2V0LCBUaWZmVGFncywgYmlnRW5kKTtcblxuICAgICAgICBpZiAodGFncy5FeGlmSUZEUG9pbnRlcikge1xuICAgICAgICAgICAgZXhpZkRhdGEgPSByZWFkVGFncyhmaWxlLCB0aWZmT2Zmc2V0LCB0aWZmT2Zmc2V0ICsgdGFncy5FeGlmSUZEUG9pbnRlciwgRXhpZlRhZ3MsIGJpZ0VuZCk7XG4gICAgICAgICAgICBmb3IgKHRhZyBpbiBleGlmRGF0YSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAodGFnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJMaWdodFNvdXJjZVwiIDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkZsYXNoXCIgOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiTWV0ZXJpbmdNb2RlXCIgOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRXhwb3N1cmVQcm9ncmFtXCIgOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU2Vuc2luZ01ldGhvZFwiIDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIlNjZW5lQ2FwdHVyZVR5cGVcIiA6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTY2VuZVR5cGVcIiA6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJDdXN0b21SZW5kZXJlZFwiIDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIldoaXRlQmFsYW5jZVwiIDpcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkdhaW5Db250cm9sXCIgOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQ29udHJhc3RcIiA6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJTYXR1cmF0aW9uXCIgOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU2hhcnBuZXNzXCIgOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiU3ViamVjdERpc3RhbmNlUmFuZ2VcIiA6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJGaWxlU291cmNlXCIgOlxuICAgICAgICAgICAgICAgICAgICAgICAgZXhpZkRhdGFbdGFnXSA9IFN0cmluZ1ZhbHVlc1t0YWddW2V4aWZEYXRhW3RhZ11dO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkV4aWZWZXJzaW9uXCIgOlxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiRmxhc2hwaXhWZXJzaW9uXCIgOlxuICAgICAgICAgICAgICAgICAgICAgICAgZXhpZkRhdGFbdGFnXSA9IFN0cmluZy5mcm9tQ2hhckNvZGUoZXhpZkRhdGFbdGFnXVswXSwgZXhpZkRhdGFbdGFnXVsxXSwgZXhpZkRhdGFbdGFnXVsyXSwgZXhpZkRhdGFbdGFnXVszXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiQ29tcG9uZW50c0NvbmZpZ3VyYXRpb25cIiA6XG4gICAgICAgICAgICAgICAgICAgICAgICBleGlmRGF0YVt0YWddID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmdWYWx1ZXMuQ29tcG9uZW50c1tleGlmRGF0YVt0YWddWzBdXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nVmFsdWVzLkNvbXBvbmVudHNbZXhpZkRhdGFbdGFnXVsxXV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZ1ZhbHVlcy5Db21wb25lbnRzW2V4aWZEYXRhW3RhZ11bMl1dICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBTdHJpbmdWYWx1ZXMuQ29tcG9uZW50c1tleGlmRGF0YVt0YWddWzNdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0YWdzW3RhZ10gPSBleGlmRGF0YVt0YWddO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhZ3MuR1BTSW5mb0lGRFBvaW50ZXIpIHtcbiAgICAgICAgICAgIGdwc0RhdGEgPSByZWFkVGFncyhmaWxlLCB0aWZmT2Zmc2V0LCB0aWZmT2Zmc2V0ICsgdGFncy5HUFNJbmZvSUZEUG9pbnRlciwgR1BTVGFncywgYmlnRW5kKTtcbiAgICAgICAgICAgIGZvciAodGFnIGluIGdwc0RhdGEpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRhZykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiR1BTVmVyc2lvbklEXCIgOlxuICAgICAgICAgICAgICAgICAgICAgICAgZ3BzRGF0YVt0YWddID0gZ3BzRGF0YVt0YWddWzBdICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIi5cIiArIGdwc0RhdGFbdGFnXVsxXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIuXCIgKyBncHNEYXRhW3RhZ11bMl0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLlwiICsgZ3BzRGF0YVt0YWddWzNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRhZ3NbdGFnXSA9IGdwc0RhdGFbdGFnXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0YWdzO1xuICAgIH1cblxuICAgIEVYSUYuZ2V0RGF0YSA9IGZ1bmN0aW9uKGltZywgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKChpbWcgaW5zdGFuY2VvZiBJbWFnZSB8fCBpbWcgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50KSAmJiAhaW1nLmNvbXBsZXRlKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFpbWFnZUhhc0RhdGEoaW1nKSkge1xuICAgICAgICAgICAgZ2V0SW1hZ2VEYXRhKGltZywgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChpbWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIEVYSUYuZ2V0VGFnID0gZnVuY3Rpb24oaW1nLCB0YWcpIHtcbiAgICAgICAgaWYgKCFpbWFnZUhhc0RhdGEoaW1nKSkgcmV0dXJuO1xuICAgICAgICByZXR1cm4gaW1nLmV4aWZkYXRhW3RhZ107XG4gICAgfVxuXG4gICAgRVhJRi5nZXRBbGxUYWdzID0gZnVuY3Rpb24oaW1nKSB7XG4gICAgICAgIGlmICghaW1hZ2VIYXNEYXRhKGltZykpIHJldHVybiB7fTtcbiAgICAgICAgdmFyIGEsXG4gICAgICAgICAgICBkYXRhID0gaW1nLmV4aWZkYXRhLFxuICAgICAgICAgICAgdGFncyA9IHt9O1xuICAgICAgICBmb3IgKGEgaW4gZGF0YSkge1xuICAgICAgICAgICAgaWYgKGRhdGEuaGFzT3duUHJvcGVydHkoYSkpIHtcbiAgICAgICAgICAgICAgICB0YWdzW2FdID0gZGF0YVthXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGFncztcbiAgICB9XG5cbiAgICBFWElGLnByZXR0eSA9IGZ1bmN0aW9uKGltZykge1xuICAgICAgICBpZiAoIWltYWdlSGFzRGF0YShpbWcpKSByZXR1cm4gXCJcIjtcbiAgICAgICAgdmFyIGEsXG4gICAgICAgICAgICBkYXRhID0gaW1nLmV4aWZkYXRhLFxuICAgICAgICAgICAgc3RyUHJldHR5ID0gXCJcIjtcbiAgICAgICAgZm9yIChhIGluIGRhdGEpIHtcbiAgICAgICAgICAgIGlmIChkYXRhLmhhc093blByb3BlcnR5KGEpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2FdID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFbYV0gaW5zdGFuY2VvZiBOdW1iZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0clByZXR0eSArPSBhICsgXCIgOiBcIiArIGRhdGFbYV0gKyBcIiBbXCIgKyBkYXRhW2FdLm51bWVyYXRvciArIFwiL1wiICsgZGF0YVthXS5kZW5vbWluYXRvciArIFwiXVxcclxcblwiO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyUHJldHR5ICs9IGEgKyBcIiA6IFtcIiArIGRhdGFbYV0ubGVuZ3RoICsgXCIgdmFsdWVzXVxcclxcblwiO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RyUHJldHR5ICs9IGEgKyBcIiA6IFwiICsgZGF0YVthXSArIFwiXFxyXFxuXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHJQcmV0dHk7XG4gICAgfVxuXG4gICAgRVhJRi5yZWFkRnJvbUJpbmFyeUZpbGUgPSBmdW5jdGlvbihmaWxlKSB7XG4gICAgICAgIHJldHVybiBmaW5kRVhJRmluSlBFRyhmaWxlKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZSgnZXhpZi1qcycsIFtdLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBFWElGO1xuICAgICAgICB9KTtcbiAgICB9XG59LmNhbGwodGhpcykpO1xuXG4iXX0=
