import { getCurrentLayout, setCurrentLayout } from "./current-layout.js";
import { clearBoard, drawBoard } from "./board.js";
import { drawComponents } from "./draw-component.js";

export const updateComponent = (component, updatedOptions) => {

  let updatedComponent = component;

  Object.keys(updatedOptions).forEach((property) => {
    if(updatedComponent.data[property] != updatedOptions[property]) {
      updatedComponent.data[property] = updatedOptions[property];
    }
  })

  const components = getCurrentLayout("components");
  components[component.data.refDes] = updatedComponent.data;
      
  setCurrentLayout("components", components);
  clearBoard();
  drawBoard();
  drawComponents();
}
