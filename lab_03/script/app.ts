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

const pointer_x: HTMLDivElement = document.querySelector("#pointer-x")!;
const pointer_y: HTMLDivElement = document.querySelector("#pointer-y")!;

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

// canvas width
const width_input: NumberInput = new NumberInput(
  document.querySelector("#i-side-length")!
);

// line color
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

// coords
const input_x1: HTMLInputElement = document.querySelector("#start-x")!;
const input_y1: HTMLInputElement = document.querySelector("#start-y")!;
const input_x2: HTMLInputElement = document.querySelector("#end-x")!;
const input_y2: HTMLInputElement = document.querySelector("#end-y")!;
const start_x_input: NumberInput = new NumberInput(input_x1);
const start_y_input: NumberInput = new NumberInput(input_y1);
const end_x_input: NumberInput = new NumberInput(input_x2);
const end_y_input: NumberInput = new NumberInput(input_y2);

const input_beams: HTMLInputElement = document.querySelector("#beam_amount")!;
const sun_beams_input: NumberInput = new NumberInput(input_beams);

// buttons
const input_side: HTMLInputElement = document.querySelector("#i-side-length")!;
const side_input: NumberInput = new NumberInput(input_side);
const button_side: HTMLInputElement = document.querySelector("#set_width")!;

// const button_: HTMLInputElement = document.querySelector("#")!;
const button_draw_seg: HTMLInputElement =
  document.querySelector("#draw_segment")!;

const button_clear_image: HTMLInputElement =
  document.querySelector("#clear-image")!;

const button_build_hist: HTMLInputElement =
  document.querySelector("#build-hist")!;

const button_build_graphs: HTMLInputElement =
  document.querySelector("#build_graphs")!;

const button_build_sun: HTMLInputElement = document.querySelector("#draw_sun")!;
//#endregion inputs

//#region algs

function fpart(x: number) {
  return x - floor(x);
}

function rfpart(x: number) {
  return 1 - fpart(x);
}

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

class LineAlg {
  static draw(
    dst: ImageData,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: RGBColor,
    profiling = false
  ): void {
    return;
  }

  static countSteps(x1: number, y1: number, x2: number, y2: number): number {
    return 0;
  }

  static measureStep(x1: number, y1: number, x2: number, y2: number): number {
    return 0;
  }

  static setPixel(
    buf: ImageData,
    x: number,
    y: number,
    color: RGBColor,
    alpha: number
  ): void {
    if (x < 0 || x >= buf.width) return;
    if (y < 0 || y >= buf.height) return;

    let tmp = (round(x) + round(y) * buf.width) * 4;
    buf.data[tmp] = color.r;
    buf.data[tmp + 1] = color.g;
    buf.data[tmp + 2] = color.b;
    buf.data[tmp + 3] = alpha;
  }
}

class DDA extends LineAlg {
  static draw(
    dst: ImageData,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: RGBColor,
    profiling = false
  ) {
    if (!profiling) out.log("Работает Алгоритм ЦДА");
    if (x1 == x2 && y1 == y2) return this.setPixel(dst, x1, y1, color, 255);

    let l = max(abs(x2 - x1), abs(y2 - y1));

    let dx = (x2 - x1) / l;
    let dy = (y2 - y1) / l;

    let x = x1;
    let y = y1;

    for (let i = 0; i <= l; ++i) {
      this.setPixel(dst, x, y, color, 255);
      x += dx;
      y += dy;
    }
  }

  static countSteps(x1: number, y1: number, x2: number, y2: number) {
    if (x1 == x2 && y1 == y2) return 0;

    let measureX: boolean = false;
    let l;

    if (abs(x2 - x1) > abs(y2 - y1)) {
      l = abs(x2 - x1);
    } else {
      l = abs(y2 - y1);
      measureX = true;
    }

    let dx = (x2 - x1) / l;
    let dy = (y2 - y1) / l;

    let x = x1;
    let y = y1;

    let stepcount = 1;
    let prev_val = measureX ? x : y;
    for (let i = 0; i < l + 1; ++i) {
      if (measureX) {
        if (round(prev_val) != round(x)) ++stepcount;
      } else if (round(prev_val) != round(y)) ++stepcount;

      prev_val = measureX ? x : y;
      x += dx;
      y += dy;
    }

    return stepcount;
  }

  static measureStep(x1: number, y1: number, x2: number, y2: number) {
    if (x1 == x2 && y1 == y2) return 1;

    let measureX: boolean = false;
    let l;

    if (abs(x2 - x1) > abs(y2 - y1)) {
      l = abs(x2 - x1);
    } else {
      l = abs(y2 - y1);
      measureX = true;
    }

    let dx = (x2 - x1) / l;
    let dy = (y2 - y1) / l;

    let x = x1;
    let y = y1;

    let maxsteplen = 0;
    let steplen = 1;
    let stepping = true;

    let prev_val = measureX ? x : y;
    for (let i = 0; i <= l; ++i) {
      if (measureX) {
        if (round(prev_val) == round(x)) {
          steplen++;
          stepping = true;
        } else if (stepping) {
          maxsteplen = max(maxsteplen, steplen);
          steplen = 1;
          stepping = false;
        }
      } else {
        if (round(prev_val) == round(y)) {
          steplen++;
          stepping = true;
        } else if (stepping) {
          maxsteplen = max(maxsteplen, steplen);
          steplen = 1;
          stepping = false;
        }
      }

      prev_val = measureX ? x : y;
      x += dx;
      y += dy;
    }

    maxsteplen = max(maxsteplen, steplen);

    return maxsteplen;
  }
}

class BresenhamReal extends LineAlg {
  static draw(
    dst: ImageData,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: RGBColor,
    profiling = false
  ): void {
    if (!profiling) out.log("Работает Алгоритм Брезенхема на действ. числах");
    // Проверка вырожденности	отрезка.
    // Если	отрезок вырожденный, то высвечивается точка и осуществляется выход.
    if (x1 == x2 && y1 == y2) return this.setPixel(dst, x1, y1, color, 255);

    let x = x1;
    let y = y1;

    // Вычисление приращений  dX=Xк-Xн и  dY=Yк-Yн.
    let dx = x2 - x1;
    let dy = y2 - y1;

    // Вычисление шага изменения каждой координаты пиксела: SX=sign(dX), SY=sign(dY).
    let sx = Math.sign(dx);
    let sy = Math.sign(dy);

    // Вычисление модулей приращения координат: dX = |dX|, dY = |dY|
    dx = abs(dx);
    dy = abs(dy);

    // Вычисление модуля тангенса угла наклона отрезка: m = dY/dX.

    // Анализ вычисленного значения m и обмен местами dX и dY при m>1:
    //      если m>1, то выполнить
    //      W=dX,
    //      dX=dY,
    //      dY=W,
    //      m=1/m,
    //      fl=1;
    //      если m<1, то fl=0
    let steep = false;
    if (dy > dx) {
      steep = true;

      let buf = dx;
      dx = dy;
      dy = buf;
    }

    let tan_abs = dy / dx;

    // Инициализация начального значения ошибки: f=m-0,5
    let f = tan_abs - 0.5;

    //  Инициализация начальных значений координат текущего пиксела:
    //  X=Xн, Y=Yн

    for (let i = 0; i < dx; ++i) {
      if (!profiling) this.setPixel(dst, x, y, color, 255);

      if (f >= 0) {
        if (steep) x += sx;
        else y += sy;

        f -= 1;
      }

      if (steep) y += sy;
      else x += sx;
      f += tan_abs;
    }
  }

  static countSteps(x1: number, y1: number, x2: number, y2: number): number {
    if (x1 == x2 && y1 == y2) return 0;

    let dx = x2 - x1;
    let dy = y2 - y1;

    let sx = Math.sign(dx);
    let sy = Math.sign(dy);

    dx = abs(dx);
    dy = abs(dy);

    let tan_abs = dy / dx;

    let swapflag = false;
    if (tan_abs > 1) {
      let buf = dx;
      dx = dy;
      dy = buf;
      tan_abs = 1 / tan_abs;
      swapflag = true;
    }

    let f = tan_abs - 0.5;

    let x = x1;
    let y = y1;

    let measureX: boolean = abs(x2 - x1) < abs(y2 - y1);
    let stepcount = 1;
    let prev_val = measureX ? x : y;

    for (let i = 0; i < dx + 1; ++i) {
      if (measureX) {
        if (prev_val != x) ++stepcount;
      } else if (prev_val != y) ++stepcount;
      prev_val = measureX ? x : y;

      if (f >= 0) {
        if (swapflag) x += sx;
        else y += sy;
        f = f - 1;
      }
      if (f < 0) {
        if (swapflag) y += sy;
        else x += sx;
      }
      f += tan_abs;
    }

    return stepcount;
  }

  static measureStep(x1: number, y1: number, x2: number, y2: number): number {
    if (x1 == x2 && y1 == y2) return 1;

    let dx = x2 - x1;
    let dy = y2 - y1;

    let sx = Math.sign(dx);
    let sy = Math.sign(dy);

    dx = abs(dx);
    dy = abs(dy);

    let tan_abs = dy / dx;

    let swapflag = false;
    if (tan_abs > 1) {
      let buf = dx;
      dx = dy;
      dy = buf;
      tan_abs = 1 / tan_abs;
      swapflag = true;
    }

    let f = tan_abs - 0.5;

    let x = x1;
    let y = y1;

    let measureX: boolean = abs(x2 - x1) < abs(y2 - y1);
    let maxsteplen = 0;
    let steplen = 1;
    let stepping = true;
    let prev_val = measureX ? x : y;

    for (let i = 0; i < dx + 1; ++i) {
      if (measureX) {
        if (prev_val == x) {
          steplen++;
          stepping = true;
        } else if (stepping) {
          maxsteplen = max(maxsteplen, steplen);
          steplen = 1;
          stepping = false;
        }
      } else {
        if (prev_val == y) {
          steplen++;
          stepping = true;
        } else if (stepping) {
          maxsteplen = max(maxsteplen, steplen);
          steplen = 1;
          stepping = false;
        }
      }
      prev_val = measureX ? x : y;

      if (f >= 0) {
        if (swapflag) x += sx;
        else y += sy;
        f = f - 1;
      }
      if (f < 0) {
        if (swapflag) y += sy;
        else x += sx;
      }
      f += tan_abs;
    }

    maxsteplen = max(maxsteplen, steplen);

    return maxsteplen;
  }
}

class BresenhamInt extends LineAlg {
  static draw(
    dst: ImageData,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: RGBColor,
    profiling = false
  ): void {
    if (!profiling) out.log("Работает Целочисленный Алгоритм Брезенхема");
    if (x1 == x2 && y1 == y2) return this.setPixel(dst, x1, y1, color, 255);

    let x = x1;
    let y = y1;

    let dx = x2 - x1;
    let dy = y2 - y1;

    let sx = Math.sign(dx);
    let sy = Math.sign(dy);

    dx = abs(dx);
    dy = abs(dy);

    let steep = false;
    if (dy > dx) {
      steep = true;
      let buf = dx;
      dx = dy;
      dy = buf;
    }

    let f = 2 * dy - dx;

    for (let i = 0; i < dx; ++i) {
      if (!profiling) this.setPixel(dst, x, y, color, 255);

      if (f >= 0) {
        if (steep) x += sx;
        else y += sy;

        f -= 2 * dx;
      }

      if (steep) y += sy;
      else x += sx;
      f += 2 * dy;
    }
  }

  static countSteps(x1: number, y1: number, x2: number, y2: number): number {
    if (x1 == x2 && y1 == y2) return 0;

    let dx = x2 - x1;
    let dy = y2 - y1;

    let sx = Math.sign(dx);
    let sy = Math.sign(dy);

    dx = abs(dx);
    dy = abs(dy);

    let tan_abs = dy / dx;

    let swapflag = false;
    if (tan_abs > 1) {
      let buf = dx;
      dx = dy;
      dy = buf;
      tan_abs = 1 / tan_abs;
      swapflag = true;
    }

    let f = 2 * dy - dx;

    let x = x1;
    let y = y1;

    let measureX: boolean = abs(x2 - x1) < abs(y2 - y1);
    let stepcount = 1;
    let prev_val = measureX ? x : y;

    for (let i = 0; i < dx + 1; ++i) {
      if (measureX) {
        if (prev_val != x) ++stepcount;
      } else if (prev_val != y) ++stepcount;
      prev_val = measureX ? x : y;

      if (f > 0) {
        if (swapflag) x += sx;
        else y += sy;
        f -= 2 * dx;
      }
      if (f < 0) {
        if (swapflag) y += sy;
        else x += sx;
      }
      f += 2 * dy;
    }

    return stepcount;
  }

  static measureStep(x1: number, y1: number, x2: number, y2: number): number {
    if (x1 == x2 && y1 == y2) return 1;

    let dx = x2 - x1;
    let dy = y2 - y1;

    let sx = Math.sign(dx);
    let sy = Math.sign(dy);

    dx = abs(dx);
    dy = abs(dy);

    let tan_abs = dy / dx;

    let swapflag = false;
    if (tan_abs > 1) {
      let buf = dx;
      dx = dy;
      dy = buf;
      tan_abs = 1 / tan_abs;
      swapflag = true;
    }

    let f = 2 * dy - dx;

    let x = x1;
    let y = y1;

    let measureX: boolean = abs(x2 - x1) < abs(y2 - y1);
    let maxsteplen = 0;
    let steplen = 1;
    let stepping = true;
    let prev_val = measureX ? x : y;

    for (let i = 0; i < dx + 1; ++i) {
      if (measureX) {
        if (prev_val == x) {
          steplen++;
          stepping = true;
        } else if (stepping) {
          maxsteplen = max(maxsteplen, steplen);
          steplen = 1;
          stepping = false;
        }
      } else {
        if (prev_val == y) {
          steplen++;
          stepping = true;
        } else if (stepping) {
          maxsteplen = max(maxsteplen, steplen);
          steplen = 1;
          stepping = false;
        }
      }
      prev_val = measureX ? x : y;

      if (f > 0) {
        if (swapflag) x += sx;
        else y += sy;
        f -= 2 * dx;
      }
      if (f < 0) {
        if (swapflag) y += sy;
        else x += sx;
      }
      f += 2 * dy;
    }

    maxsteplen = max(maxsteplen, steplen);

    return maxsteplen;
  }
}

class BresenhamAntiAlias extends LineAlg {
  static draw(
    dst: ImageData,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: RGBColor,
    profiling = false
  ): void {
    if (!profiling)
      out.log("Работает Алгоритм Брезенхема с устранением ступенчатости");

    if (x1 == x2 && y1 == y2) return this.setPixel(dst, x1, y1, color, 255);
    let I = 255;

    let dX = x2 - x1;
    let dY = y2 - y1;

    let sX = Math.sign(dX);
    let sY = Math.sign(dY);

    dX = abs(dX);
    dY = abs(dY);

    let steep = false;
    if (dY > dX) {
      steep = true;
      let buf = dX;
      dX = dY;
      dY = buf;
    }

    let m = (I * dY) / dX;
    let w = I - m;
    let e = 0.5 * I;

    let x = x1;
    let y = y1;

    for (let i = 0; i < dX; ++i) {
      this.setPixel(dst, x, y, color, round(e));
      if (e < w) {
        if (!steep) x += sX;
        else y += sY;
        e = e + m;
      } else {
        x += sX;
        y += sY;
        e -= w;
      }
    }
  }

  static countSteps(x1: number, y1: number, x2: number, y2: number): number {
    return BresenhamReal.countSteps(x1, y1, x2, y2);
  }

  static measureStep(x1: number, y1: number, x2: number, y2: number): number {
    return BresenhamReal.measureStep(x1, y1, x2, y2);
  }
}

class Wu extends LineAlg {
  static draw(
    dst: ImageData,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: RGBColor,
    profiling = false
  ): void {
    if (!profiling) out.log("Работает Алгоритм Ву");

    if (abs(x1 - x2) < EPS && abs(y1 - y2) < EPS)
      return this.setPixel(dst, x1, y1, color, 255);

    let steep: boolean = abs(y2 - y1) > abs(x2 - x1);

    if (steep) {
      let buf: number = x1;
      x1 = y1;
      y1 = buf;

      buf = x2;
      x2 = y2;
      y2 = buf;
    }

    if (x1 > x2) {
      let buf: number = x1;
      x1 = x2;
      x2 = buf;

      buf = y2;
      y2 = y1;
      y1 = buf;
    }

    let dx = x2 - x1;
    let dy = y2 - y1;
    let gradient: number;

    if (abs(dx) < EPS) gradient = 1;
    else gradient = dy / dx;

    let xend = round(x1);
    let yend = y1 + gradient * (xend - x1);
    let xgap = rfpart(x1 + 0.5);

    let xpx1 = xend;
    let ypx1 = floor(yend);

    if (steep) {
      this.setPixel(dst, ypx1, xpx1, color, rfpart(yend) * xgap * 255);
      this.setPixel(dst, ypx1 + 1, xpx1, color, fpart(yend) * xgap * 255);
    } else {
      this.setPixel(dst, xpx1, ypx1, color, rfpart(yend) * xgap * 255);
      this.setPixel(dst, xpx1, ypx1 + 1, color, fpart(yend) * xgap * 255);
    }

    let intersectY = yend + gradient;

    xend = round(x2);
    yend = y2 + gradient * (xend - x2);
    xgap = rfpart(x2 + 0.5);

    let xpx2 = xend;
    let ypx2 = floor(yend);

    if (steep) {
      this.setPixel(dst, ypx2, xpx2, color, rfpart(yend) * xgap * 255);
      this.setPixel(dst, ypx2 + 1, xpx2, color, fpart(yend) * xgap * 255);
    } else {
      this.setPixel(dst, xpx2, ypx2, color, rfpart(yend) * xgap * 255);
      this.setPixel(dst, xpx2, ypx2 + 1, color, fpart(yend) * xgap * 255);
    }

    let sx = Math.sign(xpx2 - xpx1);

    if (steep) {
      for (let x = xpx1 + 1; x != xpx2; x += sx) {
        this.setPixel(
          dst,
          floor(intersectY),
          x,
          color,
          rfpart(intersectY) * 255
        );
        this.setPixel(
          dst,
          floor(intersectY) + 1,
          x,
          color,
          fpart(intersectY) * 255
        );

        intersectY += gradient;
      }
    } else {
      for (let x = xpx1 + 1; x != xpx2; x += sx) {
        this.setPixel(
          dst,
          x,
          floor(intersectY),
          color,
          rfpart(intersectY) * 255
        );
        this.setPixel(
          dst,
          x,
          floor(intersectY) + 1,
          color,
          fpart(intersectY) * 255
        );

        intersectY += gradient;
      }
    }
  }

  static countSteps(x1: number, y1: number, x2: number, y2: number): number {
    let steep: boolean = abs(y2 - y1) > abs(x2 - x1);

    if (steep) {
      let buf: number = x1;
      x1 = y1;
      y1 = buf;

      buf = x2;
      x2 = y2;
      y2 = buf;
    }

    if (x1 > x2) {
      let buf: number = x1;
      x1 = x2;
      x1 = buf;

      buf = y2;
      y2 = y1;
      y1 = buf;
    }

    let dx = x2 - x1;
    let dy = y2 - y1;
    let gradient: number;

    if (abs(dx) < EPS) gradient = 1;
    else gradient = dy / dx;

    let xend = round(x1);
    let yend = y1 + gradient * (xend - x1);

    let xpx1 = xend;
    let ypx1 = floor(yend);

    let intersectY = yend + gradient;

    xend = round(x2);
    yend = y2 + gradient * (xend - x2);

    let xpx2 = xend;
    // let ypx2 = floor(yend);

    let prev_val = steep ? ypx1 : xpx1;
    let stepcount = 1;

    for (let x = xpx1; x <= xpx2; ++x) {
      if (prev_val != floor(intersectY)) ++stepcount;
      prev_val = floor(intersectY);
      intersectY += gradient;
    }

    return stepcount;
  }

  static measureStep(x1: number, y1: number, x2: number, y2: number): number {
    let steep: boolean = abs(y2 - y1) > abs(x2 - x1);

    if (steep) {
      let buf: number = x1;
      x1 = y1;
      y1 = buf;

      buf = x2;
      x2 = y2;
      y2 = buf;
    }

    if (x1 > x2) {
      let buf: number = x1;
      x1 = x2;
      x1 = buf;

      buf = y2;
      y2 = y1;
      y1 = buf;
    }

    let dx = x2 - x1;
    let dy = y2 - y1;
    let gradient: number;

    if (abs(dx) < EPS) gradient = 1;
    else gradient = dy / dx;

    let xend = round(x1);
    let yend = y1 + gradient * (xend - x1);

    let xpx1 = xend;
    let ypx1 = floor(yend);

    let intersectY = yend + gradient;

    xend = round(x2);
    yend = y2 + gradient * (xend - x2);

    let xpx2 = xend;

    let maxsteplen = 0;
    let steplen = 1;
    let stepping = true;
    let prev_val = steep ? ypx1 : xpx1;

    for (let x = xpx1; x <= xpx2; ++x) {
      if (prev_val == floor(intersectY)) {
        steplen++;
        stepping = true;
      } else if (stepping) {
        maxsteplen = max(maxsteplen, steplen);
        steplen = 1;
        stepping = false;
      }
      prev_val = floor(intersectY);
      intersectY += gradient;
    }

    maxsteplen = max(maxsteplen, steplen);

    return maxsteplen;
  }
}

addEventListener("scrollend", () => {
  console.log("scrollend");
});

//#endregion algs

//#region graphics

function sumImageData(from: ImageData, to: ImageData) {
  for (let i = 0; i < to.width * to.height * 4; ++i) to.data[i] = from.data[i];
}

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

  drawSegment(x1: number, y1: number, x2: number, y2: number, color: string) {
    this.ctx.putImageData(this.image, 0, 0);

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.closePath();
    this.ctx.stroke();

    this.image = this.ctx.getImageData(0, 0, this.width, this.height);

    this.drawImageData();
  }

  getBuf(): ImageData {
    return this.image;
  }

  getNewBuf(): ImageData {
    return this.ctx.createImageData(this.width, this.height);
  }

  putImageData(img: ImageData) {
    this.image = img;
    this.drawImageData();
  }

  addImageData(img: ImageData) {
    sumImageData(this.image, img);
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

const main_canv = new Graphics(main_canvas.getContext("2d")!, 300);

//#endregion graphics

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

let hist_chart: any = undefined;

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
