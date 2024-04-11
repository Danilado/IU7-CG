import { Graphics } from "../graphics";
import { Inputs } from "../inputs";

export default class GraphicsListeners {
  private _canvas: HTMLCanvasElement;
  private canvas_gr: Graphics;
  private parent: Inputs;

  constructor(canv: Graphics, parent: Inputs) {
    this.canvas_gr = canv;
    this.parent = parent;
    this._canvas = canv.node;

    this.setupGraphicsListener();
  }

  private addPointListner(e: MouseEvent) {
    let g = this.canvas_gr;
    if (!g.choosing) {
      g.choosing = true;
      g.clearCtx();
      g.polygon.drawHelpful(Inputs.getPtFromEvent(g.node, e));
    } else {
      g.clearCtx();
      g.polygon.addNode(Inputs.getPtFromEvent(g.node, e));
      g.polygon.drawHelpful(Inputs.getPtFromEvent(g.node, e));
      this.parent.setPointsValue(g.polygon.toString());
    }
  }

  private closePathListener() {
    let g = this.canvas_gr;
    g.clearCtx();
    g.choosing = false;
    g.update();
  }

  private mouseMoveListener(e: MouseEvent) {
    // TODO: add checking for custom canvas size
    let g = this.canvas_gr;
    if (g.choosing) {
      g.clearCtx();
      g.polygon.drawHelpful(Inputs.getPtFromEvent(g.node, e));
    }
  }

  private setupGraphicsListener() {
    this._canvas.addEventListener("click", (e) => {
      this.addPointListner(e);
    });

    this._canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.closePathListener();
    });

    this._canvas.addEventListener("mousemove", (e) => {
      this.mouseMoveListener(e);
    });
  }
}
