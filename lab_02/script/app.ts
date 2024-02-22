"use strict";

const EPS = 1e-10;
const DEBUG = false;
const RENDER_SCALE = 1;
let dark = false;

//#region geometry

function distance(pt1: Point, pt2: Point): number {
  return Math.sqrt(
    (pt2.x - pt1.x) * (pt2.x - pt1.x) + (pt2.y - pt1.y) * (pt2.y - pt1.y)
  );
}

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `(${toPrecision(this.x, 1)}, ${toPrecision(this.y, 1)})`;
  }
}

function pointsAreEqual(p1: Point, p2: Point) {
  return Math.abs(p1.x - p2.x) < EPS && Math.abs(p1.y - p2.y) < EPS;
}

class Triangle {
  vertex1: Point;
  vertex2: Point;
  vertex3: Point;

  constructor(p1: Point, p2: Point, p3: Point) {
    this.vertex1 = p1;
    this.vertex2 = p2;
    this.vertex3 = p3;
  }
}

class Polygon {
  vertexes: Array<Point>;

  constructor(verts: Array<Point>) {
    this.vertexes = verts;
  }
}

class Circle {
  center: Point;
  r: number;

  constructor(center: Point, radius: number) {
    this.center = center;
    this.r = radius;
  }
}

class Ellipse {
  center: Point;
  width: number;
  height: number;
  rotation: number;
  startAngle: number;
  endAngle: number;
  cc: boolean;

  constructor(
    center: Point,
    width: number,
    height: number,
    rotation: number = 0,
    startAngle: number = 0,
    endAngle: number = Math.PI * 2,
    cc: boolean = false
  ) {
    this.center = center;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.cc = cc;
  }
}

function toDeg(angle_rad: number) {
  return (angle_rad * 180) / Math.PI;
}

function toRad(angle_deg: number) {
  return (angle_deg / 180) * Math.PI;
}

function toPrecision(num: number, precision: number) {
  return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
}

//#endregion geometry

//#region interface

const input_origin_x: HTMLInputElement = document.querySelector("#origin-x")!;
const input_origin_y: HTMLInputElement = document.querySelector("#origin-y")!;

const input_angle: HTMLInputElement = document.querySelector("#i-angle")!;

const input_kx: HTMLInputElement = document.querySelector("#kx")!;
const input_ky: HTMLInputElement = document.querySelector("#ky")!;

const input_dx: HTMLInputElement = document.querySelector("#dx")!;
const input_dy: HTMLInputElement = document.querySelector("#dy")!;

const add_rotation: HTMLInputElement = document.querySelector("#add_rotation")!;
const add_scale: HTMLInputElement = document.querySelector("#add_scale")!;
const add_translate: HTMLInputElement =
  document.querySelector("#add_translation")!;

const clear_output: HTMLInputElement = document.querySelector("#clearout")!;
const output_node: HTMLDivElement = document.querySelector(".footertext")!;

const change_theme: HTMLInputElement = document.querySelector("#themechange")!;

const clear_all: HTMLInputElement = document.querySelector("#clearall")!;

const transformations_node: HTMLDivElement =
  document.querySelector(".transformations")!;

add_rotation.addEventListener("click", () => {
  let cx: number;
  let cy: number;
  let angle: number;

  cx = Number(input_origin_x.value);
  cy = Number(input_origin_y.value);

  if (Number.isNaN(cx) || Number.isNaN(cy))
    return out.error("Ошибка считывания координат центра врщения");

  angle = Number(input_angle.value);
  if (Number.isNaN(angle)) return out.error("Ошибка считывания угла поворота");
  angle = toRad(angle);

  logic.addTransformation(new RotateTransformation(new Point(cx, cy), angle));
  logic.update();
});

add_scale.addEventListener("click", () => {
  let cx: number;
  let cy: number;
  let kx: number;
  let ky: number;

  cx = Number(input_origin_x.value);
  cy = Number(input_origin_y.value);

  if (Number.isNaN(cx) || Number.isNaN(cy))
    return out.error("Ошибка считывания координат центра масштабирования");

  kx = Number(input_kx.value);
  ky = Number(input_ky.value);

  if (Number.isNaN(kx) || Number.isNaN(ky))
    return out.error("Ошибка считывания коэффицентов масштабирования");

  if (Math.abs(kx) < EPS || Math.abs(ky) < EPS)
    return out.error(`Ошибка: Попытка масштабирования с нулевым коэффицентом`);

  logic.addTransformation(
    new ScaleTransformation(new Point(cx, cy), { x: kx, y: ky })
  );
  logic.update();
});

add_translate.addEventListener("click", () => {
  let dx = Number(input_dx.value);
  let dy = Number(input_dy.value);

  if (Number.isNaN(dx) || Number.isNaN(dy))
    return out.error("Ошибка считывания смещения");

  logic.addTransformation(new TranslateTransformation(new Point(dx, dy)));
  logic.update();
});

input_origin_x.addEventListener("input", pushFocus);
input_origin_y.addEventListener("input", pushFocus);

clear_all.addEventListener("click", () => {
  logic.clearAll();
});

function pushFocus() {
  let cx = Number(input_origin_x.value);
  let cy = Number(input_origin_y.value);

  if (Number.isNaN(cx) || Number.isNaN(cy)) return;

  logic.drawFocus(new Point(cx, cy));
}

//#region output
class Output {
  node: HTMLDivElement;
  constructor(node: HTMLDivElement) {
    this.node = node;
  }

  write(text: string, prefix: string) {
    this.node.innerHTML += prefix + text.replace(/\n/, "<br />") + "<br />";
    this.scrollToBottom();
  }

  clear() {
    this.node.innerHTML = ``;
  }

  warn(text: string) {
    if (DEBUG) this.write(text, "WARN: ");
  }

  log(text: string) {
    if (DEBUG) this.write(text, "LOG: ");
  }

  error(text: string) {
    this.write(text, "ERROR: ");
  }

  scrollToBottom() {
    this.node.scroll(0, this.node.scrollHeight);
  }
}

const out: Output = new Output(output_node);

clear_output.addEventListener("click", () => {
  out.clear();
});

//#endregion

change_theme.addEventListener("click", () => {
  dark = !dark;
  let everything = document.querySelectorAll("*");
  if (dark)
    for (let node of everything) {
      node.classList.add("dark");
    }
  else
    for (let node of everything) {
      node.classList.remove("dark");
    }
});

change_theme.click();

//#endregion interface

//#region logic

interface Boundaries {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}

class Logic {
  transformations: Array<Transformation> = [];
  fg_graphics: Graphics;
  bg_graphics: Graphics;

  constructor(fg_graphics: Graphics, bg_graphics: Graphics) {
    this.fg_graphics = fg_graphics;
    this.bg_graphics = bg_graphics;
  }

  draw_bg() {
    this.draw_figure(this.bg_graphics);

    let points: Array<Point> = [center_circle.center];

    for (let transf of this.transformations) {
      let tmp = transf.getPoint();
      if (tmp) {
        points = points.filter((el) => {
          return !pointsAreEqual(el, tmp!);
        });
        points.push(tmp);
      }
    }

    for (let point of points) {
      this.bg_graphics.drawPoint(
        point,
        `(${point.x}, ${point.y})`,
        this.bg_graphics.context,
        "red"
      );
    }
  }

  draw_figure(graph: Graphics) {
    graph.drawPolygon(square_left);
    graph.drawPolygon(square_right);
    graph.drawCircleManually(center_circle, 0, Math.PI * 2);
    graph.drawEllipseManually(
      fig_ellipse.center.x,
      fig_ellipse.center.y,
      fig_ellipse.width,
      fig_ellipse.height,
      fig_ellipse.startAngle,
      fig_ellipse.endAngle
    );
    graph.drawPoint(center_circle.center, `<COORDS>`, graph.context, "#00FF00");
  }

  draw_fg() {
    this.fg_graphics.transformations = this.transformations;
    this.draw_figure(this.fg_graphics);
  }

  addTransformation(transf: Transformation) {
    this.transformations.push(transf);
    transformations_node.appendChild(transf.node);

    transf.remove_btn.addEventListener("click", () => {
      transformations_node.removeChild(transf.node);

      this.transformations = this.transformations.filter((el) => {
        return el !== transf;
      });

      this.update();
    });
    transf.activated_check.addEventListener("click", () => {
      this.update();
    });
  }

  drawFocus(pt: Point) {
    this.bg_graphics.endFrame();
    this.draw_bg();
    this.bg_graphics.drawPoint(pt, "ЦТ", this.bg_graphics.context, "#FF0088", {
      x: 0,
      y: 20,
    });
  }

  update() {
    this.fg_graphics.endFrame();
    this.draw_fg();
    pushFocus();
  }

  clearAll() {
    transformations_node.innerHTML = "";
    this.transformations = [];
    this.update();
  }
}

//#endregion

//#region graphics

const bg_canvas: HTMLCanvasElement = document.querySelector("#staticPlane")!;
const fg_canvas: HTMLCanvasElement = document.querySelector("#dynamicPlane")!;

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

const fg_ctx: CanvasRenderingContext2D = fg_canvas.getContext("2d")!;
const bg_ctx: CanvasRenderingContext2D = bg_canvas.getContext("2d")!;

class Transformation {
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

    if (dark) {
      this.node.classList.add("dark");
      this.textfiled.classList.add("dark");
      this.activated_check.classList.add("dark");
      this.remove_btn.classList.add("dark");
    }
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

class RotateTransformation extends Transformation {
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

class ScaleTransformation extends Transformation {
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

class TranslateTransformation extends Transformation {
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

interface NumPair {
  x: number;
  y: number;
}

//#region figure
const tri_s_len: number = 200;
const tri_h: number = Math.sqrt((tri_s_len * tri_s_len * 3) / 4);

const center_triangle = new Triangle(
  new Point(-tri_s_len / 2, -tri_h / 3),
  new Point(0, (tri_h * 2) / 3),
  new Point(tri_s_len / 2, -tri_h / 3)
);

const center_circle = new Circle(new Point(0, 0), tri_s_len / 2 / Math.sqrt(3));

const square_left = new Polygon([
  center_triangle.vertex2,
  center_triangle.vertex1,
  new Point(
    center_triangle.vertex1.x - tri_s_len * Math.cos(toRad(30)),
    center_triangle.vertex1.y + tri_s_len * Math.sin(toRad(30))
  ),
  new Point(
    -tri_s_len * Math.cos(toRad(30)),
    center_triangle.vertex2.y + tri_s_len * Math.sin(toRad(30))
  ),
]);

const square_right = new Polygon([
  center_triangle.vertex2,
  center_triangle.vertex3,
  new Point(
    center_triangle.vertex3.x + tri_s_len * Math.cos(toRad(30)),
    center_triangle.vertex3.y + tri_s_len * Math.sin(toRad(30))
  ),
  new Point(
    +tri_s_len * Math.cos(toRad(30)),
    center_triangle.vertex2.y + tri_s_len * Math.sin(toRad(30))
  ),
]);

const fig_ellipse = new Ellipse(
  new Point(0, center_triangle.vertex1.y),
  tri_s_len / 2,
  center_circle.r,
  0,
  Math.PI,
  Math.PI * 2,
  true
);

//#endregion

class Graphics {
  context: CanvasRenderingContext2D;
  context_node: HTMLCanvasElement;
  canvas_width: number;
  canvas_height: number;
  width: number;
  height: number;

  transformations: Array<Transformation> = [];

  minx: number;
  miny: number;
  maxx: number;
  maxy: number;

  base: NumPair;

  aspect_ratio: number;
  scale: number;

  constructor(
    context: CanvasRenderingContext2D,
    context_node: HTMLCanvasElement,
    color?: string
  ) {
    this.canvas_width = fg_canvas.width;
    this.canvas_height = fg_canvas.height;
    this.context = context;
    this.context_node = context_node;

    this.width = this.canvas_width;
    this.height = this.canvas_height;

    this.minx = 0;
    this.miny = 0;
    this.maxx = this.width;
    this.maxy = this.height;

    this.base = { x: 0, y: -this.maxy };
    this.aspect_ratio = this.canvas_width / this.canvas_height;

    this.scale = 1;

    this.context.textAlign = "center";
    this.context.font = `${RENDER_SCALE * 16}px serif`;

    this.context.lineWidth = 3 * RENDER_SCALE;

    if (color) {
      this.context.fillStyle = color;
      this.context.strokeStyle = color;
    } else this.context.fillStyle = "#222222";
  }

  getCanvasCoords(pt: Point) {
    return new Point(
      this.base.x + (pt.x - this.minx) * this.scale,
      -(this.base.y + (pt.y - this.miny) * this.scale)
    );
  }

  drawPoint(
    pt: Point,
    text: string,
    context: CanvasRenderingContext2D = this.context,
    color?: string,
    textOffset?: NumPair
  ) {
    if (
      this.minx > pt.x ||
      this.maxx < pt.x ||
      this.miny > pt.y ||
      this.maxy < pt.y
    )
      return null;

    let tmp = new Point(pt.x, pt.y);

    for (let tr of this.transformations) tmp = tr.transformPoint(tmp);

    let cpt = this.getCanvasCoords(tmp);
    if (!cpt) return;

    context.beginPath();
    this.context.save();
    if (color) context.strokeStyle = color;
    if (color) context.fillStyle = color;

    text = text.replace(/<COORDS>/, tmp.toString());

    context.arc(cpt.x, cpt.y, 3, 0, Math.PI * 2);
    context.fill();
    context.closePath();

    let xoffset = 0;
    let yoffset = -10;

    if (textOffset) {
      xoffset = textOffset.x;
      yoffset = textOffset.y;
    }

    context.beginPath();
    context.fillText(
      text,
      cpt.x + xoffset * RENDER_SCALE,
      cpt.y + yoffset * RENDER_SCALE
    );
    context.closePath();

    this.context.restore();
  }

  drawCircleManually(circ: Circle, minAngle: number, maxAngle: number) {
    let r = circ.r;
    let cx = circ.center.x;
    let cy = circ.center.y;
    let start;

    this.context.beginPath();

    for (let angle = minAngle; angle < maxAngle; angle += 1 / r) {
      let pt = new Point(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
      for (let tr of this.transformations) pt = tr.transformPoint(pt);

      pt = this.getCanvasCoords(pt);

      if (start === undefined) {
        start = pt;
        this.context.moveTo(start.x, start.y);
      } else this.context.lineTo(pt.x, pt.y);
    }

    this.context.lineTo(start!.x, start!.y);

    this.context.stroke();
    this.context.closePath();
  }

  drawTriangle(
    tri: Triangle,
    context: CanvasRenderingContext2D = this.context,
    color?: string
  ) {
    let p1: Point = new Point(tri.vertex1.x, tri.vertex1.y);
    let p2: Point = new Point(tri.vertex2.x, tri.vertex2.y);
    let p3: Point = new Point(tri.vertex3.x, tri.vertex3.y);

    for (let tr of this.transformations) {
      p1 = tr.transformPoint(p1);
      p2 = tr.transformPoint(p2);
      p3 = tr.transformPoint(p3);
    }

    p1 = this.getCanvasCoords(p1);
    p2 = this.getCanvasCoords(p2);
    p3 = this.getCanvasCoords(p3);

    context.beginPath();
    let prevColor = context.strokeStyle;
    if (color) context.strokeStyle = color;

    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.lineTo(p3.x, p3.y);
    context.lineTo(p1.x, p1.y);

    context.stroke();

    context.strokeStyle = prevColor;
    context.closePath();
  }

  drawPolygon(
    poly: Polygon,
    context: CanvasRenderingContext2D = this.context,
    color?: string
  ) {
    context.beginPath();
    let prevColor = context.strokeStyle;
    if (color) context.strokeStyle = color;

    let start;

    for (let i = 0; i < poly.vertexes.length; ++i) {
      let pt = new Point(poly.vertexes[i].x, poly.vertexes[i].y);
      for (let tr of this.transformations) pt = tr.transformPoint(pt);
      pt = this.getCanvasCoords(pt);

      if (i == 0) {
        start = pt;
        this.context.moveTo(pt.x, pt.y);
      } else this.context.lineTo(pt.x, pt.y);
    }

    context.lineTo(start!.x, start!.y);

    context.stroke();

    context.strokeStyle = prevColor;
    context.closePath();
  }

  drawSegment(
    p1: Point,
    p2: Point,
    context: CanvasRenderingContext2D = this.context,
    color?: string
  ) {
    let pt1 = new Point(p1.x, p1.y);
    let pt2 = new Point(p2.x, p2.y);

    for (let tr of this.transformations) {
      pt1 = tr.transformPoint(pt1);
      pt2 = tr.transformPoint(pt2);
    }

    pt1 = this.getCanvasCoords(pt1);
    pt2 = this.getCanvasCoords(pt2);

    context.beginPath();
    let prevColor = context.strokeStyle;
    if (color) context.strokeStyle = color;

    context.moveTo(pt1.x, pt1.y);
    context.lineTo(pt2.x, pt2.y);

    context.stroke();

    context.strokeStyle = prevColor;
    context.closePath();
  }

  drawEllipseManually(
    xc: number,
    yc: number,
    rx: number,
    ry: number,
    minAngle: number,
    maxAngle: number
  ) {
    this.context.beginPath();
    let maxr = Math.max(rx, ry);
    let start;

    for (let angle = minAngle; angle < maxAngle; angle += 1 / maxr) {
      let pt = new Point(xc + rx * Math.cos(angle), yc + ry * Math.sin(angle));
      for (let tr of this.transformations) pt = tr.transformPoint(pt);
      pt = this.getCanvasCoords(pt);

      if (start === undefined) {
        start = pt;
        this.context.moveTo(start.x, start.y);
      } else this.context.lineTo(pt.x, pt.y);
    }

    this.context.lineTo(start!.x, start!.y);

    this.context.stroke();
    this.context.closePath();
  }

  drawCanvas(canvas: HTMLCanvasElement, dx: number = 0, dy: number = 0) {
    this.context.drawImage(canvas, dx, dy);
  }

  endFrame() {
    this.context.clearRect(0, 0, this.canvas_width, this.canvas_height);
  }

  setBoundaries(bounds: Boundaries) {
    let xmin: number = bounds.x_min;
    let xmax: number = bounds.x_max;
    let ymin: number = bounds.y_min;
    let ymax: number = bounds.y_max;

    let new_w = xmax - xmin;
    let new_h = ymax - ymin;

    let tmp_ar = new_w / new_h;

    if (tmp_ar < this.aspect_ratio) {
      let x_scale = (new_h / new_w) * this.aspect_ratio;
      let diff = new_w * x_scale - new_w;
      xmax += diff / 2;
      xmin -= diff / 2;
      new_w = new_w * x_scale;
    } else {
      let y_scale = new_w / new_h / this.aspect_ratio;
      let diff = new_h * y_scale - new_h;
      ymax += diff / 2;
      ymin -= diff / 2;
      new_h = new_h * y_scale;
    }

    let newscale = this.canvas_width / new_w;

    this.minx = xmin;
    this.maxx = xmax;
    this.miny = ymin;
    this.maxy = ymax;
    this.scale = newscale;
    this.width = new_w;
    this.height = new_h;

    out.log(
      "Меняю масштаб и пределы. Текущий масштаб: " +
        `${toPrecision(this.scale, 2)} пикс. к 1 ед координат`
    );
    out.log(
      `x: [${toPrecision(xmin, 2)}; ${toPrecision(xmax, 2)}]   ` +
        `y: [${toPrecision(ymin, 2)}; ${toPrecision(ymax, 2)}]`
    );
  }
}

window.addEventListener("resize", () => {
  out.warn(
    `UNIMPLEMENTED Изменение размера холста w: ${Math.round(
      fg_canvas.getBoundingClientRect().width
    )} h: ${Math.round(fg_canvas.getBoundingClientRect().height)}`
  );
});

const graphics: Graphics = new Graphics(fg_ctx, fg_canvas, "black");
const bg_graphics: Graphics = new Graphics(bg_ctx, bg_canvas, "#aaaaaa");

const graphics_arr: Array<Graphics> = [graphics, bg_graphics];

//#endregion graphics

graphics_arr.forEach((graphics) => {
  graphics.endFrame();
  graphics.setBoundaries(<Boundaries>{
    x_min: -800,
    x_max: 800,
    y_min: -400,
    y_max: 400,
  });
});

const logic = new Logic(graphics, bg_graphics);
logic.update();
pushFocus();
