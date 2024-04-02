import { Output } from "./labels";

export const m = Math;
export const floor = m.floor;
export const round = m.round;
export const max = m.max;
export const min = m.min;
export const abs = m.abs;
export const sin = m.sin;
export const cos = m.cos;

export const RUN_COUNT = 1e5;
export const ANGLE_FROM = 0;
export const ANGLE_TO = 90;
export const EPS = 1e-6;

const output_node: HTMLDivElement = document.querySelector(".footertext")!;
export const out: Output = new Output(output_node);
