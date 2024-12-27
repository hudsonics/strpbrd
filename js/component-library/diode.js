import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx } from "../utils.js";
import { getHoleCoords } from "../board.js";

const packages = {
  "DO-35 (Small)": {
    bodyDiameter: 1.665,
    bodyLength: 4.065
  },
  "DO-41 (Standard)": {
    bodyDiameter: 2.375,
    bodyLength: 4.635
  }
}

const defaultDiodeOptions = {
  orientation: {
    type: "select",
    label: "Orientation",
    options: ["Flat", "Upright"],
    defaultValue: "Flat"
  },
  package: {
    type: "select",
    label: "Package",
    options: ["DO-35 (Small)", "DO-41 (Standard)"],
    defaultValue: "DO-41 (Standard)"
  },
  pitch: {
    type: "select",
    label: "Pitch",
    options: [4, 5, 6, 7, 8, 9, 10],
    defaultValue: 5
  },
  composition: {
    type: "select",
    label: "Composition",
    options: ["Glass", "Plastic"],
    defaultValue: "Plastic"
  },
  partNumber: {
    type: "text",
    label: "Part Number",
    placeholder: "e.g. 1N4148"
  },
  rotation: {
    type: "select",
    label: "Rotation (°)",
    options: [0, 90, 180, 270],
    defaultValue: 0
  }
}

export const getDiodeBOMLine = (component) => {
  return {
    value: component.value || "-",
    description: component.composition + " diode",
    footprint: component.orientation + " " + component.package + ", " + ((component.pitch - 1) * 2.54) + "mm (" + component.pitch + " holes) pitch"
  }
}

export const getDiodeOptions = (currentOptions) => {
  const diodeOptions = defaultDiodeOptions;
  try {
    if(currentOptions.orientation == "Upright") {
      diodeOptions.pitch.options = [2, 3, 4, 5]
      diodeOptions.pitch.defaultValue = 2;
    } else {
      if(currentOptions.package == "DO-35 (Small)") {
        diodeOptions.pitch.options = [3, 4, 5, 6, 7, 8, 9]
        diodeOptions.pitch.defaultValue = 4;
      } else if(currentOptions.package == "DO-41 (Standard)") {
        diodeOptions.pitch.options = [4, 5, 6, 7, 8, 9, 10]
        diodeOptions.pitch.defaultValue = 5;
      }
    }
  } catch(error) {}

  return diodeOptions;
}

export const drawDiode = (component) => {
  const diodeGroup = new Group();
  let position = { x: 50, y: 50 };

  if(component.orientation == "Flat") {
    const totalLength = (component.pitch - 1) * 2.54;
    const bodyLength = packages[component.package].bodyLength;
    const bodyWidth = packages[component.package].bodyDiameter;
    const legLength = (totalLength - bodyLength) / 2;
    const centralX = bodyWidth / 2;
  
    const legs = new Path({
      segments: mmToPxSegments([[centralX, 0], [centralX, ((legLength * 2) + bodyLength)]]),
      strokeColor: "grey",
      strokeWidth: 1.75 * globalSettings.getCurrentScale(),
      strokeCap: "round",
      strokeJoin: "round"
    })

    const legCap1 = new Shape.Circle({
      center: mmToPxPoint([centralX, 0]),
      radius: globalSettings.getHoleDiameter() * 0.51,
      fillColor: "#333",
      data: {
        leg: true
      }
    }) 
    
    const legCap2 = new Shape.Circle({
      center: mmToPxPoint([centralX, totalLength]),
      radius: globalSettings.getHoleDiameter() * 0.51,
      fillColor: "#333",
      data: {
        leg: true
      }
    }) 

    const body = new Shape.Rectangle({
      topLeft: mmToPxPoint([0, legLength]),
      bottomRight: mmToPxPoint([bodyWidth, (legLength + bodyLength)]),
      radius: 5,
      strokeColor: "#333",
      strokeWidth: 0.1 * globalSettings.getCurrentScale(),
      fillColor: (component.composition == "Glass") ? "orange" : "#333"
    });

    diodeGroup.addChild(legs);
    diodeGroup.addChild(body);
    diodeGroup.addChild(legCap1);
    diodeGroup.addChild(legCap2);

    if(component.hole) {
      position = getHoleCoords(component.hole.row, component.hole.column);
      if(component.rotation == 0 || component.rotation == 180) {
        position.y = position.y + mmToPx(totalLength / 2);
      } else {
        position.x = position.x + mmToPx(totalLength / 2);
      }
    }
    
    diodeGroup.rotate(component.rotation, position);
  } else if(component.orientation == "Upright") {
    const legLength = (component.pitch - 1) * 2.54;
    const bodyDiameter = packages[component.package].bodyDiameter;
    const centralX = bodyDiameter / 2;
    const totalLength = mmToPx(legLength + (bodyDiameter / 2));
    
    const body = new Shape.Circle({
      center: mmToPxPoint([centralX, 0]),
      radius: mmToPx(bodyDiameter / 2),
      strokeColor: "#333",
      strokeWidth: 0.1 * globalSettings.getCurrentScale(),
      fillColor: (component.composition == "Glass") ? "orange" : "#555"
    });

    const legs = new Path({
      segments: mmToPxSegments([[centralX, 0], [centralX, legLength]]),
      strokeColor: "grey",
      strokeWidth: 1.75 * globalSettings.getCurrentScale(),
      strokeCap: "round",
      strokeJoin: "round"
    })

    const legCap1 = new Shape.Circle({
      center: mmToPxPoint([centralX, 0]),
      radius: globalSettings.getHoleDiameter() * 0.51,
      fillColor: "#333",
      data: {
        leg: true
      }
    }) 
    
    const legCap2 = new Shape.Circle({
      center: mmToPxPoint([centralX, legLength]),
      radius: globalSettings.getHoleDiameter() * 0.51,
      fillColor: "#333",
      data: {
        leg: true
      }
    }) 


    diodeGroup.addChild(body);
    diodeGroup.addChild(legs);
    diodeGroup.addChild(legCap1);
    diodeGroup.addChild(legCap2);

    if(component.hole) {
      position = getHoleCoords(component.hole.row, component.hole.column);
      if(component.rotation == 0 || component.rotation == 180) {
        // Vertical upright
        position.y = position.y + (totalLength / 2) - (globalSettings.getHoleSpacing() / 2) + mmToPx(0.3);
        /*if(component.powerRating == "1/4W") {
          position.y = position.y + (component.rotation == 0 ? mmToPx(0.25) : mmToPx(1));
        }*/
      } else {
        // Horizontal upright
        position.x = position.x + (totalLength / 2) - (globalSettings.getHoleSpacing() / 2);
        /*if(component.powerRating == "1/4W") {
          position.x = position.x + (component.rotation == 270 ? mmToPx(0.25) : mmToPx(1));
        }*/
      }
    }
    // ((component.pitch - 1) * 2.54) / 2
    diodeGroup.rotate(component.rotation, legs.position);
  }

  diodeGroup.position = position;
  diodeGroup.data = component;

  if(component.refDes) {
    diodeGroup.data.refDes = component.refDes;
  }

  return diodeGroup;
}
