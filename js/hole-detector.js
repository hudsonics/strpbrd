import { getComponentGhostState, getComponentGhost } from "./place-component.js";
import { globalSettings } from "./global-settings.js";
import { getHoles } from "./board.js";

// Hole detector.
let selectedHoles = [];

const setSelectedHoles = (newSelectedHoles) => {
  selectedHoles = newSelectedHoles;
}

export const getSelectedHoles = () => {
  return selectedHoles;
}

export const setupHoleDetector = () => {
  window.onmousemove = (event) => {
    // Only highlight holes if component is currently being placed.
    if(getComponentGhostState()) {

      document.body.style.cursor = "not-allowed";
      
      if(getSelectedHoles()) {
        getSelectedHoles().forEach((hole) => {
          hole.item.strokeColor = "black";
          hole.item.strokeWidth = 1;
        });
      }

      // Get all holes intersected by ghost component.
      const componentGhost = getComponentGhost();

      const legs = [];
      componentGhost.children.forEach((child) => {
        if(child.data.leg == true) {
          legs.push(child);
        }
      });

      const holes = getHoles();
      const holesIntersecting = [];
      holes.forEach((hole) => {
        //legs.forEach((leg) => {
          if(legs[0].intersects(hole)) {
            holesIntersecting.push({
              item: hole,
              row: Number(hole.data.id.split("-")[1]),
              column: Number(hole.data.id.split("-")[2])
            });
          }
          if(legs[legs.length - 1].intersects(hole)) {
            holesIntersecting.push({
              item: hole,
              row: Number(hole.data.id.split("-")[1]),
              column: Number(hole.data.id.split("-")[2])
            });
          }
        //})
      });
   
      const terminals = componentGhost.data.terminals;

      if(holesIntersecting.length >= 2) {
        document.body.style.cursor = "default";
        const sortedHoles = holesIntersecting.sort((a, b) => {
          // Sort by column
          if (a.column < b.column) return -1;
          if (a.column > b.column) return 1;
          // Sort by row
          if (a.row < b.row) return -1;
          if (a.row > b.row) return 1;
          // Don't sort if comparison is already equal.
          return 0;
        });

        sortedHoles.forEach((hole) => {
          hole.item.strokeColor = "green";
          hole.item.strokeWidth = 1 * globalSettings.getCurrentScale();
        });
        setSelectedHoles(sortedHoles);
      }
    }
  }
}
