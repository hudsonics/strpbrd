// Imports from other scripts.
import { drawBoard, centreWork } from "./board.js";
import { setupControls } from "./controls.js";
import { setupQuickTools } from "./quick-tools.js";
import { setupDialogs } from "./dialogs.js";
import { setupSidebar } from "./sidebar.js";
import { setupHoleDetector } from "./hole-detector.js";
import { getSelectedComponent, setSelectedComponent } from "./draw-component.js";
import { setCurrentPage } from "./sidebar.js";

// Make paper.js accessible to all JS.
paper.install(window);

window.onload = (event) => {
  paper.setup('strpbrd');

  const background = new Path.Rectangle({
    point: [0, 0],
    size: [view.size.width, view.size.height],
    strokeColor: 'white',
  });
  background.sendToBack();
  background.fillColor = 'white';

  background.onClick = () => {
    if(getSelectedComponent()) {
      setSelectedComponent(null, true);
      setCurrentPage("main");
    }
  }

  setupControls();
  setupDialogs();
  setupQuickTools();
  setupSidebar();
  centreWork();
  drawBoard();
  setupHoleDetector();
};

