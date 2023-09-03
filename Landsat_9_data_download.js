// Initialize the Lake Champlain geometry
var lake_champlain = ee.Geometry.Polygon([[[-73.69076684855565, 45.15929968667908],
          [-73.69076684855565, 43.921510726464305],
          [-72.90567292686237, 43.921510726464305],
          [-72.90567292686237, 45.15929968667908],
          [-73.69076684855565, 45.15929968667908]]]);

// Lets define the time range - As Landsat-9 started in October 2021.
// We will select the date range after that.
var start_date = '2021-10-01';
var end_date = '2021-12-31';

// Next, Lets create the Landsat 9 collection
var landsat_9 = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA') // Note the updated collection ID
                .filterBounds(lake_champlain)
                .filterDate(ee.Date(start_date), ee.Date(end_date));

// Time to define the Google Drive folder
var drive_folder = 'Landsat_9_Data';

// Lets get the list of images
var imageList = landsat_9.toList(landsat_9.size());

// Function to export metadata
var exportMetadata = function(image, id) {
  // Lets define metadata properties that we will need during the
  // DN to Temperature conversion. 
  var properties = ["RADIANCE_MULT_BAND_10", "RADIANCE_ADD_BAND_10", "K1_CONSTANT_BAND_10", "K2_CONSTANT_BAND_10"];
  var textContent = "";
  
  for (var j = 0; j < properties.length; j++) {
    var propName = properties[j];
    var propValue = image.get(propName);
    textContent += propName + ': ' + propValue + '\n';
  }
  
  // Now, its time to export to Google Drive
  Export.table.toDrive({
    collection: ee.FeatureCollection([
      ee.Feature(null, {metadata: textContent})
    ]),
    description: 'metadata_' + id,
    folder: drive_folder,
    fileNamePrefix: 'Lake_Champlain_' + id,
    fileFormat: 'GeoJSON'
  });
};

// Retrieving the list of IDs upfront
var idList = imageList.map(function(image) {
  return ee.Image(image).get('system:index');
}).getInfo();

// Iterating through the list of images
for (var i = 0; i < idList.length; i++) {
  var image = ee.Image(imageList.get(i));
  var id = idList[i];
  var description = 'Lake_Champlain_' + id;
  
  // Casting all bands to Float32
  var imageFloat = image.toFloat();
  
  // Exporting the images
  Export.image.toDrive({
    image: imageFloat,
    description: description,
    folder: drive_folder,
    region: lake_champlain,
    scale: 30,
    fileFormat: 'GeoTIFF'
  });
  
  // Exporting the metadata
  exportMetadata(image, id);
}
