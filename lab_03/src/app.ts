"use strict";

import {
  DDA,
  BresenhamReal,
  BresenhamInt,
  BresenhamAntiAlias,
  Wu,
  HEXtoRGB,
} from "./algs";
import { ANGLE_FROM, ANGLE_TO, RUN_COUNT, floor } from "./constants";
import {
  start_x_input,
  start_y_input,
  end_x_input,
  end_y_input,
  button_draw_seg,
  color_input,
  button_side,
  side_input,
  button_clear_image,
  button_build_sun,
  sun_beams_input,
  button_build_hist,
  button_build_graphs,
  input_x1,
  input_x2,
  input_y1,
  input_y2,
} from "./inputs";
import { out, pointer_x, pointer_y } from "./labels";
import "../css/style.scss";
import { Graphics } from "./graphics";
import Chart from "chart.js/auto";

const main_canvas: HTMLCanvasElement = document.querySelector("#main_canvas")!;
main_canvas.width = main_canvas.getBoundingClientRect().width;
main_canvas.height = main_canvas.getBoundingClientRect().height;

const main_canv = new Graphics(main_canvas.getContext("2d")!, 300);

//#region interact

function movePtrs() {
  let x1 = start_x_input.validateInput()
    ? start_x_input.value(0, main_canv.width - 1)
    : 0;
  let y1 = start_y_input.validateInput()
    ? start_y_input.value(0, main_canv.height - 1)
    : 0;
  let x2 = end_x_input.validateInput()
    ? end_x_input.value(0, main_canv.width - 1)
    : 0;
  let y2 = end_y_input.validateInput()
    ? end_y_input.value(0, main_canv.height - 1)
    : 0;

  let tmp1 = main_canv.getDocumentCoords(x1, y1);
  let tmp2 = main_canv.getDocumentCoords(x2, y2);

  let pixelsize = main_canv.getPixelSize();
  // pointer_x.style.width = `${pixelsize}px`;
  // pointer_y.style.width = `${pixelsize}px`;

  pointer_x.style.left = `${tmp1.x + pixelsize / 2 - 15 / 2}px`;
  pointer_x.style.top = `${tmp1.y + pixelsize / 2 - 15 / 2}px`;
  pointer_y.style.left = `${tmp2.x + pixelsize / 2 - 15 / 2}px`;
  pointer_y.style.top = `${tmp2.y + pixelsize / 2 - 15 / 2}px`;
}

input_x1.addEventListener("keyup", () => {
  movePtrs();
});
input_y1.addEventListener("keyup", () => {
  movePtrs();
});
input_x2.addEventListener("keyup", () => {
  movePtrs();
});
input_y2.addEventListener("keyup", () => {
  movePtrs();
});

movePtrs();
const algs = [DDA, BresenhamReal, BresenhamInt, BresenhamAntiAlias, Wu];

const radiobuttons = document.querySelectorAll("input[type='radio']");

function getChosenAlgIndex() {
  let count: number = 0;
  radiobuttons.forEach((button, i) => {
    let bt = button as HTMLInputElement;
    if (bt.checked) count = i;
  });
  return count;
}

button_draw_seg.addEventListener("click", () => {
  let alg = getChosenAlgIndex();

  if (!start_x_input.validateInput())
    return out.error(`Ошибка ввода координаты x начальной точки`);
  if (!start_y_input.validateInput())
    return out.error(`Ошибка ввода координаты y начальной точки`);
  if (!end_x_input.validateInput())
    return out.error(`Ошибка ввода координаты x конечной точки`);
  if (!end_y_input.validateInput())
    return out.error(`Ошибка ввода координаты y конечной точки`);

  if (alg == 0)
    return main_canv.drawSegment(
      start_x_input.value(),
      start_y_input.value(),
      end_x_input.value(),
      end_y_input.value(),
      color_input.value()
    );
  else {
    algs[alg - 1].draw(
      main_canv.getBuf(),
      start_x_input.value(),
      start_y_input.value(),
      end_x_input.value(),
      end_y_input.value(),
      HEXtoRGB(color_input.value())
    );
    main_canv.drawImageData();
  }
});

button_side.addEventListener("click", () => {
  if (!side_input.validateInput())
    return out.error("Ошибка ввода ширины холста");
  if (side_input.value() < 10)
    return out.error("Нельзя ввести ширину холста меньше 10 пикселей");

  main_canv.width = side_input.value();
  movePtrs();
});

button_clear_image.addEventListener("click", () => {
  main_canv.resetImage();
});

button_build_sun.addEventListener("click", () => {
  let alg = getChosenAlgIndex();

  if (!start_x_input.validateInput())
    return out.error(`Ошибка ввода координаты x начальной точки`);
  if (!start_y_input.validateInput())
    return out.error(`Ошибка ввода координаты y начальной точки`);
  if (!end_x_input.validateInput())
    return out.error(`Ошибка ввода координаты x конечной точки`);
  if (!end_y_input.validateInput())
    return out.error(`Ошибка ввода координаты y конечной точки`);
  if (!sun_beams_input.validateInput())
    return out.error(`Ошибка ввода количества лучей солнышка`);
  if (sun_beams_input.value() <= 0)
    return out.error(`Ошибка - колчество лучшей солнышка слишком мало`);

  let step = (Math.PI * 2) / sun_beams_input.value();

  let x1 = start_x_input.value();
  let y1 = start_y_input.value();
  let x2 = end_x_input.value();
  let y2 = end_y_input.value();
  let color = color_input.value();
  let rgbcolor = HEXtoRGB(color_input.value());
  let angle_start = Math.atan2(y2 - y1, x2 - x1);
  let len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

  for (
    let angle = angle_start;
    angle <= Math.PI * 2 + angle_start;
    angle += step
  ) {
    let endx = len * Math.cos(angle) + x1;
    let endy = len * Math.sin(angle) + y1;

    if (alg == 0) main_canv.drawSegment(x1, y1, endx, endy, color);
    else {
      algs[alg - 1].draw(main_canv.getBuf(), x1, y1, endx, endy, rgbcolor);
      main_canv.drawImageData();
    }
  }
});

//#endregion

//#region graphs

const measure_canvas: HTMLCanvasElement = document.createElement("canvas");
measure_canvas.width = 10000;
measure_canvas.height = 10000;
const measure_ctx: CanvasRenderingContext2D = measure_canvas.getContext("2d")!;

const hist_canvas: HTMLCanvasElement = document.querySelector("#hist")!;

let hist_chart: Chart | undefined = undefined;

function buildTimeChart() {
  if (!start_x_input.validateInput())
    return out.error(`Ошибка ввода координаты x начальной точки`);
  if (!start_y_input.validateInput())
    return out.error(`Ошибка ввода координаты y начальной точки`);
  if (!end_x_input.validateInput())
    return out.error(`Ошибка ввода координаты x конечной точки`);
  if (!end_y_input.validateInput())
    return out.error(`Ошибка ввода координаты y конечной точки`);

  let x1 = start_x_input.value();
  let y1 = start_y_input.value();
  let x2 = end_x_input.value();
  let y2 = end_y_input.value();
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

  if (hist_chart !== undefined) hist_chart.destroy();
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

button_build_hist.addEventListener("click", () => {
  buildTimeChart();
});

function toRad(angle_deg: number) {
  return (angle_deg / 180) * Math.PI;
}

const amount_canvas: HTMLCanvasElement =
  document.querySelector("#graph-amount")!;
const length_canvas: HTMLCanvasElement =
  document.querySelector("#graph-length")!;

let stepcount_chart: Chart | undefined = undefined;
let steplen_chart: Chart | undefined = undefined;

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
    let x2 = len * Math.cos(a);
    let y2 = len * Math.sin(a);
    stepcounts.push(alg.countSteps(x1, y1, x2, y2));
    steplens.push(alg.measureStep(x1, y1, x2, y2));
  }

  if (stepcount_chart != undefined) stepcount_chart.destroy();
  if (steplen_chart != undefined) steplen_chart.destroy();

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

button_build_graphs.addEventListener("click", () => {
  buildStatGraphs();
});

//#endregion
