import { getCurrentLayout, setCurrentLayout, loadCurrentLayout } from "./current-layout.js";
import { clearBoard, drawBoard } from "./board.js";
import { drawComponents } from "./draw-component.js"

const dialogs = ["board-setup", "load-save-layout", "bom", "help"]

const dialogFields = {
  "board-setup": {
    layoutName: {
      type: "text",
      label: "Layout Name",
      placeholder: "Name your layout",
      updateLayoutOnChange: true,
      updateWorkOnChange: false
    },
    authorName: {
      type: "text",
      label: "Author Name",
      placeholder: "Enter your name",
      updateLayoutOnChange: true,
      updateWorkOnChange: false
    },
    boardWidth: {
      type: "integer",
      min: 1,
      max: 1000,
      label: "Board Width",
      updateLayoutOnChange: true,
      updateWorkOnChange: true
    },
    boardHeight: {
      type: "integer",
      min: 1,
      max: 1000,
      label: "Board Height",
      updateLayoutOnChange: true,
      updateWorkOnChange: true
    },
    perf: {
      type: "boolean",
      label: "Perf board?",
      updateLayoutOnChange: true,
      updateWorkOnChange: true
    }
  },
  "load-save-layout": {
    loadLayout: {
      type: "file",
      label: "Load Layout",
      accept: ".strpbrd",
      updateLayoutOnChange: false,
      updateWorkOnChange: false,
      loadsLayout: true
    }
  },
  "bom": {
    includeWires: {
      type: "boolean",
      label: "Include wires?",
    },
    consolidateBOM: {
      type: "boolean",
      label: "Consolidate BOM?",
    }
  }
}

const createForm = (fields, dialog) => {

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    const container = document.createElement("div");
    container.className = "field-container";

    const label = document.createElement("label");
    label.className = "field-label";
    label.innerHTML = field.label;

    const input = document.createElement("input");
    input.id = key + "-input";
    input.className = "field-input";
    
    if(getCurrentLayout(key)) {
      input.value = getCurrentLayout(key);
    } else {
      input.value = null;
    }

    if(field.type == "text") {
      input.type = "text";
      input.placeholder = field.placeholder;
    } else if(field.type == "integer") {
      input.type = "number";
      input.step = "1";
      input.min = field.min;
      input.max = field.max;
    } else if(field.type == "file") {
      input.type = "file";
      input.accept = field.accept;
      input.style.maxWidth = "155px"; 
    } else if (field.type == "boolean") {
      input.type = "checkbox";
      input.value = "true";
    }
    
    input.onchange = (event) => {
      if(field.updateLayoutOnChange) {
        if(field.type == "boolean") {
          setCurrentLayout(key, event.target.checked ? true : false);
        } else {
          setCurrentLayout(key, event.target.value);
        }  
      }
      
      if(field.updateWorkOnChange) {
        clearBoard();
        drawBoard();
      }

      if(field.loadsLayout) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            loadCurrentLayout(JSON.parse(reader.result));
            clearBoard();
            drawBoard();
            drawComponents();
            dialog.close();
            alert("Layout loaded successfully!");
          } catch(error) {
            alert("Failed to load layout file. See the console for more details.");
            console.error(error);
          }
        };
        reader.readAsText(input.files[0]);
      }
    }

    container.appendChild(label);
    container.appendChild(input);

    dialog.appendChild(container);

  })
}

export const setupDialogs = () => {
  for(let i = 0; i < dialogs.length; i++) {
    const dialog = document.getElementById(dialogs[i] + "-dialog");
    const openButton = document.getElementById(dialogs[i] + "-open-button");
    openButton.onclick = () => {
      dialog.showModal();
    }

    const closeButton = document.getElementById(dialogs[i] + "-close-button");
    closeButton.onclick = () => {
      dialog.close();
    }

    if(dialogFields[dialogs[i]]) {
      createForm(dialogFields[dialogs[i]], dialog);
    }
  }
}
