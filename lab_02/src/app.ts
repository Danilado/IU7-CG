"use strict";

import "../css/style.scss";
import { EPS } from "./constants";
import { toRad, Point } from "./geometry";
import { Graphics } from "./graphics";
import {
  add_rotation,
  input_origin_x,
  input_origin_y,
  input_angle,
  clear_output,
  add_translate,
  input_dx,
  input_dy,
  add_scale,
  input_kx,
  input_ky,
  clear_all,
} from "./interface";
import { Boundaries, Logic } from "./logic";
import { out } from "./output";
import {
  RotateTransformation,
  TranslateTransformation,
  ScaleTransformation,
  fg_ctx,
  fg_canvas,
  bg_ctx,
  bg_canvas,
} from "./transformations";

add_rotation.addEventListener("click", () => {
  let cx: number;
  let cy: number;
  let angle: number;

  cx = Number(input_origin_x.value);
  cy = Number(input_origin_y.value);

  if (Number.isNaN(cx) || Number.isNaN(cy))
    return out.error("Ошибка считывания координат центра врщения");

  angle = Number(input_angle.value);
  if (Number.isNaN(angle)) return out.error("Ошибка считывания угла поворота");
  angle = toRad(angle);

  logic.addTransformation(new RotateTransformation(new Point(cx, cy), angle));
  logic.update();
});

clear_output.addEventListener("click", () => {
  out.clear();
});

add_translate.addEventListener("click", () => {
  let dx = Number(input_dx.value);
  let dy = Number(input_dy.value);

  if (Number.isNaN(dx) || Number.isNaN(dy))
    return out.error("Ошибка считывания смещения");

  logic.addTransformation(new TranslateTransformation(new Point(dx, dy)));
  logic.update();
});

export function pushFocus() {
  let cx = Number(input_origin_x.value);
  let cy = Number(input_origin_y.value);

  if (Number.isNaN(cx) || Number.isNaN(cy)) return;

  logic.drawFocus(new Point(cx, cy));
}

add_scale.addEventListener("click", () => {
  let cx: number;
  let cy: number;
  let kx: number;
  let ky: number;

  cx = Number(input_origin_x.value);
  cy = Number(input_origin_y.value);

  if (Number.isNaN(cx) || Number.isNaN(cy))
    return out.error("Ошибка считывания координат центра масштабирования");

  kx = Number(input_kx.value);
  ky = Number(input_ky.value);

  if (Number.isNaN(kx) || Number.isNaN(ky))
    return out.error("Ошибка считывания коэффицентов масштабирования");

  if (Math.abs(kx) < EPS || Math.abs(ky) < EPS)
    return out.error(`Ошибка: Попытка масштабирования с нулевым коэффицентом`);

  logic.addTransformation(
    new ScaleTransformation(new Point(cx, cy), { x: kx, y: ky })
  );
  logic.update();
});

input_origin_x.addEventListener("input", pushFocus);
input_origin_y.addEventListener("input", pushFocus);

clear_all.addEventListener("click", () => {
  logic.clearAll();
});

const graphics: Graphics = new Graphics(fg_ctx, fg_canvas, "black");
const bg_graphics: Graphics = new Graphics(bg_ctx, bg_canvas, "#aaaaaa");

const graphics_arr: Array<Graphics> = [graphics, bg_graphics];

graphics_arr.forEach((graphics) => {
  graphics.endFrame();
  graphics.setBoundaries(<Boundaries>{
    x_min: -800,
    x_max: 800,
    y_min: -400,
    y_max: 400,
  });
});

const logic = new Logic(graphics, bg_graphics);
logic.update();
pushFocus();
