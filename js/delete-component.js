import { getCurrentLayout, setCurrentLayout } from "./current-layout.js";
import { clearBoard, drawBoard } from "./board.js";
import { drawComponents, setSelectedComponent } from "./draw-component.js";
import { setCurrentPage } from "./sidebar.js";

export const deleteComponent = (component) => {
  if(window.confirm("Are you sure you want to delete " + component.data.refDes + "?")) {
    const components = getCurrentLayout("components");
    delete components[component.data.refDes];
    setCurrentLayout("components", components);
    clearBoard();
    drawBoard();
    drawComponents();
    setSelectedComponent(null);
    setCurrentPage("main");
  }
}
