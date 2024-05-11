import { abs, EPS } from "../constants";

export default class Point {
  x: number;
  y: number;

  constructor();
  constructor(x: number, y: number);
  constructor(coords: string[]);
  constructor(pt: Point);
  constructor(val1?: number | string[] | Point, val2?: number) {
    if (val1 === undefined) {
      this.x = 0;
      this.y = 0;
    } else if (val1 instanceof Point) {
      this.x = val1.x;
      this.y = val1.y;
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
