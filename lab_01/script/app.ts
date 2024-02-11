"use strict";

//#region interface

//#region points

const input_x: HTMLInputElement = document.querySelector("#inewx")!;
const input_y: HTMLInputElement = document.querySelector("#inewy")!;
const add_point: HTMLInputElement = document.querySelector("#submit")!;
const output_node: HTMLDivElement = document.querySelector(".footer")!;

class output {
  node: HTMLDivElement;
  constructor(node: HTMLDivElement) {
    this.node = node;
  }

  write(text: string, prefix: string) {
    this.node.innerHTML += prefix + text + "<br><br>";
    this.scroll_to_bottom();
  }

  warn(text: string) {
    this.write(text, "WARN: ");
  }

  log(text: string) {
    this.write(text, "LOG: ");
  }

  error(text: string) {
    this.write(text, "ERROR: ");
  }

  scroll_to_bottom() {
    this.node.scroll(0, this.node.scrollHeight);
  }
}

const out: output = new output(output_node);

class point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class pointnode {
  pt: point;
  node: HTMLDivElement;
  indexnode: HTMLInputElement;
  deletebutton: HTMLInputElement;
  coords: Array<HTMLInputElement>;
  index: number = -1;

  constructor(pt: point) {
    this.pt = pt;

    this.node = document.createElement("div");
    this.indexnode = document.createElement("input");
    this.deletebutton = document.createElement("input");
    this.coords = [];
    this.index = -1;

    this._init_node();
    this._init_index();
    this._init_del();
    this._init_coords();

    this.form();
    this.update();
    this.addCoordListeners();
  }

  form() {
    this.node.appendChild(this.indexnode);

    this.coords.forEach((coord) => {
      coord.type = "text";
      coord.classList.add("coordedit");
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
      let tmp = Number(this.coords[0].value);
      if (Number.isNaN(tmp))
        return out.error(
          `Ошибка изменения координаты X точки ${this.index + 1}`
        );

      this.pt.x = tmp;
      out.log(`Координата X точки ${this.index + 1} изменена на ${tmp}`);
    });

    this.coords[1].addEventListener("input", () => {
      let tmp = Number(this.coords[1].value);
      if (Number.isNaN(tmp))
        return out.error(
          `Ошибка изменения координаты Y точки ${this.index + 1}`
        );

      this.pt.y = tmp;
      out.log(`Координата Y точки ${this.index + 1} изменена на ${tmp}`);
    });
  }

  addDelCallback(func: Function) {
    this.deletebutton.addEventListener("click", () => {
      func();
    });
  }

  private _init_node() {
    this.node.classList.add("row");
  }

  private _init_del() {
    this.deletebutton.classList.add("button");
    this.deletebutton.value = "⨯";
    this.deletebutton.type = "button";
  }

  private _init_index() {
    this.indexnode.type = "button";
    this.indexnode.classList.add("button");
  }

  private _init_coords() {
    this.coords.push(document.createElement("input"));
    this.coords.push(document.createElement("input"));
  }
}

class pointtable {
  node: HTMLDivElement;
  pointarr: Array<pointnode>;

  constructor(node_query: string) {
    this.node = document.querySelector(node_query)!;
    this.pointarr = [];
  }

  add(pn: pointnode) {
    let i = this.pointarr.length;
    this.pointarr.push(pn);
    pn.index = i;
    pn.addDelCallback(() => {
      this.remove(pn);
    });
    pn.update();
    this.update();
  }

  remove(pn: pointnode) {
    out.log(`Удаляю точку ${pn.index + 1}`);
    this.node.removeChild(pn.node);
    this.pointarr = this.pointarr.filter((element: pointnode) => {
      return element !== pn;
    });
    out.log(`Меняю нумерацию точек...`);
    this.pointarr.forEach((pn, i) => {
      pn.index = i;
      pn.update();
    });
  }

  update() {
    this.pointarr.forEach((pn: pointnode) => {
      pn.update();
      this.node.appendChild(pn.node);
    });
  }
}

const pts_element: pointtable = new pointtable(".points");

add_point.addEventListener("click", () => {
  let x_in = input_x.value;
  let y_in = input_y.value;

  let x: number;
  let y: number;

  x = Number(x_in);
  if (Number.isNaN(x)) return out.error("Ошибка чтения значения X новой точки");

  y = Number(y_in);
  if (Number.isNaN(y)) return out.error("Ошибка чтения значения Y новой точки");

  pts_element.add(new pointnode(new point(x, y)));
});

//#endregion points

//#region circle

const input_center_x: HTMLInputElement = document.querySelector("#ixcenter")!;
const input_center_y: HTMLInputElement = document.querySelector("#iycenter")!;
const input_radius: HTMLInputElement = document.querySelector("#iradius")!;

class Circle {
  x: number;
  y: number;
  r: number;

  constructor(center_x: number, center_y: number, radius: number) {
    this.x = center_x;
    this.y = center_y;
    this.r = radius;
  }
}

//#endregion circle

//#endregion interface

//#region graphics

const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
canvas.width = Math.round(canvas.getBoundingClientRect().width);
canvas.height = Math.round(canvas.getBoundingClientRect().height);

const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

class graphics {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;

  constructor(context: CanvasRenderingContext2D) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = context;
  }
}

window.addEventListener("resize", () => {
  out.warn(
    `UNIMPLEMENTED Изменение размера холста w: ${Math.round(
      canvas.getBoundingClientRect().width
    )} h: ${Math.round(canvas.getBoundingClientRect().height)}`
  );
});

//#endregion graphics
