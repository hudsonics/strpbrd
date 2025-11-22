import { drawTrackCut } from "./track-cut.js";
import { drawResistor, getResistorOptions, getResistorBOMLine } from "./resistor.js";
import { drawInductor, getInductorOptions, getInductorBOMLine } from "./inductor.js";
import { drawCapacitor, getCapacitorOptions, getCapacitorBOMLine } from "./capacitor.js";
import { drawDiode, getDiodeOptions, getDiodeBOMLine } from "./diode.js";
import { drawDIP, getDIPOptions,getDIPBOMLine } from "./dip.js";
import { drawTO92, getTO92Options, getTO92BOMLine } from "./to-92.js";
import { drawTO39, getTO39Options, getTO39BOMLine } from "./to-39.js";
import { drawWire, getWireOptions, getWireBOMLine } from "./wire.js";
import { drawTestPoint, getTestPointOptions, getTestPointBOMLine } from "./test-point.js";
import { drawLED, getLEDOptions, getLEDBOMLine } from "./led.js";
import { drawScrewTerminal, getScrewTerminalOptions, getScrewTerminalBOMLine } from "./screw-terminal.js";
import { drawLabel, getLabelOptions } from "./label.js";
import { drawTactileSwitch, getTactileSwitchOptions, getTactileSwitchBOMLine } from "./tactile-switch.js";
import { drawPinHeader, getPinHeaderOptions, getPinHeaderBOMLine } from "./pin-header.js";
import { drawPotentiometer, getPotentiometerOptions, getPotentiometerBOMLine } from "./potentiometer.js";

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
    getOptions: getWireOptions,
    getBOMLine: getWireBOMLine
  },
  "resistor": {
    draw: drawResistor,
    refDes: "R",
    properName: "Resistor",
    aliases: ["resistor"],
    getTerminals: () => { return 2; },
    getOptions: getResistorOptions,
    getBOMLine: getResistorBOMLine
  },
  "inductor": {
    draw: drawInductor,
    refDes: "L",
    properName: "Inductor",
    aliases: ["inductor", "l", "coil", "choke"],
    getTerminals: () => { return 2; },
    getOptions: getInductorOptions,
    getBOMLine: getInductorBOMLine
  },
  "capacitor": {
    draw: drawCapacitor,
    refDes: "C",
    properName: "Capacitor",
    aliases: ["capacitor"],
    getTerminals: () => { return 2; },
    getOptions: getCapacitorOptions,
    getBOMLine: getCapacitorBOMLine
  },
  "diode": {
    draw: drawDiode,
    refDes: "D",
    properName: "Diode",
    aliases: ["diode"],
    getTerminals: () => { return 2; },
    getOptions: getDiodeOptions,
    getBOMLine: getDiodeBOMLine
  },
  "dip": {
    draw: drawDIP,
    refDes: "U",
    properName: "Dual Inline Package",
    aliases: ["dual inline package", "dip", "chip", "ic"],
    getTerminals: () => { return 8; },
    getOptions: getDIPOptions,
    getBOMLine: getDIPBOMLine
  },
  "led": {
    draw: drawLED,
    refDes: "LED",
    properName: "Light Emitting Diode",
    aliases: ["light emitting diode", "led"],
    getTerminals: () => { return 2; },
    getOptions: getLEDOptions,
    getBOMLine: getLEDBOMLine
  },
  "to-92": {
    draw: drawTO92,
    refDes: "Q",
    properName: "TO-92",
    aliases: ["tranistor", "bjt", "mosfet", "jfet", "to-92"],
    getTerminals: () => { return 3; },
    getOptions: getTO92Options,
    getBOMLine: getTO92BOMLine
  },
  "to-39": {
    draw: drawTO39,
    refDes: "Q",
    properName: "TO-39",
    aliases: ["tranistor", "bjt", "mosfet", "jfet", "to-39"],
    getTerminals: () => { return 3; },
    getOptions: getTO39Options,
    getBOMLine: getTO39BOMLine
  },
  "test-point": {
    draw: drawTestPoint,
    refDes: "TP",
    properName: "Test Point",
    aliases: ["test point", "tp"],
    getTerminals: () => { return 1; },
    getOptions: getTestPointOptions,
    getBOMLine: getTestPointBOMLine
  },
  "screw-terminal": {
    draw: drawScrewTerminal,
    refDes: "J",
    properName: "Screw Terminal",
    aliases: ["screw terminal", "block", "j"],
    getTerminals: () => { return 2; },
    getOptions: getScrewTerminalOptions,
    getBOMLine: getScrewTerminalBOMLine
  },
  "tactile-switch": {
    draw: drawTactileSwitch,
    refDes: "SW",
    properName: "Tactile Switch",
    aliases: ["tactile switch", "push button"],
    getTerminals: () => { return 4; },
    getOptions: getTactileSwitchOptions,
    getBOMLine: getTactileSwitchBOMLine
  },
  "pin-header": {
    draw: drawPinHeader,
    refDes: "J",
    properName: "Pin Header",
    aliases: ["pin header", "jumper", "j"],
    getTerminals: () => { return 2; },
    getOptions: getPinHeaderOptions,
    getBOMLine: getPinHeaderBOMLine
  },
  "potentiometer": {
    draw: drawPotentiometer,
    refDes: "POT",
    properName: "Potentiometer",
    aliases: ["potentiometer", "variable resistor", "trimmer"],
    getTerminals: () => { return 2; },
    getOptions: getPotentiometerOptions,
    getBOMLine: getPotentiometerBOMLine
  }
}
