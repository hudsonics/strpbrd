import { getCurrentLayout } from "./current-layout.js";
import { globalSettings } from "./global-settings.js";

// Calculate centre coords for board of given size.
export const calculateWorkCentre = () => {
  // Calculate size of board.
  const workWidth = (globalSettings.getSubstratePadding() * 2) + (getCurrentLayout("boardWidth") * globalSettings.getHoleSpacing());
  const workHeight = (globalSettings.getSubstratePadding() * 2) + (getCurrentLayout("boardHeight") * globalSettings.getHoleSpacing());

  // Find height of workspace (in pixels).
  const canvasWidth = document.getElementById("strpbrd").width;
  const canvasHeight = document.getElementById("strpbrd").height;

  // Find halfway point (centre coords).
  const x = Math.floor((canvasWidth / 2) - (workWidth / 2)) - (document.getElementById("sidebar").clientWidth);
  const y = Math.floor((canvasHeight / 2) - (workHeight / 2)) - (document.getElementsByTagName("footer")[0].clientHeight);

  return { centreCoords: { x, y }, bounds: { topLeft: { x, y } } };
}

// Handle the position of the work
// Values dervied from Paper.js group object - stored seperately so it can persist between transformations.
const workPosition = {
  x: 0,
  y: 0,
  bounds: {
    topLeft: 0
  }
}

export const setWorkPosition = (position, bounds) => {
  workPosition.x = position.x;
  workPosition.y = position.y;
  workPosition.bounds.topLeft = bounds.topLeft;
}

export const getWorkPosition = () => { return workPosition; }
