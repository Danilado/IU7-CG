"use strict";

const EPS = 1e-6;

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

  constructor(p1: Point, p2: Point) {
    this.p1 = p1;
    this.p2 = p2;
  }

  pointOnLine(p: Point) {
    return pointsInLine(this.p1, this.p2, p);
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

function minAngleBetween(p1: Point, p2: Point) {
  let angle = angleBetween(p1, p2);
  if (angle < 0)
    return Math.abs(angle) < Math.abs(angle + Math.PI)
      ? angle
      : angle + Math.PI;
  return Math.abs(angle) < Math.abs(angle - Math.PI) ? angle : angle - Math.PI;
}

function PointsAngleWithX(p1: Point, p2: Point) {
  let angle = angleBetween(p1, p2);
  if (Math.abs(angle) < EPS) return 0;
  if (angle < 0) angle += Math.PI;
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

//#region points

const input_x: HTMLInputElement = document.querySelector("#inewx")!;
const input_y: HTMLInputElement = document.querySelector("#inewy")!;
const add_point: HTMLInputElement = document.querySelector("#padd")!;
const output_node: HTMLDivElement = document.querySelector(".footer")!;

class Output {
  node: HTMLDivElement;
  constructor(node: HTMLDivElement) {
    this.node = node;
  }

  write(text: string, prefix: string) {
    this.node.innerHTML += prefix + text + "<br><br>";
    this.scrollToBottom();
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

  scrollToBottom() {
    this.node.scroll(0, this.node.scrollHeight);
  }
}

const out: Output = new Output(output_node);

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
      if (Number.isNaN(tmp) || !this.coords[0].value)
        return out.error(
          `Ошибка изменения координаты X точки ${this.index + 1}`
        );

      this.pt.x = tmp;
      out.log(`Координата X точки ${this.index + 1} изменена на ${tmp}`);
    });

    this.coords[1].addEventListener("input", () => {
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
}

const pts_element: PointTable = new PointTable(".points");

add_point.addEventListener("click", () => {
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

//#endregion points

//#endregion interface

//#region logic

class Logic {
  constructor() {}

  findTrianglesIntersectingCircle(points: Array<PointNode>, circ: Circle) {
    if (points.length < 3) {
      return out.error(
        `Недостаточно точек для построения даже одного треугольника`
      );
    }

    const triangles: Array<Array<PointNode>> = [];

    for (let i = 0; i < points.length - 2; i++)
      for (let j = i + 1; j < points.length - 1; j++)
        for (let k = j + 1; k < points.length; k++) {
          if (i == j || i == k || j == k) continue;
          if (isTrianle(points[i].pt, points[j].pt, points[k].pt))
            triangles.push([points[i], points[j], points[k]]);
        }

    if (!triangles.length) {
      return out.error(
        `На этих точках не удалось построить ни одного треугольника`
      );
    }

    const good_triangles = triangles.filter((tri) => {
      return this.triangleSideIntersectsPoint(tri, circ.center);
    });

    if (!good_triangles.length) {
      return out.error(
        `Нe нашлось ни одного треугольника, прямая проходящая через вершину которого пересекала бы центр окружности`
      );
    }

    let min_angle: number = this.triangleAngleWithXThroughPoint(
      good_triangles[0],
      circ.center
    );
    let min_index: number = 0;

    good_triangles.forEach((tri, i) => {
      let angle: number = this.triangleAngleWithXThroughPoint(tri, circ.center);
      if (angle < min_angle) {
        min_angle = angle;
        min_index = i;
      }

      out.write(
        `Найден подходящий треугольник на точках ${
          tri[0].index + 1
        } ${tri[0].pt.toString()}; ${
          tri[1].index + 1
        } ${tri[1].pt.toString()}; ${
          tri[2].index + 1
        } ${tri[2].pt.toString()}, угол с осью Абсцисс: ${toPrecision(
          toDeg(angle),
          6
        )}град.`,
        ""
      );
    });

    let best = good_triangles[min_index];

    out.write(
      `Треугольник с наименьшим углом к оси абсцисс: ${
        best[0].index + 1
      } ${best[0].pt.toString()}; ${
        best[1].index + 1
      } ${best[1].pt.toString()}; ${
        best[2].index + 1
      } ${best[2].pt.toString()}, угол с осью Абсцисс: ${toPrecision(
        toDeg(min_angle),
        6
      )}град.`,
      ""
    );
  }

  triangleSideIntersectsPoint(tri: Array<PointNode>, pt: Point) {
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
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = context;

    this.minx = 0;
    this.miny = 0;
    this.maxx = this.width;
    this.maxy = this.height;

    this.base = { x: 0, y: -this.maxy };
    this.aspect_ratio = this.width / this.height;

    this.scale = 1;

    this.context.textAlign = "center";
    // this.context.textBaseline = "middle";
    this.context.font = "16px serif";

    this.context.beginPath();
    this.context.lineWidth = 1;
    this.context.fillStyle = "black";
    this.context.strokeStyle = "black";
  }

  getCanvasCoords(pt: Point) {
    return new Point(
      this.base.x + (this.minx + pt.x) * this.scale,
      -(this.base.y + (this.miny + pt.y) * this.scale)
    );
  }

  drawPoint(pt: Point, text: string) {
    let cpt = this.getCanvasCoords(pt);
    // this.context.moveTo(cpt.x, cpt.y);
    this.context.beginPath();
    this.context.arc(cpt.x, cpt.y, 3, 0, Math.PI * 2);
    this.context.fill();
    this.context.closePath();
    // this.context.moveTo(cpt.x - 4, cpt.y - 8);
    this.context.beginPath();
    this.context.fillText(text, cpt.x, cpt.y - 10);
    this.context.closePath();
  }

  drawCircle(circ: Circle) {
    let cpt = this.getCanvasCoords(circ.center);
    this.context.beginPath();
    this.context.arc(cpt.x, cpt.y, circ.r * this.scale, 0, Math.PI * 2);
    this.context.stroke();
    this.context.closePath();
    this.drawPoint(circ.center, `C: ${circ.center.toString()}`);
  }

  endFrame() {
    this.context.beginPath();
    this.context.fillStyle = "white";
    this.context.fillRect(0, 0, this.width, this.height);
    this.context.fillStyle = "black";
    this.context.closePath();
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
  logic.findTrianglesIntersectingCircle(pts_element.pointarr, circ);

  graphics.endFrame();

  graphics.drawCircle(circ);

  pts_element.pointarr.forEach((pn) => {
    graphics.drawPoint(pn.pt, pn.toString());
  });
});
