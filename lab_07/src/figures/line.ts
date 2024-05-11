import Point from "./point";

export default class Line {
  pt1: Point;
  pt2: Point;

  constructor(line: Line);
  constructor(pt1: Point, pt2: Point);
  constructor(x1: number, y1: number, x2: number, y2: number);
  constructor(
    arg1: Line | Point | number,
    arg2?: Point | number,
    arg3?: number,
    arg4?: number
  ) {
    if (arg1 instanceof Line) {
      this.pt1 = new Point(arg1.pt1);
      this.pt2 = new Point(arg1.pt2);
    } else if (arg2 instanceof Point) {
      this.pt1 = new Point(arg1 as Point);
      this.pt2 = new Point(arg2 as Point);
    } else {
      this.pt1 = new Point(arg1 as number, arg2 as number);
      this.pt2 = new Point(arg3 as number, arg4 as number);
    }
  }

  public get x1(): number {
    return this.pt1.x;
  }
  public get y1(): number {
    return this.pt1.y;
  }
  public get x2(): number {
    return this.pt2.x;
  }
  public get y2(): number {
    return this.pt2.y;
  }

  public set x1(n: number) {
    this.pt1.x = n;
  }
  public set y1(n: number) {
    this.pt1.y = n;
  }
  public set x2(n: number) {
    this.pt2.x = n;
  }
  public set y2(n: number) {
    this.pt2.y = n;
  }
}
