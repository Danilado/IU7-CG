import {
  Circle,
  isTrianle,
  Point,
  pointsInLine,
  pointsAreEqual,
  PointsAngleWithX,
  Line,
} from "./geometry";
import { PointNode } from "./points";

export interface TriangleSearchOut {
  triangles: Array<Array<PointNode>>;
  angles: Array<number>;
  bestIndex: number;
}

export interface TriangleSearchOutRc {
  rc: number;
  data: TriangleSearchOut | undefined;
}

export interface Boundaries {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}

export class Logic {
  constructor() {}

  findTrianglesIntersectingCircleCenter(
    points: Array<PointNode>,
    circ: Circle
  ) {
    if (points.length < 3)
      return <TriangleSearchOutRc>{
        rc: 1,
      };

    const triangles: Array<Array<PointNode>> = [];

    for (let i = 0; i < points.length - 2; i++)
      for (let j = i + 1; j < points.length - 1; j++)
        for (let k = j + 1; k < points.length; k++) {
          if (isTrianle(points[i].pt, points[j].pt, points[k].pt))
            triangles.push([points[i], points[j], points[k]]);
        }

    if (!triangles.length)
      return <TriangleSearchOutRc>{
        rc: 2,
      };

    const good_triangles = triangles.filter((tri) => {
      return this.triangleSideLineIntersectsPoint(tri, circ.center);
    });

    if (!good_triangles.length)
      return <TriangleSearchOutRc>{
        rc: 3,
      };

    const angles: Array<number> = [];

    let min_angle: number = this.triangleAngleWithXThroughPoint(
      good_triangles[0],
      circ.center
    );
    let min_index: number = 0;

    good_triangles.forEach((tri, i) => {
      let angle: number = this.triangleAngleWithXThroughPoint(tri, circ.center);
      angles.push(angle);

      if (angle < min_angle) {
        min_angle = angle;
        min_index = i;
      }
    });

    return <TriangleSearchOutRc>{
      rc: 0,
      data: <TriangleSearchOut>{
        triangles: good_triangles,
        angles: angles,
        bestIndex: min_index,
      },
    };
  }

  triangleSideLineIntersectsPoint(tri: Array<PointNode>, pt: Point) {
    return (
      pointsInLine(tri[0].pt, tri[1].pt, pt) ||
      pointsInLine(tri[0].pt, tri[2].pt, pt) ||
      pointsInLine(tri[1].pt, tri[2].pt, pt)
    );
  }

  triangleAngleWithXThroughPoint(tri: Array<PointNode>, pt: Point) {
    for (let i = 0; i < 3; ++i)
      if (pointsAreEqual(tri[i].pt, pt))
        return this.triInterFindMinimal(tri, tri[i]);

    if (pointsInLine(tri[0].pt, tri[1].pt, pt))
      return PointsAngleWithX(tri[0].pt, tri[1].pt);

    if (pointsInLine(tri[0].pt, tri[2].pt, pt))
      return PointsAngleWithX(tri[0].pt, tri[2].pt);

    return PointsAngleWithX(tri[1].pt, tri[2].pt);
  }

  triInterFindMinimal(tri: Array<PointNode>, intersecting: PointNode) {
    let tmppoints = tri.filter((pnode) => {
      return pnode !== intersecting;
    });
    return Math.min(
      PointsAngleWithX(intersecting.pt, tmppoints[0].pt),
      PointsAngleWithX(intersecting.pt, tmppoints[1].pt)
    );
  }

  getBoundaries(triangle: Array<PointNode>, circ: Circle) {
    let new_bound: Boundaries = {
      x_min: 0,
      x_max: 0,
      y_min: 0,
      y_max: 0,
    };

    new_bound.x_min = circ.center.x - circ.r;
    new_bound.x_max = circ.center.x + circ.r;
    new_bound.y_min = circ.center.y - circ.r;
    new_bound.y_max = circ.center.y + circ.r;

    triangle.forEach((pn) => {
      new_bound.x_min = Math.min(new_bound.x_min, pn.pt.x);
      new_bound.x_max = Math.max(new_bound.x_max, pn.pt.x);
      new_bound.y_min = Math.min(new_bound.y_min, pn.pt.y);
      new_bound.y_max = Math.max(new_bound.y_max, pn.pt.y);
    });

    let tmp_width = new_bound.x_max - new_bound.x_min;
    let tmp_height = new_bound.y_max - new_bound.y_min;

    new_bound.x_max += 0.1 * tmp_width;
    new_bound.x_min -= 0.1 * tmp_width;
    new_bound.y_max += 0.1 * tmp_height;
    new_bound.y_min -= 0.1 * tmp_height;

    return new_bound;
  }

  getIntersectingLine(tri: Array<PointNode>, pt: Point) {
    for (let i = 0; i < 3; ++i)
      if (pointsAreEqual(tri[i].pt, pt)) {
        // если вершина в центре окружности
        let tmppoints = tri.filter((pnode) => {
          return pnode !== tri[i];
        });
        return PointsAngleWithX(tri[i].pt, tmppoints[0].pt) <
          PointsAngleWithX(tri[i].pt, tmppoints[1].pt)
          ? new Line(tri[i].pt, tmppoints[0].pt)
          : new Line(tri[i].pt, tmppoints[1].pt);
      }

    if (pointsInLine(tri[0].pt, tri[1].pt, pt))
      return new Line(tri[0].pt, tri[1].pt);

    if (pointsInLine(tri[0].pt, tri[2].pt, pt))
      return new Line(tri[0].pt, tri[2].pt);

    return new Line(tri[1].pt, tri[2].pt);
  }
}

export const logic = new Logic();
