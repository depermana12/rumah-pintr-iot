import "./style.css";
import LightController from "./lightController";

document.addEventListener("DOMContentLoaded", () => {
  (window as any).lights = new LightController();
});
