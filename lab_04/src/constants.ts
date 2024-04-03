import { Output } from "./labels";

export const m = Math;
export const floor = m.floor;
export const round = m.round;
export const max = m.max;
export const min = m.min;
export const abs = m.abs;
export const sin = m.sin;
export const cos = m.cos;

export const RUN_COUNT = 5e4;
export const R_START = 100;
export const R_END = 1000;
export const R_STEP = 50;
export const EPS = 1e-6;

const output_node: HTMLDivElement = document.querySelector(".footertext")!;
export const out: Output = new Output(output_node);
