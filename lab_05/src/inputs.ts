import { Point } from "./polygon";

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

export class Inputs {
  private _color: ColorInput;
  private _points: TextAreaPointsInput;

  constructor(
    color_field: HTMLInputElement,
    points_field: HTMLTextAreaElement
  ) {
    this._color = new ColorInput(color_field);
    this._points = new TextAreaPointsInput(points_field);
  }

  public get color(): string {
    if (!this._color.validateInput()) throw new Error("Ошибка выбора цвета");
    return this._color.value();
  }

  public get points(): Point[] {
    if (!this._points.validateInput()) throw new Error("Ошибка ввода точек");
    return this._points.value();
  }
}
