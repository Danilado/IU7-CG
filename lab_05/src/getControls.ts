import { Graphics } from "./graphics";
import { Inputs } from "./inputs";

const i_color_node: HTMLInputElement = document.querySelector("#i-color")!;
const pts_field: HTMLTextAreaElement = document.querySelector("textarea")!;
const delay_field: HTMLInputElement = document.querySelector("#delay")!;
const input_fill: HTMLInputElement = document.querySelector("#fill")!;
const input_clean: HTMLInputElement = document.querySelector("#clear")!;

export const btn_side: HTMLInputElement = document.querySelector("#set_width")!;

// const : HTMLInputElement = document.querySelector("#")!;
// const _input: NumberInput = new NumberInput();
// const btn_: HTMLInputElement = document.querySelector("#")!;

export function getControls(gr: Graphics): Inputs {
  return new Inputs(
    i_color_node,
    pts_field,
    delay_field,
    input_clean,
    input_fill,
    gr
  );
}
