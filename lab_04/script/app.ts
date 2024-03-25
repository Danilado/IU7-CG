"use strict";

const floor = Math.floor;
const round = Math.round;
const max = Math.max;
const abs = Math.abs;

const RUN_COUNT = 1e5;
const ANGLE_FROM = 0;
const ANGLE_TO = 90;
const DEBUG = false;
const EPS = 1e-6;

let dark = false;

function range(start: number, end: number) {
  let step = Math.sign(end - start);
  let ret: number[] = [];

  for (let i = start; i != end; i += step) ret.push(i);

  return ret;
}

//#region labels
const canvasWidthLabel: HTMLSpanElement = document.querySelector(".c-width")!;
const canvasHeightLabel: HTMLSpanElement = document.querySelector(".c-height")!;

const change_theme: HTMLInputElement = document.querySelector("#themechange")!;

const pointer_x: HTMLDivElement = document.querySelector("#pointer-center")!;

change_theme.addEventListener("click", () => {
  dark = !dark;
  let everything = document.querySelectorAll("*");
  if (dark)
    for (let node of everything) {
      node.classList.add("dark");
    }
  else
    for (let node of everything) {
      node.classList.remove("dark");
    }
});

change_theme.click();

class Output {
  node: HTMLDivElement;
  constructor(node: HTMLDivElement) {
    this.node = node;
  }

  write(text: string, prefix: string) {
    this.node.innerHTML += prefix + text.replace(/\n/, "<br />") + "<br />";
    this.scrollToBottom();
  }

  clear() {
    this.node.innerHTML = ``;
  }

  warn(text: string) {
    if (DEBUG) this.write(text, "WARN: ");
  }

  log(text: string) {
    if (DEBUG) this.write(text, "LOG: ");
  }

  error(text: string) {
    this.write(text, "ERROR: ");
  }

  scrollToBottom() {
    this.node.scroll(0, this.node.scrollHeight);
  }
}

const output_node: HTMLDivElement = document.querySelector(".footertext")!;
const out: Output = new Output(output_node);

//#endregion labels

//#region inputs
class NumberInput {
  node: HTMLInputElement;

  constructor(node: HTMLInputElement) {
    this.node = node;
  }

  validateInput(minN: number = -Infinity, maxN: number = Infinity): boolean {
    let tmp = Number(this.node.value);
    if (Number.isNaN(tmp)) return false;
    if (tmp < minN) return false;
    if (tmp > maxN) return false;
    return true;
  }

  value(minN: number = -Infinity, maxN: number = Infinity) {
    let tmp = Number(this.node.value);
    if (Number.isNaN(tmp)) return tmp;
    if (tmp < minN) return minN;
    if (tmp > maxN) return maxN;
    return tmp;
  }
}

class ColorInput {
  node: HTMLInputElement;

  constructor(node: HTMLInputElement) {
    this.node = node;
  }

  validateInput(): boolean {
    return CSS.supports("color", this.node.value);
  }

  value() {
    return this.node.value;
  }
}

const i_color_node: HTMLInputElement = document.querySelector("#i-color")!;
const color_input: ColorInput = new ColorInput(i_color_node);

const set_color_default: HTMLInputElement =
  document.querySelector("#set_default_color")!;
set_color_default.addEventListener("click", () => {
  i_color_node.value = "#000000";
});
const set_color_bg: HTMLInputElement = document.querySelector("#set_bg_color")!;
set_color_bg.addEventListener("click", () => {
  i_color_node.value = "#ffffff";
});

const center_x: HTMLInputElement = document.querySelector("#center-x")!;
const center_x_input: NumberInput = new NumberInput(center_x);

const center_y: HTMLInputElement = document.querySelector("#center-y")!;
const center_y_input: NumberInput = new NumberInput(center_y);

const circle_r: HTMLInputElement = document.querySelector("#circle-radius")!;
const circle_r_input: NumberInput = new NumberInput(circle_r);
const button_build_circle: HTMLInputElement =
  document.querySelector("#build-circle")!;

const input_side: HTMLInputElement = document.querySelector("#i-side-length")!;
const side_input: NumberInput = new NumberInput(input_side);
const button_side: HTMLInputElement = document.querySelector("#set_width")!;

const eliipse_r_x: HTMLInputElement = document.querySelector("#ellipse-x")!;
const eliipse_r_x_input: NumberInput = new NumberInput(eliipse_r_x);
const eliipse_r_y: HTMLInputElement = document.querySelector("#ellipse-y")!;
const eliipse_r_y_input: NumberInput = new NumberInput(eliipse_r_y);
const button_build_ellipse: HTMLInputElement =
  document.querySelector("#build-ellipse")!;

//#region circ-specter

const circ_specter_r_start: HTMLInputElement =
  document.querySelector("#circle-specter-r1")!;
const circ_specter_r_start_input: NumberInput = new NumberInput(
  circ_specter_r_start
);
const circ_specter_r_end: HTMLInputElement =
  document.querySelector("#circle-specter-r2")!;
const circ_specter_r_end_input: NumberInput = new NumberInput(
  circ_specter_r_end
);
const circ_specter_r_step: HTMLInputElement = document.querySelector(
  "#circle-specter-step"
)!;
const circ_specter_r_step_input: NumberInput = new NumberInput(
  circ_specter_r_step
);
const circ_specter_amount: HTMLInputElement = document.querySelector(
  "#circle-specter-amount"
)!;
const circ_specter_amount_input: NumberInput = new NumberInput(
  circ_specter_amount
);
const button_build_circ_specter: HTMLInputElement = document.querySelector(
  "#build-circle-specter"
)!;

//#endregion

//#region ellipse-specter

const el_specter_r_start: HTMLInputElement = document.querySelector(
  "#ellipse-specter-r1"
)!;
const el_specter_r_start_input: NumberInput = new NumberInput(
  el_specter_r_start
);
const el_specter_r_end: HTMLInputElement = document.querySelector(
  "#ellipse-specter-r2"
)!;
const el_specter_r_end_input: NumberInput = new NumberInput(el_specter_r_end);
const el_specter_r_step: HTMLInputElement = document.querySelector(
  "#ellipse-specter-step"
)!;
const el_specter_r_step_input: NumberInput = new NumberInput(el_specter_r_step);
const button_build_el_specter: HTMLInputElement = document.querySelector(
  "#build-ellipse-specter"
)!;

//#endregion

const button_build_graphs: HTMLInputElement =
  document.querySelector("#build-graphs")!;

const button_clear_image: HTMLInputElement =
  document.querySelector("#clear-image")!;

// const : HTMLInputElement = document.querySelector("#")!;
// const _input: NumberInput = new NumberInput();
// const button_: HTMLInputElement = document.querySelector("#")!;
//#endregion inputs

//#region algs

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

function reverseString(str: string) {
  var splitString = str.split("");
  var reverseArray = splitString.reverse();
  var joinArray = reverseArray.join("");
  return joinArray;
}

function HEXtoInt(s: string): number {
  return parseInt(s, 16);
}

function HEXtoRGB(s: string): RGBColor {
  s = s.replace(/#/, "");
  return <RGBColor>{
    r: HEXtoInt(s[0] + s[1]),
    g: HEXtoInt(s[2] + s[3]),
    b: HEXtoInt(s[4] + s[5]),
  };
}

interface Pixel {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
}

function setPixel(buf: ImageData, pix: Pixel): void {
  if (pix.x < 0 || pix.x >= buf.width) return;
  if (pix.y < 0 || pix.y >= buf.height) return;

  let tmp = (round(pix.x) + round(pix.y) * buf.width) * 4;
  buf.data[tmp] = pix.r;
  buf.data[tmp + 1] = pix.g;
  buf.data[tmp + 2] = pix.b;
  buf.data[tmp + 3] = pix.alpha;
}

interface Axis {
  x: number;
  y: number;
}

function mirrorPixVertical(pix: Pixel, origin: number) {
  return <Pixel>{
    x: 2 * origin - pix.x,
    y: pix.y,
    r: pix.r,
    g: pix.g,
    b: pix.b,
    alpha: pix.alpha,
  };
}

function mirrorPixHorizontal(pix: Pixel, origin: number) {
  return <Pixel>{
    x: pix.x,
    y: 2 * origin - pix.y,
    r: pix.r,
    g: pix.g,
    b: pix.b,
    alpha: pix.alpha,
  };
}

function setSymPixels(buf: ImageData, pix: Pixel, origin: Axis) {
  setPixel(buf, pix);
  setPixel(buf, mirrorPixHorizontal(pix, origin.y));
  setPixel(buf, mirrorPixVertical(pix, origin.x));
  setPixel(
    buf,
    mirrorPixHorizontal(mirrorPixVertical(pix, origin.x), origin.y)
  );
}

function buildCircleCanonical(
  buf: ImageData,
  cx: number,
  cy: number,
  r: number,
  color: RGBColor,
  profiling: boolean = false
) {
  let r_sqr = r ** 2;

  let border = round(cx + r / Math.sqrt(2));

  for (let x = cx; x < border - 1; ++x) {
    let y = cy + Math.sqrt(r_sqr - (x - cx) ** 2);
    if (!profiling)
      setSymPixels(
        buf,
        <Pixel>{
          x: x,
          y: y,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
  }
}

function buildEllipseCanonical(
  buf: ImageData,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: RGBColor,
  profiling: boolean = false
) {
  let rx_sqr = rx * rx;
  let ry_sqr = ry * ry;

  let border_x = round(cx + rx / Math.sqrt(1 + ry_sqr / rx_sqr));
  let border_y = round(cy + ry / Math.sqrt(1 + rx_sqr / ry_sqr));

  for (let x = cx; x < border_x + 1; ++x) {
    let y = cy + Math.sqrt(rx_sqr * ry_sqr - (x - cx) ** 2 * ry_sqr) / rx;
    if (!profiling)
      setSymPixels(
        buf,
        <Pixel>{
          x: x,
          y: y,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
  }

  for (let y = border_y; y > cy - 1; --y) {
    let x = cx + Math.sqrt(rx_sqr * ry_sqr - (y - cy) ** 2 * rx_sqr) / ry;
    if (!profiling)
      setSymPixels(
        buf,
        <Pixel>{
          x: x,
          y: y,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
  }
}

//#endregion algs

//#region graphics

interface coords {
  x: number;
  y: number;
}

class Graphics {
  renderer: CanvasRenderingContext2D;
  ctx: CanvasRenderingContext2D;
  image: ImageData;
  ar: number;

  private _width: number;
  public get width(): number {
    return this._width;
  }
  public set width(v: number) {
    this._width = v;
    this._height = floor(this._width / this.ar);

    canvasWidthLabel.innerHTML = `${this._width}`;
    canvasHeightLabel.innerHTML = `${this._height}`;

    this.resetImage();
  }

  private _height: number;
  public get height(): number {
    return this._height;
  }
  public set height(v: number) {
    this._height = floor(v);
    this._width = floor(this._height * this.ar);

    canvasWidthLabel.innerHTML = `${this._width}`;
    canvasHeightLabel.innerHTML = `${this._height}`;

    this.resetImage();
  }

  constructor(renderer: CanvasRenderingContext2D, width: number) {
    this.renderer = renderer;
    this.renderer.imageSmoothingEnabled = false;

    this.ctx = document.createElement("canvas").getContext("2d")!;
    this.ctx.lineWidth = 1;
    this.renderer.lineWidth = 1;

    this.ar =
      this.renderer.canvas.getBoundingClientRect().width /
      this.renderer.canvas.getBoundingClientRect().height;

    this._width = width;
    this._height = floor(this._width / this.ar);

    this.width = width;

    this.image = this.ctx.createImageData(this.width, this.height);

    this.drawImageData();
  }

  drawCircle(x_c: number, y_c: number, r: number, color: string) {
    this.ctx.putImageData(this.image, 0, 0);

    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x_c, y_c, r, 0, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.stroke();

    this.image = this.ctx.getImageData(0, 0, this.width, this.height);

    this.drawImageData();
  }

  drawEllipse(
    x_c: number,
    y_c: number,
    r_x: number,
    r_y: number,
    color: string
  ) {
    this.ctx.putImageData(this.image, 0, 0);

    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.ellipse(x_c, y_c, r_x, r_y, 0, 0, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.stroke();

    this.image = this.ctx.getImageData(0, 0, this.width, this.height);

    this.drawImageData();
  }

  getBuf(): ImageData {
    return this.image;
  }

  putImageData(img: ImageData) {
    this.image = img;
    this.drawImageData();
  }

  drawImageData() {
    this.renderer.clearRect(
      0,
      0,
      this.renderer.canvas.width,
      this.renderer.canvas.height
    );
    this.ctx.putImageData(this.image, 0, 0);
    this.renderer.drawImage(
      this.ctx.canvas,
      0,
      0,
      this.width * this.getPixelSize(),
      floor(this.height) * this.getPixelSize()
    );
  }

  resizeCtx() {
    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height = this.height;
  }

  clearCtx() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  resetImage() {
    this.ar =
      this.renderer.canvas.getBoundingClientRect().width /
      this.renderer.canvas.getBoundingClientRect().height;
    this._height = this._width / this.ar;

    this.resizeCtx();
    this.clearCtx();
    this.image = this.ctx.createImageData(this.width, this.height);
    this.drawImageData();
  }

  getDocumentCoords(x: number, y: number) {
    let documentStuff = this.renderer.canvas.getBoundingClientRect();

    let baseX = documentStuff.x;
    let baseY = documentStuff.y;

    return <coords>{
      x: baseX + (x / this.width) * documentStuff.width,
      y: baseY + (y / this.height) * documentStuff.height,
    };
  }

  getPixelSize() {
    return this.renderer.canvas.getBoundingClientRect().width / this.width;
  }
}

const main_canvas: HTMLCanvasElement = document.querySelector("#main_canvas")!;
main_canvas.width = main_canvas.getBoundingClientRect().width;
main_canvas.height = main_canvas.getBoundingClientRect().height;

const main_canv = new Graphics(
  main_canvas.getContext("2d")!,
  main_canvas.width
);

//#endregion graphics

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

const algs = [undefined];

const radiobuttons = document.querySelectorAll("input[type='radio']");

function getChosenAlgIndex() {
  let count: number = 0;
  radiobuttons.forEach((button, i) => {
    let bt = button as HTMLInputElement;
    if (bt.checked) count = i;
  });
  return count;
}

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
//#endregion

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
    let x2 = len * Math.cos(a);
    let y2 = len * Math.sin(a);
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

button_build_graphs.addEventListener("click", () => {
  buildStatGraphs();
});

//#endregion
