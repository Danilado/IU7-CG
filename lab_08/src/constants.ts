import Point from "./figures/point";
import { out } from "./output";

export const m = Math;
export const floor = m.floor;
export const round = m.round;

export const min = m.min;
export const max = m.max;

export const abs = m.abs;

export const sin = m.sin;
export const cos = m.cos;

export const EPS = 1e-6;
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const getClickCoords = (node: HTMLElement, e: MouseEvent) => {
  let bcr = node.getBoundingClientRect();
  return new Point(round(e.clientX - bcr.left), round(e.clientY - bcr.top));
};

export function errHandler(err: Error): void;
export function errHandler(err: any): void;
export function errHandler(err: any | Error): void {
  if (err instanceof Error) out.error(err.message);
  else out.error(`${err}`);
}

export function consoleErrHandler(err: any): void {
  console.log(err);
}
