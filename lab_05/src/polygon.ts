import { abs, max, min, round } from "./constants";
import { Graphics } from "./graphics";

interface Boundaries {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export class Point {
  x: number;
  y: number;

  constructor();
  constructor(x: number, y: number);
  constructor(coords: string[]);
  constructor(val1?: number | string[], val2?: number) {
    if (val1 === undefined) {
      this.x = 0;
      this.y = 0;
    } else if (typeof val1 === "number") {
      this.x = val1;
      this.y = val2 ? val2 : 0;
    } else {
      this.x = parseFloat(val1[0]);
      this.y = parseFloat(val1[1]);
    }
  }

  public toString(): string {
    return `${this.x} ${this.y}`;
  }
}

export class Polygon {
  context: Graphics;
  points: Point[];

  constructor(graphics: Graphics, pts: Point[] = []) {
    this.context = graphics;
    this.points = pts;
  }

  addNode(pt: Point) {
    this.points.push(pt);
  }

  drawEdges() {
    if (this.points.length < 3)
      throw new Error(
        "Недостаточно точек для отрисовки многоугольника. Введите хотя бы три."
      );

    let ctx = this.context.renderer;
    ctx.beginPath();

    let startpt: Point | undefined = undefined;

    for (let pt of this.points) {
      if (startpt === undefined) {
        ctx.moveTo(pt.x, pt.y);
        startpt = pt;
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    }

    ctx.lineTo(startpt!.x, startpt!.y);

    ctx.stroke();
    ctx.closePath();
  }

  drawHelpful(cursorPos: Point) {
    if (this.points.length === 0) return;

    let ctx = this.context.renderer;
    ctx.beginPath();

    let startpt: Point | undefined = undefined;
    for (let pt of this.points) {
      if (startpt === undefined) {
        ctx.moveTo(pt.x, pt.y);
        startpt = pt;
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    }

    ctx.lineTo(cursorPos.x, cursorPos.y);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.save();

    ctx.strokeStyle = "blue";
    ctx.setLineDash([20, 5]);

    ctx.moveTo(cursorPos.x, cursorPos.y);
    ctx.lineTo(startpt!.x, startpt!.y);
    ctx.stroke();

    ctx.restore();
    ctx.closePath();
  }

  fill(delay: number) {
    let buf = this.context.getBuf();

    let bounds = this.getBoundaries();

    let intersections = this.getSearchLineCrossList(bounds);
  }

  getBoundaries(): Boundaries {
    if (this.points.length === 0)
      return <Boundaries>{ x1: 0, y1: 0, x2: 0, y2: 0 };

    let res: Boundaries = {
      x1: Infinity,
      y1: Infinity,
      x2: 0,
      y2: 0,
    };

    for (let pt of this.points) {
      res.x1 = min(res.x1, pt.x);
      res.x2 = max(res.x2, pt.x);
      res.y1 = min(res.y1, pt.y);
      res.y2 = max(res.y2, pt.y);
    }

    return res;
  }

  private getBorder(pt1: Point, pt2: Point): Point[] {
    let res: Point[] = [];

    if (pt1.x == pt2.x && pt1.y == pt2.y) return [new Point(pt1.x, pt1.y)];

    let l = max(abs(pt2.x - pt1.x), abs(pt2.y - pt1.y));

    let dx = (pt2.x - pt1.x) / l;
    let dy = (pt2.y - pt1.y) / l;

    let x = pt1.x;
    let y = pt1.y;

    for (let i = 0; i <= l; ++i) {
      res.push(new Point(round(x), round(y)));
      x += dx;
      y += dy;
    }

    return res;
  }

  private getBorderPixels(): Point[] {
    let res: Point[] = [];

    for (let i = 0; i < this.points.length - 1; ++i)
      res = res.concat(this.getBorder(this.points[i], this.points[i + 1]));

    res = res.concat(
      this.getBorder(this.points[0], this.points[this.points.length - 1])
    );

    return res;
  }

  getSearchLineCrossList(bounds: Boundaries): Point[][] {
    if (this.points.length < 3)
      throw Error("Недостаточно точек для закраски многоугольника");

    let res: Point[][] = [];

    for (let i = bounds.y1; i <= bounds.y2; ++i) res.push([]);
    let intersections = this.getBorderPixels();

    for (let pt of intersections) res[pt.y - bounds.y1].push(pt);

    return res;
  }

  clear() {
    this.points = [];
  }

  public toString(): string {
    return this.points
      .map((pt) => {
        return pt.toString();
      })
      .join("\n");
  }
}
