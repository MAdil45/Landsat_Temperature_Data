// Initialize the Lake Champlain geometry
var lake_champlain = ee.Geometry.Polygon([[[-73.69076684855565, 45.15929968667908],
          [-73.69076684855565, 43.921510726464305],
          [-72.90567292686237, 43.921510726464305],
          [-72.90567292686237, 45.15929968667908],
          [-73.69076684855565, 45.15929968667908]]]);

// Define the time range
var start_date = '2021-08-01';
var end_date = '2021-10-31';

// Create the Landsat 8 collection
var landsat_8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
                .filterBounds(lake_champlain)
                .filterDate(ee.Date(start_date), ee.Date(end_date));

// Define the Google Drive folder
var drive_folder = 'Landsat_8_Data';

// Get the list of images
var imageList = landsat_8.toList(landsat_8.size());

// Function to export metadata
var exportMetadata = function(image, id) {
  // Define metadata properties that you are interested in
  var properties = ["RADIANCE_MULT_BAND_10", "RADIANCE_ADD_BAND_10", "K1_CONSTANT_BAND_10", "K2_CONSTANT_BAND_10"];
  var textContent = "";
  
  for (var j = 0; j < properties.length; j++) {
    var propName = properties[j];
    var propValue = image.get(propName);
    textContent += propName + ': ' + propValue + '\n';
  }
  
  // Export to Google Drive
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

// Retrieve the list of IDs upfront
var idList = imageList.map(function(image) {
  return ee.Image(image).get('system:index');
}).getInfo();

// Iterate through the list of images
for (var i = 0; i < idList.length; i++) {
  var image = ee.Image(imageList.get(i));
  var id = idList[i];
  var description = 'Lake_Champlain_' + id;
  
  // Cast all bands to Float32
  var imageFloat = image.toFloat();
  
  // Export image
  Export.image.toDrive({
    image: imageFloat,
    description: description,
    folder: drive_folder,
    region: lake_champlain,
    scale: 30,
    fileFormat: 'GeoTIFF'
  });
  
  // Export metadata
  exportMetadata(image, id);
}
