"use strict";

import "../css/style.scss";

import { Circle, Point, toPrecision, toDeg, Triangle, Line } from "./geometry";
import { graphics } from "./graphics";
import {
  run_button,
  input_center_x,
  input_center_y,
  input_radius,
  clear_output,
} from "./interface";
import { TriangleSearchOutRc, logic, Boundaries } from "./logic";
import { out } from "./output";
import { pts_element } from "./points";

run_button.addEventListener("click", () => {
  graphics.endFrame();

  let x: number = Number(input_center_x.value);
  if (Number.isNaN(x) || !input_center_x.value)
    return out.error("Ошибка чтения значения координаты x центра окружности");

  let y: number = Number(input_center_y.value);
  if (Number.isNaN(y) || !input_center_y.value)
    return out.error("Ошибка чтения значения координаты y центра окружности");

  let r: number = Number(input_radius.value);
  if (Number.isNaN(r) || !input_radius.value)
    return out.error("Ошибка чтения значения радиуса окружности");

  let circ = new Circle(new Point(x, y), r);
  let ret: TriangleSearchOutRc = logic.findTrianglesIntersectingCircleCenter(
    pts_element.pointarr,
    circ
  );

  if (ret.rc) {
    if (ret.rc == 1)
      return out.error(
        `Недостаточно точек для построения даже одного треугольника`
      );

    if (ret.rc == 2)
      return out.error(
        `На этих точках не удалось построить ни одного треугольника`
      );

    if (ret.rc == 3)
      return out.error(
        "Нe нашлось ни одного треугольника, прямая проходящая через " +
          "сторону которого пересекала бы центр окружности"
      );
  }

  let triangles = ret.data!.triangles;
  let angles = ret.data!.angles;
  let bestIndex = ret.data!.bestIndex;
  let bestTriangle = triangles[bestIndex];

  out.write(`ОТВЕТ:\nНайденные треугольники:\n`, "");

  for (let i = 0; i < triangles!.length; ++i) {
    out.write(
      `${i + 1}: треугольник на точках ${triangles[i][0].index + 1} ` +
        `${triangles[i][0].pt.toString()}; ` +
        `${triangles[i][1].index + 1} ${triangles[i][1].pt.toString()}; ` +
        `${triangles[i][2].index + 1} ${triangles[i][2].pt.toString()}, ` +
        `угол с осью Абсцисс: ${toPrecision(toDeg(angles[i]), 6)}град.`,
      ""
    );
  }

  out.write(
    `Треугольник с наименьшим углом к оси абсцисс:\n` +
      `${bestIndex + 1}: ` +
      `${bestTriangle[0].index + 1} ${bestTriangle[0].pt.toString()}; ` +
      `${bestTriangle[1].index + 1} ${bestTriangle[1].pt.toString()}; ` +
      `${bestTriangle[2].index + 1} ${bestTriangle[2].pt.toString()}, ` +
      `угол с осью Абсцисс: ${toPrecision(toDeg(angles[bestIndex]), 6)}град.`,
    ""
  );

  let bounds: Boundaries = logic.getBoundaries(bestTriangle, circ);
  graphics.setBoundaries(bounds);

  graphics.drawCircle(circ);

  let tri = new Triangle(
    bestTriangle[0].pt,
    bestTriangle[1].pt,
    bestTriangle[2].pt
  );

  graphics.drawTriangle(tri, "blue");

  let l: Line = logic.getIntersectingLine(bestTriangle, circ.center);

  graphics.drawLine(l, "red");

  pts_element.pointarr.forEach((pn) => {
    graphics.drawPoint(pn.pt, pn.toString());
  });
});

clear_output.addEventListener("click", () => {
  out.clear();
  graphics.endFrame();
});
