import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx } from "../utils.js";
import { getHoleCoords } from "../board.js";

const defaultScrewTerminalOptions = {
  terminals: {
    type: "select",
    label: "Ways",
    options: [2, 3, 4, 5, 6, 7, 8],
    defaultValue: 2
  },
  pitch: {
    type: "select",
    label: "Pitch",
    options: [2, 3, 4, 5, 6, 7, 8],
    defaultValue: 3
  },
  rotation: {
    type: "select",
    label: "Rotation (°)",
    options: [0, 90, 180, 270],
    defaultValue: 90
  },
  refDesLabelSize: {
    type: "select",
    label: "RefDes Size (pt)",
    options: [0, 4, 6],
    defaultValue: 6
  },
  pinLabelHeader: {
    type: "header",
    label: "Pin Labels"
  },
  pinLabelSize: {
    type: "select",
    label: "Pin Label Size (Pt)",
    options: [0, 2, 4, 6],
    defaultValue: 4
  }
}

export const getScrewTerminalOptions = (currentOptions) => {
  const screwTerminalOptions = JSON.parse(JSON.stringify(defaultScrewTerminalOptions));
  for(let pinNumber = 1; pinNumber <= Math.max(...screwTerminalOptions.terminals.options); pinNumber++) {
    if(pinNumber <= (currentOptions.terminals || screwTerminalOptions.terminals.defaultValue)) {
      screwTerminalOptions["pin" + pinNumber + "Label"] = {
        type: "text",
        label: "Pin " + pinNumber,
        placeholder: "Pin " + pinNumber + " label"
      }
    } 
  }
  return screwTerminalOptions;
}

export const getScrewTerminalBOMLine = (component) => {
  return {
    value: "-",
    description: "Screw terminal block",
    footprint: component.terminals + " way, " + ((component.pitch - 1) * 2.54) + "mm (" + component.pitch + " holes) pitch"
  }
}

export const drawScrewTerminal = (component) => {

  component.width = 10.8;
  const screwTerminalGroup = new Group();
  let position = { x: 50, y: 50 }

  const yOffset = 2.54;
  const pitch = (component.pitch - 1) * 2.54;
  const totalLength = ((component.terminals - 1) * pitch) + (yOffset * 2);
  const centralX = component.width / 2;

  const body = new Shape.Rectangle({
    topLeft: mmToPxPoint([0, 0]),
    bottomRight: mmToPxPoint([component.width, totalLength]),
    radius: 3,
    strokeColor: "#333",
    strokeWidth: 0.1 * globalSettings.getCurrentScale(),
    fillColor: "#7bb17d"
  });

  const wireEntry = new Shape.Rectangle({
    topLeft: mmToPxPoint([0, 0]),
    bottomRight: mmToPxPoint([component.width / 4, totalLength]),
    strokeColor: "#333",
    strokeWidth: 0.1 * globalSettings.getCurrentScale(),
    fillColor: "#66a067"
  });
  
  screwTerminalGroup.addChild(body);
  screwTerminalGroup.addChild(wireEntry);

  const legPositions = [];
  for(let leg = 1; leg <= component.terminals; leg++) {
    legPositions.push([centralX, yOffset + (leg - 1) * pitch]);
    const legObject = new Shape.Circle({
      center: mmToPxPoint(legPositions[leg - 1]),
      radius: globalSettings.getHoleDiameter() * 0.51,
      fillColor: "#333",
      data: {
        leg: true
      }
    })

    screwTerminalGroup.addChild(legObject);
  }

  // Add reference designator label - needs to be rotated independently.
  const refDesLabel = new PointText({
    point: [0, 0],
    content: (component.refDes ? component.refDes : ""),
    fillColor: "black",
    fontFamily: "monospace",
    justification: "center",
    fontSize: component.refDesLabelSize * globalSettings.getCurrentScale() + "pt"
  });

  refDesLabel.position = [wireEntry.position.x, refDesLabel.bounds.height / 2]
  refDesLabel.rotation = -90;
  
  // Ref des label rotated independently from body.
  screwTerminalGroup.addChild(refDesLabel);
  
  const wireEntryMarking = new PointText({
    point: [0, 0],
    content: "►",
    fillColor: "black",
    fontFamily: "monospace",
    justification: "center",
    fontSize: (component.width) * globalSettings.getCurrentScale() + "pt"
  });

  wireEntryMarking.position = [wireEntry.position.x, wireEntry.position.y]

  screwTerminalGroup.addChild(wireEntryMarking);

  if(component.hole) {
    position = getHoleCoords(component.hole.row, component.hole.column);
    if(component.rotation == 0 || component.rotation == 180) {
      position.y = position.y - (globalSettings.getHoleSpacing()) + mmToPx(totalLength / 2);
    } else {
      position.x = position.x - (globalSettings.getHoleSpacing()) + mmToPx(totalLength / 2);
    }
  }
  

  for(let leg = 1; leg <= component.terminals; leg++) {

    const pinLabel = new PointText({
      point: [0, 0],
      content: component["pin" + leg + "Label"] || "",
      fillColor: "black",
      fontFamily: "monospace",
      justification: "center",
      fontSize: component.pinLabelSize * globalSettings.getCurrentScale() + "pt"
    });

    let pinLabelPosition = [0, 0]
    pinLabelPosition[0] = mmToPx(legPositions[leg - 1][0] + 0.75) + (pinLabel.bounds.width / 2);
    pinLabelPosition[1] = mmToPx(legPositions[leg - 1][1]);
    if(component.rotation == 90 || component.rotation == 180) {
      pinLabel.rotate(180);
    } else {
      pinLabel.rotate(0);
    }
     
    pinLabel.position = pinLabelPosition,
    screwTerminalGroup.addChild(pinLabel);
  }

  screwTerminalGroup.rotate(component.rotation);
  if(component.rotation == 270 || component.rotation == 180) {
    refDesLabel.rotate(180);
  }


  screwTerminalGroup.position = position;
  screwTerminalGroup.data = component;
  
  if(component.refDes) {
    screwTerminalGroup.data.refDes = component.refDes;
  }

  return screwTerminalGroup;
}
