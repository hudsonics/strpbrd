let currentLayout = {
  layoutName: "",
  authorName: "",
  boardWidth: 20,
  boardHeight: 10,
  perf: false,
  components: {}
}


let historyIndex = 0;
let layoutHistory = [JSON.parse(JSON.stringify(currentLayout))];

export const getCurrentLayout = (key = null) => {
  if(key) {
    if(currentLayout[key]) {
      return JSON.parse(JSON.stringify(currentLayout[key]));
    } else {
      return;
    }
  } else {
    return JSON.parse(JSON.stringify(currentLayout));
  }
}

export const setCurrentLayout = (key, value, undo = null) => {
  if(key == "all" && (undo === true || undo === false)) {
    currentLayout = value;
  } else {  
    
    currentLayout[key] = value;
    if(key == "layoutName" || key == "authorName") {
      updateLayoutInfo();
    }
 
    // If change made when back in history, delete history.
    if(historyIndex + 1 != layoutHistory.length) {
      layoutHistory = [];
      historyIndex = -1;
    }

    // Push current layout into history.
    layoutHistory.push(getCurrentLayout());
    historyIndex++;  
         
  }
}

export const undo = () => {
  if(historyIndex > 0) {
    historyIndex--;
    setCurrentLayout("all", layoutHistory[historyIndex], true);
    getCurrentLayout();
  } else {
    alert("Nothing to undo!");
  }
}

export const redo = () => {
  if(layoutHistory.length - 1 > historyIndex) {
    historyIndex++;
    setCurrentLayout("all", layoutHistory[historyIndex], false);
    getCurrentLayout();
  } else {
    alert("Nothing to redo!");
  }
}

export const loadCurrentLayout = (loadedLayout) => {
  currentLayout = {};
  currentLayout = loadedLayout;
  updateLayoutInfo();
  updateBoardSetupDialog();
}

// Updates tagline on footer with layout name and author, if entered.
const updateLayoutInfo = () => {
  const layoutInfo = document.getElementById("layout-info");
  layoutInfo.innerHTML = "";

  if(getCurrentLayout("layoutName") != null) {
    layoutInfo.innerHTML += "<span style='font-weight: bold;'>" + getCurrentLayout("layoutName") + "</span>";
    if(getCurrentLayout("authorName") != null) {
      layoutInfo.innerHTML += " by <span style='font-weight: bold;'>" + getCurrentLayout("authorName"); + "</span>";
    } 
  }
}

const updateBoardSetupDialog = () => {
  Object.keys(getCurrentLayout()).forEach((key) => {
    const input = document.getElementById(key + "-input");
    if(input) {
      input.value = getCurrentLayout(key);
    }
  });
}
