import Point from "./point";

class PointNodeBuilder {
  static build(): HTMLDivElement {
    let res = this.buildMain();

    let x_i = this.buildTexinput(res);
    x_i.placeholder = "x";
    x_i.id = "x";

    let y_i = this.buildTexinput(res);
    y_i.placeholder = "y";
    y_i.id = "y";

    let del_b = this.buildBtn(res);
    del_b.value = "⨯";
    del_b.id = "del";

    return res;
  }

  private static buildMain(): HTMLDivElement {
    let res: HTMLDivElement = document.createElement("div");
    res.classList.add("row");
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

interface PNEventDetail {
  node: HTMLDivElement;
  metadata: any;
}

export default class PointNode {
  node: HTMLDivElement;
  data: PNEventDetail;

  x_i: HTMLInputElement;
  y_i: HTMLInputElement;
  del_btn: HTMLInputElement;

  constructor(parent: HTMLDivElement, meta: any) {
    this.node = PointNodeBuilder.build();
    parent.appendChild(this.node);

    this.data = {
      node: this.node,
      metadata: meta,
    };

    this.x_i = this.node.querySelector("#x")!;
    this.y_i = this.node.querySelector("#y")!;
    this.del_btn = this.node.querySelector("#del")!;

    this.setupListeners();
  }

  private setupListeners() {
    this.setupDeleteListener();
    this.setupChangeListeners();
  }

  private setupDeleteListener() {
    this.del_btn.addEventListener("click", () => {
      this.node.dispatchEvent(
        new CustomEvent("point_delete", { bubbles: true, detail: this.data })
      );
    });
  }

  private setupChangeListeners() {
    this.x_i.addEventListener("keyup", () => {
      this.node.dispatchEvent(
        new CustomEvent("point_change", { bubbles: true, detail: this.data })
      );
    });
    this.y_i.addEventListener("keyup", () => {
      this.node.dispatchEvent(
        new CustomEvent("point_change", { bubbles: true, detail: this.data })
      );
    });
  }

  public set x(x: number) {
    this.x_i.value = `${x}`;
  }
  public set y(y: number) {
    this.y_i.value = `${y}`;
  }
  public set pt(pt: Point) {
    this.x_i.value = `${pt.x}`;
    this.y_i.value = `${pt.y}`;
  }

  public get x(): number {
    let res = Number(this.x_i.value);
    if (Number.isNaN(res)) return 0;
    return res;
  }
  public get y(): number {
    let res = Number(this.y_i.value);
    if (Number.isNaN(res)) return 0;
    return res;
  }
  public get pt(): Point {
    let res_x = Number(this.x_i.value);
    if (Number.isNaN(res_x)) res_x = 0;
    let res_y = Number(this.y_i.value);
    if (Number.isNaN(res_y)) res_y = 0;
    return new Point(res_x, res_y);
  }

  public validate() {
    let res_x = Number(this.x_i.value);
    if (Number.isNaN(res_x))
      throw new Error(
        `Ошибка в значении координаты x поля ввода с данными ${this.data}`
      );
    let res_y = Number(this.x_i.value);
    if (Number.isNaN(res_y))
      throw new Error(
        `Ошибка в значении координаты y поля ввода с данными ${this.data}`
      );
  }
}
