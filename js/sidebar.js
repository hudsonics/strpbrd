import { placeComponent } from "./place-component.js";
import { updateComponent } from "./update-component.js";
import { deleteComponent } from "./delete-component.js";
import { getSelectedComponent, setSelectedComponent } from "./draw-component.js";
import { componentLibrary } from "./component-library/component-library-wrapper.js";
import { duplicateComponent } from "./duplicate-component.js";
import { moveComponent } from "./move-component.js";

let currentPage = "main";

const pages = ["main", "find-component", "component"];

const getCurrentPage = () => {
  return currentPage;
}

export const setCurrentPage = (newPage) => {
  currentPage = newPage;
  drawSidebar();
}

export const setupSidebar = () => {
  const placeTrackCutButton = document.getElementById("place-track-cut-button");
  placeTrackCutButton.onclick = () => {
    placeComponent({ componentId: "track-cut" });
  }

  const findComponentButton = document.getElementById("find-component-button");
  findComponentButton.onclick = () => {
    setCurrentPage("find-component");
  }
  
  const placeWireButton = document.getElementById("place-wire-button");
  placeWireButton.onclick = () => {
    setCurrentPage("component");
    componentOptions("wire", {}, false);
  }
  
  const placeLabelButton = document.getElementById("place-label-button");
  placeLabelButton.onclick = () => {
    setCurrentPage("component");
    componentOptions("label", {}, false);
  }

  const findComponentInput = document.getElementById("findComponent");
  findComponentInput.oninput = () => {
    if(findComponentInput.value) {
      findComponent(findComponentInput.value);
    }
  }

  const backToMainSidebarButton = document.getElementById("back-to-main-sidebar");
  backToMainSidebarButton.onclick = () => {
    setCurrentPage("main");
    setSelectedComponent(null);
  }
  
  const backToFindComponentSidebarButton = document.getElementById("back-to-find-component-sidebar");
  backToFindComponentSidebarButton.onclick = () => {
    setCurrentPage("find-component");
    setSelectedComponent(null);
  }
}

const findComponent = (term) => {
  term = term.toLowerCase();
  let results = [];

  for(let i = 0; i < Object.keys(componentLibrary).length; i++) {
    const componentId = Object.keys(componentLibrary)[i];
    for(let j = 0; j < componentLibrary[componentId].aliases.length; j++) {
      const alias = componentLibrary[componentId].aliases[j];
      if(alias.search(term) >= 0) {
        results.push(componentId);
        break;
      }
    }
  }
  
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  const numberOfResults = document.createElement("p");
  numberOfResults.innerHTML = results.length + " result(s) found.";

  const resultsList = document.createElement("div");
  
  results.forEach((componentId) => {
    const resultItem = document.createElement("div");
    resultItem.className = "resultItem";
    resultItem.onclick = () => {
      if(componentLibrary[componentId].getOptions({})) {
        setCurrentPage("component");
        componentOptions(componentId, {}, false);
      } else {
        placeComponent({ componentId: componentId });
      }
    }

    const resultName = document.createElement("p");
    resultName.innerHTML = componentLibrary[componentId].properName;

    resultItem.appendChild(resultName);
    resultsList.appendChild(resultItem);
  });

  resultsDiv.appendChild(numberOfResults);
  resultsDiv.appendChild(resultsList);

}

export const drawSidebar = () => {
  pages.forEach((page) => {
    if(page == currentPage) {
      document.getElementById("sidebar-" + page).style.display = "block";
    } else {
      document.getElementById("sidebar-" + page).style.display = "none";
    }
  });


  if(currentPage == "component") {
    // Dynamically generate component options
    const selectedComponent = getSelectedComponent();
    if(selectedComponent) {
      componentOptions(selectedComponent.data.componentId, selectedComponent.data, false);
    }
  }
}

const componentOptions = (componentId, existingOptions, fieldUpdated = false) => {
  const componentProperties = document.getElementById("component-properties");

  // Get currently selected options - dynamically update available options given current selection, e.g. change range of available pitches on different size components.
  let currentOptions = {};
  if(existingOptions && getSelectedComponent() && !fieldUpdated) {
    // If existing component is selected, update fields to use data for existing component.
    currentOptions = existingOptions;
  } else {
    if(componentProperties.children.length > 0) {
      Array.from(componentProperties.children).forEach((child) => {
        if(child.className == "field-container") {
          if(child.children[1].value) {
            currentOptions[child.children[1].id] = child.children[1].value;
          }
        }
      })
    }
  }

  // Clear current property fields and redraw.
  componentProperties.innerHTML = "";

  const componentName = document.createElement("h3");
  if(getSelectedComponent()) {
    componentName.innerHTML = componentLibrary[componentId].properName + " - <b>" + getSelectedComponent().data.refDes + "</b>";
  } else {
    componentName.innerHTML = componentLibrary[componentId].properName;
  }

  componentProperties.appendChild(componentName); 

  let propertyElements = [];
  
  Object.keys(componentLibrary[componentId].getOptions(currentOptions)).forEach((componentOption) => {
    const property = componentLibrary[componentId].getOptions(currentOptions)[componentOption];

    if(property.type == "header") {
      const header = document.createElement("p");
      header.style.fontWeight = "bold";
      header.textContent = property.label;
      componentProperties.appendChild(header);
      return;
    }

    const fieldContainer = document.createElement("div");
    fieldContainer.className = "field-container";
    
    const label = document.createElement("label");
    label.className = "field-label";
    label.innerHTML = property.label;
    
    fieldContainer.appendChild(label);

    propertyElements.push(componentOption);
      
    if(property.type == "select") {
      const select = document.createElement("select");
      select.id = componentOption;

      select.onchange = () => {
        //setCurrentPage("component");
        componentOptions(componentId, currentOptions, true);
      }

      property.options.forEach((value) => {
        const option = document.createElement("option");
        option.value = value;
        option.innerHTML = value;

        select.appendChild(option);
      });

      let valueSet = false;
      Array.from(select.children).forEach((option) => {
        if(option.value == currentOptions[componentOption]) {
          option.selected = true;
          valueSet = true;
        }
      });

      if(!valueSet) {
        Array.from(select.children).forEach((option) => {
          if(option.value == property.defaultValue) {
            option.selected = true;
            valueSet = true;
          }
      });

      }

      fieldContainer.appendChild(select);
    } else if(property.type == "text") {
      const input = document.createElement("input");
      input.id = componentOption;
      input.type = "text";
      input.placeholder = property.placeholder || "";
      input.value = currentOptions[componentOption] || "";
      
      fieldContainer.appendChild(input);
    } else if(property.type == "number") {
      const input = document.createElement("input");
      input.id = componentOption;
      input.type = "number";
      input.step = property.step;
      input.min = property.min;
      input.max = property.max;
      input.value = currentOptions[componentOption] || property.defaultValue;
      
      fieldContainer.appendChild(input);
    } else if(property.type == "boolean") {
      const input = document.createElement("input");
      input.id = componentOption;
      input.type = "checkbox";
      input.value = "true";
      input.checked = (currentOptions[componentOption] || property.defaultValue) ? true : false;
      
      fieldContainer.appendChild(input);
      
    }
    
    componentProperties.appendChild(fieldContainer);
  })
  
  const placeComponentButton = document.getElementById("place-component-button");
  
  placeComponentButton.style.display = "block";
  if(Object.keys(componentLibrary[componentId].getOptions(currentOptions)).length == 0) {
    placeComponentButton.style.display = "none";
  } else if(getSelectedComponent()) {
    placeComponentButton.innerHTML = "♻  Update " + componentLibrary[componentId].properName + " " + getSelectedComponent().data.refDes;
  } else {
    placeComponentButton.innerHTML = "📍 Place " + componentLibrary[componentId].properName;
  }

  placeComponentButton.onclick = () => {
    const componentToBePlacedOptions = { componentId: componentId, terminals: componentLibrary[componentId].getTerminals() };
    propertyElements.forEach((elementId) => {
      if(document.getElementById(elementId).type == "checkbox") {
        componentToBePlacedOptions[elementId] = document.getElementById(elementId).checked ? true : false;
      } else {
        componentToBePlacedOptions[elementId] = document.getElementById(elementId).value;
      }
    });
    if(getSelectedComponent()) {
      updateComponent(getSelectedComponent(), componentToBePlacedOptions);
    } else {
      placeComponent(componentToBePlacedOptions);
    }
  }

  // Move
  //
  const moveComponentButton = document.getElementById("move-component-button");
  moveComponentButton.style.display = "none";
  if(getSelectedComponent()) {
    moveComponentButton.innerHTML = "✥ Move " + componentLibrary[componentId].properName + " " + getSelectedComponent().data.refDes;
    moveComponentButton.style.display = "block";
  }

  moveComponentButton.onclick = () => {
    if(getSelectedComponent()) {
      moveComponent(getSelectedComponent().data);
      //placeComponent(getSelectedComponent().data, true);
    }
  }

  const duplicateComponentButton = document.getElementById("duplicate-component-button");
  duplicateComponentButton.style.display = "none";
  if(getSelectedComponent()) {
    duplicateComponentButton.innerHTML = "📋 Duplicate " + componentLibrary[componentId].properName + " " + getSelectedComponent().data.refDes;
    duplicateComponentButton.style.display = "block";
  }

  duplicateComponentButton.onclick = () => {
    if(getSelectedComponent()) {
      duplicateComponent();
    }
  }
  
  const newComponentButton = document.getElementById("new-component-button");
  newComponentButton.style.display = "none";
  if(getSelectedComponent() && componentId != "track-cut") {
    newComponentButton.innerHTML = "➕ Add Another " + componentLibrary[componentId].properName;
    newComponentButton.style.display = "block";
  }

  newComponentButton.onclick = () => {
    setCurrentPage("component");
    setSelectedComponent(null, true);
    componentOptions(componentId, {}, false);
  }

  const deleteComponentButton = document.getElementById("delete-component-button");
  deleteComponentButton.style.display = "none";
  if(getSelectedComponent()) {
    deleteComponentButton.innerHTML = "🗑 Delete " + componentLibrary[componentId].properName + " " + getSelectedComponent().data.refDes;
    deleteComponentButton.style.display = "block";
  }

  deleteComponentButton.onclick = () => {
    if(getSelectedComponent()) {
      deleteComponent(getSelectedComponent());
    }
  }
}
