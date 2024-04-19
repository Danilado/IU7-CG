import { floor, round, max, abs, EPS } from "./constants";
import { out } from "./labels";

function setPixel(
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

export function reverseString(str: string) {
  var splitString = str.split("");
  var reverseArray = splitString.reverse();
  var joinArray = reverseArray.join("");
  return joinArray;
}

export function HEXtoInt(s: string): number {
  return parseInt(s, 16);
}

export function HEXtoRGB(s: string): RGBColor {
  s = s.replace(/#/, "");
  return <RGBColor>{
    r: HEXtoInt(s[0] + s[1]),
    g: HEXtoInt(s[2] + s[3]),
    b: HEXtoInt(s[4] + s[5]),
  };
}

export class DDA {
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
    if (x1 == x2 && y1 == y2) return setPixel(dst, x1, y1, color, 255);

    let l = max(abs(x2 - x1), abs(y2 - y1));

    let dx = (x2 - x1) / l;
    let dy = (y2 - y1) / l;

    let x = x1;
    let y = y1;

    for (let i = 0; i <= l; ++i) {
      setPixel(dst, x, y, color, 255);
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

export class BresenhamReal {
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
    if (x1 == x2 && y1 == y2) return setPixel(dst, x1, y1, color, 255);

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
      if (!profiling) setPixel(dst, x, y, color, 255);

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

export class BresenhamInt {
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
    if (x1 == x2 && y1 == y2) return setPixel(dst, x1, y1, color, 255);

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
      if (!profiling) setPixel(dst, x, y, color, 255);

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

export class BresenhamAntiAlias {
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

    if (x1 == x2 && y1 == y2) return setPixel(dst, x1, y1, color, 255);
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
      setPixel(dst, x, y, color, round(e));
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

export class Wu {
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
      return setPixel(dst, x1, y1, color, 255);

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
      setPixel(dst, ypx1, xpx1, color, rfpart(yend) * xgap * 255);
      setPixel(dst, ypx1 + 1, xpx1, color, fpart(yend) * xgap * 255);
    } else {
      setPixel(dst, xpx1, ypx1, color, rfpart(yend) * xgap * 255);
      setPixel(dst, xpx1, ypx1 + 1, color, fpart(yend) * xgap * 255);
    }

    let intersectY = yend + gradient;

    xend = round(x2);
    yend = y2 + gradient * (xend - x2);
    xgap = rfpart(x2 + 0.5);

    let xpx2 = xend;
    let ypx2 = floor(yend);

    if (steep) {
      setPixel(dst, ypx2, xpx2, color, rfpart(yend) * xgap * 255);
      setPixel(dst, ypx2 + 1, xpx2, color, fpart(yend) * xgap * 255);
    } else {
      setPixel(dst, xpx2, ypx2, color, rfpart(yend) * xgap * 255);
      setPixel(dst, xpx2, ypx2 + 1, color, fpart(yend) * xgap * 255);
    }

    let sx = Math.sign(xpx2 - xpx1);

    if (steep) {
      for (let x = xpx1 + 1; x != xpx2; x += sx) {
        setPixel(
          dst,
          floor(intersectY),
          x,
          color,
          rfpart(intersectY) * 255
        );
        setPixel(
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
        setPixel(
          dst,
          x,
          floor(intersectY),
          color,
          rfpart(intersectY) * 255
        );
        setPixel(
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
