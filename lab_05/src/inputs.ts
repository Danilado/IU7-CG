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

const input_side: HTMLInputElement = document.querySelector("#i-side-length")!;
export const side_input: NumberInput = new NumberInput(input_side);
export const btn_side: HTMLInputElement = document.querySelector("#set_width")!;

// const : HTMLInputElement = document.querySelector("#")!;
// const _input: NumberInput = new NumberInput();
// const btn_: HTMLInputElement = document.querySelector("#")!;
