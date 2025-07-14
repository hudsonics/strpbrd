import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx, ptToPxHeight } from "../utils.js";
import { getHoleCoords } from "../board.js";

const defaultInductorOptions = {
  componentType: {
    type: "select",
    label: "Type",
    options: ["Toroidal (Upright)"],
    defaultValue: "Toroidal (Upright)"
  },
  pitch: {
    type: "select",
    label: "Pitch",
    options: [4, 5, 6],
    defaultValue: 4
  },
  width: {
    type: "select",
    label: "Width",
    options: [3.3, 5.2],
    defaultValue: 3.3
  },
  diameter: {
    type: "select",
    label: "Diameter",
    options: [9.5],
    defaultValue: 9.5
  }, 
  value: {
    type: "text",
    label: "Inductance",
    placeholder: "e.g. 1u, 10T on FT37-61"
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

export const getInductorOptions = (currentOptions) => {
  const inductorOptions = defaultInductorOptions;

  return inductorOptions;
}

export const getInductorBOMLine = (component) => {
  return {
    value: component.value || "-",
    description: component.componentType + " inductor",
    footprint: ((component.pitch - 1) * 2.54) + "mm (" + component.pitch + " holes) pitch"
  }
}

export const drawInductor = (component) => {
  const inductorGroup = new Group();
  let position = { x: 50, y: 50 };

  const totalLength = (component.pitch - 1) * 2.54;
  const bodyLength = Number(component.diameter);
  const bodyWidth = Number(component.width);
  const legLength = (totalLength - bodyLength) / 2;
  const centralX = bodyWidth / 2;

  console.log(totalLength, bodyLength, legLength);

  const legs = new Path({
    segments: mmToPxSegments([[centralX, 0], [centralX, ((legLength * 2) + bodyLength)]]),
    strokeColor: "#B87333",
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
    fillColor: "grey"
  });

  const windings = new Group();
  const windingOffsetY = bodyLength / 3;

  for(let i = 0; i < 3; i++) {
    const winding = new Path({
      segments: mmToPxSegments([[0, legLength + (windingOffsetY * i)], [bodyWidth, legLength + (windingOffsetY * (i + 1))]]),
      strokeColor: "#B87333",
      strokeWidth: 1.75 * globalSettings.getCurrentScale(),
      strokeCap: "round",
      strokeJoin: "round" 
    })
    windings.addChild(winding);
  }

  inductorGroup.addChild(legs);
  inductorGroup.addChild(body);
  inductorGroup.addChild(windings);
  inductorGroup.addChild(legCap1);
  inductorGroup.addChild(legCap2);
  

  if(component.hole) {
    position = getHoleCoords(component.hole.row, component.hole.column);
    if(component.rotation == 0 || component.rotation == 180) {
      position.y = position.y + mmToPx(totalLength / 2);
    } else {
      position.x = position.x + mmToPx(totalLength / 2);
    }
  }
  
  inductorGroup.rotate(component.rotation, position);

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
    refDesLabel.point = [inductorGroup.bounds.x + (inductorGroup.bounds.width / 2) + (refDesLabel.bounds.width / 4), inductorGroup.bounds.y + (inductorGroup.bounds.height / 2)];
  } else {
    refDesLabel.rotation = 0;
    refDesLabel.point = [inductorGroup.bounds.x + (inductorGroup.bounds.width / 2), inductorGroup.bounds.y + (inductorGroup.bounds.height / 2) + (refDesLabel.bounds.height / 4)];
  }

  inductorGroup.addChild(refDesLabel);

 
  inductorGroup.position = position;
  inductorGroup.data = component;

  if(component.refDes) {
    inductorGroup.data.refDes = component.refDes;
  }

  return inductorGroup;
}

