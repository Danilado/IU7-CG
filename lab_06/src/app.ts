import { getClickCoords } from "./constants";
import Chain from "./figures/chain";
import Point from "./figures/point";
import FigureField from "./figuresField";
import { Graphics } from "./graphics";
import { out } from "./output";
import { HEXtoRGB } from "./pixels";

export default class App {
  state: "idle" | "filling" | "picking" | "drawing" = "idle";
  ff: FigureField;
  graphics: Graphics;

  blocker: HTMLDivElement;
  blockertext: HTMLDivElement;
  docff: HTMLDivElement;
  canv: HTMLCanvasElement;
  outline_canv: HTMLCanvasElement;
  delay_i: HTMLInputElement;
  color_i: HTMLInputElement;

  constructor() {
    this.docff = document.querySelector("#figures")!;

    this.ff = new FigureField(
      this.docff,
      document.querySelector("#add_line")!,
      document.querySelector("#add_circle")!,
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

    this.delay_i = document.querySelector("#delay")!;
    this.color_i = document.querySelector("#i-color")!;

    this.setupListeners();
  }

  private setupListeners() {
    this.setupFiguresListeners();
    this.setupDrawListeners();
    this.setupClearListener();
    this.setupFillListener();
  }

  private setupFillListener() {
    document.querySelector("#fill")!.addEventListener("click", () => {
      let del: number = Number(this.delay_i.value);
      if (this.delay_i.value == "") del = 0;
      if (Number.isNaN(del))
        return out.error("Ошибка ввода задержки при заливке");

      this.reqCanvasCoords("Выберите точку затравки\nПКМ для отмены").then(
        (coords) => {
          this.state = "filling";
          this.toggleInterface(false, "Выполняется заливка");
          this.graphics
            .fill(coords, HEXtoRGB(this.color_i.value), del)
            .then(
              (time) => {
                let s_flag = time > 1000;
                if (time > 1000) time /= 1000;
                out.write(`Заливка заняла ${time}${s_flag ? "c" : "мс"}`, ``);
              },
              (err) => {
                out.error(err);
              }
            )
            .finally(() => {
              this.toggleInterface(true);
              this.state = "idle";
            });
        },
        (rej: Error) => {
          out.error(rej.message);
        }
      );
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
  }

  private update() {
    this.graphics.drawFigures(this.ff.figures);
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

  private setupDrawListeners() {
    let ch: Chain | undefined = undefined;

    this.outline_canv.addEventListener("mousedown", () => {
      if (this.state !== "idle") return;
      this.state = "drawing";
      ch = this.ff.addChain();
    });

    this.outline_canv.addEventListener("mouseup", () => {
      if (this.state !== "drawing") return;
      this.state = "idle";
      if (ch!.points.length < 2) this.ff.removeFigure(ch!);
      ch = undefined;
    });

    this.outline_canv.addEventListener("mousemove", (e) => {
      if (this.state !== "drawing") return;
      let coords = getClickCoords(this.outline_canv, e);
      ch!.addPoint(coords);
      this.update();
    });

    this.outline_canv.addEventListener("mouseleave", () => {
      if (this.state !== "drawing") return;
      this.state = "idle";
      if (ch!.points.length < 2) this.ff.removeFigure(ch!);
      ch = undefined;
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
