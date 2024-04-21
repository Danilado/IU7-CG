import { round } from "./constants";
import { Graphics } from "./graphics";
import CleanBtn from "./inputs/cleaner";
import FillBtn from "./inputs/fillbtn";
import GraphicsListeners from "./inputs/graphicsListeners";
import { PointsListeners, TextAreaPointsInput } from "./inputs/pointsListeners";
import { HEXtoRGB } from "./pixels";
import { Point, Polygon } from "./polygon";

export class NumberInput {
  node: HTMLInputElement;

  constructor(node: HTMLInputElement) {
    this.node = node;
  }

  validateInput(minN: number = -Infinity, maxN: number = Infinity): boolean {
    if (this.node.value == "") return false;
    let tmp = Number(this.node.value);
    if (Number.isNaN(tmp)) return false;
    if (tmp < minN) return false;
    if (tmp > maxN) return false;
    return true;
  }

  value(minN: number = -Infinity, maxN: number = Infinity) {
    if (this.node.value == "") return 0;
    let tmp = Number(this.node.value);
    if (Number.isNaN(tmp)) return tmp;
    if (tmp < minN) return minN;
    if (tmp > maxN) return maxN;
    return tmp;
  }
}

export class ColorInput {
  node: HTMLInputElement;

  constructor(node: HTMLInputElement) {
    this.node = node;
  }

  validateInput(): boolean {
    return CSS.supports("color", this.node.value);
  }

  value() {
    return this.node.value;
  }
}

export class Inputs {
  private _color: HTMLInputElement;
  private _points: HTMLTextAreaElement;
  private _delay: HTMLInputElement;

  private gr: Graphics;
  private color_i: ColorInput;
  private points_i: TextAreaPointsInput;
  private delay_i: NumberInput;

  canv_listeners: GraphicsListeners;
  pts_listeners: PointsListeners;
  clean_listener: CleanBtn;
  fill_listener: FillBtn;

  static getPtFromEvent(node: HTMLElement, e: MouseEvent) {
    let bcr = node.getBoundingClientRect();
    return new Point(round(e.clientX - bcr.x), round(e.clientY - bcr.y));
  }

  constructor(
    color_field: HTMLInputElement,
    points_field: HTMLTextAreaElement,
    delay_field: HTMLInputElement,
    clean_inp: HTMLInputElement,
    fill_btn: HTMLInputElement,
    canv: Graphics
  ) {
    this._color = color_field;
    this.color_i = new ColorInput(color_field);

    this._delay = delay_field;
    this.delay_i = new NumberInput(delay_field);

    this._points = points_field;
    this.pts_listeners = new PointsListeners(points_field, this);
    this.points_i = this.pts_listeners.points_i;

    this.gr = canv;
    this.canv_listeners = new GraphicsListeners(canv, this);

    this.clean_listener = new CleanBtn(clean_inp, this.gr, this.points_i);

    this.fill_listener = new FillBtn(fill_btn, this.gr, this);

    this._color;
  }

  updateCanv() {
    this.gr.update();
  }

  setCanvPoly(pts: Point[]) {
    this.gr.polygon = new Polygon(this.gr, pts);
    this.gr.update();
  }

  setPointsValue(val: string) {
    this._points.value = val;
    this._points.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
  }

  public get color(): string {
    if (!this.color_i.validateInput()) throw new Error("Ошибка выбора цвета");
    return this.color_i.value();
  }

  public get points(): Point[] {
    if (!this.points_i.validateInput()) throw new Error("Ошибка ввода точек");
    return this.points_i.value();
  }

  public get delay(): number {
    if (!this.delay_i.validateInput()) throw new Error("Ошибка ввода задержки");
    return this.delay_i.value();
  }
}
