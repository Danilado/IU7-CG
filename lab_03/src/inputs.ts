export class NumberInput {
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

// canvas width
export const width_input: NumberInput = new NumberInput(
  document.querySelector("#i-side-length")!
);

// line color
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

// coords
export const input_x1: HTMLInputElement = document.querySelector("#start-x")!;
export const input_y1: HTMLInputElement = document.querySelector("#start-y")!;
export const input_x2: HTMLInputElement = document.querySelector("#end-x")!;
export const input_y2: HTMLInputElement = document.querySelector("#end-y")!;
export const start_x_input: NumberInput = new NumberInput(input_x1);
export const start_y_input: NumberInput = new NumberInput(input_y1);
export const end_x_input: NumberInput = new NumberInput(input_x2);
export const end_y_input: NumberInput = new NumberInput(input_y2);

const input_beams: HTMLInputElement = document.querySelector("#beam_amount")!;
export const sun_beams_input: NumberInput = new NumberInput(input_beams);

// buttons
const input_side: HTMLInputElement = document.querySelector("#i-side-length")!;
export const side_input: NumberInput = new NumberInput(input_side);
export const button_side: HTMLInputElement = document.querySelector("#set_width")!;

// const button_: HTMLInputElement = document.querySelector("#")!;
export const button_draw_seg: HTMLInputElement =
  document.querySelector("#draw_segment")!;

export const button_clear_image: HTMLInputElement =
  document.querySelector("#clear-image")!;

export const button_build_hist: HTMLInputElement =
  document.querySelector("#build-hist")!;

export const button_build_graphs: HTMLInputElement =
  document.querySelector("#build_graphs")!;

export const button_build_sun: HTMLInputElement = document.querySelector("#draw_sun")!;
