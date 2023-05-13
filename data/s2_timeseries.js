var batch = require('users/fitoprincipe/geetools:batch');

// Define region of interest from "seeland.geojson" file
var roi = { "type": "MultiPolygon",
        "coordinates": [ 
            [ 
                [ 
                    [ 7.174431222482196, 47.10434134613898 ],
                    [ 7.274250067236944, 47.041999612772294 ],
                    [ 7.258394366265072, 46.982180377287506 ],
                    [ 7.09407164710202, 46.911190079754341 ],
                    [ 6.957496404639748, 47.019297131835295 ],
                    [ 7.174431222482196, 47.10434134613898 ]
                ]
            ]
        ]
    };
    
// Define start and end dates
var start = '2021-05-01';
var end = '2021-07-31';

/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud masked Sentinel-2 image
 */
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
      .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

  return image.updateMask(mask).divide(10000);
}

// Generate 'clear_sky' Sentinel-2 images using SCL.
var s2_clear_sky = function(image){
    var scl = image.select('SCL');
    var clear_sky_pixels = scl.eq(4).or(scl.eq(5)).or(scl.eq(6)).or(scl.eq(11));
    return image.updateMask(clear_sky_pixels);
    };

function clip(img) {
  return img.clip(roi)
}

var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                  .filterDate(start, end)
                  // Pre-filter to get less cloudy granules.
                  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                  .map(maskS2clouds)
                  .map(s2_clear_sky)
                  .filterBounds(roi)
                  .map(clip);
                  
print(dataset.size())
                  
var visualization = {
  'min': 0.0,
  'max': 0.3,
  // RGB
  'bands': ['B4', 'B3', 'B2'],
};

Map.centerObject(ee.Geometry(roi, 11))
Map.addLayer(dataset.mean(), visualization, 'S2')

/*
batch.Download.ImageCollection.toDrive(dataset, 'Sentinel-2', {
  name: '{system:index}',
  type: 'float',
  scale: 30,
  region: roi
});*/


