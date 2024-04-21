import { abs, max, min, round } from "./constants";
import { Graphics } from "./graphics";
import { RGBColor, xorPixel, Pixel } from "./pixels";

const EPS = 1e-6;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

  public collinear(pt2: Point, pt3: Point): boolean {
    return (
      abs(
        (this.y - pt2.y) * (this.x - pt3.x) -
          (this.y - pt3.y) * (this.x - pt2.x)
      ) < EPS
    );
  }

  public equalTo(pt: Point): boolean {
    return abs(pt.x - this.x) < EPS && abs(pt.y - this.y) < EPS;
  }
}

export class Polygon {
  context: Graphics;
  points: Point[];
  color: RGBColor = {
    r: 0,
    g: 0,
    b: 0,
  };

  constructor(graphics: Graphics, pts: Point[] = []) {
    this.context = graphics;
    this.points = pts;
  }

  addNode(pt: Point) {
    if (!this.points.length || !pt.equalTo(this.points[this.points.length - 1]))
      this.points.push(pt);
  }

  drawEdges() {
    if (this.points.length < 3)
      throw new Error(
        "Недостаточно точек для отрисовки многоугольника. Введите хотя бы три."
      );

    let ctx = this.context.out_renderer;
    ctx.beginPath();

    let startpt: Point | undefined = undefined;

    for (let pt of this.points) {
      if (startpt === undefined) {
        ctx.moveTo(pt.x, pt.y + 0.5);
        startpt = pt;
      } else {
        ctx.lineTo(pt.x, pt.y + 0.5);
      }
    }

    ctx.lineTo(startpt!.x, startpt!.y + 0.5);

    ctx.stroke();
    ctx.closePath();
  }

  drawHelpful(cursorPos: Point) {
    if (this.points.length === 0) return;

    let ctx = this.context.out_renderer;
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

  checkOneLine() {
    if (this.points.length < 3) throw new Error("Недостаточно точек");
    let pt1 = this.points[0];
    let pt2 = this.points[1];
    if (
      this.points.every((val) => {
        return val.collinear(pt1, pt2);
      })
    )
      throw new Error("Все точки лежат на одной прямой");
  }

  async fill(delay: number): Promise<number> {
    let res = new Promise<number>((resolve, reject) => {
      if (this.points.length < 3) reject(new Error("Недостаточно точек"));

      this.checkOneLine();

      let pixelBorders = this.getBorders();
      this.xorFillSep(pixelBorders, delay).then(
        (val) => resolve(val),
        (err) => reject(err)
      );
    });

    return res;
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

    if (pt1.y == pt2.y) {
      if (pt1.x == pt2.x) return [new Point(pt1.x, pt1.y)];
      return [];
    }

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

  private getBorders(): Point[][] {
    if (this.points.length < 3)
      throw Error("Недостаточно точек для закраски многоугольника");

    let res: Point[][] = [];

    for (let i = 0; i <= this.points.length; ++i) res.push([]);

    for (let i = 0; i < this.points.length - 1; ++i)
      res[i] = this.getBorder(this.points[i], this.points[i + 1]);

    res[res.length - 1] = this.getBorder(
      this.points[this.points.length - 1],
      this.points[0]
    );

    return res;
  }

  private getSeparator(borders: Point[][]): number {
    if (!borders.length) return 0;

    let xsum = borders.reduce((acc: number, cur_border: Point[]) => {
      return (
        acc +
        cur_border.reduce((acc: number, cur_pt: Point) => {
          return acc + cur_pt.x;
        }, 0)
      );
    }, 0);

    return (
      xsum /
      borders.reduce((acc: number, cur_border: Point[]) => {
        return acc + cur_border.length;
      }, 0)
    );
  }

  private thinBorderSep(
    border: Point[],
    prev_up?: boolean | undefined
  ): Point[] {
    if (!border.length) return [];

    let res: Point[] = [];

    if (prev_up !== undefined) {
      if (prev_up == border[0].y < border[border.length - 1].y) {
        let ybuf = border[0].y;
        while (border.length && border[0].y == ybuf) border.shift();
      }
    }

    if (!border.length) return [];

    let closest_to_sep: Point = border[0];
    let y_prev = border[0].y;

    for (let pt of border) {
      if (pt.y == y_prev) {
        if (closest_to_sep.x < pt.x) closest_to_sep = pt;
      } else {
        res.push(closest_to_sep);

        y_prev = pt.y;
        closest_to_sep = pt;
      }
    }

    if (!res.length || res[res.length - 1].y != closest_to_sep.y)
      res.push(closest_to_sep);

    return res;
  }

  private thinBordersSep(borders: Point[][]): Point[][] {
    let res: Point[][] = [];
    let prev_up: boolean | undefined =
      borders[borders.length - 1][0].y <
      borders[borders.length - 1][borders[borders.length - 1].length - 1].y;
    for (let border of borders) {
      if (!border.length) continue;

      border = this.thinBorderSep(border, prev_up);
      if (border.length > 1)
        prev_up = border[0].y < border[border.length - 1].y;

      // console.log(border[0].y, border[border.length - 1].y);

      res.push(border);
    }
    return res;
  }

  private async xorFillSep(borders: Point[][], delay: number): Promise<number> {
    let buf = this.context.getBuf();
    let sep: number = this.getSeparator(borders);
    let count = 0;

    borders = this.thinBordersSep(borders);

    let res = new Promise<number>(async (resolve) => {
      let timestamp_start = performance.now();
      for (let border of borders) {
        for (let pt of border) {
          this.xorFillLine(buf, sep, pt);
          ++count;
        }
        // ПОДВИНЬТЕ ЭТОТ ИФ ВНУТРЬ ЦИКЛА, ЧТОБЫ
        // ОТРИСОВЫВАТЬ ПРОГРЕСС ПОСЛЕ КАЖДОЙ СТРОКИ
        if (delay) {
          this.context.putImageData(buf);
          await sleep(delay);
        }
      }
      let timestamp_end = performance.now();

      if (!delay) {
        this.context.putImageData(buf);
      }

      resolve(timestamp_end - timestamp_start);
    });

    return res;
  }

  private xorFillLine(buf: ImageData, x_sep: number, pt: Point) {
    if (x_sep < pt.x) {
      for (let x: number = pt.x; x > x_sep; --x)
        xorPixel(buf, <Pixel>{
          x: x,
          y: pt.y,
          r: this.color.r,
          g: this.color.g,
          b: this.color.b,
          alpha: 255,
        });
    } else {
      for (let x: number = pt.x; x <= x_sep; ++x)
        xorPixel(buf, <Pixel>{
          x: x,
          y: pt.y,
          r: this.color.r,
          g: this.color.g,
          b: this.color.b,
          alpha: 255,
        });
    }
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

  public setColor(color: RGBColor) {
    this.color = color;
  }
}
