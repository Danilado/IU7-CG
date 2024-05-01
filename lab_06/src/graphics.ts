import { floor } from "./constants";
import { Polygon } from "./polygon";

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
  polygon: Polygon;

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

    this.choosing = false;
    this.polygon = new Polygon(this);

    this.ctx.strokeStyle = "black";
  }

  update() {
    this.clearCtx();
    this.drawImageData();
    this.polygon.drawEdges();
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

  async fill(delay: number): Promise<number> {
    if (this.image) this.image.data.fill(0);
    return this.polygon.fill(delay);
  }
}
