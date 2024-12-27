import { centreWork, drawBoard, clearBoard, setBoardLocked, getBoardLocked, getStripboardGroup } from "./board.js"
import { scales, getScaleIndex, setScaleIndex } from "./global-settings.js";
import { getCurrentLayout } from "./current-layout.js"
import { drawComponents } from "./draw-component.js";

export const setupQuickTools = () => {
  centreViewButton();
  lockBoardPositionButton();
  scaleSelect();
  saveLayoutButton();
}

const centreViewButton = () => {
  const button = document.getElementById("centre-view-button");
  button.onclick = () => {
    clearBoard();
    centreWork();
    drawBoard();
    drawComponents();
  }
}

const lockBoardPositionButton = () => {
  const button = document.getElementById("lock-board-position-button");

  button.onclick = () => {
    // Invert current board locked state.
    setBoardLocked(!getBoardLocked());

    // Update button
    if(getBoardLocked()) {
      button.innerHTML = "🔓 Unlock Board Position";
    } else {
      button.innerHTML = "🔒 Lock Board Position";
    }
  };  
}

const scaleSelect = () => {
  const select = document.getElementById("scale-select");
  for(let scaleIndex = 0; scaleIndex < scales.length; scaleIndex++) {
    const option = document.createElement("option");
    option.value = scaleIndex;
    option.innerHTML = scales[scaleIndex] + ":1";
    if(getScaleIndex() == scaleIndex) {
      option.selected = true;
    }
    select.appendChild(option);
  }

  select.onchange = (event) => {
    clearBoard();
    setScaleIndex(event.target.value);
    drawBoard();
    drawComponents();
  }
}

export const updateScaleSelect = (getScaleIndex) => {
  const select = document.getElementById("scale-select");
  for(let scaleIndex = 0; scaleIndex < select.children.length; scaleIndex++) { 
    const option = select.children[scaleIndex];
    if(getScaleIndex() == scaleIndex) {
      option.selected = true;
    } else {
      option.selected = false;
    }
  }
}

const saveLayoutButton = () => {
  const dialog = document.getElementById("load-save-layout-dialog");

  const saveButton = document.createElement("div");

  saveButton.className = "menu-item";
  saveButton.innerHTML = "Save Current Layout";
  saveButton.style.margin = "2rem auto 1rem auto";
  
  saveButton.onclick = () => {
    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(getCurrentLayout())], { type: "text/plain" });
    a.href = URL.createObjectURL(file);

    let filename = "untitled-layout.strpbrd";
    if(getCurrentLayout("layoutName")) {
      filename = getCurrentLayout("layoutName").replace(/\s+/g, '-').toLowerCase() + ".strpbrd";
    }
    a.download = filename;

    a.click();
  }

  const seperator = document.createElement("hr");
  seperator.style.borderColor = "#FFF";
  seperator.style.padding = "auto 1rem auto 1rem";

  const exportButton = document.createElement("div");

  exportButton.className = "menu-item";
  exportButton.innerHTML = "Export Current Layout (PNG)";
  exportButton.style.margin = "1rem auto 1rem auto";
  
  exportButton.onclick = () => {
    
    exportButton.innerHTML = "Exporting...";
    exportButton.disabled = true;

    const a = document.createElement("a");
    const raster = getStripboardGroup().rasterize(300);
    a.href = raster.toDataURL();

    let filename = "untitled-layout.svg";
    if(getCurrentLayout("layoutName")) {
      filename = getCurrentLayout("layoutName").replace(/\s+/g, '-').toLowerCase() + ".svg";
    }
    a.download = filename;

    a.click();
    raster.remove();
    
    exportButton.innerHTML = "Export Current Layout (PNG)";
    exportButton.disabled = false;
  }

  const exportNote = document.createElement("p");
  exportNote.textContent = "Exporting may take a few moments...";
  exportNote.style.margin = "0 auto 1rem auto";

  dialog.appendChild(saveButton);
  dialog.appendChild(seperator);
  dialog.appendChild(exportButton);
  dialog.appendChild(exportNote);

}
