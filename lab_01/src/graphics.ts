import { Point, Circle, Triangle, Line, toPrecision } from "./geometry";
import { Boundaries } from "./logic";
import { out } from "./output";

let STROKE_COLOR = "#222222";
let STROKE_COLOR_DARK = "#aaaaaa";
const dark = false;

const canvas: HTMLCanvasElement = document.querySelector("canvas")!;
canvas.width = Math.round(canvas.getBoundingClientRect().width);
canvas.height = Math.round(canvas.getBoundingClientRect().height);

const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

export interface NumPair {
  x: number;
  y: number;
}

export class Graphics {
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

export const graphics = new Graphics(ctx);
