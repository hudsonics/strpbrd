import { mmToPx } from "./utils.js";
import { getComponentGhostState } from "./place-component.js"

export const globalSettings = {
  getCurrentScale: () => { return scales[scaleIndex]; },
  trackColour: "#d5b376",
  substrateColour: "beige"
}

// Define real life sizes of board dimensions - all sizes in mm.
globalSettings.getHoleDiameter = () => { return mmToPx(1.02); };
globalSettings.getPadDiameter = () => { return mmToPx(2); };
globalSettings.getHoleSpacing = () => { return mmToPx(2.54); };
globalSettings.getTrackWidth = () => { return mmToPx(2); };
globalSettings.getSubstratePadding = () => { return mmToPx(1); };

// Scales (zoom level).
export const scales = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
let scaleIndex = 3;
export const getScaleIndex = () => { return scaleIndex; }
export const setScaleIndex = (newScaleIndex) => { 
  if(!getComponentGhostState()) {
    scaleIndex = newScaleIndex; 
  }
}

