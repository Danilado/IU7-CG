import { Graphics } from "../graphics";
import { Inputs } from "../inputs";
import { out } from "../output";
import { HEXtoRGB } from "../pixels";

export default class FillBtn {
  private node: HTMLInputElement;
  private gr: Graphics;
  private parent: Inputs;

  constructor(node: HTMLInputElement, gr: Graphics, parent: Inputs) {
    this.node = node;
    this.gr = gr;
    this.parent = parent;

    this.setup();
  }

  private setup() {
    this.node.addEventListener("click", () => {
      try {
        this.gr.polygon.color = HEXtoRGB(this.parent.color);
      } catch (error) {
        out.error(`${error}`);
      }
      this.gr.fill(this.parent.delay).then(
        (res) => {
          let s_flag = res > 1000;
          if (res > 1000) res /= 1000;
          out.write(`Закраска заняла ${res}${s_flag ? "c" : "мс"}`, ``);
        },
        (err) => out.error(`${err}`)
      );
    });
  }
}
