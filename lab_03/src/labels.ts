import { DEBUG } from "./constants";

export const canvasWidthLabel: HTMLSpanElement =
  document.querySelector(".c-width")!;
export const canvasHeightLabel: HTMLSpanElement =
  document.querySelector(".c-height")!;

export const change_theme: HTMLInputElement =
  document.querySelector("#themechange")!;

export const pointer_x: HTMLDivElement = document.querySelector("#pointer-x")!;
export const pointer_y: HTMLDivElement = document.querySelector("#pointer-y")!;

let dark = false;

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

export class Output {
  node: HTMLDivElement;
  constructor(node: HTMLDivElement) {
    this.node = node;
  }

  write(text: string, prefix: string) {
    this.node.innerHTML += prefix + text.replace(/\n/, "<br />") + "<br />";
    this.scrollToBottom();
  }

  clear() {
    this.node.innerHTML = ``;
  }

  warn(text: string) {
    if (DEBUG) this.write(text, "WARN: ");
  }

  log(text: string) {
    if (DEBUG) this.write(text, "LOG: ");
  }

  error(text: string) {
    this.write(text, "ERROR: ");
  }

  scrollToBottom() {
    this.node.scroll(0, this.node.scrollHeight);
  }
}

const output_node: HTMLDivElement = document.querySelector(".footertext")!;
export const out: Output = new Output(output_node);
