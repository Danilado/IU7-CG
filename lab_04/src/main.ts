import "../css/style.css";

import { pointer_x } from "./labels";
import { Graphics } from "./graphics";
import {
  center_x_input,
  center_y_input,
  center_x,
  center_y,
  btn_side,
  side_input,
  btn_clear_image,
  btn_build_circle,
  circle_r_input,
  color_input,
  btn_build_ellipse,
  ellipse_r_x_input,
  ellipse_r_y_input,
  btn_build_circ_spectrum,
  circ_spectrum_r_start_input,
  circ_spectrum_r_end_input,
  circ_spectrum_r_step_input,
  circ_spectrum_amount_input,
  btn_build_el_spectrum,
  el_spectrum_rx_start_input,
  el_spectrum_ry_start_input,
  el_spectrum_r_step_input,
  el_spectrum_r_amount_input,
  btn_build_graphs_circle,
  btn_build_graphs_ellipse,
} from "./inputs";
import { RUN_COUNT, R_END, R_START, R_STEP, m, out, round } from "./constants";
import { HEXtoRGB, RGBColor } from "./pixels";
import {
  buildCircleCanonical,
  buildCircleParametric,
  buildCircleBresenham,
  buildCircleMidpoint,
} from "./circle";
import {
  buildEllipseCanonical,
  buildEllipseParametric,
  buildEllipseBresenham,
  buildEllipseMidpoint,
} from "./ellipse";

import Chart from "chart.js/auto";

let ch: Chart | null = null;

/// <reference path="global.ts" />

const main_canvas: HTMLCanvasElement = document.querySelector("#main_canvas")!;
main_canvas.width = main_canvas.getBoundingClientRect().width;
main_canvas.height = main_canvas.getBoundingClientRect().height;

const main_canv = new Graphics(
  main_canvas.getContext("2d")!,
  main_canvas.width
);

//#region interact

function movePtrs() {
  let x1 = center_x_input.validateInput()
    ? center_x_input.value(0, main_canv.width - 1)
    : 0;
  let y1 = center_y_input.validateInput()
    ? center_y_input.value(0, main_canv.height - 1)
    : 0;

  let tmp1 = main_canv.getDocumentCoords(x1, y1);

  let pixelsize = main_canv.getPixelSize();

  pointer_x.style.left = `${tmp1.x + pixelsize / 2 - 15 / 2}px`;
  pointer_x.style.top = `${tmp1.y + pixelsize / 2 - 15 / 2}px`;
}

center_x.addEventListener("keyup", () => {
  movePtrs();
});
center_y.addEventListener("keyup", () => {
  movePtrs();
});

movePtrs();

const radiobuttons = document.querySelectorAll("input[type='radio']");

function getChosenAlgIndex() {
  let count: number = 0;
  radiobuttons.forEach((button, i) => {
    let bt = button as HTMLInputElement;
    if (bt.checked) count = i;
  });
  return count;
}

btn_side.addEventListener("click", () => {
  clearGraph();
  if (!side_input.validateInput())
    return out.error("Ошибка ввода ширины холста");
  if (side_input.value() < 10)
    return out.error("Нельзя ввести ширину холста меньше 10 пикселей");

  main_canv.width = side_input.value();
  movePtrs();
});

btn_clear_image.addEventListener("click", () => {
  clearGraph();
  main_canv.resetImage();
});

function buildCircleFromInputs() {
  if (!center_x_input.validateInput())
    return out.error(`Ошибка ввода кординаты x центра фигуры`);
  if (!center_y_input.validateInput())
    return out.error(`Ошибка ввода кординаты y центра фигуры`);
  let r;
  if (!circle_r_input.validateInput())
    return out.error(`Ошибка ввода радиуса окружности`);
  r = circle_r_input.value();
  if (r < 0)
    return out.error(`Ошибка: Радиус окружности не может быть меньше нуля`);

  let cx = center_x_input.value();
  let cy = center_y_input.value();

  let color = color_input.value();
  let rgbc: RGBColor;
  let buf: ImageData;

  let i = getChosenAlgIndex();
  if (i != 0) {
    rgbc = HEXtoRGB(color);
    buf = main_canv.getBuf();
  }

  return buildCircle(buf!, cx, cy, r, i, i == 0 ? color : rgbc!);
}

function buildCircle(
  buf: ImageData,
  cx: number,
  cy: number,
  r: number,
  alg: number,
  color: RGBColor | string,
  profile: boolean = false
) {
  switch (alg) {
    case 0:
      main_canv.drawCircle(cx, cy, r, color as string);
      break;
    case 1:
      buildCircleCanonical(buf!, cx, cy, r, color as RGBColor, profile);
      break;
    case 2:
      buildCircleParametric(buf!, cx, cy, r, color as RGBColor, profile);
      break;
    case 3:
      buildCircleBresenham(buf!, cx, cy, r, color as RGBColor, profile);
      break;
    case 4:
      buildCircleMidpoint(buf!, cx, cy, r, color as RGBColor, profile);
      break;
    // case(0):{}break;
    default:
      {
        out.error(
          "Ошибка: Выбранный алгоритм рисования не определён или ещё не реализован"
        );
      }
      break;
  }
}

btn_build_circle.addEventListener("click", () => {
  clearGraph();
  buildCircleFromInputs();
  main_canv.drawImageData();
});

function buildEllipseFromInputs() {
  if (!center_x_input.validateInput())
    return out.error(`Ошибка ввода кординаты x центра фигуры`);
  if (!center_y_input.validateInput())
    return out.error(`Ошибка ввода кординаты y центра фигуры`);

  if (!ellipse_r_x_input.validateInput())
    return out.error(`Ошибка ввода полуоси x эллипса`);
  let rx = ellipse_r_x_input.value();
  if (rx < 0) return out.error(`Ошибка: Полуось x эллипса меньше 0`);
  if (!ellipse_r_y_input.validateInput())
    return out.error(`Ошибка ввода полуоси y эллипса`);
  let ry = ellipse_r_y_input.value();
  if (ry < 0) return out.error(`Ошибка: Полуось y эллипса меньше 0`);

  let cx = center_x_input.value();
  let cy = center_y_input.value();
  let color = color_input.value();
  let rgbc: RGBColor;
  let buf: ImageData;

  let i = getChosenAlgIndex();
  if (i != 0) {
    rgbc = HEXtoRGB(color);
    buf = main_canv.getBuf();
  }

  buildEllipse(buf!, cx, cy, rx, ry, i, i == 0 ? color : rgbc!);
}

function buildEllipse(
  buf: ImageData,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  alg: number,
  color: RGBColor | string,
  profile: boolean = false
) {
  switch (alg) {
    case 0:
      main_canv.drawEllipse(cx, cy, rx, ry, color as string);
      break;
    case 1:
      buildEllipseCanonical(buf!, cx, cy, rx, ry, color as RGBColor, profile);
      break;
    case 2:
      buildEllipseParametric(buf!, cx, cy, rx, ry, color as RGBColor, profile);
      break;
    case 3:
      buildEllipseBresenham(buf!, cx, cy, rx, ry, color as RGBColor, profile);
      break;
    case 4:
      buildEllipseMidpoint(buf!, cx, cy, rx, ry, color as RGBColor, profile);
      break;
    // case(0):{}break;
    default:
      {
        out.error(
          "Ошибка: Выбранный алгоритм рисования не определён или ещё не реализован"
        );
      }
      break;
  }
}

btn_build_ellipse.addEventListener("click", () => {
  clearGraph();
  buildEllipseFromInputs();
  main_canv.drawImageData();
});

function getCircSpectrumRads1(rbeg: number, rend: number, rstep: number) {
  let res = [];
  for (let i = rbeg; i <= rend; i += rstep) res.push(round(i));
  return res;
}

function getCircSpectrumRads2(rbeg: number, rend: number, ramount: number) {
  let res = [];
  let step = (rend - rbeg) / ramount;
  for (let i = rbeg; i <= rend; i += step) res.push(round(i));
  return res;
}

function getCircSpectrumRads3(rbeg: number, rstep: number, ramount: number) {
  let res = [];
  let r = rbeg;
  for (let i = 0; i < ramount; ++i) {
    if (r < 0) r = 0;
    res.push(round(r));
    r += rstep;
  }
  return res;
}

function getCircSpectrumRads4(rend: number, rstep: number, ramount: number) {
  let res = [];

  let r = rend;
  for (let i = 0; i < ramount; ++i) {
    if (r < 0) r = 0;
    res.push(round(r));
    r -= rstep;
  }
  return res;
}

btn_build_circ_spectrum.addEventListener("click", () => {
  clearGraph();
  if (!center_x_input.validateInput())
    return out.error(`Ошибка ввода кординаты x центра фигуры`);
  if (!center_y_input.validateInput())
    return out.error(`Ошибка ввода кординаты y центра фигуры`);

  let cx = center_x_input.value();
  let cy = center_y_input.value();
  let color = color_input.value();
  let rgbc = HEXtoRGB(color);
  let buf = main_canv.getBuf();

  let circ_b = circ_spectrum_r_start_input.validateInput();
  let circ_e = circ_spectrum_r_end_input.validateInput();
  let circ_s = circ_spectrum_r_step_input.validateInput();
  let circ_a = circ_spectrum_amount_input.validateInput();

  if (Number(circ_b) + Number(circ_e) + Number(circ_s) + Number(circ_a) < 3)
    return out.error("Недостаточно заполненных полей");

  let rads: number[];

  let r_b = circ_spectrum_r_start_input.value();
  let r_e = circ_spectrum_r_end_input.value();
  let r_s = circ_spectrum_r_step_input.value();
  let r_a = circ_spectrum_amount_input.value();

  if (circ_b && circ_e && circ_s) rads = getCircSpectrumRads1(r_b, r_e, r_s);
  else if (circ_b && circ_e && circ_a)
    rads = getCircSpectrumRads2(r_b, r_e, r_a);
  else if (circ_b && circ_s && circ_a)
    rads = getCircSpectrumRads3(r_b, r_s, r_a);
  else rads = getCircSpectrumRads4(r_e, r_s, r_a);

  let i = getChosenAlgIndex();
  if (i != 0) {
    rgbc = HEXtoRGB(color);
    buf = main_canv.getBuf();
  }

  for (let r of rads) {
    buildCircle(buf!, cx, cy, r, i, i == 0 ? color : rgbc!);
  }
  main_canv.drawImageData();
});

function getElRadsSpectrum(
  rx_s: number,
  ry_s: number,
  step_rx: number,
  amount: number
) {
  let res: number[][] = [];

  let rx = rx_s;
  let ry = ry_s;

  let step_ry = (step_rx * ry) / rx;

  for (let i = 0; i < amount; ++i) {
    res.push([round(rx), round(ry)]);
    rx += step_rx;
    ry += step_ry;
  }

  return res;
}

btn_build_el_spectrum.addEventListener("click", () => {
  clearGraph();
  if (!center_x_input.validateInput())
    return out.error(`Ошибка ввода кординаты x центра фигуры`);
  if (!center_y_input.validateInput())
    return out.error(`Ошибка ввода кординаты y центра фигуры`);

  let cx = center_x_input.value();
  let cy = center_y_input.value();
  let color = color_input.value();
  let rgbc = HEXtoRGB(color);
  let buf = main_canv.getBuf();

  if (!el_spectrum_rx_start_input.validateInput())
    return out.error(`Ошибка ввода полуоси x эллипса`);
  let rx1 = el_spectrum_rx_start_input.value();
  if (rx1 < 0)
    return out.error(`Ошибка: Начальное значение полуоси x эллипса меньше 0`);

  if (!el_spectrum_ry_start_input.validateInput())
    return out.error(`Ошибка ввода полуоси y эллипса`);
  let ry1 = el_spectrum_ry_start_input.value();
  if (ry1 < 0)
    return out.error(`Ошибка: Начальное значение полуоси y эллипса меньше 0`);

  if (!el_spectrum_r_step_input.validateInput())
    return out.error(`Ошибка чтения шага роста полуосей эллипса`);
  let rstep = el_spectrum_r_step_input.value();

  if (!el_spectrum_r_amount_input.validateInput())
    return out.error("Ошибка чтения количества эллипсов");
  let amount = el_spectrum_r_amount_input.value();
  if (amount <= 0)
    return out.error("Ошибка: Количество эллипсов должно быть больше нуля");

  let i = getChosenAlgIndex();
  if (i != 0) {
    rgbc = HEXtoRGB(color);
    buf = main_canv.getBuf();
  }

  let radpairs: number[][] = getElRadsSpectrum(rx1, ry1, rstep, amount);

  for (let radpair of radpairs) {
    buildEllipse(
      buf!,
      cx,
      cy,
      radpair[0],
      radpair[1],
      i,
      i == 0 ? color : rgbc
    );
  }

  main_canv.drawImageData();
});

function clearGraph() {
  if (ch != null) ch.destroy();
  ch = null;
}

const measure_canvas: HTMLCanvasElement = document.createElement("canvas");
measure_canvas.width = 10000;
measure_canvas.height = 10000;
const measure_ctx: CanvasRenderingContext2D = measure_canvas.getContext("2d")!;
let measure_buf = measure_ctx.createImageData(
  main_canv.width,
  main_canv.height
);
const circle_algs = [
  buildCircleCanonical,
  buildCircleParametric,
  buildCircleBresenham,
  buildCircleMidpoint,
];

let radiuses: number[] = [];
for (let r = R_START; r <= R_END; r += R_STEP) radiuses.push(r);

btn_build_graphs_circle.addEventListener("click", () => {
  clearGraph();
  let times: number[][] = [[], [], [], [], []];

  for (let r of radiuses) {
    let t1 = performance.now();
    for (let _ = 0; _ < RUN_COUNT; ++_) {
      measure_ctx.beginPath();
      measure_ctx.arc(0, 0, r, 0, 2 * m.PI, false);
      measure_ctx.closePath();
    }
    let t2 = performance.now();
    times[0].push(t2 - t1);
  }

  let i = 1;
  for (let alg of circle_algs) {
    for (let r of radiuses) {
      let t1 = performance.now();
      for (let _ = 0; _ < RUN_COUNT; ++_)
        alg(measure_buf, 0, 0, r, <RGBColor>{ r: 0, g: 0, b: 0 }, true);
      let t2 = performance.now();
      times[i].push(t2 - t1);
    }

    ++i;
  }

  console.log(times);

  ch = new Chart(main_canvas.getContext("2d")!, {
    type: "line",
    data: {
      labels: radiuses,
      datasets: [
        { label: "Библиотечная функция", data: times[0] },
        { label: "Алгоритм средней точки", data: times[1] },
        { label: "Алгоритм Брезенхема", data: times[2] },
        { label: "Параметрическое уравнение", data: times[3] },
        { label: "Каноническое уравнение", data: times[4] },
      ],
    },
  });
});

const ellipse_algs = [
  buildEllipseCanonical,
  buildEllipseParametric,
  buildEllipseBresenham,
  buildEllipseMidpoint,
];

btn_build_graphs_ellipse.addEventListener("click", () => {
  clearGraph();
  let times: number[][] = [[], [], [], [], []];

  for (let r of radiuses) {
    let t1 = performance.now();
    for (let _ = 0; _ < RUN_COUNT; ++_) {
      measure_ctx.beginPath();
      measure_ctx.ellipse(0, 0, r, r, 0, 0, 2 * m.PI, false);
      measure_ctx.closePath();
    }
    let t2 = performance.now();
    times[0].push(t2 - t1);
  }

  let i = 1;
  for (let alg of ellipse_algs) {
    for (let r of radiuses) {
      let t1 = performance.now();
      for (let _ = 0; _ < RUN_COUNT; ++_)
        alg(measure_buf, 0, 0, r, r, <RGBColor>{ r: 0, g: 0, b: 0 }, true);
      let t2 = performance.now();
      times[i].push(t2 - t1);
    }

    ++i;
  }

  console.log(times);

  ch = new Chart(main_canvas.getContext("2d")!, {
    type: "line",
    data: {
      labels: radiuses,
      datasets: [
        { label: "Библиотечная функция", data: times[0] },
        { label: "Алгоритм средней точки", data: times[1] },
        { label: "Алгоритм Брезенхема", data: times[2] },
        { label: "Параметрическое уравнение", data: times[3] },
        { label: "Каноническое уравнение", data: times[4] },
      ],
    },
  });
});
