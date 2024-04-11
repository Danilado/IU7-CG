import { Graphics } from "./graphics";

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

  fill() {}

  fillWithDelay(delay: number) {}

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
