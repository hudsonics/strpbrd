import { getHoleCoords, getStripboardGroup, clearBoard, drawBoard } from "./board.js";
import { componentLibrary } from "./component-library/component-library-wrapper.js";
import { getCurrentLayout } from "./current-layout.js";
import { placeComponent } from "./place-component.js";
import { setCurrentPage } from "./sidebar.js";
import { globalSettings } from "./global-settings.js";

export const drawComponents = (returnComponent = null) => {
  const components = getCurrentLayout("components");
  let componentToReturn;
  // Draw all components, except track cuts.
  Object.keys(components).forEach((refDes) => {
    if(components[refDes].componentId != "track-cut") {
      const component = drawComponent(components[refDes]);
      if(!componentToReturn && refDes == returnComponent) {
        componentToReturn = component;
      }
    }
  });

  // Draw trackcuts on top of all other components - makes selecting coomponents easier.
  Object.keys(components).forEach((refDes) => {
    if(components[refDes].componentId == "track-cut") {
      const component = drawComponent(components[refDes]);
      if(!componentToReturn && refDes == returnComponent) {
        componentToReturn = component;
      }
    }
  });
 
  if(returnComponent && componentToReturn) {
    return componentToReturn;
  }
};

let selectedComponent;

export const getSelectedComponent = () => {
  return selectedComponent;
}

export const setSelectedComponent = (componentToBeSelected = null, redrawBoard = false) => {
  selectedComponent = componentToBeSelected;

  // Redraw board, if requested
  if(redrawBoard) {
    clearBoard();  
    drawBoard();
    drawComponents();
  }
}

export const drawComponent = (component) => {
  // If no position given, get position from holeId.
  const componentItem = componentLibrary[component.componentId].draw(component);

  componentItem.opacity = 0.8;
  
  if(getSelectedComponent()) {
    if(componentItem.data.refDes == getSelectedComponent().data.refDes) {
      componentItem.blendMode = 'multiply';
      componentItem.opacity = 0.6;
    }
  } else {
    componentItem.onMouseEnter = () => {
      componentItem.blendMode = 'multiply';
    }
    
    componentItem.onMouseLeave = () => {
      componentItem.blendMode = 'normal';
    }
  }

  componentItem.onClick = () => {
    setSelectedComponent(componentItem, true);
    setCurrentPage("component");
  }


  // Add component to main graphics group.
  getStripboardGroup().addChild(componentItem);

  return componentItem;
}
