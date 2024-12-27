import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx } from "../utils.js";
import { getHoleCoords } from "../board.js";

const pinouts = {
  BJT: ["C-B-E", "C-E-B", "E-B-C", "E-C-B", "B-C-E", "B-E-C"],
  FET: ["D-G-S", "D-S-G", "S-G-D", "S-D-G", "G-D-S", "G-S-D"]
}

const defaultTO92Options = {
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
  }
}

export const getTO92Options = (currentOptions) => {
  const updatedTO92Options = defaultTO92Options;
  try {
    if(currentOptions.componentType == "BJT") {
      updatedTO92Options.pinout.options = pinouts["BJT"]; 
    } else if(currentOptions.powerRating == "FET") {
      updatedTO92Options.pinout.options = pinouts["FET"]; 
      updatedTO92Options.pinout.defaultValue = "D-G-S"; 
    }
  } catch(error) {}

  return updatedTO92Options;
}

export const drawTO92 = (component) => {

  const totalLength = component.pitch * 2.54;
  const centralX = mmToPx(component.width / 2);
  const leg1Y = (globalSettings.getHoleSpacing() / 2);
  const leg2Y = mmToPx(totalLength) - leg1Y;
  
  const flat = new Path.Line({
    from: [0, 0],
    to: mmToPxPoint([0, 4]),
    strokeColor: '#333',
    strokeWidth: 0.2 * globalSettings.getCurrentScale()
  });

  const curve = new Path.Arc({
    from: mmToPxPoint([0, 0]),
    through: mmToPxPoint([2.5, 2]),
    to: mmToPxPoint([0, 4]),
    strokeColor: '#333',
    strokeWidth: 0.2 * globalSettings.getCurrentScale(),
    fillColor: "#888",
    closed: true
  });

  const body = new Group();
  body.addChild(flat);
  body.addChild(curve);

  const TO92Group = new Group();
  TO92Group.addChild(body);
  
  const legPositions = [];
  for(let leg = 0; leg < 3; leg++) {
    const legItem = new Shape.Circle({
      center: [0, (leg * mmToPx(2.54))],
      radius: globalSettings.getHoleDiameter() * 0.51,
      fillColor: "#333",
      data: {
        leg: true
      }
    });
    TO92Group.addChild(legItem);
    
    /*    if(component.pinout) {
      const legLabel = new PointText({
        position: [0 - mmToPx(0.01), (leg * mmToPx(2.54)) + (globalSettings.getHoleDiameter() * 0.29)],
        justification: 'center',
        fontFamily: 'Courier New',
        content: component.pinout.split("-")[leg],
        fontSize: (0.325 * globalSettings.getCurrentScale()) + "em"
      })
      TO92Group.addChild(legLabel);
    }*/

    legPositions.push({ x: legItem.position.x, y: legItem.position.y });
  }

  body.position = [legPositions[1].x + mmToPx(0.4), legPositions[1].y];
  //TO92Group.pivot = body.position;

  let position = { x: 50, y: 50 };

  if(component.hole) {
    position = getHoleCoords(component.hole.row, component.hole.column);
    console.log(position)
    // TODO: add position exception if axial capacitor.
    // AXIAL - position.y = position.y - mmToPx(totalLength / 2);
    if(component.rotation == 0) {
      position.y = position.y + mmToPx(2.54);
      position.x = position.x + mmToPx(0.4);
    } else {
      position.y = position.y + mmToPx(2.54);
      position.x = position.x - mmToPx(0.4);// + mmToPx(0.4);
    }
  }

  TO92Group.position = position;
  TO92Group.data = component;
  TO92Group.rotate(component.rotation);

  if(component.refDes) {
    TO92Group.data.refDes = component.refDes;
  }

  return TO92Group;
}
