import { RENDER_SCALE } from "./constants";
import { Point, Circle, Triangle, Polygon, toPrecision } from "./geometry";
import { Boundaries } from "./logic";
import { out } from "./output";
import { Transformation, NumPair, fg_canvas } from "./transformations";

export class Graphics {
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
