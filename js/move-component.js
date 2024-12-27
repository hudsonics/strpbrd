import { getCurrentLayout, setCurrentLayout } from "./current-layout.js";
import { drawComponents } from "./draw-component.js";
import { placeComponent } from "./place-component.js";
import { clearBoard, drawBoard } from "./board.js";

export const moveComponent = (component) => {
  const currentLayout = getCurrentLayout("components");
  if(currentLayout[component.refDes]) {
    const componentToBeMoved = currentLayout[component.refDes];
    // Remove component from layout.
    delete currentLayout[component.refDes];
    setCurrentLayout("components", currentLayout);

    // Redraw board to remove component being moved.
    clearBoard();
    drawBoard();
    drawComponents();

    // Readd component being moved.
    currentLayout[component.refDes] = component;

    // Move component.
    placeComponent(component, true);
  }
}
