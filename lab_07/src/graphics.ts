import { floor } from "./constants";
import drawLineWu from "./figures/WuLine";
import Line from "./figures/line";
import LineNode from "./figures/lineNode";
import Point from "./figures/point";
import Rect from "./figures/rectangle";
import { HEXtoRGB, RGBColor } from "./pixels";

const canvasWidthLabel: HTMLSpanElement = document.querySelector(".c-width")!;
const canvasHeightLabel: HTMLSpanElement = document.querySelector(".c-height")!;

export interface coords {
  x: number;
  y: number;
}

export class Graphics {
  node: HTMLCanvasElement;
  out_renderer: CanvasRenderingContext2D;
  renderer: CanvasRenderingContext2D;
  ctx: CanvasRenderingContext2D;
  image: ImageData;
  ar: number;

  choosing: boolean;

  private _width: number;
  public get width(): number {
    return this._width;
  }
  public set width(v: number) {
    this._width = v;
    this._height = floor(this._width / this.ar);

    canvasWidthLabel.innerHTML = `${this._width}`;
    canvasHeightLabel.innerHTML = `${this._height}`;

    this.resetImage();
  }

  private _height: number;
  public get height(): number {
    return this._height;
  }
  public set height(v: number) {
    this._height = floor(v);
    this._width = floor(this._height * this.ar);

    canvasWidthLabel.innerHTML = `${this._width}`;
    canvasHeightLabel.innerHTML = `${this._height}`;

    this.resetImage();
  }

  constructor(
    renderer: CanvasRenderingContext2D,
    width: number,
    outlineRenderer: CanvasRenderingContext2D
  ) {
    let bcr = renderer.canvas.getBoundingClientRect();

    renderer.canvas.width = bcr.width;
    outlineRenderer.canvas.width = bcr.width;
    renderer.canvas.height = bcr.height;
    outlineRenderer.canvas.height = bcr.height;

    this.out_renderer = outlineRenderer;
    this.out_renderer.lineWidth = 2;
    this.renderer = renderer;
    this.node = renderer.canvas;
    this.renderer.imageSmoothingEnabled = false;

    this.ctx = document.createElement("canvas").getContext("2d")!;
    this.ctx.lineWidth = 2;
    this.renderer.lineWidth = 2;

    this.ar =
      this.renderer.canvas.getBoundingClientRect().width /
      this.renderer.canvas.getBoundingClientRect().height;

    this._width = width;
    this._height = floor(this._width / this.ar);

    this.width = width;

    this.image = this.ctx.createImageData(this.width, this.height);
    this.image.data.fill(0);

    this.choosing = false;

    this.ctx.strokeStyle = "black";
  }

  update() {
    this.clearCtx();
    this.drawImageData();
  }

  getBuf(): ImageData {
    return this.image;
  }

  putImageData(img: ImageData): void;
  putImageData(imgPromise: Promise<ImageData>): void;
  putImageData(imgDt: ImageData | Promise<ImageData>): void {
    // console.log("imageData Drawing...");
    if (imgDt instanceof ImageData) {
      this.image = imgDt;
      this.update();
    } else {
      imgDt.then(
        (img) => {
          this.image = img;
          this.update();
        },
        (err) => {
          throw err;
        }
      );
    }
  }

  drawImageData() {
    this.renderer.clearRect(
      0,
      0,
      this.renderer.canvas.width,
      this.renderer.canvas.height
    );
    this.ctx.putImageData(this.image, 0, 0);
    this.renderer.drawImage(
      this.ctx.canvas,
      0,
      0,
      this.width * this.getPixelSize(),
      floor(this.height) * this.getPixelSize()
    );
  }

  resizeCtx() {
    this.ctx.canvas.width = this.width;
    this.ctx.canvas.height = this.height;
  }

  clearCtx() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.out_renderer.clearRect(0, 0, this.width, this.height);
  }

  resetImage() {
    this.ar =
      this.renderer.canvas.getBoundingClientRect().width /
      this.renderer.canvas.getBoundingClientRect().height;
    this._height = this._width / this.ar;

    this.resizeCtx();
    this.clearCtx();
    this.renderer.clearRect(0, 0, this.width, this.height);
    this.image = this.ctx.createImageData(this.width, this.height);
    this.image.data.fill(0);
    this.drawImageData();
  }

  getPixelSize() {
    return this.renderer.canvas.getBoundingClientRect().width / this.width;
  }

  public drawLine(l: Line, lineColor?: string | RGBColor): void;
  public drawLine(pt1: Point, pt2: Point, lineColor?: string | RGBColor): void;
  public drawLine(
    arg1: Line | Point,
    arg2?: Point | string | RGBColor,
    arg3?: string | RGBColor
  ) {
    let buf = this.getBuf();
    let color: RGBColor;

    let color_arg: string | RGBColor | undefined;

    if (arg2 === undefined) color_arg = undefined;
    else if (arg2 instanceof Point) color_arg = arg3;
    else color_arg = arg2;

    if (color_arg === undefined) color = { r: 0, g: 0, b: 0 };
    else if (typeof color_arg === "string") color = HEXtoRGB(color_arg);
    else color = color_arg;

    if (arg1 instanceof Line)
      drawLineWu(buf, arg1.x1, arg1.y1, arg1.x2, arg1.y2, color);
    else
      drawLineWu(
        buf,
        arg1.x,
        arg1.y,
        (arg2 as Point).x,
        (arg2 as Point).y,
        color
      );
  }

  public drawLines(figures: LineNode[] | Line[], lineColor?: string) {
    if (!figures.length) return;

    let buf = this.getBuf();
    let color: RGBColor;

    if (lineColor !== undefined && lineColor != "") color = HEXtoRGB(lineColor);
    else color = { r: 0, g: 0, b: 0 };

    if (figures[0] instanceof LineNode)
      for (let figure of figures as LineNode[])
        try {
          figure.draw(buf, color);
        } catch (error) {
          console.log(error);
        }
    else
      for (let line of figures)
        try {
          this.drawLine(line, color);
        } catch (error) {
          console.log(error);
        }

    this.drawImageData();
  }

  public drawRect(rectangle: Rect, lineColor?: string) {
    let buf = this.getBuf();
    let color: RGBColor;

    if (lineColor !== undefined && lineColor != "") color = HEXtoRGB(lineColor);
    else color = { r: 0, g: 0, b: 0 };

    rectangle.draw(buf, color);

    this.drawImageData();
  }
}
