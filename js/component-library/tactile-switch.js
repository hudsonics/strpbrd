import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx } from "../utils.js";
import { getHoleCoords } from "../board.js";

const defaultTactileSwitchOptions = {
  pitchY: {
    type: "select",
    label: "Vertical Pitch",
    options: [2, 3, 4, 5],
    defaultValue: 3
  },
  pitchX: {
    type: "select",
    label: "Horizontal Pitch",
    options: [2, 3, 4, 5],
    defaultValue: 4
  },
  rotation: {
    type: "select",
    label: "Rotation",
    options: [0, 90],
    defaultValue: 0
  },
  refDesLabelSize: {
    type: "select",
    label: "RefDes Size (Pt)",
    options: [0, 2, 4, 6, 8, 10],
    defaultValue: 6
  },
}

export const getTactileSwitchOptions = (currentOptions) => {
  return defaultTactileSwitchOptions;
}

export const getTactileSwitchBOMLine = (component) => { 
  return {
    value: "-",
    description: "Tactile switch",
    footprint: ((component.pitchX - 1) * 2.54) + "x" + ((component.pitchY - 1) * 2.54) + "mm ("+ component.pitchX + "x" + component.pitchY + " holes) pitch"
  }
}


export const drawTactileSwitch = (component) => {

  // Enforce square body.

  let totalWidth, totalHeight;
  if(component.pitchX >= component.pitchY) {
    totalWidth = (component.pitchX - 1) * 2.54;
    totalHeight = totalWidth;
  } else {
    totalHeight = (component.pitchY - 1) * 2.54;
    totalWidth = totalHeight;
  }

  const centralX = totalWidth / 2;

  const tactileSwitchGroup = new Group();

  const body = new Shape.Rectangle({
    topLeft: mmToPxPoint([0.51, 0.51]),
    bottomRight: mmToPxPoint([totalWidth - 0.51, totalHeight - 0.51]),
    radius: 5,
    strokeColor: "#333",
    strokeWidth: 0.1 * globalSettings.getCurrentScale(),
    fillColor: "#ddd"
  });

  const button = new Shape.Circle({
    center: mmToPxPoint([totalWidth / 2, totalHeight / 2]),
    radius: mmToPx(totalWidth / 4),
    strokeColor: "#333",
    strokeWidth: 0.1 * globalSettings.getCurrentScale(),
    fillColor: "#bc6462"
  })

  const legPositions = [
    [0, (totalHeight / 2) - ((component.pitchY - 1) * 2.54) / 2],
    [0, (totalHeight / 2) + ((component.pitchY - 1) * 2.54) / 2],
    [totalWidth, (totalHeight / 2) - ((component.pitchY - 1) * 2.54) / 2],
    [totalWidth, (totalHeight / 2) + ((component.pitchY - 1) * 2.54) / 2]
  ]

  for(let leg = 1; leg <= 4; leg++) {
    const legObject = new Shape.Circle({
      center: mmToPxPoint(legPositions[leg - 1]),
      radius: globalSettings.getHoleDiameter() * 0.51,
      fillColor: "#333",
      data: {
        leg: true
      }
    });

    tactileSwitchGroup.addChild(legObject);
  }

  tactileSwitchGroup.addChild(body);
  tactileSwitchGroup.addChild(button);

  const refDesLabel = new PointText({
    point: [0, 0],
    content: component.refDes,
    fillColor: "black",
    fontFamily: "monospace",
    justification: "center",
    fontSize: component.refDesLabelSize * globalSettings.getCurrentScale() + "pt"
  });

  refDesLabel.position = button.position;
  tactileSwitchGroup.addChild(refDesLabel);


  let position = { x: 50, y: 50 };

  if(component.hole) {
    position = getHoleCoords(component.hole.row, component.hole.column);
    if(component.rotation == 0) {
      position.x = position.x + (mmToPx((component.pitchX - 1) * 2.54) / 2);
      position.y = position.y + (mmToPx((component.pitchY - 1) * 2.54) / 2);
    } else {
      position.x = position.x + (mmToPx((component.pitchY - 1) * 2.54) / 2);
      position.y = position.y + (mmToPx((component.pitchX - 1) * 2.54) / 2);
      refDesLabel.rotate(180);
    }  
  }
 
  tactileSwitchGroup.position = position;
  tactileSwitchGroup.data = component;

  tactileSwitchGroup.rotate(component.rotation);

  if(component.refDes) {
    tactileSwitchGroup.data.refDes = component.refDes;
  }

  return tactileSwitchGroup;
}
