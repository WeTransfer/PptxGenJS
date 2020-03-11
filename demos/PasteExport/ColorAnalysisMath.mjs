/* eslint-disable no-param-reassign */

// This is a copy of the math.js file from lambda/ImageAnalysis on Studio


export const clamp = (x) => {
  return Math.max(0, Math.min(1, x));
};

export const lerp = (a, b, u) => {
  return a * (1 - u) + b * u;
};

export const bilerp = (
  x1y1,
  x2y1,
  x1y2,
  x2y2,
  x,
  y,
) => {
  return lerp(lerp(x1y1, x2y1, x), lerp(x1y2, x2y2, x), y);
};

// Given an angle in degrees and a table of values meant to be evenly
// distributed around a circle (e.g. a color wheel), return the linearly
// interpolated value at that angle.
export const piecewiseLinearDeg = (table, a) => {
  const normalized = ((a / 360) * table.length) % table.length;
  const i0 = Math.floor(normalized);
  const i1 = (i0 + 1) % table.length;
  const u = normalized - i0;
  return lerp(table[i0], table[i1], u);
};

export const piecewiseLinearTest = (pts, x, y) => {
  const det = (a, b, x0, y0) => {
    return (b.x - a.x) * (y0 - a.y) - (b.y - a.y) * (x0 - a.x);
  };

  let aa;
  let bb;
  for (let i = 0; i < pts.length - 1; i++) {
    aa = pts[i];
    bb = pts[i + 1];
    if (x >= aa.x && x <= bb.x) {
      return det(aa, bb, x, y) > 0;
    }
  }

  if (x >= pts[pts.length - 2].x && x <= pts[pts.length - 1]) {
    return det(aa, bb, x, y) > 0;
  }

  // undefined
  return true;
};

// Given a table of values, return the linearly interpolated value
// of a given point. Assumes points in the range [0,1]. First column
// defines size of all columns.
export const linearTableLookup = (table, x, y) => {
  x = clamp(x);
  y = clamp(y);
  // This 2 (rather than 1) comes up because we're finding which cell we're in.
  const maxX = table.length - 2;
  const maxY = table[0].length - 2;

  const iX = Math.floor(x * maxX);
  const iY = Math.floor(y * maxY);

  // This is the location of the corner of the cell thus we add one and
  // and compute the cell's corners position in unit-floating point coordinates.
  const cellCornerOffsetX = iX / (maxX + 1);
  const cellCornerOffsetY = iY / (maxY + 1);

  const xInCell = x - cellCornerOffsetX;
  const yInCell = y - cellCornerOffsetY;
  return bilerp(
    table[iX][iY],
    table[iX + 1][iY],
    table[iX][iY + 1],
    table[iX + 1][iY + 1],
    xInCell,
    yInCell,
  );
};
