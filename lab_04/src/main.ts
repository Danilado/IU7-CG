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
} from "./inputs";
import { out } from "./constants";
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
  if (!side_input.validateInput())
    return out.error("Ошибка ввода ширины холста");
  if (side_input.value() < 10)
    return out.error("Нельзя ввести ширину холста меньше 10 пикселей");

  main_canv.width = side_input.value();
  movePtrs();
});

btn_clear_image.addEventListener("click", () => {
  main_canv.resetImage();
});

btn_build_circle.addEventListener("click", () => {
  if (!center_x_input.validateInput())
    return out.error(`Ошибка ввода кординаты x центра фигуры`);
  if (!center_y_input.validateInput())
    return out.error(`Ошибка ввода кординаты y центра фигуры`);
  if (!circle_r_input.validateInput())
    return out.error(`Ошибка ввода радиуса окружности`);
  let r = circle_r_input.value();
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

  switch (i) {
    case 0:
      main_canv.drawCircle(cx, cy, r, color);
      break;
    case 1:
      buildCircleCanonical(buf!, cx, cy, r, rgbc!);
      break;
    case 2:
      buildCircleParametric(buf!, cx, cy, r, rgbc!);
      break;
    case 3:
      buildCircleBresenham(buf!, cx, cy, r, rgbc!);
      break;
    case 4:
      buildCircleMidpoint(buf!, cx, cy, r, rgbc!);
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

  if (i != 0) main_canv.drawImageData();
});

btn_build_ellipse.addEventListener("click", () => {
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

  switch (i) {
    case 0:
      main_canv.drawEllipse(cx, cy, rx, ry, color);
      break;
    case 1:
      buildEllipseCanonical(buf!, cx, cy, rx, ry, rgbc!, false);
      break;
    case 2:
      buildEllipseParametric(buf!, cx, cy, rx, ry, rgbc!);
      break;
    case 3:
      buildEllipseBresenham(buf!, cx, cy, rx, ry, rgbc!);
      break;
    case 4:
      buildEllipseMidpoint(buf!, cx, cy, rx, ry, rgbc!);
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

  if (i != 0) main_canv.drawImageData();
});

//#endregion

/*

//#region graphs

const measure_canvas: HTMLCanvasElement = document.createElement("canvas");
measure_canvas.width = 10000;
measure_canvas.height = 10000;
const measure_ctx: CanvasRenderingContext2D = measure_canvas.getContext("2d")!;

const hist_canvas: HTMLCanvasElement = document.querySelector("#hist")!;

let hist_chart: any = undefined;

function buildTimeChart() {
  if (!center_x_input.validateInput())
    return out.error(`Ошибка ввода координаты x точки центра`);
  if (!center_y_input.validateInput())
    return out.error(`Ошибка ввода координаты y точки центра`);

  let x1 = center_x_input.value();
  let y1 = center_y_input.value();
  let times: number[] = [];

  let t1 = performance.now();
  for (let i = 0; i < RUN_COUNT; ++i) {
    measure_ctx.beginPath();
    measure_ctx.moveTo(x1, y1);
    measure_ctx.lineTo(x2, y2);
    measure_ctx.stroke();
    measure_ctx.closePath();
  }
  let t2 = performance.now();

  console.log(t2 - t1);

  times.push(1);

  let buf = measure_ctx.createImageData(main_canv.width, main_canv.height);

  for (let alg of algs) {
    t1 = window.performance.now();
    for (let i = 0; i < RUN_COUNT; ++i) {
      alg.draw(buf, x1, y1, x2, y2, { r: 255, g: 0, b: 0 }, true);
    }
    t2 = window.performance.now();
    times.push(t2 - t1);
  }

  // @ts-ignore
  if (hist_chart !== undefined) hist_chart.destroy();
  // @ts-ignore
  hist_chart = new Chart(hist_canvas, {
    type: "bar",
    data: {
      labels: [
        "Библ.",
        "ЦДА",
        "Брез.\nдейств.",
        "Брез.\nцел.",
        "Брез.\nступ.",
        "Ву",
      ],
      datasets: [
        {
          label: "время выполнения алгоритма в мс",
          data: times,
          backgroundColor: [
            "#f7258522",
            "#b5179e22",
            "#7209b722",
            "#560bad22",
            "#480ca822",
            "#3a0ca322",
          ],
          borderColor: [
            "#f72585FF",
            "#b5179eFF",
            "#7209b7FF",
            "#560badFF",
            "#480ca8FF",
            "#3a0ca3FF",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

btn_build_hist.addEventListener("click", () => {
  buildTimeChart();
});

function toRad(angle_deg: number) {
  return (angle_deg / 180) * m.PI;
}

const amount_canvas: HTMLCanvasElement =
  document.querySelector("#graph-amount")!;
const length_canvas: HTMLCanvasElement =
  document.querySelector("#graph-length")!;

let stepcount_chart: any = undefined;
let steplen_chart: any = undefined;

function buildStatGraphs() {
  const len = 100;

  let algIndex = getChosenAlgIndex();
  if (algIndex == 0)
    return out.error(
      "Измерение статистики библиотечной функции не поддерживается"
    );

  let alg = algs[algIndex - 1];

  let x1 = 0;
  let y1 = 0;

  let angles: number[] = [];
  let stepcounts: number[] = [];
  let steplens: number[] = [];

  for (let i = ANGLE_FROM; i <= ANGLE_TO; ++i) {
    angles.push(i);
    let a = toRad(i);
    let x2 = len * m.cos(a);
    let y2 = len * m.sin(a);
    stepcounts.push(alg.countSteps(x1, y1, x2, y2));
    steplens.push(alg.measureStep(x1, y1, x2, y2));
  }

  if (stepcount_chart != undefined)
    // @ts-ignore
    stepcount_chart.destroy();
  if (steplen_chart != undefined)
    // @ts-ignore
    steplen_chart.destroy();

  // @ts-ignore
  stepcount_chart = new Chart(amount_canvas, {
    type: "line",
    data: {
      labels: angles,
      datasets: [
        {
          label: "количество ступенек в зависимости от угла",
          data: stepcounts,
          fill: false,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5,
        },
      ],
    },
  });
  // @ts-ignore
  steplen_chart = new Chart(length_canvas, {
    type: "line",
    data: {
      labels: angles,
      datasets: [
        {
          label: "длина наибольшей ступеньки в зависимости от угла",
          data: steplens,
          fill: false,
          tension: 0.3,
          pointRadius: 2,
          pointHoverRadius: 5,
        },
      ],
    },
  });
}

btn_build_graphs.addEventListener("click", () => {
  buildStatGraphs();
});

//#endregion

//*/
