import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx } from "../utils.js";
import { getHoleCoords } from "../board.js";

const defaultLabelOptions = {
  labelText: {
    type: "text",
    label: "Label Text",
    options: [3, 5],
    defaultValue: 5
  },
  labelSize: {
    type: "select",
    label: "Label Text Size (pt)",
    options: [4, 6, 8, 10, 12, 14, 16, 18],
    defaultValue: 6
  }
}

export const getLabelOptions = () => {
  return defaultLabelOptions;
}

export const drawLabel = (component) => {
  
  const labelGroup = new Group();
  let position = { x: 50, y: 50 }
  
  const radius = mmToPx(component.diameter / 2);
  const leg1Y = radius - (globalSettings.getHoleSpacing() / 2);
  const leg2Y = radius + (globalSettings.getHoleSpacing() / 2);
  
  const labelText = new PointText({
    point: [0, 0],
    content: (component.labelText),
    fillColor: "black",
    fontFamily: "monospace",
    justification: "center",
    fontSize: component.labelSize * globalSettings.getCurrentScale() + "pt"
  });

  const labelBodyWidth = Math.ceil(labelText.bounds.width / mmToPx(2.54)) * mmToPx(2.54);

  const labelBody = new Shape.Rectangle({
    position: [labelText.position.x, labelText.position.y],
    size: [labelBodyWidth, labelText.bounds.height],
    strokeColor: "#333",
    strokeWidth: 0.2 * globalSettings.getCurrentScale(),
    fillColor: "white"
  });

  const leg1 = new Shape.Circle({
    center: [(0 - labelBodyWidth) / 2, labelText.position.y],
    radius: globalSettings.getHoleDiameter() * 0.51,
    fillColor: "#333",
    opacity: 0,
    data: {
      leg: true
    }
  })
  
  const leg2 = new Shape.Circle({
    center: [labelBodyWidth / 2, labelText.position.y],
    radius: globalSettings.getHoleDiameter() * 0.51,
    fillColor: "#333",
    opacity: 0,
    data: {
      leg: true
    }
  })
  
  labelGroup.addChild(labelBody);
  labelGroup.addChild(labelText);
  labelGroup.addChild(leg1);
  labelGroup.addChild(leg2);
  
  if(component.hole) {
    position = getHoleCoords(component.hole.row, component.hole.column);
    position.x = position.x + (labelBodyWidth / 2) + mmToPx(0);
  }

  labelGroup.position = position;
  labelGroup.data = component;
  
  if(component.refDes) {
    labelGroup.data.refDes = component.refDes;
  }

  return labelGroup;
}
