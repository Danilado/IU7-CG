import "../css/style.scss";
import App from "./app";

const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
const out_canvas: HTMLCanvasElement =
  document.querySelector("#outline_canvas")!;

new App(canvas, out_canvas);
