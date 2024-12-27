import { mmToPxSegments } from "./utils.js"
import { globalSettings } from "./global-settings.js";
import { getSelectedHoles } from "./hole-detector.js";
import { getCurrentLayout, setCurrentLayout } from "./current-layout.js";
import { clearBoard, drawBoard } from "./board.js";
import { componentLibrary } from "./component-library/component-library-wrapper.js";
import { drawComponents, setSelectedComponent } from "./draw-component.js";
import { drawSidebar, setCurrentPage } from "./sidebar.js"

let componentGhost;
let componentGhostState = false;

export const setComponentGhostState = (newComponentGhostState) => {
  // Remove component ghost on change (component placed or new component selected)
  if(componentGhost) {
    componentGhost.clear();
  }

  componentGhostState = newComponentGhostState;

  if(componentGhostState) {
    document.body.style.cursor = "not-allowed";
  } else {
    if(getSelectedHoles()) {
      getSelectedHoles().forEach((hole) => {
        hole.item.strokeColor = "black";
        hole.item.strokeWidth = 1;
      })
    }
    document.body.style.cursor = "default";
  }

}

export const getComponentGhostState = () => {
  return componentGhostState;
}

export const getComponentGhost = () => {
  return componentGhost;
}

// Generates new refDes, sequentially.
const generateUniqueRefDes = (designator) => {
  let highestNumber = 0;
  Object.keys(getCurrentLayout("components")).forEach((refDes) => {
    // Splits refDes by alpha and numeric characters, e.g. "C12" - > ["C", "12"]
    const parts = refDes.match(/[a-z]+|\d+/ig);
    if(parts[0] == designator) {
      if(highestNumber < Number(parts[1])) {
        highestNumber = Number(parts[1]);
      }
    }
  });
  return designator + (Number(highestNumber) + 1);
}

export const placeComponent = (component, move = false) => {
  const componentId = component.componentId;
  setComponentGhostState(true);

  componentGhost = componentLibrary[componentId].draw(component);

  componentGhost.opacity = 0.5;
  
  componentGhost.onMouseDown = () => {
    // Get hole where component is anchored.
    const hole = getSelectedHoles()[0].item;
    
    let refDes;
    if(move) {
      refDes = component.refDes;
    } else {
      // Create unique refDes.
      refDes = generateUniqueRefDes(componentLibrary[componentId].refDes);
    }

      // TODO: check if hole is already occupied.
    if(hole) {
      const holeCoords = hole.data.id.split("hole-")[1];
      const components = getCurrentLayout("components");

      componentGhost.data.refDes = refDes;
      componentGhost.data.componentId = componentId;

      componentGhost.data.hole = { 
        row: holeCoords.split("-")[0],
        column: holeCoords.split("-")[1]
      }
      
      components[refDes] = componentGhost.data;
      
      setCurrentLayout("components", components);
      setComponentGhostState(false);
      
      clearBoard();
      drawBoard();
      const component = drawComponents(refDes);
      setSelectedComponent(component, true);

      setCurrentPage("component", component.data, false);
      drawSidebar();
    } else {
      console.error("Must be placed on a hole");
    }
  }

  document.getElementById("strpbrd").onmousemove = (event) => {
    if(getComponentGhostState()) {
      componentGhost.position = [(event.x - document.getElementById("sidebar").offsetWidth), event.y];
    }
  }
}
