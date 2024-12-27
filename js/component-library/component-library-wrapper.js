import { drawTrackCut } from "./track-cut.js";
import { drawResistor, getResistorOptions } from "./resistor.js";
import { drawCapacitor, getCapacitorOptions } from "./capacitor.js";
import { drawDiode, getDiodeOptions } from "./diode.js";
import { drawDIP, getDIPOptions } from "./dip.js";
import { drawTO92, getTO92Options } from "./to-92.js";
import { drawWire, getWireOptions} from "./wire.js";
import { drawTestPoint, getTestPointOptions } from "./test-point.js";
import { drawLED, getLEDOptions } from "./led.js";
import { drawScrewTerminal, getScrewTerminalOptions } from "./screw-terminal.js";
import { drawLabel, getLabelOptions } from "./label.js";
import { drawTactileSwitch, getTactileSwitchOptions } from "./tactile-switch.js";

// Note: setting aliases to an empty array makes the component unsearchable.
export const componentLibrary = {
  "track-cut": {
    draw: drawTrackCut,
    refDes: "TC",
    properName: "Track Cut",
    aliases: [],
    getOptions: () => { return {} }
  },
  "label": {
    draw: drawLabel,
    refDes: "LABEL",
    properName: "Label",
    aliases: [],
    getTerminals: () => { return 2; },
    getOptions: getLabelOptions
  },
  "wire": {
    draw: drawWire,
    refDes: "NET",
    properName: "Wire",
    aliases: [],
    getTerminals: () => { return 2; },
    getOptions: getWireOptions 
  },
  "resistor": {
    draw: drawResistor,
    refDes: "R",
    properName: "Resistor",
    aliases: ["resistor"],
    getTerminals: () => { return 2; },
    getOptions: getResistorOptions
  },
  "capacitor": {
    draw: drawCapacitor,
    refDes: "C",
    properName: "Capacitor",
    aliases: ["capacitor"],
    getTerminals: () => { return 2; },
    getOptions: getCapacitorOptions
  },
  "diode": {
    draw: drawDiode,
    refDes: "D",
    properName: "Diode",
    aliases: ["diode"],
    getTerminals: () => { return 2; },
    getOptions: getDiodeOptions
  },
  "dip": {
    draw: drawDIP,
    refDes: "U",
    properName: "Dual Inline Package",
    aliases: ["dual inline package", "dip", "chip", "ic"],
    getTerminals: () => { return 8; },
    getOptions: getDIPOptions
  },
  "led": {
    draw: drawLED,
    refDes: "LED",
    properName: "Light Emitting Diode",
    aliases: ["light emitting diode", "led"],
    getTerminals: () => { return 2; },
    getOptions: getLEDOptions
  },
  "to-92": {
    draw: drawTO92,
    refDes: "Q",
    properName: "TO-92",
    aliases: ["tranistor", "bjt", "mosfet", "jfet", "to-92"],
    getTerminals: () => { return 3; },
    getOptions: getTO92Options
  },
  "test-point": {
    draw: drawTestPoint,
    refDes: "TP",
    properName: "Test Point",
    aliases: ["test point", "tp"],
    getTerminals: () => { return 1; },
    getOptions: getTestPointOptions
  },
  "screw-terminal": {
    draw: drawScrewTerminal,
    refDes: "J",
    properName: "Screw Terminal",
    aliases: ["screw terminal", "block", "j"],
    getTerminals: () => { return 2; },
    getOptions: getScrewTerminalOptions
  },
  "tactile-switch": {
    draw: drawTactileSwitch,
    refDes: "SW",
    properName: "Tactile Switch",
    aliases: ["tactile switch", "push button"],
    getTerminals: () => { return 4; },
    getOptions: getTactileSwitchOptions
  }
}