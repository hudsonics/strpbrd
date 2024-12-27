import { updateScaleSelect } from "./quick-tools.js";
import { getScaleIndex, setScaleIndex, scales } from "./global-settings.js";
import { clearBoard, drawBoard } from "./board.js";
import { getComponentGhostState, setComponentGhostState } from "./place-component.js";
import { getSelectedComponent, setSelectedComponent, drawComponents } from "./draw-component.js";
import { setCurrentPage } from "./sidebar.js";
import { undo, redo } from "./current-layout.js";
import { deleteComponent } from "./delete-component.js";
import { duplicateComponent } from "./duplicate-component.js";
import { moveComponent } from "./move-component.js";

export const setupControls = () => {
  // Zoom on scroll.
  window.addEventListener("wheel", (event) => { 
    // If Y movement is negative, user has scrolled up.
    const scrollUp = event.deltaY < 0;
    if(scrollUp == true) {
      // Increase scale if possible.
      if(getScaleIndex() < (scales.length - 1)) { 
        setScaleIndex(getScaleIndex() + 1);
      }
    } else {
      // Decrease scale if possible.
      if(getScaleIndex() > 0) { 
        setScaleIndex(getScaleIndex() - 1);
      }
    }

    // Prevent redraw when component is being placed, e.g. scaling.
    if(!getComponentGhostState()) {
      updateScaleSelect(getScaleIndex);
      clearBoard();  
      drawBoard();
      drawComponents();
    }
  });

  window.onkeydown = (event) => {
    switch(event.key) {
      case "Escape": {
        // If component is currently being placed, cancel placement.
        if(getComponentGhostState()) {
          setComponentGhostState(false);
        }

        if(getSelectedComponent()) {
          setSelectedComponent(null, true);
          setCurrentPage("main");
        }

        break;
      }
      case 'z': {
        if(event.ctrlKey) {
          undo();
          clearBoard();  
          drawBoard();
          drawComponents();
        }
        break;
      }
      case 'y': {
        if(event.ctrlKey) {
          redo();
          clearBoard();  
          drawBoard();
          drawComponents();
        }
        break;
      }
      case 'Delete': {
        if(getSelectedComponent()) {
          deleteComponent(getSelectedComponent());
        }
        break;
      }
      case 'c': {
        if(event.ctrlKey && getSelectedComponent()) {
          duplicateComponent(getSelectedComponent().data);
        }
        break;
      }
      case 'm': {
        if(getSelectedComponent()) {
          moveComponent(getSelectedComponent().data);
        }
        break;
      }
      default: {}
    }
  }
}
