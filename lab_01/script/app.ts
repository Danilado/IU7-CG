"use strict";

const EPS = 1e-10;
const DEBUG = false;
let dark = false;
let STROKE_COLOR = "#222222";
let STROKE_COLOR_DARK = "#aaaaaa";

//#region geometry

class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `(${this.x}, ${this.y})`;
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

class Circle {
  center: Point;
  r: number;

  constructor(center: Point, radius: number) {
    this.center = center;
    this.r = radius;
  }
}

class Line {
  p1: Point;
  p2: Point;
  k: number;
  c: number;

  constructor(p1: Point, p2: Point) {
    this.p1 = p1;
    this.p2 = p2;
    this.k = (p2.y - p1.y) / (p2.x - p1.x);
    this.c = p1.y - this.k * p1.x;
  }

  pointOnLine(p: Point) {
    return pointsInLine(this.p1, this.p2, p);
  }

  getYbyX(x: number) {
    if (!Number.isFinite(this.k)) return null;
    return x * this.k + this.c;
  }

  getXbyY(y: number) {
    if (!this.k) return null;
    return (y - this.c) / this.k;
  }

  isHorizontal() {
    return !this.k;
  }

  isVertical() {
    return !Number.isFinite(this.k);
  }
}

function pointsInLine(a: Point, b: Point, c: Point) {
  // (Cy - Ay) * (Bx - Ax) = (By - Ay) * (Cx - Ax)
  return Math.abs((c.y - a.y) * (b.x - a.x) - (b.y - a.y) * (c.x - a.x)) < EPS;
}

function isTrianle(p1: Point, p2: Point, p3: Point) {
  return !pointsInLine(p1, p2, p3);
}

function angleBetween(p1: Point, p2: Point) {
  // то же самое, что arctan(dy/dx) между 2-мя точками
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function minAbsAngleBetween(p1: Point, p2: Point) {
  let angle = angleBetween(p1, p2);
  if (angle < 0)
    return Math.abs(angle) < Math.abs(angle + Math.PI)
      ? angle
      : angle + Math.PI;
  return Math.abs(angle) < Math.abs(angle - Math.PI) ? angle : angle - Math.PI;
}

function PointsAngleWithX(p1: Point, p2: Point) {
  let angle = angleBetween(p1, p2);

  angle = Math.abs(angle);

  if (angle >= Math.PI / 2 - EPS) angle = Math.PI - angle;

  if (angle < EPS) return 0;

  return angle;
}

function LineAngleWithX(l: Line) {
  return PointsAngleWithX(l.p1, l.p2);
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

const input_center_x: HTMLInputElement = document.querySelector("#ixcenter")!;
const input_center_y: HTMLInputElement = document.querySelector("#iycenter")!;
const input_radius: HTMLInputElement = document.querySelector("#iradius")!;

const run_button: HTMLInputElement = document.querySelector("#submit")!;

const input_x: HTMLInputElement = document.querySelector("#inewx")!;
const input_y: HTMLInputElement = document.querySelector("#inewy")!;
const add_point: HTMLInputElement = document.querySelector("#padd")!;
const clear_points: HTMLInputElement = document.querySelector("#clearall")!;
const clear_output: HTMLInputElement = document.querySelector("#clearout")!;
const output_node: HTMLDivElement = document.querySelector(".footertext")!;

const change_theme: HTMLInputElement = document.querySelector("#themechange")!;

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
  graphics.endFrame();
});

//#endregion

//#region points
class PointNode {
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

class PointTable {
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

const pts_element: PointTable = new PointTable(".points");

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

//#endregion points

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

  graphics.context.strokeStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
  graphics.context.fillStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
});

//#endregion interface

//#region logic

interface TriangleSearchOut {
  triangles: Array<Array<PointNode>>;
  angles: Array<number>;
  bestIndex: number;
}

interface TriangleSearchOutRc {
  rc: number;
  data: TriangleSearchOut | undefined;
}

interface Boundaries {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}

class Logic {
  constructor() {}

  findTrianglesIntersectingCircleCenter(
    points: Array<PointNode>,
    circ: Circle
  ) {
    if (points.length < 3)
      return <TriangleSearchOutRc>{
        rc: 1,
      };

    const triangles: Array<Array<PointNode>> = [];

    for (let i = 0; i < points.length - 2; i++)
      for (let j = i + 1; j < points.length - 1; j++)
        for (let k = j + 1; k < points.length; k++) {
          if (isTrianle(points[i].pt, points[j].pt, points[k].pt))
            triangles.push([points[i], points[j], points[k]]);
        }

    if (!triangles.length)
      return <TriangleSearchOutRc>{
        rc: 2,
      };

    const good_triangles = triangles.filter((tri) => {
      return this.triangleSideLineIntersectsPoint(tri, circ.center);
    });

    if (!good_triangles.length)
      return <TriangleSearchOutRc>{
        rc: 3,
      };

    const angles: Array<number> = [];

    let min_angle: number = this.triangleAngleWithXThroughPoint(
      good_triangles[0],
      circ.center
    );
    let min_index: number = 0;

    good_triangles.forEach((tri, i) => {
      let angle: number = this.triangleAngleWithXThroughPoint(tri, circ.center);
      angles.push(angle);

      if (angle < min_angle) {
        min_angle = angle;
        min_index = i;
      }
    });

    return <TriangleSearchOutRc>{
      rc: 0,
      data: <TriangleSearchOut>{
        triangles: good_triangles,
        angles: angles,
        bestIndex: min_index,
      },
    };
  }

  triangleSideLineIntersectsPoint(tri: Array<PointNode>, pt: Point) {
    return (
      pointsInLine(tri[0].pt, tri[1].pt, pt) ||
      pointsInLine(tri[0].pt, tri[2].pt, pt) ||
      pointsInLine(tri[1].pt, tri[2].pt, pt)
    );
  }

  triangleAngleWithXThroughPoint(tri: Array<PointNode>, pt: Point) {
    for (let i = 0; i < 3; ++i)
      if (pointsAreEqual(tri[i].pt, pt))
        return this.triInterFindMinimal(tri, tri[i]);

    if (pointsInLine(tri[0].pt, tri[1].pt, pt))
      return PointsAngleWithX(tri[0].pt, tri[1].pt);

    if (pointsInLine(tri[0].pt, tri[2].pt, pt))
      return PointsAngleWithX(tri[0].pt, tri[2].pt);

    return PointsAngleWithX(tri[1].pt, tri[2].pt);
  }

  triInterFindMinimal(tri: Array<PointNode>, intersecting: PointNode) {
    let tmppoints = tri.filter((pnode) => {
      return pnode !== intersecting;
    });
    return Math.min(
      PointsAngleWithX(intersecting.pt, tmppoints[0].pt),
      PointsAngleWithX(intersecting.pt, tmppoints[1].pt)
    );
  }

  getBoundaries(triangle: Array<PointNode>, circ: Circle) {
    let new_bound: Boundaries = {
      x_min: 0,
      x_max: 0,
      y_min: 0,
      y_max: 0,
    };

    new_bound.x_min = circ.center.x - circ.r;
    new_bound.x_max = circ.center.x + circ.r;
    new_bound.y_min = circ.center.y - circ.r;
    new_bound.y_max = circ.center.y + circ.r;

    triangle.forEach((pn) => {
      new_bound.x_min = Math.min(new_bound.x_min, pn.pt.x);
      new_bound.x_max = Math.max(new_bound.x_max, pn.pt.x);
      new_bound.y_min = Math.min(new_bound.y_min, pn.pt.y);
      new_bound.y_max = Math.max(new_bound.y_max, pn.pt.y);
    });

    let tmp_width = new_bound.x_max - new_bound.x_min;
    let tmp_height = new_bound.y_max - new_bound.y_min;

    new_bound.x_max += 0.1 * tmp_width;
    new_bound.x_min -= 0.1 * tmp_width;
    new_bound.y_max += 0.1 * tmp_height;
    new_bound.y_min -= 0.1 * tmp_height;

    return new_bound;
  }

  getIntersectingLine(tri: Array<PointNode>, pt: Point) {
    for (let i = 0; i < 3; ++i)
      if (pointsAreEqual(tri[i].pt, pt)) {
        // если вершина в центре окружности
        let tmppoints = tri.filter((pnode) => {
          return pnode !== tri[i];
        });
        return PointsAngleWithX(tri[i].pt, tmppoints[0].pt) <
          PointsAngleWithX(tri[i].pt, tmppoints[1].pt)
          ? new Line(tri[i].pt, tmppoints[0].pt)
          : new Line(tri[i].pt, tmppoints[1].pt);
      }

    if (pointsInLine(tri[0].pt, tri[1].pt, pt))
      return new Line(tri[0].pt, tri[1].pt);

    if (pointsInLine(tri[0].pt, tri[2].pt, pt))
      return new Line(tri[0].pt, tri[2].pt);

    return new Line(tri[1].pt, tri[2].pt);
  }
}

const logic = new Logic();

//#endregion

//#region graphics

const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
canvas.width = Math.round(canvas.getBoundingClientRect().width);
canvas.height = Math.round(canvas.getBoundingClientRect().height);

const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

interface NumPair {
  x: number;
  y: number;
}

class Graphics {
  context: CanvasRenderingContext2D;
  canvas_width: number;
  canvas_height: number;
  width: number;
  height: number;

  minx: number;
  miny: number;
  maxx: number;
  maxy: number;

  base: NumPair;

  aspect_ratio: number;
  scale: number;

  constructor(context: CanvasRenderingContext2D) {
    this.canvas_width = canvas.width;
    this.canvas_height = canvas.height;
    this.context = context;

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
    // this.context.textBaseline = "middle";
    this.context.font = "16px serif";

    this.context.beginPath();
    this.context.lineWidth = 1;
    this.context.fillStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
    this.context.strokeStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
  }

  getCanvasCoords(pt: Point) {
    return new Point(
      this.base.x + (pt.x - this.minx) * this.scale,
      -(this.base.y + (pt.y - this.miny) * this.scale)
    );
  }

  drawPoint(pt: Point, text: string) {
    if (
      this.minx > pt.x ||
      this.maxx < pt.x ||
      this.miny > pt.y ||
      this.maxy < pt.y
    )
      return null;

    let cpt = this.getCanvasCoords(pt);
    if (!cpt) return;

    this.context.beginPath();
    this.context.arc(cpt.x, cpt.y, 3, 0, Math.PI * 2);
    this.context.fill();
    this.context.closePath();

    this.context.beginPath();
    this.context.fillText(text, cpt.x, cpt.y - 10);
    this.context.closePath();
  }

  drawCircle(circ: Circle) {
    let cpt = this.getCanvasCoords(circ.center);
    console.log(cpt);
    this.context.beginPath();
    this.context.arc(cpt.x, cpt.y, circ.r * this.scale, 0, Math.PI * 2);
    this.context.stroke();
    this.context.closePath();
    this.drawPoint(circ.center, `C: ${circ.center.toString()}`);
  }

  drawTriangle(tri: Triangle, color: string | void) {
    let p1: Point = this.getCanvasCoords(tri.vertex1);
    let p2: Point = this.getCanvasCoords(tri.vertex2);
    let p3: Point = this.getCanvasCoords(tri.vertex3);

    this.context.beginPath();
    if (color) this.context.strokeStyle = color;

    this.context.moveTo(p1.x, p1.y);
    this.context.lineTo(p2.x, p2.y);
    this.context.lineTo(p3.x, p3.y);
    this.context.lineTo(p1.x, p1.y);

    this.context.stroke();

    this.context.strokeStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
    this.context.closePath();
  }

  drawSegment(p1: Point, p2: Point, color: string | void) {
    let ctx_p1: Point = this.getCanvasCoords(p1);
    let ctx_p2: Point = this.getCanvasCoords(p2);

    this.context.beginPath();
    if (color) this.context.strokeStyle = color;

    this.context.moveTo(ctx_p1.x, ctx_p1.y);
    this.context.lineTo(ctx_p2.x, ctx_p2.y);

    this.context.stroke();

    this.context.strokeStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
    this.context.closePath();
  }

  drawLine(l: Line, color: string | void) {
    let p1: Point = new Point(this.minx, 0);
    let p2: Point = new Point(this.maxx, 0);

    if (l.isHorizontal()) {
      p1.y = l.p1.y;
      p2.y = l.p1.y;
    } else if (l.isVertical()) {
      p1.y = this.miny;
      p2.y = this.maxy;

      p1.x = l.p1.x;
      p2.x = l.p1.x;
    } else {
      p1.y = l.getYbyX(p1.x)!;
      p2.y = l.getYbyX(p2.x)!;
    }

    this.drawSegment(p1, p2, color);
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

  updateStrokeColor() {
    this.context.fillStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
    this.context.strokeStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
  }
}

window.addEventListener("resize", () => {
  out.warn(
    `UNIMPLEMENTED Изменение размера холста w: ${Math.round(
      canvas.getBoundingClientRect().width
    )} h: ${Math.round(canvas.getBoundingClientRect().height)}`
  );
});

const graphics = new Graphics(ctx);

// graphics.drawPoint(new Point(100, 550), "pepega");

//#endregion graphics

run_button.addEventListener("click", () => {
  graphics.endFrame();

  let x: number = Number(input_center_x.value);
  if (Number.isNaN(x) || !input_center_x.value)
    return out.error("Ошибка чтения значения координаты x центра окружности");

  let y: number = Number(input_center_y.value);
  if (Number.isNaN(y) || !input_center_y.value)
    return out.error("Ошибка чтения значения координаты y центра окружности");

  let r: number = Number(input_radius.value);
  if (Number.isNaN(r) || !input_radius.value)
    return out.error("Ошибка чтения значения радиуса окружности");

  let circ = new Circle(new Point(x, y), r);
  let ret: TriangleSearchOutRc = logic.findTrianglesIntersectingCircleCenter(
    pts_element.pointarr,
    circ
  );

  if (ret.rc) {
    if (ret.rc == 1)
      return out.error(
        `Недостаточно точек для построения даже одного треугольника`
      );

    if (ret.rc == 2)
      return out.error(
        `На этих точках не удалось построить ни одного треугольника`
      );

    if (ret.rc == 3)
      return out.error(
        "Нe нашлось ни одного треугольника, прямая проходящая через " +
          "сторону которого пересекала бы центр окружности"
      );
  }

  let triangles = ret.data!.triangles;
  let angles = ret.data!.angles;
  let bestIndex = ret.data!.bestIndex;
  let bestTriangle = triangles[bestIndex];

  out.write(`ОТВЕТ:\nНайденные треугольники:\n`, "");

  for (let i = 0; i < triangles!.length; ++i) {
    out.write(
      `${i + 1}: треугольник на точках ${triangles[i][0].index + 1} ` +
        `${triangles[i][0].pt.toString()}; ` +
        `${triangles[i][1].index + 1} ${triangles[i][1].pt.toString()}; ` +
        `${triangles[i][2].index + 1} ${triangles[i][2].pt.toString()}, ` +
        `угол с осью Абсцисс: ${toPrecision(toDeg(angles[i]), 6)}град.`,
      ""
    );
  }

  out.write(
    `Треугольник с наименьшим углом к оси абсцисс:\n` +
      `${bestIndex + 1}: ` +
      `${bestTriangle[0].index + 1} ${bestTriangle[0].pt.toString()}; ` +
      `${bestTriangle[1].index + 1} ${bestTriangle[1].pt.toString()}; ` +
      `${bestTriangle[2].index + 1} ${bestTriangle[2].pt.toString()}, ` +
      `угол с осью Абсцисс: ${toPrecision(toDeg(angles[bestIndex]), 6)}град.`,
    ""
  );

  let bounds: Boundaries = logic.getBoundaries(bestTriangle, circ);
  graphics.setBoundaries(bounds);

  graphics.drawCircle(circ);

  let tri = new Triangle(
    bestTriangle[0].pt,
    bestTriangle[1].pt,
    bestTriangle[2].pt
  );

  graphics.drawTriangle(tri, "blue");

  let l: Line = logic.getIntersectingLine(bestTriangle, circ.center);

  graphics.drawLine(l, "red");

  pts_element.pointarr.forEach((pn) => {
    graphics.drawPoint(pn.pt, pn.toString());
  });
});
