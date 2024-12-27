import { globalSettings } from "../global-settings.js";
import { mmToPxPoint, mmToPxSegments, mmToPx } from "../utils.js";
import { getHoleCoords } from "../board.js";

const capacitorColourLookup = {
  "Orange": "orange",
  "White": "white",
  "Blue": "blue",
  "Yellow": "yellow",
  "Green": "green",
  "Red": "red",
}

const defaultCapacitorOptions = {
  capacitorType: {
    type: "select",
    label: "Capacitor Type",
    options: ["Disc/Rect", "Radial", "Axial"],
    defaultValue: "Disc/Rect"
  },
  polarised: {
    type: "boolean",
    label: "Polarised",
    defaultValue: false
  },
  pitch: {
    type: "select",
    label: "Pitch",
    options: [2, 3, 4, 5, 6, 7, 8],
    defaultValue: 2
  },
  width: {
    type: "select",
    label: "Width (mm)",
    options: [2, 3, 4, 5, 6, 7, 8],
    defaultValue: 3
  },
  colour: {
    type: "select",
    label: "Colour",
    options: [],
    defaultValue: "Orange"
  },
  value: {
    type: "text",
    label: "Capacitance",
    placeholder: "e.g. 1u, 2n2"
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

export const getCapacitorOptions = (currentOptions) => {
  const updatedCapacitorOptions = JSON.parse(JSON.stringify(defaultCapacitorOptions));
  updatedCapacitorOptions.colour.options = Object.keys(capacitorColourLookup);
  if (currentOptions.capacitorType == "Radial") {
    delete updatedCapacitorOptions.colour;

    // Change "width" property to "diameter", while retaining order.
    updatedCapacitorOptions.width = {
      type: "select",
      label: "Diameter (mm)",
      options: [4, 5, 6.3],
      defaultValue: 4
    }

    if(currentOptions.width == 4 || currentOptions.width == 5) {
      updatedCapacitorOptions.pitch.options = [2];
      updatedCapacitorOptions.pitch.defaultValue = 2;
    } else if (currentOptions.width == 6.3) {
      updatedCapacitorOptions.pitch.options = [2, 3];
      updatedCapacitorOptions.pitch.defaultValue = 3;
    }
  }
  return updatedCapacitorOptions;
}

export const getCapacitorBOMLine = (component) => {
  let footprint = component.capacitorType + ", ";
  if(component.capacitorType == "Radial") {
    footprint += component.width + "mm diameter, "
  } else if(component.capacitorType == "Disc/Rect") {
    footprint += component.width + "mm wide, "
  }

  footprint += ((component.pitch - 1) * 2.54) + "mm (" + component.pitch + " holes) pitch";

  return {
    value: component.value || "-",
    description: (component.polarised ? "Polarised" : "Non-polarised") + " capacitor",
    footprint: footprint
  }
}

export const drawCapacitor = (component) => {
  
  const capacitorGroup = new Group();
  let position = { x: 50, y: 50 }
  
  if(component.capacitorType == "Disc/Rect") {
    const totalLength = component.pitch * 2.54;
    const centralX = mmToPx(component.width / 2);
    const leg1Y = (globalSettings.getHoleSpacing() / 2);
    const leg2Y = mmToPx(totalLength) - leg1Y;

    const leg1 = new Shape.Circle({
      center: [centralX, leg1Y],
      radius: globalSettings.getHoleDiameter() * 0.51,
      fillColor: "#333",
      data: {
        leg: true
      }
    })
    
    const leg2 = new Shape.Circle({
      center: [centralX, leg2Y],
      radius: globalSettings.getHoleDiameter() * 0.51,
      fillColor: "#333",
      data: {
        leg: true
      }
    })

    const body = new Shape.Rectangle({
      topLeft: mmToPxPoint([0, 0]),
      bottomRight: mmToPxPoint([component.width, totalLength]),
      radius: 3,
      strokeColor: "#333",
      strokeWidth: 0.1 * globalSettings.getCurrentScale(),
      fillColor: capacitorColourLookup[component.colour]
    });

    capacitorGroup.addChild(body);
    capacitorGroup.addChild(leg1);
    capacitorGroup.addChild(leg2);
    
    let polarityMarking;
    if(component.polarised) {
      polarityMarking = new PointText({
        point: [0, 0],
        content: "+",
        fillColor: "black",
        fontFamily: "monospace",
        justification: "center",
        fontSize: 3 * globalSettings.getCurrentScale() + "pt"
      });

      polarityMarking.position = [mmToPx(component.width) / 2, mmToPx(0.325)]

      capacitorGroup.addChild(polarityMarking);
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
 
    refDesLabel.position = mmToPxPoint([component.width / 2, totalLength / 2]);
    if(component.rotation == 0 || component.rotation == 180) {
      refDesLabel.rotation = -90;
    } else {
      refDesLabel.rotation = 0;
    }

    if(component.hole) {
      position = getHoleCoords(component.hole.row, component.hole.column);
      if(component.rotation == 0 || component.rotation == 180) {
        position.y = position.y - (globalSettings.getHoleSpacing() / 2) + mmToPx(totalLength / 2);
        if(component.polarised) {
          const polarityMarkingYOffset = (body.bounds.top - polarityMarking.bounds.top) / 2;
          position.y = position.y + (component.rotation == 0 ? -(polarityMarkingYOffset) : polarityMarkingYOffset);
          refDesLabel.position.y = refDesLabel.position.y + (component.rotation == 180 ? -(polarityMarkingYOffset * 2) : -(polarityMarkingYOffset / 2));
        }
      } else {
        position.x = position.x - (globalSettings.getHoleSpacing() / 2) + mmToPx(totalLength / 2);
        const polarityMarkingXOffset = (body.bounds.top - polarityMarking.bounds.top) / 2;
        position.x = position.x + (component.rotation == 270 ? -(polarityMarkingXOffset) : polarityMarkingXOffset);
        refDesLabel.position.x = refDesLabel.position.x + (component.rotation == 90 ? -(polarityMarkingXOffset) : +(polarityMarkingXOffset));
      }

    }

    capacitorGroup.rotate(component.rotation);

    // Ref des label rotated independently from body.
    capacitorGroup.addChild(refDesLabel);
  } else if(component.capacitorType == "Radial") {
    const pitch = (component.pitch - 1) * 2.54;
    const pitchEdge = pitch + 1.02; // 1.02mm = hole diameter.
    const radius = mmToPx(component.width / 2);
    const leg1Y = radius - mmToPx(pitch / 2);
    const leg2Y = radius + mmToPx(pitch / 2);

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

    const body = new Group({ name: "body" });

    const bodySleeve = new Shape.Circle({
      center: [radius, radius],
      radius: radius,
      strokeColor: "#333",
      strokeWidth: 0.1 * globalSettings.getCurrentScale(),
      fillColor: "#223e63"
    });

    const bodyVent = new Shape.Circle({
      center: [radius, radius],
      radius: radius - (radius / 4),
      strokeColor: "#333",
      strokeWidth: 0,
      fillColor: "grey"
    });

    body.addChild(bodySleeve);
    body.addChild(bodyVent);

    
    capacitorGroup.addChild(body);
    capacitorGroup.addChild(leg1);
    capacitorGroup.addChild(leg2);

    let polarityMarking;
    if(component.polarised) {
      polarityMarking = new PointText({
        point: [0, 0],
        content: "+",
        fillColor: "black",
        fontFamily: "monospace",
        justification: "center",
        fontSize: 4 * globalSettings.getCurrentScale() + "pt"
      });
      
      polarityMarking.position = [(radius * 2), radius - (polarityMarking.bounds.height)]
 
      capacitorGroup.addChild(polarityMarking);
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

    refDesLabel.position = [radius, radius];
    refDesLabel.rotation = 0;

    if(component.hole) {
      position = getHoleCoords(component.hole.row, component.hole.column);
      if(component.rotation == 0 || component.rotation == 180) {
        position.y = position.y + (mmToPx(pitch) / 2);
      } else {
        position.x = position.x + (mmToPx(pitch) / 2);
      }

      let polarityMarkingXOffset = 0;
      let polarityMarkingYOffset = 0; 
      
      if(component.polarised) {
        // If the bounds of the polarity marking exceeds the bounds of the body, offset vertical position.  
        if(polarityMarking.bounds.top < body.bounds.top) {
          polarityMarkingYOffset = ((polarityMarking.bounds.top - body.bounds.top) / 2);
        }
        polarityMarkingXOffset = ((polarityMarking.bounds.right - body.bounds.right) / 2);
      }

        // Offset polarity marking sitting outside body.
      if(component.rotation == 0) {
        position.x = position.x + polarityMarkingXOffset;
        position.y = position.y + polarityMarkingYOffset;
        refDesLabel.position = [radius, radius];
      } else if(component.rotation == 90) {
        position.x = position.x + Math.abs(polarityMarkingYOffset);
        position.y = position.y + polarityMarkingXOffset;
        console.log("Ref des label pos.: " + refDesLabel.position);
        console.log("Polarity marking X offset: " + polarityMarkingXOffset);
        console.log("Polarity marking Y offset: " + polarityMarkingYOffset);
        refDesLabel.position = [radius + (polarityMarkingYOffset) - (refDesLabel.bounds.width), radius + Math.abs(polarityMarkingXOffset)]
      } else if (component.rotation == 180) {
        position.x = position.x - polarityMarkingXOffset;
        position.y = position.y - polarityMarkingYOffset;
        refDesLabel.position = [radius + (polarityMarkingXOffset * 2), radius + (polarityMarkingYOffset * 2)];
      }
      

    }



    capacitorGroup.rotate(component.rotation);

    // Ref des label rotated independently from body.
    capacitorGroup.addChild(refDesLabel);
  }

  capacitorGroup.position = position;
  capacitorGroup.data = component;
  
  if(component.refDes) {
    capacitorGroup.data.refDes = component.refDes;
  }

  return capacitorGroup;
}
