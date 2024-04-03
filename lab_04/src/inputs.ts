export class NumberInput {
  node: HTMLInputElement;

  constructor(node: HTMLInputElement) {
    this.node = node;
  }

  validateInput(minN: number = -Infinity, maxN: number = Infinity): boolean {
    if (this.node.value == "") return false;
    let tmp = Number(this.node.value);
    if (Number.isNaN(tmp)) return false;
    if (tmp < minN) return false;
    if (tmp > maxN) return false;
    return true;
  }

  value(minN: number = -Infinity, maxN: number = Infinity) {
    if (this.node.value == "") return 0;
    let tmp = Number(this.node.value);
    if (Number.isNaN(tmp)) return tmp;
    if (tmp < minN) return minN;
    if (tmp > maxN) return maxN;
    return tmp;
  }
}

export class ColorInput {
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
export const color_input: ColorInput = new ColorInput(i_color_node);

const set_color_default: HTMLInputElement =
  document.querySelector("#set_default_color")!;
set_color_default.addEventListener("click", () => {
  i_color_node.value = "#000000";
});
const set_color_bg: HTMLInputElement = document.querySelector("#set_bg_color")!;
set_color_bg.addEventListener("click", () => {
  i_color_node.value = "#ffffff";
});

export const center_x: HTMLInputElement = document.querySelector("#center-x")!;
export const center_x_input: NumberInput = new NumberInput(center_x);

export const center_y: HTMLInputElement = document.querySelector("#center-y")!;
export const center_y_input: NumberInput = new NumberInput(center_y);

const circle_r: HTMLInputElement = document.querySelector("#circle-radius")!;
export const circle_r_input: NumberInput = new NumberInput(circle_r);
export const btn_build_circle: HTMLInputElement =
  document.querySelector("#build-circle")!;

const input_side: HTMLInputElement = document.querySelector("#i-side-length")!;
export const side_input: NumberInput = new NumberInput(input_side);
export const btn_side: HTMLInputElement = document.querySelector("#set_width")!;

const ellipse_r_x: HTMLInputElement = document.querySelector("#ellipse-x")!;
export const ellipse_r_x_input: NumberInput = new NumberInput(ellipse_r_x);
const ellipse_r_y: HTMLInputElement = document.querySelector("#ellipse-y")!;
export const ellipse_r_y_input: NumberInput = new NumberInput(ellipse_r_y);
export const btn_build_ellipse: HTMLInputElement =
  document.querySelector("#build-ellipse")!;

//#region circ-spectrum

const circ_spectrum_r_start: HTMLInputElement = document.querySelector(
  "#circle-spectrum-r1"
)!;
export const circ_spectrum_r_start_input: NumberInput = new NumberInput(
  circ_spectrum_r_start
);
const circ_spectrum_r_end: HTMLInputElement = document.querySelector(
  "#circle-spectrum-r2"
)!;
export const circ_spectrum_r_end_input: NumberInput = new NumberInput(
  circ_spectrum_r_end
);
const circ_spectrum_r_step: HTMLInputElement = document.querySelector(
  "#circle-spectrum-step"
)!;
export const circ_spectrum_r_step_input: NumberInput = new NumberInput(
  circ_spectrum_r_step
);
const circ_spectrum_amount: HTMLInputElement = document.querySelector(
  "#circle-spectrum-amount"
)!;
export const circ_spectrum_amount_input: NumberInput = new NumberInput(
  circ_spectrum_amount
);
export const btn_build_circ_spectrum: HTMLInputElement = document.querySelector(
  "#build-circle-spectrum"
)!;

//#endregion

//#region ellipse-spectrum

const el_spectrum_rx_start: HTMLInputElement = document.querySelector(
  "#ellipse-spectrum-r1"
)!;
export const el_spectrum_rx_start_input: NumberInput = new NumberInput(
  el_spectrum_rx_start
);
const el_spectrum_ry_start: HTMLInputElement = document.querySelector(
  "#ellipse-spectrum-r2"
)!;
export const el_spectrum_ry_start_input: NumberInput = new NumberInput(
  el_spectrum_ry_start
);
const el_spectrum_r_step: HTMLInputElement = document.querySelector(
  "#ellipse-spectrum-step"
)!;
export const el_spectrum_r_step_input: NumberInput = new NumberInput(
  el_spectrum_r_step
);
const el_spectrum_r_amount: HTMLInputElement = document.querySelector(
  "#ellipse-spectrum-amount"
)!;
export const el_spectrum_r_amount_input: NumberInput = new NumberInput(
  el_spectrum_r_amount
);
export const btn_build_el_spectrum: HTMLInputElement = document.querySelector(
  "#build-ellipse-spectrum"
)!;

//#endregion

export const btn_build_graphs: HTMLInputElement =
  document.querySelector("#build-graphs")!;

export const btn_clear_image: HTMLInputElement =
  document.querySelector("#clear-image")!;

// const : HTMLInputElement = document.querySelector("#")!;
// const _input: NumberInput = new NumberInput();
// const btn_: HTMLInputElement = document.querySelector("#")!;
