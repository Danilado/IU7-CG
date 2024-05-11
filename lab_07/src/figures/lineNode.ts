import { RGBColor } from "../pixels";
import drawLineWu from "./WuLine";
import Point from "./point";
import PointNode from "./pointNode";

class LineNodeBuilder {
  static build(): HTMLDivElement {
    let res = this.buildMain();
    let verb = this.buildVerbal(res);

    let name_row = this.buildRow(verb);
    name_row.innerHTML = `<div style="margin-left: auto">Отрезок</div>`;
    name_row.id = "name";

    let del_b = this.buildBtn(name_row);
    del_b.value = "⨯";
    del_b.id = "del";

    let points_holder = this.buildPtsHolder(verb);
    points_holder.id = "pts_holder";

    let cont_row = this.buildRow(verb);
    let cont_btn = this.buildWideBtn(cont_row);
    cont_btn.id = "inter";
    cont_btn.value = "задать кликами";

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

  private static buildPtsHolder(parent: HTMLDivElement): HTMLDivElement {
    let res = document.createElement("div");
    res.classList.add("verbal");
    res.classList.add("high");
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

  private static buildBtn(parent: HTMLDivElement): HTMLInputElement {
    let res: HTMLInputElement = document.createElement("input");
    res.type = "button";
    res.classList.add("button");

    parent.appendChild(res);

    return res;
  }
}

export default class LineNode {
  node: HTMLDivElement;
  _pt1: PointNode;
  _pt2: PointNode;

  pts_node: HTMLDivElement;

  coordReqCallback: (prompt?: string) => Promise<Point>;

  constructor(
    parentNode: HTMLDivElement,
    coordReqCallback: (prompt?: string) => Promise<Point>
  ) {
    this.node = LineNodeBuilder.build();
    parentNode.appendChild(this.node);

    this.coordReqCallback = coordReqCallback;

    this.pts_node = this.node.querySelector("#pts_holder")!;
    this._pt1 = new PointNode(this.pts_node, {}, true);
    this._pt2 = new PointNode(this.pts_node, {}, true);

    this.setupListeners();
  }

  private setupListeners() {
    this.setupInterListener();
    this.setupMainListeners();
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

  private setupInterListener() {
    let node = this.node.querySelector("#inter")!;
    node.addEventListener("click", () => {
      this.coordReqCallback(
        "Выберите первую точку отрезка\nИли нажмите ПКМ для отмены"
      ).then((pt1: Point) => {
        this.coordReqCallback(
          "Выберите вторую точку отрезка\nИли нажмите ПКМ для отмены"
        ).then((pt2: Point) => {
          this.pt1 = pt1;
          this.pt2 = pt2;
          this.dispatchUpdate();
        });
      });
    });
  }

  private setupMainListeners() {
    this.node.addEventListener("point_change", (e) => {
      e.stopPropagation();
      this.dispatchUpdate();
    });
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

  public draw(buf: ImageData, color: RGBColor) {
    try {
      this._pt1.validate();
    } catch (error) {
      throw new Error("Ошибка ввода первой точки отрезка");
    }
    try {
      this._pt2.validate();
    } catch (error) {
      throw new Error("Ошибка ввода первой точки отрезка");
    }

    drawLineWu(buf, this.x1, this.y1, this.x2, this.y2, color, false);
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

  //#endregion
}
