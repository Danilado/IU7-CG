import { Triangle, Point, Circle, Polygon, toRad, Ellipse } from "./geometry";

const tri_s_len: number = 200;
const tri_h: number = Math.sqrt((tri_s_len * tri_s_len * 3) / 4);

export const center_triangle = new Triangle(
  new Point(-tri_s_len / 2, -tri_h / 3),
  new Point(0, (tri_h * 2) / 3),
  new Point(tri_s_len / 2, -tri_h / 3)
);

export const center_circle = new Circle(
  new Point(0, 0),
  tri_s_len / 2 / Math.sqrt(3)
);

export const square_left = new Polygon([
  center_triangle.vertex2,
  center_triangle.vertex1,
  new Point(
    center_triangle.vertex1.x - tri_s_len * Math.cos(toRad(30)),
    center_triangle.vertex1.y + tri_s_len * Math.sin(toRad(30))
  ),
  new Point(
    -tri_s_len * Math.cos(toRad(30)),
    center_triangle.vertex2.y + tri_s_len * Math.sin(toRad(30))
  ),
]);

export const square_right = new Polygon([
  center_triangle.vertex2,
  center_triangle.vertex3,
  new Point(
    center_triangle.vertex3.x + tri_s_len * Math.cos(toRad(30)),
    center_triangle.vertex3.y + tri_s_len * Math.sin(toRad(30))
  ),
  new Point(
    +tri_s_len * Math.cos(toRad(30)),
    center_triangle.vertex2.y + tri_s_len * Math.sin(toRad(30))
  ),
]);

export const fig_ellipse = new Ellipse(
  new Point(0, center_triangle.vertex1.y),
  tri_s_len / 2,
  center_circle.r,
  0,
  Math.PI,
  Math.PI * 2,
  true
);
