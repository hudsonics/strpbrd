import { mmToPxSegments, mmToPxPoint } from "../utils.js";
import { globalSettings } from "../global-settings.js";
import { getHoleCoords } from "../board.js";

const length = 1;
const halfDiagonal = length / 2;
  
export const drawTrackCut = (component) => {
  let position;
  if(component.hole) {
    position = getHoleCoords(component.hole.row, component.hole.column);
  } else {
    position = { x: 50, y: 50 };
  }

  const trackCutGroup = new Group({
    data: {
      pitch: 1,
      terminals: 1,
      componentId: "track-cut"
    }
  });

  const trackCut = new Path({ 
    segments: mmToPxSegments([[0, 0], [length, length], [halfDiagonal, halfDiagonal], [length, 0], [0, length]]),
    strokeColor: "red",
    strokeWidth: 1.5 * globalSettings.getCurrentScale(),
    strokeCap: "round",
    strokeJoin: "round",
    position: [position.x, position.y],
    opacity: 0.5
  })

  const trackCutLeg = new Shape.Circle({
    center: [position.x, position.y],
    radius: globalSettings.getHoleDiameter() * 0.51,
    fillColor: "#333",
    data: {
      leg: true
    }
  })

  trackCutGroup.addChild(trackCutLeg);
  trackCutGroup.addChild(trackCut);

  if(component.refDes) {
    trackCutGroup.data.refDes = component.refDes;
  }


  return trackCutGroup;
}
