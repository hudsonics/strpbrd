import { mmToPx } from "../utils.js";
import { globalSettings } from "../global-settings.js";
import { getHoleCoords } from "../board.js";

const defaultTestPointOptions = {
  diameter: {
    type: "select",
    label: "Diameter (mm)",
    options: [1, 1.5, 2],
    defaultValue: 1
  },
  refDesLabelSize: {
    type: "select",
    label: "RefDes Size (pt)",
    options: [0, 1, 1.5, 2.5, 3],
    defaultValue: 1.5
  }
}

export const getTestPointOptions = () => {
  return defaultTestPointOptions;
}

export const drawTestPoint = (component) => {
  let position;
  if(component.hole) {
    position = getHoleCoords(component.hole.row, component.hole.column);
  } else {
    position = { x: 50, y: 50 };
  }

  const testPointGroup = new Group();
  
  const testPointLeg = new Shape.Circle({
    center: [position.x, position.y],
    radius: mmToPx(component.diameter / 2),
    fillColor: "grey",
    strokeColor: "#333",
    strokeWidth: 0.2 * globalSettings.getCurrentScale(),
    data: {
      leg: true
    }
  })

  const refDesLabel = new PointText({
    point: [0, 0],
    content: (component.refDes ? component.refDes : ""),
    fillColor: "black",
    fontFamily: "monospace",
    justification: "center",
    fontSize: component.refDesLabelSize * globalSettings.getCurrentScale() + "pt"
  });

  refDesLabel.position = testPointLeg.position;


  testPointGroup.addChild(testPointLeg);
  testPointGroup.addChild(refDesLabel);
  
  testPointGroup.position = position;
  testPointGroup.data = component;

  if(component.refDes) {
    testPointGroup.data.refDes = component.refDes;
  }


  return testPointGroup;
}
