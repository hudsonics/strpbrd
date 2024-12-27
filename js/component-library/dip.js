import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx } from "../utils.js";
import { getHoleCoords } from "../board.js";

const defaultDIPOptions = {
  terminals: {
    type: "select",
    label: "Ways",
    options: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
    defaultValue: 8
  },
  partNumber: {
    type: "text",
    label: "Part Number",
    placeholder: "e.g. LM471, NE555"
  },
  rotation: {
    type: "select",
    label: "Rotation",
    options: [0, 180],
    defaultValue: 0
  },
  refDesLabelSize: {
    type: "select",
    label: "RefDes Size (Pt)",
    options: [0, 2, 4, 6, 8, 10],
    defaultValue: 6
  },
  pinLabelHeader: {
    type: "header",
    label: "Pin Labels"
  },
  pinLabelSize: {
    type: "select",
    label: "Pin Label Size (Pt)",
    options: [0, 1, 2, 3, 4],
    defaultValue: 4
  },
}

export const getDIPOptions = (currentOptions) => {
  const DIPOptions = JSON.parse(JSON.stringify(defaultDIPOptions));
  for(let pinNumber = 1; pinNumber <= Math.max(...DIPOptions.terminals.options); pinNumber++) {
    if(pinNumber <= (currentOptions.terminals || DIPOptions.terminals.defaultValue)) {
      DIPOptions["pin" + pinNumber + "Label"] = {
        type: "text",
        label: "Pin " + pinNumber,
        placeholder: "Pin " + pinNumber + " label"
      }
    } 
  }
  return DIPOptions;
}

export const drawDIP = (component) => {

  const totalLength = (component.terminals / 2) * 2.54;
  const bodyWidth = 4 * 2.54;
  const centralX = bodyWidth / 2;

  const DIPGroup = new Group();

  const body = new Shape.Rectangle({
    topLeft: mmToPxPoint([0, 0]),
    bottomRight: mmToPxPoint([bodyWidth, totalLength]),
    radius: 5,
    strokeColor: "#333",
    strokeWidth: 0.1 * globalSettings.getCurrentScale(),
    fillColor: "#666"
  });

  const notch = new Path.Arc({
    from: mmToPxPoint([centralX - 1.28, 0]),
    through: mmToPxPoint([centralX, 1.28]),
    to: mmToPxPoint([centralX + 1.28, 0]),
    strokeColor: '#333',
    strokeWidth: 0.2 * globalSettings.getCurrentScale(),
    fillColor: "#888",
    closed: true
  });

  DIPGroup.addChild(body);
  DIPGroup.addChild(notch);


  const leftHandSideX = 2.54 / 2;
  const rightHandSideX = bodyWidth - leftHandSideX;
  const leftHandSideY = leftHandSideX;
  const rightHandSideY = totalLength - (2.54 / 2);

  let position = { x: 50, y: 50 };

  if(component.hole) {
    position = getHoleCoords(component.hole.row, component.hole.column);

    if(component.rotation == 0 || component.rotation == 180) {
      position.y = position.y - mmToPx(2.54 / 2) + mmToPx(totalLength / 2);
      position.x = position.x - mmToPx(2.54 / 2) + mmToPx(bodyWidth / 2);
    } else {
      position.y = position.y - mmToPx(2.54 / 2) + mmToPx(bodyWidth / 2);
      position.x = position.x - mmToPx(2.54 / 2) + mmToPx(totalLength / 2);
    }
  }

  const legPositions = [];
  for(let leg = 1; leg <= component.terminals; leg++) {
    let legPosition = [0, 0];
    if(leg <= component.terminals / 2) {
      // Left hand side.
      legPosition = [leftHandSideX, leftHandSideY + ((leg - 1) * 2.54)]
    } else {
      // Right hand side.
      legPosition = [rightHandSideX, rightHandSideY - (((component.terminals - leg)) * 2.54)]
    }
    
    const legObject = new Shape.Circle({
      center: mmToPxPoint(legPosition),
      radius: globalSettings.getHoleDiameter() * 0.51,
      fillColor: "#333",
      data: {
        leg: true
      }
    });
    legPositions.push(legPosition);
    DIPGroup.addChild(legObject);
  }

  DIPGroup.rotate(component.rotation);

  if(component.rotation == 180) {
    legPositions.reverse();
  }

  for(let leg = 1; leg <= component.terminals; leg++) {

    let pinLabelTextKey = "pin";// + leg + "Label";
    if(leg <= component.terminals / 2) {
      pinLabelTextKey += leg + "Label";
    } else {
      pinLabelTextKey += ((component.terminals - leg) + (component.terminals / 2) + 1) + "Label";
    }

    const pinLabel = new PointText({
      point: [0, 0],
      content: component[pinLabelTextKey] || "",
      fillColor: "black",
      fontFamily: "monospace",
      justification: "center",
      fontSize: component.pinLabelSize * globalSettings.getCurrentScale() + "pt"
    });
    
    let pinLabelPosition = [0, mmToPx(legPositions[leg - 1][1])]
    if(leg <= (component.terminals / 2)) {
      if(component.rotation == 0) {
        pinLabelPosition[0] = mmToPx(legPositions[leg - 1][0] + 0.75) + (pinLabel.bounds.width / 2);
      } else {
        pinLabelPosition[0] = mmToPx(legPositions[leg - 1][0] - 0.75) - (pinLabel.bounds.width / 2);
      }
    } else {
      if(component.rotation == 0) {
        pinLabelPosition[0] = mmToPx(legPositions[leg - 1][0] - 0.75) - (pinLabel.bounds.width / 2);
      } else {
        pinLabelPosition[0] = mmToPx(legPositions[leg - 1][0] + 0.75) + (pinLabel.bounds.width / 2);
      }
    }

    console.log(leg, legPositions[leg-1]);
    pinLabel.position = pinLabelPosition,
    DIPGroup.addChild(pinLabel);
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

  // Center label on body.
  refDesLabel.rotation = 0;
  refDesLabel.point = [DIPGroup.bounds.x + (DIPGroup.bounds.width / 2), DIPGroup.bounds.y + (DIPGroup.bounds.height / 2) + (refDesLabel.bounds.height / 4)];

  DIPGroup.addChild(refDesLabel);
  
  DIPGroup.position = position;
  DIPGroup.data = component;

  if(component.refDes) {
    DIPGroup.data.refDes = component.refDes;
  }

  return DIPGroup;
}
