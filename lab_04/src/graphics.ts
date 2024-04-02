import { canvasHeightLabel, canvasWidthLabel } from "./labels";
import { floor, m } from "./constants";

export interface coords {
  x: number;
  y: number;
}

export class Graphics {
  renderer: CanvasRenderingContext2D;
  ctx: CanvasRenderingContext2D;
  image: ImageData;
  ar: number;

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

  constructor(renderer: CanvasRenderingContext2D, width: number) {
    this.renderer = renderer;
    this.renderer.imageSmoothingEnabled = false;

    this.ctx = document.createElement("canvas").getContext("2d")!;
    this.ctx.lineWidth = 1;
    this.renderer.lineWidth = 1;

    this.ar =
      this.renderer.canvas.getBoundingClientRect().width /
      this.renderer.canvas.getBoundingClientRect().height;

    this._width = width;
    this._height = floor(this._width / this.ar);

    this.width = width;

    this.image = this.ctx.createImageData(this.width, this.height);

    this.drawImageData();
  }

  drawCircle(x_c: number, y_c: number, r: number, color: string) {
    this.ctx.putImageData(this.image, 0, 0);

    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x_c, y_c, r, 0, 2 * m.PI);
    this.ctx.closePath();
    this.ctx.stroke();

    this.image = this.ctx.getImageData(0, 0, this.width, this.height);

    this.drawImageData();
  }

  drawEllipse(
    x_c: number,
    y_c: number,
    r_x: number,
    r_y: number,
    color: string
  ) {
    this.ctx.putImageData(this.image, 0, 0);

    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.ellipse(x_c, y_c, r_x, r_y, 0, 0, 2 * m.PI);
    this.ctx.closePath();
    this.ctx.stroke();

    this.image = this.ctx.getImageData(0, 0, this.width, this.height);

    this.drawImageData();
  }

  getBuf(): ImageData {
    return this.image;
  }

  putImageData(img: ImageData) {
    this.image = img;
    this.drawImageData();
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
  }

  resetImage() {
    this.ar =
      this.renderer.canvas.getBoundingClientRect().width /
      this.renderer.canvas.getBoundingClientRect().height;
    this._height = this._width / this.ar;

    this.resizeCtx();
    this.clearCtx();
    this.image = this.ctx.createImageData(this.width, this.height);
    this.drawImageData();
  }

  getDocumentCoords(x: number, y: number) {
    let documentStuff = this.renderer.canvas.getBoundingClientRect();

    let baseX = documentStuff.x;
    let baseY = documentStuff.y;

    return <coords>{
      x: baseX + (x / this.width) * documentStuff.width,
      y: baseY + (y / this.height) * documentStuff.height,
    };
  }

  getPixelSize() {
    return this.renderer.canvas.getBoundingClientRect().width / this.width;
  }
}
