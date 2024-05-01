import { Inputs } from "./inputs";
import { Graphics } from "./graphics";
import { getControls } from "./getControls";

export default class App {
  graphics: Graphics;
  controls: Inputs;

  constructor(canvas: HTMLCanvasElement, out_canvas: HTMLCanvasElement) {
    canvas.width = canvas.getBoundingClientRect().width;
    canvas.height = canvas.getBoundingClientRect().height;
    out_canvas.width = canvas.width;
    out_canvas.height = canvas.height;

    this.graphics = new Graphics(
      canvas.getContext("2d")!,
      canvas.getBoundingClientRect().width,
      out_canvas.getContext("2d")!
    );

    this.controls = getControls(this.graphics);
    console.log(this.controls.points);
  }
}
