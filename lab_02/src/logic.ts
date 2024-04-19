import { pushFocus } from "./app";
import {
  center_circle,
  square_left,
  square_right,
  fig_ellipse,
} from "./figure";
import { Point, pointsAreEqual } from "./geometry";
import { Graphics } from "./graphics";
import { transformations_node } from "./interface";
import { Transformation } from "./transformations";

export interface Boundaries {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}

export class Logic {
  transformations: Array<Transformation> = [];
  fg_graphics: Graphics;
  bg_graphics: Graphics;

  constructor(fg_graphics: Graphics, bg_graphics: Graphics) {
    this.fg_graphics = fg_graphics;
    this.bg_graphics = bg_graphics;
  }

  draw_bg() {
    this.draw_figure(this.bg_graphics);

    let points: Array<Point> = [center_circle.center];

    for (let transf of this.transformations) {
      let tmp = transf.getPoint();
      if (tmp) {
        points = points.filter((el) => {
          return !pointsAreEqual(el, tmp!);
        });
        points.push(tmp);
      }
    }

    for (let point of points) {
      this.bg_graphics.drawPoint(
        point,
        `(${point.x}, ${point.y})`,
        this.bg_graphics.context,
        "red"
      );
    }
  }

  draw_figure(graph: Graphics) {
    graph.drawPolygon(square_left);
    graph.drawPolygon(square_right);
    graph.drawCircleManually(center_circle, 0, Math.PI * 2);
    graph.drawEllipseManually(
      fig_ellipse.center.x,
      fig_ellipse.center.y,
      fig_ellipse.width,
      fig_ellipse.height,
      fig_ellipse.startAngle,
      fig_ellipse.endAngle
    );
    graph.drawPoint(center_circle.center, `<COORDS>`, graph.context, "#00FF00");
  }

  draw_fg() {
    this.fg_graphics.transformations = this.transformations;
    this.draw_figure(this.fg_graphics);
  }

  addTransformation(transf: Transformation) {
    this.transformations.push(transf);
    transformations_node.appendChild(transf.node);

    transf.remove_btn.addEventListener("click", () => {
      transformations_node.removeChild(transf.node);

      this.transformations = this.transformations.filter((el) => {
        return el !== transf;
      });

      this.update();
    });
    transf.activated_check.addEventListener("click", () => {
      this.update();
    });
  }

  drawFocus(pt: Point) {
    this.bg_graphics.endFrame();
    this.draw_bg();
    this.bg_graphics.drawPoint(pt, "ЦТ", this.bg_graphics.context, "#FF0088", {
      x: 0,
      y: 20,
    });
  }

  update() {
    this.fg_graphics.endFrame();
    this.draw_fg();
    pushFocus();
  }

  clearAll() {
    transformations_node.innerHTML = "";
    this.transformations = [];
    this.update();
  }
}
