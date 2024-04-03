import { RGBColor, Pixel, Axis, setSymPixels } from "./pixels";
import { m, round, sin, cos, max } from "./constants";

export function buildEllipseCanonical(
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
  let sqrt_coeff = ry / rx;
  let hyp = m.sqrt(rx_sqr + ry_sqr);

  let x_range = rx_sqr / hyp + 1;

  for (let xoff = 0; xoff <= x_range; ++xoff) {
    let yoff = round(sqrt_coeff * m.sqrt(rx_sqr - xoff * xoff));
    if (!profiling)
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
  }

  sqrt_coeff = 1 / sqrt_coeff;
  let y_range = ry_sqr / hyp + 1;

  for (let yoff = 0; yoff <= y_range; ++yoff) {
    let xoff = round(sqrt_coeff * m.sqrt(ry_sqr - yoff * yoff));
    if (!profiling)
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
  }
}

export function buildEllipseParametric(
  buf: ImageData,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: RGBColor,
  profiling: boolean = false
) {
  let step = 1 / max(rx, ry);

  for (let tau = 0; tau <= m.PI / 2; tau += step) {
    let xoffset = round(rx * cos(tau));
    let yoffset = round(ry * sin(tau));

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
    }
  }
}

export function buildEllipseBresenham(
  buf: ImageData,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: RGBColor,
  profiling: boolean = false
) {
  let rx_sq = rx * rx;
  let ry_sq = ry * ry;

  let xcur = 0;
  let ycur = ry;

  let cap_delta = ry_sq - rx_sq * (2 * ry - 1);

  let coverage = [0, 0, 0, 0, 0];

  while (ycur >= 0) {
    if (!profiling)
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + xcur,
          y: cy + ycur,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );

    if (cap_delta < 0) {
      let d = 2 * cap_delta + rx_sq * (2 * ycur - 1);
      if (d <= 0) {
        xcur++;
        cap_delta += ry_sq * (2 * xcur + 1);
        coverage[0]++;
      } else {
        xcur++;
        ycur--;
        cap_delta += 2 * xcur * ry_sq - 2 * ycur * rx_sq + rx_sq + ry_sq;
        coverage[1]++;
      }
    } else if (cap_delta > 0) {
      let d = 2 * cap_delta - ry_sq * (2 * xcur + 1);
      if (d <= 0) {
        xcur++;
        ycur--;
        cap_delta += 2 * xcur * ry_sq - 2 * ycur * rx_sq + rx_sq + ry_sq;
        coverage[2]++;
      } else {
        ycur--;
        cap_delta += rx_sq * (-2 * ycur + 1);
        coverage[3]++;
      }
    } else {
      xcur++;
      ycur--;
      cap_delta += 2 * xcur * ry_sq - 2 * ycur * rx_sq + rx_sq + ry_sq;
      coverage[4]++;
    }

    console.log(coverage);
  }
}

export function buildEllipseMidpoint(
  buf: ImageData,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: RGBColor,
  profiling: boolean = false
) {
  let rx_sq = rx * rx;
  let ry_sq = ry * ry;

  let xcur = 0;
  let ycur = ry;

  let trial = 2 * (ry_sq * 2 - rx_sq * 2 * (ry - 1));
  let dx = 0;
  let dy = rx_sq * 2 * ycur;

  while (dx < dy) {
    if (!profiling)
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + xcur,
          y: cy + ycur,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );

    xcur++;
    dx += ry_sq * 2;

    if (trial >= 0) {
      ycur--;
      dy -= rx_sq * 2;
      trial -= 4 * dy;
    }

    trial += 4 * (dx + ry_sq);
  }

  trial -= 4 * (ry_sq * (xcur + 3) + rx_sq * (ycur - 3));
  while (dy >= 0) {
    if (!profiling)
      setSymPixels(
        buf,
        <Pixel>{
          x: cx + xcur,
          y: cy + ycur,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        },
        <Axis>{ x: cx, y: cy }
      );

    ycur--;
    dy -= rx_sq * 2;

    if (trial < 0) {
      xcur++;
      dx += ry_sq * 2;
      trial += 4 * dx;
    }

    trial -= 4 * (dy - rx_sq);
  }
}
