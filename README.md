# Awesome Map

This is a project for study purpose.

## App Features

- Extract Exif Geolocation from image file, create a marker in that location and display the image in the popup

## Instructions

To build the bundle, run `npm run build`

## Informations

Map built with [MapBox](https://www.mapbox.com/).

[ES6 features](http://es6-features.org/) used:

- Block-Scoped Variables
- Arrow Functions
- Template Strings
- Destructuring Assignment
- Modules
- Classes
- Promises

## To Do

### Code

- [Replace callbacks with ES6 Generators](http://modernweb.com/2014/02/10/replacing-callbacks-with-es6-generators/)
- React.js components
- CSS Modules

### Interface

- Create better interface with panels
  - Top header panel for navigation
  - Right side panel for control
    - Upload button should be in this panel
    - List os inputed images
    - Each image have:
      - Checkbox
      - Thumbnail
      - Input fields for title, description
      - Date information extrated from EXIF tag is have, if not a date input field
      - List of tags
      - List of persons
      - String address grabbed from MapBox API that matches the EXIF geo tag
    - Checked images are be highlighted
  - Left side panel for the map

### Experience

- When input an image:
  - In the map panel:
    - Create marker in the geolocation tagged - OK
    - Focus on the marker with high zoom - OK
    - Open the popup of the new marker with the image
  - In the control panel:
    - Create a list of images
    - Include the current image in the list as selected
- When input other images:
  - In the map panel:
    - Create marker in the geolocation tagged - OK
    - Focus on boundary with all markers related to selected images in the control list with needed zoom
    - Close all popups (?)
    - Open the popup new marker with the image
  - In the control panel:
    - Same as the first
    - Include the current image in the list as selected
- When changing selected images in the control list
  - Close all popups (?)
  - Change boundary and zoom to fit all markers related to selected images
