import { getCurrentLayout } from "./current-layout.js";
import { componentLibrary } from "./component-library/component-library-wrapper.js";

export const generateBOM = (includeWires = false, consolidateBOM = true) => {
  const currentLayout = getCurrentLayout();
  const components = JSON.parse(JSON.stringify(getCurrentLayout("components")))
  const BOM = [];

  if(currentLayout.layoutName) {
    BOM.push(["Layout Name", currentLayout.layoutName]);
  }
  
  if(currentLayout.authorName) {
    BOM.push(["Layout Designed By", currentLayout.authorName]);
  }

  BOM.push(["Board Dimensions", currentLayout.boardWidth + "x" + currentLayout.boardHeight + " holes"]);

  BOM.push([""]);
  BOM.push([""]);
  BOM.push([""]);
  
  const consolidatedBOM = BOM;

  if(consolidateBOM) {
    consolidatedBOM.push(["Reference Designator(s)", "Quantity", "Description", "Value", "Footprint"])
  } else {
    BOM.push(["Reference Designator", "Description", "Value", "Footprint"])
  }

  const orderedComponents = Object.keys(components).sort().reduce((obj, key) => { 
    obj[key] = components[key]; 
    return obj;
  }, {});


  const duplicateComponents = {}
  const excludedComponents = ["track-cut", "label"];
  if(!includeWires) {
    excludedComponents.push("wire");
  }
  Object.keys(orderedComponents).forEach((refDes) => {
    const component = orderedComponents[refDes];
    if(!excludedComponents.includes(component.componentId)) {
      const bomLine = componentLibrary[component.componentId].getBOMLine(component);

      if(!consolidateBOM) {
        BOM.push([
          refDes,
          bomLine.description,
          bomLine.value,
          bomLine.footprint
        ])
      }
      
      const duplicateKey = component.componentId + bomLine.value + bomLine.description + bomLine.footprint
      if(duplicateComponents[duplicateKey]) {
        duplicateComponents[duplicateKey].refDes.push(refDes);
        duplicateComponents[duplicateKey].qty = Number(duplicateComponents[duplicateKey].qty) + 1;
      } else {
        duplicateComponents[duplicateKey] = {
          refDes: [refDes],
          qty: 1,
          description: bomLine.description,
          value: bomLine.value,
          footprint: bomLine.footprint
        }
      }
    }
  })

  if(consolidateBOM) {
    Object.keys(duplicateComponents).forEach((duplicateKey) => {
      const component = duplicateComponents[duplicateKey];
      consolidatedBOM.push([
        component.refDes.join(", "),
        component.qty,
        component.description,
        component.value,
        component.footprint
      ])
    })

    return consolidatedBOM;
  } else {
    return BOM;
  }
  
}
