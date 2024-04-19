let dark = false;

export const input_origin_x: HTMLInputElement =
  document.querySelector("#origin-x")!;
export const input_origin_y: HTMLInputElement =
  document.querySelector("#origin-y")!;

export const input_angle: HTMLInputElement =
  document.querySelector("#i-angle")!;

export const input_kx: HTMLInputElement = document.querySelector("#kx")!;
export const input_ky: HTMLInputElement = document.querySelector("#ky")!;

export const input_dx: HTMLInputElement = document.querySelector("#dx")!;
export const input_dy: HTMLInputElement = document.querySelector("#dy")!;

export const add_rotation: HTMLInputElement =
  document.querySelector("#add_rotation")!;
export const add_scale: HTMLInputElement =
  document.querySelector("#add_scale")!;
export const add_translate: HTMLInputElement =
  document.querySelector("#add_translation")!;

export const clear_output: HTMLInputElement =
  document.querySelector("#clearout")!;
export const output_node: HTMLDivElement =
  document.querySelector(".footertext")!;

export const change_theme: HTMLInputElement =
  document.querySelector("#themechange")!;

export const clear_all: HTMLInputElement = document.querySelector("#clearall")!;

export const transformations_node: HTMLDivElement =
  document.querySelector(".transformations")!;

change_theme.addEventListener("click", () => {
  dark = !dark;
  let everything = document.querySelectorAll("*");
  if (dark)
    for (let node of everything) {
      node.classList.add("dark");
    }
  else
    for (let node of everything) {
      node.classList.remove("dark");
    }
});

// change_theme.click();
