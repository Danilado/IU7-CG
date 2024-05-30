import { errHandler, getClickCoords } from "./constants";
import Point from "./figures/point";
import FigureField from "./figuresField";
import { checkConvexityPolygon, getCutLines } from "./getCutLine";
import { Graphics } from "./graphics";

export default class App {
  state: "idle" | "filling" | "picking" | "drawing" = "idle";
  ff: FigureField;
  graphics: Graphics;

  blocker: HTMLDivElement;
  blockertext: HTMLDivElement;
  docff: HTMLDivElement;
  canv: HTMLCanvasElement;
  outline_canv: HTMLCanvasElement;

  constructor() {
    this.docff = document.querySelector("#figures")!;

    this.ff = new FigureField(
      this.docff,
      document.querySelector("#add_line")!,
      (prompt?: string) => {
        return this.reqCanvasCoords(prompt);
      }
    );

    this.blocker = document.querySelector(".blocker")!;
    this.blockertext = document.querySelector(".blockertext")!;
    this.canv = document.querySelector("#main_canvas")!;
    this.outline_canv = document.querySelector("#outline_canvas")!;

    this.graphics = new Graphics(
      this.canv.getContext("2d")!,
      this.canv.getBoundingClientRect().width,
      this.outline_canv.getContext("2d")!
    );

    this.setupListeners();
  }

  private setupListeners() {
    this.setupFiguresListeners();
    this.setupClearListener();
    this.setupFillListener();
  }

  private setupFillListener() {
    const resColorI: HTMLInputElement = document.querySelector("#i-color-res")!;
    document.querySelector("#cut")!.addEventListener("click", () => {
      try {
        if (!checkConvexityPolygon(this.ff.chain.getPoints()))
          throw new Error(
            "Отсекатель не выпуклый или не имеет менее трёх точек"
          );

        let cutLines = getCutLines(this.ff.chain.getPoints(), this.ff.lines);
        console.log(cutLines);
        this.graphics.drawLines(cutLines, resColorI.value);
      } catch (err) {
        errHandler(err);
      }
    });
  }

  private setupClearListener() {
    document.querySelector("#clear")!.addEventListener("click", () => {
      this.ff.clear();
    });
  }

  private setupFiguresListeners() {
    this.docff.addEventListener("figure_changed", (event) => {
      event.stopPropagation();
      this.update();
    });
    this.ff.chain.node.addEventListener("figure_changed", (event) => {
      event.stopPropagation();
      this.update();
    });
  }

  private update() {
    const rectColorI: HTMLInputElement =
      document.querySelector("#i-color-rect")!;
    const lineColorI: HTMLInputElement =
      document.querySelector("#i-color-line")!;

    this.graphics.resetImage();
    try {
      this.graphics.drawChain(this.ff.chain, rectColorI.value);
    } catch (_err) {
      console.log(_err);
    }
    try {
      this.graphics.drawLines(this.ff.lines, lineColorI.value);
    } catch (_err) {
      console.log(_err);
    }
  }

  public reqCanvasCoords(prompt?: string): Promise<Point> {
    return new Promise((res) => {
      if (this.state !== "idle")
        throw new Error(`Приложение занято. Текущее состояние: ${this.state}`);

      this.toggleInterface(false, prompt);

      this.state = "picking";

      let retclick = (e: MouseEvent) => {
        fin();
        res(getClickCoords(this.outline_canv, e));
      };

      let reterr = (e: MouseEvent) => {
        e.preventDefault();
        fin();
        throw new Error("Rightclick");
      };

      this.outline_canv.addEventListener("click", retclick);
      this.outline_canv.addEventListener("contextmenu", reterr);

      let fin = () => {
        this.outline_canv.removeEventListener("click", retclick);
        this.outline_canv.removeEventListener("contextmenu", reterr);
        this.state = "idle";
        this.toggleInterface(true);
      };
    });
  }

  private toggleInterface(state: boolean, text?: string) {
    if (state) {
      this.blocker.classList.remove("active");
      this.blockertext.innerText = "";
    } else {
      this.blocker.classList.add("active");
      this.blockertext.innerText = text !== undefined ? text : "";
    }
  }
}
