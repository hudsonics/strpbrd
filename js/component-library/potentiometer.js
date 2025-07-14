import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx } from "../utils.js";
import { getHoleCoords } from "../board.js";

const defaultPotentiometerOptions = {
  value: {
    type: "text",
    label: "Resistance",
    placeholder: "e.g. 10K"
  },
  rotation: {
    type: "select",
    label: "Rotation (°)",
    options: [0, 90, 180, 270],
    defaultValue: 0
  },
  refDesLabelSize: {
    type: "select",
    label: "RefDes Size (pt)",
    options: [0, 2, 4, 6, 8, 10],
    defaultValue: 6
  }
}

export const getPotentiometerOptions = (currentOptions) => {
  const updatedPotentiometerOptions = defaultPotentiometerOptions;

  return updatedPotentiometerOptions;
}

export const getPotentiometerBOMLine = (component) => {
  return {
    value: component.value || "-",
    description: "Trimpot",
    footprint: "Trimpot"
  }
}

export const drawPotentiometer = (component) => {
  const potentiometerGroup = new Group();
  
  const pitchX = 3;
  const pitchY = 3;
  
  const bodyDimension = 6;
  const trimmerDiameter = 5;

  const totalLength = component.pitch * 2.54;
  const centralX = mmToPx(bodyDimension / 2);

  const body = new Shape.Rectangle({
    topLeft: [0, 0],
    bottomRight: mmToPxPoint([bodyDimension, bodyDimension]),
    radius: 5,
    strokeColor: "#333",
    strokeWidth: 0.1 * globalSettings.getCurrentScale(),
    fillColor: "blue"   
  });

  const trimmer = new Shape.Circle({
    center: mmToPxPoint([bodyDimension / 2, bodyDimension / 2]),
    radius: mmToPx(trimmerDiameter / 2),
    strokeColor: "#333",
    strokeWidth: 0.1 * globalSettings.getCurrentScale(),
    fillColor: "white",
  })
  
  const screw = new Shape.Rectangle({
    topLeft: mmToPxPoint([1, (bodyDimension / 2) - 0.5]),
    bottomRight: mmToPxPoint([(bodyDimension) - 1, (bodyDimension / 2) + 0.5]),
    radius: 2,
    strokeColor: "#333",
    strokeWidth: 0.1 * globalSettings.getCurrentScale(),
    fillColor: "lightgray"   
  });

  screw.position = mmToPxPoint([bodyDimension / 2, bodyDimension / 2])
  
  potentiometerGroup.addChild(body);
  potentiometerGroup.addChild(trimmer);
  potentiometerGroup.addChild(screw);

  const holeRadius = globalSettings.getHoleDiameter() * 0.45;
  const legCoords = [
    [mmToPx(bodyDimension / 2), holeRadius],
    [holeRadius, mmToPx(bodyDimension) - holeRadius],
    [mmToPx(bodyDimension) - holeRadius, mmToPx(bodyDimension) - holeRadius]
  ];

  for(let i = 0; i < 3; i++) {
    const leg = new Shape.Circle({
      center: legCoords[i],
      radius: globalSettings.getHoleDiameter() * 0.51,
      fillColor: "#333",
      data: {
        leg: (i == 0) ? true : false
      }
    })
    potentiometerGroup.addChild(leg);
  }

  // Add reference designator label - needs to be rotated independently.
  const refDesLabel = new PointText({
    point: [0, 0],
    content: component.refDes,
    fillColor: "black",
    fontFamily: "monospace",
    justification: "center",
    fontSize: component.refDesLabelSize * globalSettings.getCurrentScale() + "pt"
  });
 
  let position = { x: 50, y: 50 };

  if(component.hole) {
    position = getHoleCoords(component.hole.row, component.hole.column);
    // TODO: add position exception if axial capacitor.
    // AXIAL - position.y = position.y - mmToPx(totalLength / 2);
    if(component.rotation == 0) {
      position.y = position.y + mmToPx(2.54);
    } else if(component.rotation == 90) {
      position.x = position.x - mmToPx(2.54);
    } else if (component.rotation == 180) {
      position.y = position.y - mmToPx(2.54);
    } else {
      position.x = position.x + mmToPx(2.54);
    }
    //} else {
    //  position.x = position.x + mmToPx(2.54);
    //}
  }

  potentiometerGroup.position = position;
  potentiometerGroup.data = component;
  potentiometerGroup.rotate(component.rotation);

  // Center reference designator label.
  if(component.rotation == 0 || component.rotation == 180) {
    refDesLabel.rotation = 0;
    refDesLabel.point = [potentiometerGroup.bounds.x + (potentiometerGroup.bounds.width / 2), potentiometerGroup.bounds.y + (potentiometerGroup.bounds.height / 2) + (refDesLabel.bounds.height / 4)];
  } else {
    refDesLabel.rotation = -90;
    refDesLabel.point = [potentiometerGroup.bounds.x + (potentiometerGroup.bounds.width / 2) + (refDesLabel.bounds.width / 4), potentiometerGroup.bounds.y + (potentiometerGroup.bounds.height / 2)];
  }
  
  potentiometerGroup.addChild(refDesLabel);
  
  if(component.refDes) {
    potentiometerGroup.data.refDes = component.refDes;
  }

  return potentiometerGroup;
}
