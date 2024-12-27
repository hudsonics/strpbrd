import { globalSettings } from "./global-settings.js";

export const mmToPx = (mm) => {
  // Assuming DPI of 96.
  return ((mm * 96) / 25.4) * globalSettings.getCurrentScale();
}

export const mmToPxSegments = (segments) => {
  return segments.map(coord => coord.map(point => mmToPx(point)));
}

export const mmToPxPoint = (point) => {
  return [mmToPx(point[0]), mmToPx(point[1])];
}

export const ptToPxHeight = (pt) => {
  // 1pt text height = 1.334 px
  return Number(pt.slice(0, -2)) * 1.334;
}
