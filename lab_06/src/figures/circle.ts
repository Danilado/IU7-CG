import { out } from "../output";
import { RGBColor, setSymPixels, Pixel, Axis } from "../pixels";
import Point from "./point";

export function buildCircleMidpoint(
  buf: ImageData,
  cx: number,
  cy: number,
  r: number,
  color: RGBColor,
  profiling: boolean = false
) {
  let xoff = 0;
  let yoff = r;

  let trial = 4 * (5 - r);
  while (xoff <= yoff) {
    if (!profiling) {
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + xoff,
          y: cy + yoff,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + yoff,
          y: cy + xoff,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
    }

    xoff++;
    if (trial > 0) {
      yoff--;
      trial -= 8 * yoff;
    }
    trial += 8 * xoff + 4;
  }
}

class CircleNodeBuilder {
  static build(): HTMLDivElement {
    let res = this.buildMain();
    let verb = this.buildVerbal(res);

    let name_row = this.buildRow(verb);
    name_row.innerHTML = `<div style="margin-left: auto">Окружность</div>`;
    name_row.id = "name";

    let del_b = this.buildBtn(name_row);
    del_b.value = "⨯";
    del_b.id = "del";

    let coords_row = this.buildRow(verb);
    let x_i = this.buildTexinput(coords_row);
    x_i.placeholder = "x";
    x_i.id = "x";

    let y_i = this.buildTexinput(coords_row);
    y_i.placeholder = "y";
    y_i.id = "y";

    let radius_row = this.buildRow(verb);
    let radius_i = this.buildTexinput(radius_row);
    radius_i.id = "rad";
    radius_i.placeholder = "радиус";

    let inter_center_row = this.buildRow(verb);
    let inter_center_btn = this.buildWideBtn(inter_center_row);
    inter_center_btn.id = "inter_center";
    inter_center_btn.value = "задать центр кликом";

    return res;
  }

  private static buildMain(): HTMLDivElement {
    let res = document.createElement("div");
    res.classList.add("figure");

    return res;
  }

  private static buildVerbal(parent: HTMLDivElement): HTMLDivElement {
    let res = document.createElement("div");
    res.classList.add("verbal");

    parent.appendChild(res);
    return res;
  }

  private static buildRow(parent: HTMLDivElement): HTMLDivElement {
    let res = document.createElement("div");
    res.classList.add("row");

    parent.appendChild(res);
    return res;
  }

  private static buildWideBtn(parent: HTMLDivElement): HTMLInputElement {
    let res = document.createElement("input");
    parent.appendChild(res);
    res.type = "button";
    res.classList.add("widebutton");

    return res;
  }

  private static buildTexinput(parent: HTMLDivElement): HTMLInputElement {
    let res: HTMLInputElement = document.createElement("input");
    res.type = "text";
    res.classList.add("texinput");

    parent.appendChild(res);

    return res;
  }

  private static buildBtn(parent: HTMLDivElement): HTMLInputElement {
    let res: HTMLInputElement = document.createElement("input");
    res.type = "button";
    res.classList.add("button");

    parent.appendChild(res);

    return res;
  }
}

export default class Circle {
  node: HTMLDivElement;
  _center: Point;
  _r: number;

  x_i: HTMLInputElement;
  y_i: HTMLInputElement;
  r_i: HTMLInputElement;

  coordReqCallback: (prompt?: string) => Promise<Point>;

  constructor(
    parentNode: HTMLDivElement,
    coordReqCallback: (prompt?: string) => Promise<Point>,
    center?: Point,
    radius?: number
  ) {
    this.node = CircleNodeBuilder.build();
    parentNode.appendChild(this.node);

    this.coordReqCallback = coordReqCallback;

    this.x_i = this.node.querySelector("#x")!;
    this.y_i = this.node.querySelector("#y")!;
    this.r_i = this.node.querySelector("#rad")!;

    this._center = center !== undefined ? center : new Point(0, 0);
    this._r = radius !== undefined ? radius : 0;

    this.setupListeners();
  }

  private setupListeners() {
    this.setupCoordsListeners();
    this.setupRadiusListener();
    this.setupInterListener();
    this.setupDelListener();
  }

  private setupDelListener() {
    let node = this.node.querySelector("#del")!;
    node.addEventListener("click", () => {
      this.node.dispatchEvent(
        new CustomEvent("figure_delete", {
          bubbles: true,
          detail: { fig: this, node: this.node },
        })
      );
    });
  }

  private setupCoordsListeners() {
    this.x_i.addEventListener("keyup", () => {
      let res = Number(this.x_i.value);
      if (Number.isNaN(res)) return;

      this.cx = res;
    });
    this.y_i.addEventListener("keyup", () => {
      let res = Number(this.y_i.value);
      if (Number.isNaN(res)) return;

      this.cy = res;
    });
  }

  private setupRadiusListener() {
    this.r_i.addEventListener("keyup", () => {
      let res = Number(this.r_i.value);
      if (Number.isNaN(res)) return;

      this.r = res;
    });
  }

  private setupInterListener() {
    let node = this.node.querySelector("#inter_center")!;
    node.addEventListener("click", () => {
      this.coordReqCallback(
        "Выберите точку центра окружности\nПКМ для отмены"
      ).then(
        (coords) => {
          this.center = coords;
          this.dispatchUpdate();
        },
        (rej: Error) => {
          out.error(rej.message);
        }
      );
    });
  }

  public get center(): Point {
    return this._center;
  }
  public set center(pt: Point) {
    this.cx = pt.x;
    this.cy = pt.y;

    this.x_i.value = `${pt.x}`;
    this.y_i.value = `${pt.y}`;

    this.dispatchUpdate();
  }

  public get cx(): number {
    return this._center.x;
  }
  public set cx(cx: number) {
    this._center = new Point(cx, this._center.y);
    this.x_i.value = `${cx}`;

    this.dispatchUpdate();
  }

  public get cy(): number {
    return this._center.y;
  }
  public set cy(cy: number) {
    this._center = new Point(this._center.x, cy);
    this.y_i.value = `${cy}`;

    this.dispatchUpdate();
  }

  public get r(): number {
    return this._r;
  }
  public set r(r: number) {
    this._r = r;
    this.r_i.value = `${r}`;

    this.dispatchUpdate();
  }

  private dispatchUpdate() {
    this.node.dispatchEvent(
      new CustomEvent("figure_changed", {
        bubbles: true,
        detail: {
          node: this.node,
        },
      })
    );
  }

  public draw(buf: ImageData) {
    buildCircleMidpoint(
      buf,
      this.cx,
      this.cy,
      this.r,
      { r: 0, g: 0, b: 0 },
      false
    );
  }
}
