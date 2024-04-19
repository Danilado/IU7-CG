import { RENDER_SCALE } from "./constants";
import { Point, toPrecision, toDeg } from "./geometry";
import { Graphics } from "./graphics";

export const bg_canvas: HTMLCanvasElement =
  document.querySelector("#staticPlane")!;
export const fg_canvas: HTMLCanvasElement =
  document.querySelector("#dynamicPlane")!;

fg_canvas.width = Math.round(
  fg_canvas.getBoundingClientRect().width * RENDER_SCALE
);
fg_canvas.height = Math.round(
  fg_canvas.getBoundingClientRect().height * RENDER_SCALE
);

bg_canvas.width = Math.round(
  fg_canvas.getBoundingClientRect().width * RENDER_SCALE
);
bg_canvas.height = Math.round(
  fg_canvas.getBoundingClientRect().height * RENDER_SCALE
);

export const fg_ctx: CanvasRenderingContext2D = fg_canvas.getContext("2d")!;
export const bg_ctx: CanvasRenderingContext2D = bg_canvas.getContext("2d")!;

export class Transformation {
  activated: boolean;

  node: HTMLDivElement = document.createElement("div")!;
  textfiled: HTMLDivElement = document.createElement("div")!;
  remove_btn: HTMLInputElement = document.createElement("input")!;
  activated_check: HTMLInputElement = document.createElement("input")!;

  constructor() {
    this.activated = true;
    this._buildNode();
  }

  apply(graph: Graphics) {}

  getPoint(): Point | null {
    return null;
  }

  transformPoint(pt: Point) {
    return pt;
  }

  _buildNode() {
    this.node.classList.add("row");
    this._buildDelButton();
    this._buildCheckBox();

    this.textfiled.classList.add("tranformtext");

    this.node.appendChild(this.textfiled);
    this.node.appendChild(this.activated_check);
    this.node.appendChild(this.remove_btn);
  }

  _buildDelButton() {
    this.remove_btn.type = "button";
    this.remove_btn.value = "⨯";
    this.remove_btn.classList.add("button");
  }

  _buildCheckBox() {
    this.activated_check.style.minWidth = "4em";
    this.activated_check.type = "button";
    this.activated_check.classList.add("button");
    this.activated_check.value = "ВКЛ";

    this.activated_check.addEventListener("click", () => {
      this.activated = !this.activated;
      this.activated_check.value = this.activated ? "ВКЛ" : "ВЫКЛ";
    });
  }
}

export class RotateTransformation extends Transformation {
  pivot: Point;
  angle: number;

  constructor(pivot: Point, angle: number) {
    super();
    this.pivot = pivot;
    this.angle = angle;

    this.textfiled.innerHTML = `Вращение<br/>Угол: ${toPrecision(
      toDeg(this.angle),
      3
    )}град.<br/>центр: ${this.pivot.toString()}`;
  }

  apply(graph: Graphics) {
    if (!this.activated) return;

    let tmp_pivot = graph.getCanvasCoords(this.pivot);
    graph.context.translate(tmp_pivot.x, tmp_pivot.y);
    graph.context.rotate(this.angle);
    graph.context.translate(-tmp_pivot.x, -tmp_pivot.y);
  }

  getPoint(): Point | null {
    return this.pivot;
  }

  transformPoint(pt: Point): Point {
    if (!this.activated) return pt;
    //prettier-ignore
    return new Point(
      (pt.x - this.pivot.x)*Math.cos(this.angle) - (pt.y - this.pivot.y)*Math.sin(this.angle) + this.pivot.x, 
      (pt.x - this.pivot.x)*Math.sin(this.angle) + (pt.y - this.pivot.y)*Math.cos(this.angle) + this.pivot.y
      );
  }
}

export class ScaleTransformation extends Transformation {
  origin: Point;
  scale: NumPair;
  constructor(origin: Point, scale: NumPair) {
    super();
    this.origin = origin;
    this.scale = scale;
    this.textfiled.innerHTML = `Масштабирование<br/>kx: ${this.scale.x} ky: ${
      this.scale.y
    }<br/>центр: ${this.origin.toString()}`;
  }

  apply(graph: Graphics) {
    if (!this.activated) return;
    let tmp_origin = graph.getCanvasCoords(this.origin);

    graph.context.transform(
      this.scale.x,
      0,
      0,
      this.scale.y,
      tmp_origin.x * (1 - this.scale.x),
      tmp_origin.y * (1 - this.scale.y)
    );
  }

  getPoint(): Point | null {
    return this.origin;
  }

  transformPoint(pt: Point): Point {
    if (!this.activated) return pt;
    //prettier-ignore
    return new Point(
      pt.x * this.scale.x + this.origin.x * (1 - this.scale.x),
      pt.y * this.scale.y + this.origin.y * (1 - this.scale.y)
      );
  }
}

export class TranslateTransformation extends Transformation {
  translation: Point;

  constructor(translation: Point) {
    super();
    this.translation = translation;

    this.textfiled.innerHTML = `Смещение<br/>dx: ${this.translation.x} dy: ${this.translation.y}`;
  }

  apply(graph: Graphics): void {
    if (!this.activated) return;
    graph.context.transform(
      1,
      0,
      0,
      1,
      this.translation.x * graph.scale,
      this.translation.y * graph.scale
    );
  }

  transformPoint(pt: Point): Point {
    if (!this.activated) return pt;
    //prettier-ignore
    return new Point(
      pt.x + this.translation.x,
      pt.y + this.translation.y
      );
  }
}

export interface NumPair {
  x: number;
  y: number;
}
