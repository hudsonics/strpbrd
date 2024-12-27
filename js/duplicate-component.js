import { placeComponent } from "./place-component.js";
import { getSelectedComponent } from "./draw-component.js";

export const duplicateComponent = () => {
  placeComponent(getSelectedComponent().data);
}

