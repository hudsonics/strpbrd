import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx, ptToPxHeight } from "../utils.js";
import { getHoleCoords } from "../board.js";

const powerRatings = {
  "1/4W": {
    width: 2.5,
    length: 6.5
  },
  "1/2W": {
    width: 3,
    length: 8.5
  }
}

const defaultResistorOptions = {
  orientation: {
    type: "select",
    label: "Orientation",
    options: ["Flat", "Upright"],
    defaultValue: "Flat"
  },
  powerRating: {
    type: "select",
    label: "Power Rating",
    options: Object.keys(powerRatings),
    defaultValue: Object.keys(powerRatings)[0]
  },
  pitch: {
    type: "select",
    label: "Pitch",
    options: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    defaultValue: 5
  },
  composition: {
    type: "select",
    label: "Composition",
    options: ["Carbon Film", "Metal Film"],
    defaultValue: "Metal Film"
  },
  value: {
    type: "text",
    label: "Resistance",
    placeholder: "e.g. 100R, 3K3"
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

export const getResistorOptions = (currentOptions) => {
  const resistorOptions = defaultResistorOptions;
  try {
    if(currentOptions.orientation == "Upright") {
      if(currentOptions.powerRating == "1/4W") {
        resistorOptions.pitch.options = [2, 3, 4, 5]
        resistorOptions.pitch.defaultValue = 2;
      } else if(currentOptions.powerRating == "1/2W") {
        resistorOptions.pitch.options = [3, 4, 5, 6]
        resistorOptions.pitch.defaultValue = 3;
      } 
    } else {
      if(currentOptions.powerRating == "1/4W") {
        resistorOptions.pitch.options = [4, 5, 6, 7, 8, 9, 10, 11, 12]
      } else if(currentOptions.powerRating == "1/2W") {
        resistorOptions.pitch.options = [5, 6, 7, 8, 9, 10, 10, 11, 12, 13]
        resistorOptions.pitch.defaultValue = 6;
      }
    }
  } catch(error) {}

  return resistorOptions;
}

export const drawResistor = (component) => {
  const powerRating = component.powerRating;

  const resistorGroup = new Group();
  let position = { x: 50, y: 50 };

  if(component.orientation == "Flat") {
    const totalLength = (component.pitch - 1) * 2.54;
    const bodyLength = powerRatings[powerRating].length;
    const bodyWidth = powerRatings[powerRating].width;
    const legLength = (totalLength - bodyLength) / 2;
    const centralX = powerRatings[powerRating].width / 2;
  
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
      fillColor: (component.composition == "Metal Film") ? "lightblue" : "beige"
    });

    resistorGroup.addChild(legs);
    resistorGroup.addChild(body);
    resistorGroup.addChild(legCap1);
    resistorGroup.addChild(legCap2);
    

    if(component.hole) {
      position = getHoleCoords(component.hole.row, component.hole.column);
      if(component.rotation == 0 || component.rotation == 180) {
        position.y = position.y + mmToPx(totalLength / 2);
      } else {
        position.x = position.x + mmToPx(totalLength / 2);
      }
    }
    
    resistorGroup.rotate(component.rotation, position);

    // Add reference designator label - needs to be rotated independently.
    const refDesLabel = new PointText({
      point: [0, 0],
      content: component.refDes,
      fillColor: "black",
      fontFamily: "monospace",
      justification: "center",
      fontSize: component.refDesLabelSize * globalSettings.getCurrentScale() + "pt"
    });

    // Center reference designator label.
    if(component.rotation == 0 || component.rotation == 180) {
      refDesLabel.rotation = -90;
      refDesLabel.point = [resistorGroup.bounds.x + (resistorGroup.bounds.width / 2) + (refDesLabel.bounds.width / 4), resistorGroup.bounds.y + (resistorGroup.bounds.height / 2)];
    } else {
      refDesLabel.rotation = 0;
      refDesLabel.point = [resistorGroup.bounds.x + (resistorGroup.bounds.width / 2), resistorGroup.bounds.y + (resistorGroup.bounds.height / 2) + (refDesLabel.bounds.height / 4)];
    }

    resistorGroup.addChild(refDesLabel);

  } else if(component.orientation == "Upright") {
    const legLength = (component.pitch - 1) * 2.54;
    const bodyDiameter = powerRatings[powerRating].width;
    const centralX = powerRatings[powerRating].width / 2;
    const totalLength = mmToPx(legLength + (bodyDiameter / 2));
    
    const body = new Shape.Circle({
      center: mmToPxPoint([centralX, 0]),
      radius: mmToPx(bodyDiameter / 2),
      strokeColor: "#333",
      strokeWidth: 0.1 * globalSettings.getCurrentScale(),
      fillColor: (component.composition == "Metal Film") ? "lightblue" : "beige"
    });

    const leg = new Path({
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

    resistorGroup.addChild(body);
    resistorGroup.addChild(leg);
    resistorGroup.addChild(legCap1);
    resistorGroup.addChild(legCap2);

    // Add reference designator label - needs to be rotated independently.
    const refDesLabel = new PointText({
      point: [0, 0],
      content: (component.refDes ? component.refDes : "") + "\n",
      fillColor: "black",
      fontFamily: "monospace",
      justification: "center",
      fontSize: component.refDesLabelSize * globalSettings.getCurrentScale() + "pt"
    });


    // Center and offset reference designator label on leg.
    if(component.rotation == 0 || component.rotation == 180) {
      refDesLabel.rotation = -90;
      refDesLabel.position = [leg.bounds.center.x, leg.bounds.center.y];
    } else {
      refDesLabel.rotation = 0;
      refDesLabel.position = [leg.bounds.center.x, leg.bounds.center.y];
    }
    
    if(component.hole) {
      position = getHoleCoords(component.hole.row, component.hole.column);
      if(component.rotation == 0 || component.rotation == 180) {
        // Vertical upright
        position.y = position.y + (totalLength / 2) - (globalSettings.getHoleSpacing() / 2);
        if(component.powerRating == "1/4W") {
          position.y = position.y + (component.rotation == 0 ? mmToPx(0.25) : mmToPx(1));
        }
      } else {
        // Horizontal upright
        position.x = position.x + (totalLength / 2) - (globalSettings.getHoleSpacing() / 2);
        if(component.powerRating == "1/4W") {
          position.x = position.x + (component.rotation == 270 ? mmToPx(0.25) : mmToPx(1));
        }
      }
    }
    resistorGroup.rotate(component.rotation, leg.position);
    
    resistorGroup.addChild(refDesLabel);
  }

  resistorGroup.position = position;
  resistorGroup.data = component;

  if(component.refDes) {
    resistorGroup.data.refDes = component.refDes;
  }

  return resistorGroup;
}
