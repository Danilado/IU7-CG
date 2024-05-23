import { EPS, abs, floor, round } from "../constants";
import { out } from "../output";
import { Pixel, RGBColor, blendPixel, setPixel } from "../pixels";

function fpart(x: number) {
  return x - floor(x);
}

function rfpart(x: number) {
  return 1 - fpart(x);
}

export default function drawLineWu(
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
    return setPixel(dst, <Pixel>{
      x: round(x1),
      y: round(y1),
      r: color.r,
      g: color.g,
      b: color.b,
      alpha: 255,
    });

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
    blendPixel(dst, <Pixel>{
      x: ypx1,
      y: xpx1,
      r: color.r,
      g: color.g,
      b: color.b,
      alpha: rfpart(yend) * xgap * 255,
    });
    blendPixel(dst, <Pixel>{
      x: ypx1 + 1,
      y: xpx1,
      r: color.r,
      g: color.g,
      b: color.b,
      alpha: fpart(yend) * xgap * 255,
    });
  } else {
    blendPixel(dst, <Pixel>{
      x: xpx1,
      y: ypx1,
      r: color.r,
      g: color.g,
      b: color.b,
      alpha: rfpart(yend) * xgap * 255,
    });
    blendPixel(dst, <Pixel>{
      x: xpx1,
      y: ypx1 + 1,
      r: color.r,
      g: color.g,
      b: color.b,
      alpha: fpart(yend) * xgap * 255,
    });
  }

  let intersectY = yend + gradient;

  xend = round(x2);
  yend = y2 + gradient * (xend - x2);
  xgap = rfpart(x2 + 0.5);

  let xpx2 = xend;
  let ypx2 = floor(yend);

  if (steep) {
    setPixel(dst, <Pixel>{
      x: ypx2,
      y: xpx2,
      r: color.r,
      g: color.g,
      b: color.b,
      alpha: rfpart(yend) * xgap * 255,
    });
    setPixel(dst, <Pixel>{
      x: ypx2 + 1,
      y: xpx2,
      r: color.r,
      g: color.g,
      b: color.b,
      alpha: fpart(yend) * xgap * 255,
    });
  } else {
    setPixel(dst, <Pixel>{
      x: xpx2,
      y: ypx2,
      r: color.r,
      g: color.g,
      b: color.b,
      alpha: rfpart(yend) * xgap * 255,
    });
    setPixel(dst, <Pixel>{
      x: xpx2,
      y: ypx2 + 1,
      r: color.r,
      g: color.g,
      b: color.b,
      alpha: fpart(yend) * xgap * 255,
    });
  }

  let sx = Math.sign(xpx2 - xpx1);

  if (steep) {
    for (let x = xpx1 + 1; x != xpx2; x += sx) {
      setPixel(dst, <Pixel>{
        x: floor(intersectY),
        y: x,
        r: color.r,
        g: color.g,
        b: color.b,
        alpha: rfpart(intersectY) * 255,
      });
      setPixel(dst, <Pixel>{
        x: floor(intersectY) + 1,
        y: x,
        r: color.r,
        g: color.g,
        b: color.b,
        alpha: fpart(intersectY) * 255,
      });

      intersectY += gradient;
    }
  } else {
    for (let x = xpx1 + 1; x != xpx2; x += sx) {
      setPixel(dst, <Pixel>{
        x: x,
        y: floor(intersectY),
        r: color.r,
        g: color.g,
        b: color.b,
        alpha: rfpart(intersectY) * 255,
      });
      setPixel(dst, <Pixel>{
        x: x,
        y: floor(intersectY) + 1,
        r: color.r,
        g: color.g,
        b: color.b,
        alpha: fpart(intersectY) * 255,
      });

      intersectY += gradient;
    }
  }
}
