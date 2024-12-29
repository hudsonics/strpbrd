import { mmToPx } from "./utils.js"
import { calculateWorkCentre, getWorkPosition, setWorkPosition } from "./position.js"
import { getCurrentLayout } from "./current-layout.js";
import { globalSettings } from "./global-settings.js";
import { getSelectedComponent } from "./draw-component.js";

let isMoveable = false;

export const setIsMoveable = (moveable) => {
  isMoveable = moveable;
}

export const getIsMoveable = () => {
    return isMoveable;
}

let stripboardGroup;

export const getStripboardGroup = () => {
  return stripboardGroup;
}

// Contains all hole item.
let holes = [];

const setHoles = (newHoles) => {
  holes = newHoles;
}

export const getHoles = () => {
  return holes;
}

export const drawBoard = () => {
  stripboardGroup = new Group();

  setHoles([]);

  const workPosition = getWorkPosition();
  stripboardGroup.position.x = workPosition.x;
  stripboardGroup.position.y = workPosition.y;
  
  // Draw substrate.
  const substrateCoords = getSubstrateCoords();

  const substrate = new Shape.Rectangle({
    topLeft: [substrateCoords.x1, substrateCoords.y1],
    bottomRight: [substrateCoords.x2, substrateCoords.y2],
    radius: 5,
    strokeColor: "grey",
    fillColor: "beige"
  });

  stripboardGroup.addChild(substrate);  
  
  // Draw each row.
  for(let row = 0; row < getCurrentLayout("boardHeight"); row++) {
    // Get co-ordinates for current row copper (track).
    const rowCoords = getRowCoords(row);
    const track = new Shape.Rectangle({
      topLeft: [rowCoords.x1, rowCoords.y1],
      bottomRight: [rowCoords.x2, rowCoords.y2],
      radius: 2,
      strokeColor: "grey",
      fillColor: globalSettings.trackColour
    });
    
    track.onDoubleClick = () => {
      if(!getSelectedComponent()) {
        if(track.strokeWidth == 2) {
          track.strokeColor = "grey";
          track.strokeWidth = 1;
        } else {
          track.strokeColor = "green";
          track.strokeWidth = 2;
        }
      }
    }


    stripboardGroup.addChild(track);
     
    // Draw each hole within row.
    for(let column = 0; column < getCurrentLayout("boardWidth"); column++) {
      const holeCoords = getHoleCoords(row, column);

      let hole = new Path.Circle(new Point(holeCoords.x, holeCoords.y), globalSettings.getHoleDiameter() / 2);
      hole.fillColor = "white";
      hole.strokeWidth = 1;
      hole.strokeColor = "black";
      hole.data = { className: "hole", id: ("hole-" + row + "-" + column) };
      setHoles([...getHoles(), hole]);
      stripboardGroup.addChild(hole);
    }
  }    
}

export const moveBoard = (deltaX, deltaY) => {
  if(!getBoardLocked()) {
    stripboardGroup.position.x += deltaX;
    stripboardGroup.position.y += deltaY;
    setWorkPosition({ 
      x: stripboardGroup.position.x,
      y: stripboardGroup.position.y
    }, stripboardGroup.bounds);
  }
}

export const clearBoard = () => {
  stripboardGroup.removeChildren();
}

const getRowCoords = (row) => {
  // Top left corner coords.
  let x1 = getWorkPosition().bounds.topLeft.x; 
  let y1 = getWorkPosition().bounds.topLeft.y + (row * globalSettings.getHoleSpacing());

  // Bottom right coords.
  let x2 = getWorkPosition().bounds.topLeft.x + (getCurrentLayout("boardWidth") * globalSettings.getHoleSpacing());
  let y2 = y1 + globalSettings.getTrackWidth();
  
  return { x1, y1, x2, y2 };
}

export const getHoleCoords = (row, hole) => {
  const x = getWorkPosition().bounds.topLeft.x + (hole * globalSettings.getHoleSpacing()) + (globalSettings.getHoleSpacing() / 2);
  const y = getWorkPosition().bounds.topLeft.y + (row * (globalSettings.getHoleSpacing())) + (globalSettings.getTrackWidth() / 2);

  return { x, y };
}

const getSubstrateCoords = () => {
  // Top left corner coords.
  const x1 = getWorkPosition().bounds.topLeft.x - globalSettings.getSubstratePadding();
  const y1 = getWorkPosition().bounds.topLeft.y - globalSettings.getSubstratePadding();

  // Bottom right coords.
  const x2 = getWorkPosition().bounds.topLeft.x + (getCurrentLayout("boardWidth") * globalSettings.getHoleSpacing()) + globalSettings.getSubstratePadding();
  const y2 = getWorkPosition().bounds.topLeft.y + (getCurrentLayout("boardHeight") * globalSettings.getHoleSpacing()) + (globalSettings.getSubstratePadding() / 2);

  return { x1, y1, x2, y2 };
}

export const centreWork = () => {
  const { centreCoords, bounds } = calculateWorkCentre();
  setWorkPosition(centreCoords, bounds);
}

let boardLocked = false;

export const getBoardLocked = () => { return boardLocked; };

export const setBoardLocked = (newBoardLockedState) => { boardLocked = newBoardLockedState; };
