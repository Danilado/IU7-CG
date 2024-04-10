import { Inputs } from "./inputs";

const i_color_node: HTMLInputElement = document.querySelector("#i-color")!;
const pts_field: HTMLTextAreaElement = document.querySelector("textarea")!;
const input_side: HTMLInputElement = document.querySelector("#i-side-length")!;

export const btn_side: HTMLInputElement = document.querySelector("#set_width")!;

// const : HTMLInputElement = document.querySelector("#")!;
// const _input: NumberInput = new NumberInput();
// const btn_: HTMLInputElement = document.querySelector("#")!;

export function getControls(): Inputs {
  return new Inputs(i_color_node, pts_field);
}
