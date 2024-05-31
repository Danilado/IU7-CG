import Point from "./figures/point";
import LineNode from "./figures/lineNode";
import Line from "./figures/line";
import { EPS, abs, max, min } from "./constants";

function scalarMul(vec1: Point, vec2: Point): number {
  return vec1.x * vec2.x + vec1.y * vec2.y;
}

function vectorMul(vec1: Point, vec2: Point): number {
  return vec1.x * vec2.y - vec1.y * vec2.x;
}

function getDirectrice(vec1: Point, vec2: Point): Point {
  return new Point(vec2.x - vec1.x, vec2.y - vec1.y);
}

export function checkConvexityPolygon(cutter: Array<Point>): boolean {
  if (cutter.length < 3) return false;

  let vec1 = getDirectrice(cutter[0], cutter[1]);
  let vec2 = getDirectrice(cutter[1], cutter[2]);

  let sign = vectorMul(vec1, vec2) > 0 ? 1 : -1;

  let clen = cutter.length;
  for (let i = 0; i < cutter.length; ++i) {
    let vec1 = getDirectrice(cutter[i], cutter[(i + 1) % clen]);
    let vec2 = getDirectrice(cutter[(i + 1) % clen], cutter[(i + 2) % clen]);

    if (sign * vectorMul(vec1, vec2) < 0) return false;
  }

  if (sign < 0) cutter = cutter.reverse();

  return true;
}

function getNormal(pt1: Point, pt2: Point, pt3: Point): Point {
  let vec = new Point(pt2.x - pt1.x, pt2.y - pt1.y);

  let normal = new Point();

  if (abs(vec.y) > EPS) {
    normal.x = 1;
    normal.y = -vec.x / vec.y;
  } else {
    normal.y = 1;
    normal.x = 0;
  }

  if (scalarMul(new Point(pt3.x - pt2.x, pt3.y - pt2.y), normal) < 0) {
    normal.x *= -1;
    normal.y *= -1;
  }

  return normal;
}

export function getCutLine(
  cutter: Array<Point>,
  line: LineNode | Line
): Line | null {
  let m = cutter.length;
  if (m < 3) return null;

  let t_beg = 0;
  let t_end = 1;

  // директрисса
  let d = new Point(line.x2 - line.x1, line.y2 - line.y1);

  for (let i = 0; i < cutter.length; ++i) {
    let normal = getNormal(cutter[i], cutter[(i + 1) % m], cutter[(i + 2) % m]);

    // Вектор от начала отрезка до произвольной точки i-го ребра. Берём начало, так проще
    let w = new Point(line.x1 - cutter[i].x, line.y1 - cutter[i].y);

    let d_scalar = scalarMul(d, normal);
    let w_scalar = scalarMul(w, normal);

    if (abs(d_scalar) < EPS) {
      if (w_scalar < EPS) return null; // отрезок вырожденный
      continue;
    }

    let t = -w_scalar / d_scalar;

    if (d_scalar > 0) {
      // точка ближе к концу отрезка
      if (t - 1 <= EPS)
        // t <= 1
        t_beg = max(t_beg, t);
      else return null;
    } else if (d_scalar < 0) {
      // точка ближе к началу отрезка
      if (t >= -EPS)
        // t >= 0
        t_end = min(t_end, t);
      else return null;
    }

    if (t_beg > t_end) return null;
  }

  return new Line(
    new Point(line.x1 + d.x * t_beg, line.y1 + d.y * t_beg),
    new Point(line.x1 + d.x * t_end, line.y1 + d.y * t_end)
  );
}

export function getCutLines(cutter: Array<Point>, lines: LineNode[]): Line[] {
  let res: Line[] = [];
  if (!lines.length) return res;

  return lines
    .map((lnode: LineNode) => {
      return getCutLine(cutter, lnode);
    })
    .filter((val: Line | null) => {
      return val instanceof Line;
    }) as Line[];
}
