import { getHoleCoords } from "../board.js";
import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx } from "../utils.js";

const colourLookup = {
  "Red": "red",
  "Black": "black",
  "Blue": "blue",
  "Green": "green"
}

const wireOptions = {
  colour: {
    type: "select",
    label: "Colour",
    options: [],
    defaultValue: "Red"
  },
  length: {
    type: "number",
    label: "Length (tracks)",
    step: 1,
    min: 2,
    max: 100,
    defaultValue: 2
  },
  rotation: {
    type: "select",
    label: "Rotation (°)",
    options: [0, 90],
    defaultValue: 0
  }
}

export const getWireOptions = () => {
  const updatedWireOptions = wireOptions;
  updatedWireOptions.colour.options = Object.keys(colourLookup);
  return updatedWireOptions;
}

export const drawWire = (wire) => {
  // Get ending hole coord by wire length.
  const wireLength = (wire.length - 1) * 2.54;
  console.log(wireLength);

  const wireGroup = new Group();

  const wireItem = new Path({ 
    segments: mmToPxSegments([[0, 0], [0, wireLength]]),
    strokeColor: colourLookup[wire.colour],
    strokeWidth: 2 * globalSettings.getCurrentScale(),
    strokeCap: "round",
    strokeJoin: "round",
    position: mmToPxPoint([0, wireLength / 2])
  })

  const leg1 = new Shape.Circle({
    center: mmToPxPoint([0, 0]),
    radius: globalSettings.getHoleDiameter() * 0.51,
    fillColor: "#333",
    data: {
      leg: true
    }
  })
  
  const leg2 = new Shape.Circle({
    center: mmToPxPoint([0, wireLength]),
    radius: globalSettings.getHoleDiameter() * 0.51,
    fillColor: "#333",
    data: {
      leg: true
    }
  })

  wireGroup.addChild(wireItem);
  wireGroup.addChild(leg1);
  wireGroup.addChild(leg2);

  let position = { x: 50, y: 50 };

  if(wire.hole) {
    position = getHoleCoords(wire.hole.row, wire.hole.column);
    if(wire.rotation == 0) {
      position.y = position.y + mmToPx(wireLength / 2);
    } else {
      position.x = position.x + mmToPx(wireLength / 2);
    }

  }

  wireGroup.position = position;
  wireGroup.data = wire;

  wireGroup.rotate(wire.rotation);

  if(wire.refDes) {
    wireGroup.data.refDes = wire.refDes;
  }


  return wireGroup;
}
