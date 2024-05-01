import { Point } from "../polygon";
import { Inputs } from "../inputs";

export class TextAreaPointsInput {
  node: HTMLTextAreaElement;

  constructor(node: HTMLTextAreaElement) {
    this.node = node;
  }

  validateInput(): boolean {
    return this.node.value
      .trim()
      .split("\n")
      .every((line) => {
        return line.trim().split(" ").length == 2;
      });
  }

  value(): Point[] {
    return this.node.value
      .trim()
      .split("\n")
      .map((line) => {
        return new Point(line.trim().split(" "));
      });
  }
}

export class PointsListeners {
  private _points: HTMLTextAreaElement;
  private parent: Inputs;
  points_i: TextAreaPointsInput;

  constructor(points_field: HTMLTextAreaElement, parent: Inputs) {
    this._points = points_field;
    this.points_i = new TextAreaPointsInput(points_field);

    this.parent = parent;

    this.setupTAPI();
  }

  private setupTAPI() {
    this._points.addEventListener("keyup", () => {
      if (this.points_i.validateInput()) {
        this.parent.setCanvPoly(this.points_i.value());
        this.parent.updateCanv();
      }
    });
  }
}
