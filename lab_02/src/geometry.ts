import { EPS } from "./constants";

export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `(${toPrecision(this.x, 1)}, ${toPrecision(this.y, 1)})`;
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

export class Polygon {
  vertexes: Array<Point>;

  constructor(verts: Array<Point>) {
    this.vertexes = verts;
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

export class Ellipse {
  center: Point;
  width: number;
  height: number;
  rotation: number;
  startAngle: number;
  endAngle: number;
  cc: boolean;

  constructor(
    center: Point,
    width: number,
    height: number,
    rotation: number = 0,
    startAngle: number = 0,
    endAngle: number = Math.PI * 2,
    cc: boolean = false
  ) {
    this.center = center;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.cc = cc;
  }
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
