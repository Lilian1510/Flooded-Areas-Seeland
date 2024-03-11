var roi = 
    /* color: #0b4a8b */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[6.969962158203122, 47.08855059666047],
          [6.969962158203122, 46.92842064665592],
          [7.171835937499997, 46.92842064665592],
          [7.171835937499997, 47.08855059666047]]], null, false);
          
function clip(img) {
  return img.clip(roi);
}

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

var before = ee.ImageCollection("COPERNICUS/S2_SR")
              .filterDate('2021-05-20', '2021-05-31')
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 15))
              .map(maskS2clouds)
              .map(clip);
              
var after = ee.ImageCollection("COPERNICUS/S2_SR")
              .filterDate('2021-07-15', '2021-07-25')
              .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
              .map(maskS2clouds)
              .map(clip);
              
var visualization = {
  min: 0.0,
  max: 0.3,
  bands: ['B4', 'B3', 'B2']
};

Map.centerObject(roi);
Map.addLayer(before.mean(), visualization, 'before');
Map.addLayer(after.mean(), visualization, 'after');


Export.image.toDrive({
  image:before.mean(),
  description:'sentinel2a-before',
  scale:10,
  region:roi
});

Export.image.toDrive({
  image:after.mean(),
  description:'sentinel2a-after',
  scale:10,
  region:roi
});