import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx } from "../utils.js";
import { getHoleCoords } from "../board.js";

const pinouts = {
  BJT: ["C-B-E", "C-E-B", "E-B-C", "E-C-B", "B-C-E", "B-E-C"],
  FET: ["D-G-S", "D-S-G", "S-G-D", "S-D-G", "G-D-S", "G-S-D"]
}

const defaultTO39Options = {
  componentType: {
    type: "select",
    label: "Component Type",
    options: ["BJT", "FET"],
    defaultValue: "BJT"
  },
  pinout: {
    type: "select",
    label: "Pinout",
    options: pinouts["BJT"],
    defaultValue: "C-B-E"
  },
  partNumber: {
    type: "text",
    label: "Part Number",
    placeholder: "e.g. BC182, 2N7000"
  },
  rotation: {
    type: "select",
    label: "Rotation (°)",
    options: [0, 180],
    defaultValue: 0
  },
  refDesLabelSize: {
    type: "select",
    label: "RefDes Size (pt)",
    options: [0, 4, 6],
    defaultValue: 6
  },
  pinLabelSize: {
    type: "select",
    label: "Pin Label Size (Pt)",
    options: [0, 2, 4, 6],
    defaultValue: 4
  }
}

export const getTO39Options = (currentOptions) => {
  const updatedTO39Options = JSON.parse(JSON.stringify(defaultTO39Options));
  try {
    if(currentOptions.componentType == "BJT") {
      updatedTO39Options.pinout.options = pinouts["BJT"]; 
      updatedTO39Options.pinout.defaultValue = "C-B-E"; 
    } else if(currentOptions.componentType == "FET") {
      updatedTO39Options.pinout.options = pinouts["FET"]; 
      updatedTO39Options.pinout.defaultValue = "D-G-S"; 
    }
  } catch(error) {}
  
  return updatedTO39Options;
}

export const getTO39BOMLine = (component) => {
  return {
    value: component.partNumber || "-",
    description: component.componentType + " transistor",
    footprint: "TO-39 package"
  }
}

export const drawTO39 = (component) => {

  const baseRadius = mmToPx(9 / 2);
  const topRadius = mmToPx(8 / 2);
  const totalLength = component.pitch * 2.54;
  const centralX = mmToPx(component.width / 2);
  const leg1Y = (globalSettings.getHoleSpacing() / 2);
  const leg2Y = mmToPx(totalLength) - leg1Y;


  const TO39Group = new Group();
  
  const tabPosition = [mmToPx(7.5 + 0.4), mmToPx(9 - 7.5 - 0.4)]

  const tab = new Shape.Rectangle({
    topLeft: mmToPxPoint([0, 0]),
    bottomRight: mmToPxPoint([0.8, 0.8]),
    position: tabPosition,
    radius: 1,
    rotation: 45,
    strokeColor: "#333",
    strokeWidth: 0.1 * globalSettings.getCurrentScale(),
    fillColor: "silver"
  });
  
  const bodyBase = new Shape.Circle({
    center: [baseRadius, baseRadius],
    radius: baseRadius,
    strokeColor: "#333",
    strokeWidth: 0.1 * globalSettings.getCurrentScale(),
    fillColor: "silver"
  });


  const bodyTop = new Shape.Circle({
    center: [baseRadius, baseRadius],
    radius: topRadius,
    strokeColor: "grey",
    strokeWidth: 0.2 * globalSettings.getCurrentScale(),
    fillColor: "silver"
  });

  TO39Group.addChild(tab);
  TO39Group.addChild(bodyBase);
  TO39Group.addChild(bodyTop);

  const legPositions = [];
  for(let leg = 0; leg < 3; leg++) {
    const legItem = new Shape.Circle({
      center: [((leg % 2 != 0) ? (baseRadius) : (baseRadius + mmToPx(2.54))) - mmToPx(2.54), (leg * mmToPx(2.54)) + mmToPx(1.96)],
      radius: globalSettings.getHoleDiameter() * 0.51,
      fillColor: "#333",
      data: {
        leg: true
      }
    });
    TO39Group.addChild(legItem);
    
    legPositions.push({ x: legItem.position.x, y: legItem.position.y });
  }

  const refDesLabel = new PointText({
    point: [0, 0],
    content: (component.refDes ? component.refDes : ""),
    fillColor: "black",
    fontFamily: "monospace",
    justification: "center",
    fontSize: component.refDesLabelSize * globalSettings.getCurrentScale() + "pt"
  });

  refDesLabel.position = [baseRadius, baseRadius];
  if(component.rotation == 180) {
    refDesLabel.rotation = 180;
  }

  TO39Group.addChild(refDesLabel);

  for(let leg = 0; leg < 3; leg++) {

    const pinLabel = new PointText({
      point: [0, 0],
      content: component.pinout.split("-")[leg],
      fillColor: "black",
      fontFamily: "monospace",
      justification: "center",
      fontSize: component.pinLabelSize * globalSettings.getCurrentScale() + "pt"
    });

    let pinLabelPosition = [0, 0]
    pinLabelPosition[0] = legPositions[leg].x - mmToPx(1) - (pinLabel.bounds.width / 2);
    pinLabelPosition[1] = legPositions[leg].y;
    if(component.rotation == 90 || component.rotation == 180) {
      pinLabel.rotate(180);
    } else {
      pinLabel.rotate(0);
    }
     
    pinLabel.position = pinLabelPosition,
    TO39Group.addChild(pinLabel);
  }

  let position = { x: 50, y: 50 };

  if(component.hole) {
    position = getHoleCoords(component.hole.row, component.hole.column);
    // TODO: add position exception if axial capacitor.
    // AXIAL - position.y = position.y - mmToPx(totalLength / 2);
    if(component.rotation == 0) {
      position.y = position.y + mmToPx(2.54);
      //position.x = position.x - mmToPx(0.04);
    } else {
      position.y = position.y + mmToPx(2.54);
      //position.x = position.x + mmToPx(0.04);// + mmToPx(0.4);
    }
  }

  TO39Group.position = position;
  TO39Group.data = component;
  TO39Group.rotate(component.rotation);

  if(component.refDes) {
    TO39Group.data.refDes = component.refDes;
  }

  return TO39Group;
}
