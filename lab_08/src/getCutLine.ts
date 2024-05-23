import Point from "./figures/point";
import LineNode from "./figures/lineNode";
import { EPS, abs, max, min } from "./constants";
import Line from "./figures/line";

const higher = parseInt("1000", 2);
const lower = parseInt("0100", 2);
const right = parseInt("0010", 2);
const left = parseInt("0001", 2);

export interface Cutter {
  xl: number;
  xr: number;
  yt: number;
  yb: number;
}

function getMask(pt: Point, cutter: Cutter): number {
  let res: number = 0;

  if (pt.x < cutter.xl) res += left;
  else if (pt.x > cutter.xr) res += right;

  if (pt.y < cutter.yt) res += higher;
  else if (pt.y > cutter.yb) res += lower;

  return res;
}

function rectToCutter(rect: Rect): Cutter {
  try {
    rect._pt1.validate();
    rect._pt2.validate();
  } catch (_err) {
    throw new Error("Ошибка ввода углов отсекателя");
  }

  return <Cutter>{
    xl: min(rect.x1, rect.x2),
    xr: max(rect.x1, rect.x2),
    yt: min(rect.y1, rect.y2),
    yb: max(rect.y1, rect.y2),
  };
}

export function getCutLine(cutter: Rect, line: LineNode | Line): Line | null;
export function getCutLine(cutter: Cutter, line: LineNode | Line): Line | null;
export function getCutLine(
  cutter: Cutter | Rect,
  line: LineNode | Line
): Line | null {
  if (cutter instanceof Rect) {
    cutter = rectToCutter(cutter);
  }

  let _cutter: Cutter = cutter as Cutter;

  let pt1: Point = line.pt1;
  let pt2: Point = line.pt2;

  let T1 = getMask(pt1, _cutter);
  let T2 = getMask(pt2, _cutter);
  let line_tan = 1e30;

  if (!T1 && !T2) return new Line(pt1, pt2);
  if (T1 & T2) return null;

  let r1: Point;
  let r2: Point;
  let q: Point;
  let i: number = 0;

  if (!T1) {
    r1 = pt1;
    q = pt2;
    i = 2;
    return determineLinePosition();
  }

  if (!T2) {
    r1 = pt2;
    q = pt1;
    i = 2;
    return determineLinePosition();
  }

  return nextIteration();

  // 12
  function nextIteration(): Line | null {
    ++i;
    if (i > 2) return new Line(r1!, r2!);
    q = i == 1 ? pt1 : pt2;

    return determineLinePosition();
  }

  // 15
  function determineLinePosition(): Line | null {
    if (pt1.x == pt2.x) return handleVertical();

    line_tan = (pt2.y - pt1.y) / (pt2.x - pt1.x);

    if (q.x > _cutter.xl) return checkRightIntersection();

    let yp = line_tan * (_cutter.xl - q.x) + q.y;
    if (yp >= _cutter.yt && yp <= _cutter.yb) {
      if (i == 1) {
        r1 = new Point(_cutter.xl, yp);
      } else {
        r2 = new Point(_cutter.xl, yp);
      }
      return nextIteration();
    }

    return checkRightIntersection();
  }

  // 20
  function checkRightIntersection(): Line | null {
    if (q.x < _cutter.xr) return handleVertical();

    let yp = line_tan * (_cutter.xr - q.x) + q.y;
    if (yp >= _cutter.yt && yp <= _cutter.yb) {
      if (i == 1) {
        r1 = new Point(_cutter.xr, yp);
      } else {
        r2 = new Point(_cutter.xr, yp);
      }
      return nextIteration();
    }

    return handleVertical();
  }

  // 23
  function handleVertical(): Line | null {
    if (abs(line_tan) < EPS) return nextIteration();

    if (q.y > _cutter.yt) return checkBottomIntersetion();
    let xp = (_cutter.yt - q.y) / line_tan + q.x;
    if (xp <= _cutter.xr && xp >= _cutter.xl) {
      if (i == 1) {
        r1 = new Point(xp, _cutter.yt);
      } else {
        r2 = new Point(xp, _cutter.yt);
      }
      return nextIteration();
    }

    return checkBottomIntersetion();
  }

  // 27
  function checkBottomIntersetion(): Line | null {
    if (q.y < _cutter.yb) return null;

    let xp = (_cutter.yb - q.y) / line_tan + q.x;
    if (xp <= _cutter.xr && xp >= _cutter.xl) {
      if (i == 1) {
        r1 = new Point(xp, _cutter.yb);
      } else {
        r2 = new Point(xp, _cutter.yb);
      }
      return nextIteration();
    }

    return null;
  }
}

export function getCutLines(cutter: Rect, lines: LineNode[]): Line[] {
  let res: Line[] = [];
  if (!lines.length) return res;

  let _cutter = rectToCutter(cutter);

  return lines
    .map((lnode: LineNode) => {
      return getCutLine(_cutter, lnode);
    })
    .filter((val: Line | null) => {
      return val instanceof Line;
    }) as Line[];
}
