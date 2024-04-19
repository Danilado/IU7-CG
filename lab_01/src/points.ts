import { Point } from "./geometry";
import { graphics } from "./graphics";
import { add_point, input_x, input_y, clear_points } from "./interface";
import { out } from "./output";

let dark = false;

export class PointNode {
  pt: Point;
  node: HTMLDivElement;
  indexnode: HTMLInputElement;
  deletebutton: HTMLInputElement;
  coords: Array<HTMLInputElement>;
  index: number = -1;

  constructor(pt: Point) {
    this.pt = pt;

    this.node = document.createElement("div");
    this.indexnode = document.createElement("input");
    this.indexnode.disabled = true;
    if (dark) this.indexnode.classList.add("dark");
    this.deletebutton = document.createElement("input");
    this.coords = [];
    this.index = -1;

    this._initNode();
    this._initIndex();
    this._initDel();
    this._initCoords();

    this.form();
    this.update();
    this.addCoordListeners();
  }

  form() {
    if (dark) {
      this.node.classList.add("dark");
      this.deletebutton.classList.add("dark");
    }

    this.node.appendChild(this.indexnode);

    this.coords.forEach((coord) => {
      coord.type = "text";
      coord.classList.add("coordedit");
      if (dark) coord.classList.add("dark");
      this.node.appendChild(coord);
    });

    this.node.appendChild(this.deletebutton);
  }

  update() {
    this.indexnode.value = `${this.index + 1}`;
    this.coords[0].value = `${this.pt.x}`;
    this.coords[1].value = `${this.pt.y}`;
  }

  addCoordListeners() {
    this.coords[0].addEventListener("input", () => {
      graphics.endFrame();

      let tmp = Number(this.coords[0].value);
      if (Number.isNaN(tmp) || !this.coords[0].value)
        return out.error(
          `Ошибка изменения координаты X точки ${this.index + 1}`
        );

      this.pt.x = tmp;
      out.log(`Координата X точки ${this.index + 1} изменена на ${tmp}`);
    });

    this.coords[1].addEventListener("input", () => {
      graphics.endFrame();

      let tmp = Number(this.coords[1].value);
      if (Number.isNaN(tmp) || !this.coords[1].value)
        return out.error(
          `Ошибка изменения координаты Y точки ${this.index + 1}`
        );

      this.pt.y = tmp;
      out.log(`Координата Y точки ${this.index + 1} изменена на ${tmp}`);
    });
  }

  addDelCallback(func: Function) {
    this.deletebutton.addEventListener("click", () => {
      graphics.endFrame();

      func();
    });
  }

  private _initNode() {
    this.node.classList.add("row");
  }

  private _initDel() {
    this.deletebutton.classList.add("button");
    this.deletebutton.value = "⨯";
    this.deletebutton.type = "button";
  }

  private _initIndex() {
    this.indexnode.type = "button";
    this.indexnode.classList.add("button");
  }

  private _initCoords() {
    this.coords.push(document.createElement("input"));
    this.coords.push(document.createElement("input"));
  }

  toString() {
    return `${this.index + 1}: ${this.pt.toString()}`;
  }
}

export class PointTable {
  node: HTMLDivElement;
  pointarr: Array<PointNode>;

  constructor(node_query: string) {
    this.node = document.querySelector(node_query)!;
    this.pointarr = [];
  }

  add(pn: PointNode) {
    let i = this.pointarr.length;
    this.pointarr.push(pn);
    pn.index = i;
    pn.addDelCallback(() => {
      this.remove(pn);
    });
    pn.update();
    this.update();
  }

  remove(pn: PointNode) {
    graphics.endFrame();

    out.log(`Удаляю точку ${pn.index + 1}`);
    this.node.removeChild(pn.node);
    this.pointarr = this.pointarr.filter((element: PointNode) => {
      return element !== pn;
    });
    out.log(`Меняю нумерацию точек...`);
    this.pointarr.forEach((pn, i) => {
      pn.index = i;
      pn.update();
    });
  }

  update() {
    this.pointarr.forEach((pn: PointNode) => {
      pn.update();
      this.node.appendChild(pn.node);
    });
  }

  clear() {
    graphics.endFrame();

    this.pointarr.forEach((pn: PointNode) => {
      this.node.removeChild(pn.node);
    });

    this.pointarr = [];
    this.update();
  }
}

export const pts_element: PointTable = new PointTable(".points");

add_point.addEventListener("click", () => {
  graphics.endFrame();

  let x_in = input_x.value;
  let y_in = input_y.value;

  let x: number;
  let y: number;

  x = Number(x_in);
  if (Number.isNaN(x) || !x_in)
    return out.error("Ошибка чтения значения X новой точки");

  y = Number(y_in);
  if (Number.isNaN(y) || !y_in)
    return out.error("Ошибка чтения значения Y новой точки");

  pts_element.add(new PointNode(new Point(x, y)));
});

clear_points.addEventListener("click", () => {
  graphics.endFrame();

  pts_element.clear();
});
