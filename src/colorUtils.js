const Vibrant = require('node-vibrant');

// Derived from https://gimplearn.net/dmc_color_picker.php
// Released under MIT license with permission.
const DMC = require('./colors.json');

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function component2Hex(c) {
  const hex = c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

// Convert an rgb object into a css-style hex value
function rgb2Hex(rgb) {
  return `#${component2Hex(rgb.r)}${component2Hex(rgb.g)}${component2Hex(rgb.b)}`;
}

// Convert a standard CSS style hex color value to the integer value that JIMP
// expects. Assumes the CSS value is in the form '#[RR][GG][BB]' and adds unless
// an alpha is provided produces an totally solid color.
function cssHex2JimpInt(colorHex, alphaChannel = 'FF') {
  const color = `0x${colorHex.slice(-6)}${alphaChannel}`;
  return parseInt(color, 16); // Done it two steps to ease debugging.
}

// Convert int color to css hex without Alpha channel.
function int2CssHex(intColor) {
  let hexString = `${intColor.toString(16).toUpperCase()}`;
  if (hexString.length < 8) {
    hexString = hexString.padStart(8, '0');
  }
  return `#${hexString.slice(0, -2)}`;
}

// Calculate the DeltaE between two RGB objects.
function colorDistance(rgb1, rgb2) {
  const rgb1Vec3 = [rgb1.r, rgb1.g, rgb1.b];
  const rgb2Vec3 = [rgb2.r, rgb2.g, rgb2.b];
  return Vibrant.Util.rgbDiff(rgb1Vec3, rgb2Vec3);
}

// Calculate the closest color from a list of options.
function closestColor(rgb) {
  let closestColorFound = {};
  let closestDistanceSoFar = 100;
  let testDist = -1;
  DMC.some((dmcColor) => {
    testDist = colorDistance(rgb, dmcColor.RGB);
    if (testDist < closestDistanceSoFar) {
      closestDistanceSoFar = testDist;
      closestColorFound = dmcColor;
    }
    if (closestDistanceSoFar < 1) {
      return closestColorFound;
    }
  });
  return closestColorFound;
}

// Uses the W3C guideline for a dark color vs light.
function isDarkColor(rgb) {
  // See https://www.w3.org/TR/AERT/#color-contrast
  return (((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000) >= 128;
}

exports.cssHex2JimpInt = cssHex2JimpInt;
exports.rgb2Hex = rgb2Hex;
exports.hex2Rgb = hexToRgb;
exports.colorDistance = colorDistance;
exports.closestColor = closestColor;
exports.int2CssHex = int2CssHex;
exports.isDarkColor = isDarkColor;
