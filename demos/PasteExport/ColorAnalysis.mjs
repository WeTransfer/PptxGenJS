import tinycolor from 'tinycolor2';

const hueTable = [/*   0deg */ 0, -10, -10, 20, 20, 10, /* 180deg */ 10, 10, 10, -10, -20, 10];

// Consider the S x V unit square.
//
// we're setting up a table offsets (in terms of saturation and value between 0,1
//
// (.2,-.2)----------------------(.2,-.3)
//    |                             |
// (.25,-.15)                    (.4,-.15)
//    |                             |
// (.3,-.1)----------------------(.6,-1)
//
// We're interpolating this tuple over the unit square so we'll
// use a 2D LUT for S and another for V. There might be an easier way to do this the
// LUT approach mapped 1-1 to the color studies Allen has been doing thus
// easier for tuning.
const shadowSOffsetTable = [
  [0.2, 0.2],
  [0.25, 0.4],
  [0.3, 0.6],
];
const shadowVOffsetTable = [
  [-0.2, -0.3],
  [-0.15, -0.15],
  [-0.1, -0.1],
];

// The shadow computations expect the background color as their input.
const shadow = color => {
  const hsv = color.toHsv();

  const sOffset = math.linearTableLookup(shadowSOffsetTable, hsv.s, hsv.v);
  const vOffset = math.linearTableLookup(shadowVOffsetTable, hsv.s, hsv.v);

  hsv.s += sOffset;
  hsv.s = math.clamp(hsv.s);
  hsv.v += vOffset;
  hsv.v = math.clamp(hsv.v);

  // This is applying a warp in hue-space to move yellows towards red and greens
  // towards blue.
  hsv.h += math.piecewiseLinearDeg(hueTable, hsv.h);

  const result = tinycolor(hsv).setAlpha(0.5);
  return result;
};

const H1_RANGE = [36, 200];
const H1_PTS = [
  { x: 0, y: 0.75 },
  { x: 0.5, y: 0.85 },
  { x: 1, y: 0.85 },
];
const H2_PTS = [
  { x: 0, y: 0.75 },
  { x: 0.5, y: 1 },
  { x: 1, y: 1 },
];
const DARK_TEXT = { s: 0.2, v: 0.25 };
const LIGHT_TEXT = { s: 0.1, v: 1 };

// This expects a HSV value.
const isLightTextColor = hsv => {
  let isLight = true;
  if (hsv.h >= H1_RANGE[0] && hsv.h <= H1_RANGE[1]) {
    isLight = math.piecewiseLinearTest(H1_PTS, hsv.s, hsv.v);
  } else {
    isLight = math.piecewiseLinearTest(H2_PTS, hsv.s, hsv.v);
  }

  return !isLight;
};

const text = color => {
    const hsv = color.toHsv();
    if (isLightTextColor(hsv)) {
      if (hsv.s >= LIGHT_TEXT.s) {
        hsv.s = LIGHT_TEXT.s;
      }
  
      hsv.v = LIGHT_TEXT.v;
    } else {
      if (hsv.s >= DARK_TEXT.s) {
        hsv.s = DARK_TEXT.s;
      }
  
      hsv.v = DARK_TEXT.v;
    }
    return tinycolor(hsv);
};

export const colorAnalysis = (color) => {
    const commonColor = tinycolor(color);
  
    const backgroundColor = commonColor;
    return {
      common: backgroundColor.toRgbString(),
      background: backgroundColor.toRgbString(),
      thumbnailBackground: backgroundColor.toRgbString(),
      text: text(backgroundColor).toRgbString(),
      shadow: shadow(backgroundColor).toRgbString(),
      isLight: backgroundColor.isLight(),
    };
};

// convert rgb and HexStrings to Hex colors (w/o '#')
export const colorToHex = (rgb) => {
    const color = tinycolor(rgb);
    return color.toHex()
};