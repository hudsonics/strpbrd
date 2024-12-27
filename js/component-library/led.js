import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx } from "../utils.js";
import { getHoleCoords } from "../board.js";

const ledColourLookup = {
  "White": "white",
  "Blue": "blue",
  "Yellow": "yellow",
  "Green": "green",
  "Red": "red"
}

const defaultLEDOptions = {
  diameter: {
    type: "select",
    label: "Diameter (mm)",
    options: [3, 5],
    defaultValue: 5
  },
  colour: {
    type: "select",
    label: "Colour",
    options: [],
    defaultValue: "Red"
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
    options: [0, 2, 3, 4],
    defaultValue: 4
  }
}

export const getLEDOptions = () => {
  const updatedLEDOptions = defaultLEDOptions;
  updatedLEDOptions.colour.options = Object.keys(ledColourLookup);
  return updatedLEDOptions;
}

export const drawLED = (component) => {
  
  const LEDGroup = new Group();
  let position = { x: 50, y: 50 }
  
  const radius = mmToPx(component.diameter / 2);
  const leg1Y = radius - (globalSettings.getHoleSpacing() / 2);
  const leg2Y = radius + (globalSettings.getHoleSpacing() / 2);

  const leg1 = new Shape.Circle({
    center: [radius, leg1Y],
    radius: globalSettings.getHoleDiameter() * 0.51,
    fillColor: "#333",
    data: {
      leg: true
    }
  })
  
  const leg2 = new Shape.Circle({
    center: [radius, leg2Y],
    radius: globalSettings.getHoleDiameter() * 0.51,
    fillColor: "#333",
    data: {
      leg: true
    }
  })
  
  /*const body = new Shape.Circle({
    center: [centralX, centralX],
    radius: mmToPx(component.diameter / 2),
    strokeColor: "#333",
    strokeWidth: 0.1 * globalSettings.getCurrentScale(),
    fillColor: ledColourLookup[component.colour]
  });*/

  const flatCoord = component.diameter == 5 ? mmToPx(1.5) : mmToPx(1);
  const body = new Path.Arc({
    from: [radius - flatCoord, radius * 2],
    through: [radius, 0],
    to: [radius + flatCoord, radius * 2],
    strokeColor: '#333',
    strokeWidth: 0.2 * globalSettings.getCurrentScale(),
    fillColor: ledColourLookup[component.colour],
    closed: true
  });

  const polarityMarking = new PointText({
    point: [0, 0],
    content: "+",
    fillColor: "black",
    fontFamily: "monospace",
    justification: "center",
    fontSize: 4 * globalSettings.getCurrentScale() + "pt"
  });

  polarityMarking.position = [(radius * 2), radius - (polarityMarking.bounds.height)]

  LEDGroup.addChild(body);
  LEDGroup.addChild(leg1);
  LEDGroup.addChild(leg2);
  LEDGroup.addChild(polarityMarking);

  // Add reference designator label - needs to be rotated independently.
  const refDesLabel = new PointText({
    point: [0, 0],
    content: (component.refDes ? component.refDes : ""),
    fillColor: "black",
    fontFamily: "monospace",
    justification: "center",
    fontSize: component.refDesLabelSize * globalSettings.getCurrentScale() + "pt"
  });

  refDesLabel.position = [radius, radius];
  refDesLabel.rotation = 0;
  
  if(component.hole) {
    position = getHoleCoords(component.hole.row, component.hole.column);
    position.y = position.y - ((leg1Y - leg2Y) / 2);

    // Offset polarity marking sitting outside body.
    const polarityMarkingXOffset = ((polarityMarking.bounds.right - body.bounds.right) / 2);
    if(component.rotation == 0) {
      position.x = position.x + polarityMarkingXOffset;
      refDesLabel.position = [radius - polarityMarkingXOffset, radius];
    } else {
      position.x = position.x - polarityMarkingXOffset;
      refDesLabel.position = [radius + polarityMarkingXOffset, radius];
    }

    if(component.diameter == 3) {
      // Difference between top of leg 1 and top of polarity marking.
      if(component.rotation == 0) {
        position.y = position.y + ((polarityMarking.bounds.top - leg1.bounds.top) / 2)
        refDesLabel.position = [radius, radius];
      } else {
        position.y = position.y - ((polarityMarking.bounds.top - leg1.bounds.top) / 2)
        refDesLabel.position = [radius + ((polarityMarking.bounds.right - body.bounds.right)), radius + ((polarityMarking.bounds.top - leg1.bounds.top))];
      }
    }
  }

  LEDGroup.rotate(component.rotation);

  // Ref des label rotated independently from body.
  LEDGroup.addChild(refDesLabel);
   

  LEDGroup.position = position;
  LEDGroup.data = component;
  
  if(component.refDes) {
    LEDGroup.data.refDes = component.refDes;
  }

  return LEDGroup;
}
