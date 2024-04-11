import { Graphics } from "../graphics";
import { Polygon } from "../polygon";
import { TextAreaPointsInput } from "./pointsListeners";

export default class CleanBtn {
  private node: HTMLInputElement;
  private gr: Graphics;
  private textArea: TextAreaPointsInput;

  constructor(node: HTMLInputElement, gr: Graphics, pts: TextAreaPointsInput) {
    this.node = node;
    this.gr = gr;
    this.textArea = pts;

    this.setup();
  }

  private setup() {
    this.node.addEventListener("click", () => {
      this.gr.polygon.clear();
      this.gr.clearCtx();
      this.textArea.node.value = "";
    });
  }
}
