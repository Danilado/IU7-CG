import { Graphics } from "../graphics";

export default class FillBtn {
  private node: HTMLInputElement;
  private gr: Graphics;

  constructor(node: HTMLInputElement, gr: Graphics) {
    this.node = node;
    this.gr = gr;

    this.setup();
  }

  private setup() {
    this.node.addEventListener("click", () => {
      this.gr.fill();
    });
  }
}
