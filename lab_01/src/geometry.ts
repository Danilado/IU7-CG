import { EPS } from "./constants";

export class Point {
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

export function pointsAreEqual(p1: Point, p2: Point) {
  return Math.abs(p1.x - p2.x) < EPS && Math.abs(p1.y - p2.y) < EPS;
}

export class Triangle {
  vertex1: Point;
  vertex2: Point;
  vertex3: Point;

  constructor(p1: Point, p2: Point, p3: Point) {
    this.vertex1 = p1;
    this.vertex2 = p2;
    this.vertex3 = p3;
  }
}

export class Circle {
  center: Point;
  r: number;

  constructor(center: Point, radius: number) {
    this.center = center;
    this.r = radius;
  }
}

export class Line {
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

export function pointsInLine(a: Point, b: Point, c: Point) {
  // (Cy - Ay) * (Bx - Ax) = (By - Ay) * (Cx - Ax)
  return Math.abs((c.y - a.y) * (b.x - a.x) - (b.y - a.y) * (c.x - a.x)) < EPS;
}

export function isTrianle(p1: Point, p2: Point, p3: Point) {
  return !pointsInLine(p1, p2, p3);
}

export function angleBetween(p1: Point, p2: Point) {
  // то же самое, что arctan(dy/dx) между 2-мя точками
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

export function minAbsAngleBetween(p1: Point, p2: Point) {
  let angle = angleBetween(p1, p2);
  if (angle < 0)
    return Math.abs(angle) < Math.abs(angle + Math.PI)
      ? angle
      : angle + Math.PI;
  return Math.abs(angle) < Math.abs(angle - Math.PI) ? angle : angle - Math.PI;
}

export function PointsAngleWithX(p1: Point, p2: Point) {
  let angle = angleBetween(p1, p2);

  angle = Math.abs(angle);

  if (angle >= Math.PI / 2 - EPS) angle = Math.PI - angle;

  if (angle < EPS) return 0;

  return angle;
}

export function LineAngleWithX(l: Line) {
  return PointsAngleWithX(l.p1, l.p2);
}

export function toDeg(angle_rad: number) {
  return (angle_rad * 180) / Math.PI;
}

export function toRad(angle_deg: number) {
  return (angle_deg / 180) * Math.PI;
}

export function toPrecision(num: number, precision: number) {
  return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
}
