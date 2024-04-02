import { setSymPixels, Pixel, Axis, RGBColor } from "./pixels";
import { round, m, sin, cos } from "./constants";

export function buildCircleCanonical(
  buf: ImageData,
  cx: number,
  cy: number,
  r: number,
  color: RGBColor,
  profiling: boolean = false
) {
  let r_sqr = r ** 2;
  let x_range = r / m.SQRT2 + 1;

  for (let xoffset = 0; xoffset <= x_range; ++xoffset) {
    let yoffset = round(m.sqrt(r_sqr - xoffset * xoffset));
    if (!profiling) {
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + xoffset,
          y: cy + yoffset,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + yoffset,
          y: cy + xoffset,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
    }
  }
}

export function buildCircleParametric(
  buf: ImageData,
  cx: number,
  cy: number,
  r: number,
  color: RGBColor,
  profiling: boolean = false
) {
  let step = 1 / r;

  for (let tau = 0; tau <= m.PI / 4; tau += step) {
    let xoffset = round(r * cos(tau));
    let yoffset = round(r * sin(tau));
    if (!profiling) {
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + xoffset,
          y: cy + yoffset,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + yoffset,
          y: cy + xoffset,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
    }
  }
}

export function buildCircleBresenham(
  buf: ImageData,
  cx: number,
  cy: number,
  r: number,
  color: RGBColor,
  profiling: boolean = false
) {
  let xoff = 0;
  let yoff = r;
  let cap_delta = 2 * (1 - r);

  while (yoff >= xoff) {
    if (!profiling) {
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + xoff,
          y: cy + yoff,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + yoff,
          y: cy + xoff,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
    }
    if (cap_delta < 0) {
      let delta = 2 * (cap_delta + yoff) - 1;
      if (delta <= 0) {
        xoff++; // вправо
        cap_delta += 2 * xoff + 1;
      } else {
        // вправо по диагонали
        xoff += 1;
        yoff -= 1;
        cap_delta += 2 * (xoff - yoff + 1);
      }
    } else {
      // здесь переход только по диагонали, потому что строим 1/8
      xoff++;
      yoff--;
      cap_delta += 2 * (xoff - yoff + 1);
    }
  }
}

export function buildCircleMidpoint(
  buf: ImageData,
  cx: number,
  cy: number,
  r: number,
  color: RGBColor,
  profiling: boolean = false
) {
  let xoff = 0;
  let yoff = r;

  let trial = 4 * (5 - r);
  while (xoff <= yoff) {
    if (!profiling) {
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + xoff,
          y: cy + yoff,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + yoff,
          y: cy + xoff,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );
    }

    xoff++;
    if (trial > 0) {
      yoff--;
      trial -= 8 * yoff;
    }
    trial += 8 * xoff + 4;
  }
}
