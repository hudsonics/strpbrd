import { updateScaleSelect } from "./quick-tools.js";
import { getScaleIndex, setScaleIndex, scales } from "./global-settings.js";
import { clearBoard, drawBoard, moveBoard } from "./board.js";
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
      if(!event.shiftKey && !event.ctrlKey && !getComponentGhostState()) {
        // Increase scale if possible.
        event.preventDefault();
        if(getScaleIndex() < (scales.length - 1)) { 
          setScaleIndex(getScaleIndex() + 1);
        }
      } else if(event.shiftKey && !event.ctrlKey) {
        // Move board position right
        event.preventDefault();
        moveBoard(10, 0);
      } else if(!event.shiftKey && event.ctrlKey) {
        // Move board position up
        event.preventDefault();
        moveBoard(0, 10);
      }


    } else {
      if(!event.shiftKey && !event.ctrlKey && !getComponentGhostState()) {
        // Decrease scale if possible.
        event.preventDefault();
        if(getScaleIndex() > 0) { 
          setScaleIndex(getScaleIndex() - 1);
        }
      } else if(event.shiftKey && !event.ctrlKey) {
        // Move board position left
        event.preventDefault();
        moveBoard(-10, 0);
      } else if(!event.shiftKey && event.ctrlKey) {
        // Move board position down
        event.preventDefault();
        moveBoard(0, -10);
      }
    }

    // Prevent redraw when component is being placed, e.g. scaling.
    if(!event.shiftKey && !event.ctrlKey && !getComponentGhostState()) {
      updateScaleSelect(getScaleIndex);
      clearBoard();  
      drawBoard();
      drawComponents();
    }
  }, { passive: false });

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
