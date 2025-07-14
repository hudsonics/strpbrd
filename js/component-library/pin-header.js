import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx } from "../utils.js";
import { getHoleCoords } from "../board.js";

const defaultPinHeaderOptions = {
  terminals: {
    type: "select",
    label: "Ways",
    options: [2, 3, 4, 5, 6, 7, 8],
    defaultValue: 2
  },
  pitch: {
    type: "select",
    label: "Pitch",
    options: [2, 3],
    defaultValue: 2
  },
  rotation: {
    type: "select",
    label: "Rotation (°)",
    options: [0, 90],
    defaultValue: 0
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

export const getPinHeaderOptions = (currentOptions) => {
  const pinHeaderOptions = JSON.parse(JSON.stringify(defaultPinHeaderOptions));
  for(let pinNumber = 1; pinNumber <= Math.max(...pinHeaderOptions.terminals.options); pinNumber++) {
    if(pinNumber <= (currentOptions.terminals || pinHeaderOptions.terminals.defaultValue)) {
      pinHeaderOptions["pin" + pinNumber + "Label"] = {
        type: "text",
        label: "Pin " + pinNumber,
        placeholder: "Pin " + pinNumber + " label"
      }
    } 
  }
  return pinHeaderOptions;
}

export const getPinHeaderBOMLine = (component) => {
  return {
    value: "-",
    description: "Vertical pin header",
    footprint: component.terminals + " way, " + ((component.pitch - 1) * 2.54) + "mm (" + component.pitch + " holes) pitch"
  }
}

export const drawPinHeader = (component) => {

  component.width = 2.5;
  const pinHeaderGroup = new Group();
  let position = { x: 50, y: 50 }

  const yOffset = 1;
  const pitch = (component.pitch - 1) * 2.54;
  const totalLength = ((component.terminals - 1) * pitch) + (yOffset * 2);
  const centralX = component.width / 2;

  const body = new Shape.Rectangle({
    topLeft: mmToPxPoint([0, 0]),
    bottomRight: mmToPxPoint([component.width, totalLength]),
    radius: 3,
    strokeColor: "#333",
    strokeWidth: 0.1 * globalSettings.getCurrentScale(),
    fillColor: "grey"
  });

  pinHeaderGroup.addChild(body);

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

    pinHeaderGroup.addChild(legObject);
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

  if(component.rotation == 0) {
    refDesLabel.rotation = 0;
    refDesLabel.position = [body.position.x, 0 - (refDesLabel.bounds.height / 2)]
  } else {
    refDesLabel.rotation = 270;
    refDesLabel.position = [mmToPx(0.2) - (refDesLabel.bounds.height / 2), mmToPx(totalLength / 2)]
  } 
  
  // Ref des label rotated independently from body.
  pinHeaderGroup.addChild(refDesLabel);
  
  if(component.hole) {
    position = getHoleCoords(component.hole.row, component.hole.column);
    if(component.rotation == 0 || component.rotation == 180) {
      position.y = position.y + (body.size.height / 2) - (globalSettings.getHoleDiameter()) - (refDesLabel.bounds.height / 2);
      console.log(body);
    } else {
      position.x = position.x + (body.size.height / 2) - (globalSettings.getHoleDiameter())
      position.y = position.y - (refDesLabel.bounds.height / 2)
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
    pinLabelPosition[0] = mmToPx(legPositions[leg - 1][0] - 1.5) - (pinLabel.bounds.width / 2);
    pinLabelPosition[1] = mmToPx(legPositions[leg - 1][1]);

    if(component.rotation == 90 || component.rotation == 180) {
      pinLabel.rotate(180);
    } else {
      pinLabel.rotate(0);
    }
     
    pinLabel.position = pinLabelPosition,
    pinHeaderGroup.addChild(pinLabel);
  }

  pinHeaderGroup.rotate(component.rotation);
  if(component.rotation == 270 || component.rotation == 180) {
    refDesLabel.rotate(180);
  }


  pinHeaderGroup.position = position;
  pinHeaderGroup.data = component;
  
  if(component.refDes) {
    pinHeaderGroup.data.refDes = component.refDes;
  }

  return pinHeaderGroup;
}
