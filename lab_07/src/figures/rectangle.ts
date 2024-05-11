import { RGBColor } from "../pixels";
import drawLineWu from "./WuLine";
import Point from "./point";
import PointNode from "./pointNode";

class InterBtnBuilder {
  static build(): HTMLDivElement {
    let res = this.buildMain();

    let btn = this.buildButton();
    res.appendChild(btn);

    return res;
  }

  private static buildMain(): HTMLDivElement {
    let res: HTMLDivElement = document.createElement("div");
    res.classList.add("row");
    return res;
  }

  private static buildButton(): HTMLInputElement {
    let res: HTMLInputElement = document.createElement("input");
    res.type = "button";
    res.classList.add("widebutton");
    res.value = "Задать кликами";
    return res;
  }
}

export default class Rect {
  coordReqCallback: (prompt?: string) => Promise<Point>;
  node: HTMLDivElement;

  _pt1: PointNode;
  _pt2: PointNode;

  inter_set_btn: HTMLInputElement;

  constructor(
    parentNode: HTMLDivElement,
    coordReqCallback: (prompt?: string) => Promise<Point>
  ) {
    this.node = parentNode;

    this._pt1 = new PointNode(this.node, {}, true);
    this._pt2 = new PointNode(this.node, {}, true);

    let inter_btn_node = InterBtnBuilder.build();
    this.node.appendChild(inter_btn_node);
    this.inter_set_btn = inter_btn_node.querySelector("input")!;

    this.coordReqCallback = coordReqCallback;

    this.setupListeners();
  }

  private setupListeners() {
    this.setupInterSetBtnListeners();
    this.setupRectListener();
  }

  private setupRectListener() {
    this.node.addEventListener("point_change", (e) => {
      e.stopPropagation();
      this.dispatchUpdate();
    });
  }

  private setupInterSetBtnListeners() {
    this.inter_set_btn.addEventListener("click", () => {
      this.coordReqCallback(
        "Выберите первый угол отсекателя\nИли нажмите ПКМ для отмены"
      ).then((pt1: Point) => {
        this.coordReqCallback(
          "Выберите второй угол отсекателя\nИли нажмите ПКМ для отмены"
        ).then((pt2: Point) => {
          this.pt1 = pt1;
          this.pt2 = pt2;
          this.dispatchUpdate();
        });
      });
    });
  }

  public draw(buf: ImageData, color: RGBColor) {
    try {
      this._pt1.validate();
    } catch (_err) {
      throw new Error("Ошибка ввода первого угла отсекателя");
    }
    try {
      this._pt2.validate();
    } catch (_err) {
      throw new Error("Ошибка ввода второго угла отсекателя");
    }

    let pts: Point[] = [
      this.pt1,
      new Point(this.pt1.x, this.pt2.y),
      this.pt2,
      new Point(this.pt2.x, this.pt1.y),
      this.pt1,
    ];

    if (pts.length < 2) throw new Error("not enough points");

    for (let i = 0; i < pts.length - 1; ++i) {
      drawLineWu(
        buf,
        pts[i].x,
        pts[i].y,
        pts[i + 1].x,
        pts[i + 1].y,
        color,
        false
      );
    }
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

  //#region gettersetters

  public get pt1(): Point {
    return this._pt1.pt;
  }
  public set pt1(pt: Point) {
    this._pt1.pt = pt;
  }

  public get pt2(): Point {
    return this._pt2.pt;
  }
  public set pt2(pt: Point) {
    this._pt2.pt = pt;
  }

  public get x1(): number {
    return this._pt1.x;
  }
  public set x1(n: number) {
    this._pt1.x = n;
  }

  public get y1(): number {
    return this._pt1.y;
  }
  public set y1(n: number) {
    this._pt1.y = n;
  }

  public get x2(): number {
    return this._pt2.x;
  }
  public set x2(n: number) {
    this._pt2.x = n;
  }

  public get y2(): number {
    return this._pt2.y;
  }
  public set y2(n: number) {
    this._pt2.y = n;
  }

  //#endregion gettersetters
}
