import { floor, sleep } from "./constants";
import Chain from "./figures/chain";
import Circle from "./figures/circle";
import Point from "./figures/point";
import { Pixel, RGBColor, cmpColros, getPixelColor, setPixel } from "./pixels";

const canvasWidthLabel: HTMLSpanElement = document.querySelector(".c-width")!;
const canvasHeightLabel: HTMLSpanElement = document.querySelector(".c-height")!;

export interface coords {
  x: number;
  y: number;
}

function isBorder(color: RGBColor | undefined) {
  if (color === undefined) return true;
  return !color.r && !color.g && !color.b;
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
    this.image.data.fill(255);

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
    this.image.data.fill(255);
    this.drawImageData();
  }

  getPixelSize() {
    return this.renderer.canvas.getBoundingClientRect().width / this.width;
  }

  async fill(seed: Point, color: RGBColor, delay: number): Promise<number> {
    let t1 = performance.now();

    let stack: Array<Point> = [seed];

    let buf = this.getBuf();
    let cur: Point = new Point();

    while (stack.length) {
      cur = stack.pop()!;

      setPixel(buf, <Pixel>{
        x: cur.x,
        y: cur.y,
        r: color.r,
        g: color.g,
        b: color.b,
        alpha: 255,
      });

      let wx = cur.x;
      ++cur.x;

      while (
        cur.x < this.width &&
        !isBorder(getPixelColor(buf, cur.x, cur.y))
      ) {
        setPixel(buf, <Pixel>{
          x: cur.x,
          y: cur.y,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        });
        ++cur.x;
      }

      let xr = cur.x - 1;

      cur.x = wx - 1;

      while (cur.x >= 0 && !isBorder(getPixelColor(buf, cur.x, cur.y))) {
        setPixel(buf, <Pixel>{
          x: cur.x,
          y: cur.y,
          r: color.r,
          g: color.g,
          b: color.b,
          alpha: 255,
        });
        --cur.x;
      }

      let xl = cur.x + 1;

      cur.x = xl;
      ++cur.y;

      if (cur.y < this.height) {
        while (cur.x <= xr) {
          let f = false;

          while (cur.x <= xr) {
            let cur_color = getPixelColor(buf, cur.x, cur.y);
            if (isBorder(cur_color) || cmpColros(cur_color, color)) break;

            f = true;
            ++cur.x;
          }

          if (f) {
            let cur_color = getPixelColor(buf, cur.x, cur.y);
            if (
              cur.x == xr &&
              !cmpColros(cur_color, color) &&
              !isBorder(cur_color)
            )
              stack.push(new Point(cur));
            else stack.push(new Point(cur.x - 1, cur.y));

            f = false;
          }

          wx = cur.x;
          while (cur.x < xr) {
            let cur_color = getPixelColor(buf, cur.x, cur.y);
            if (!cmpColros(cur_color, color) && !isBorder(cur_color)) break;
            ++cur.x;
          }

          if (cur.x == wx) ++cur.x;
        }
      }

      cur.x = xl;
      cur.y -= 2;

      if (cur.y >= 0) {
        while (cur.x <= xr) {
          let f = false;

          while (cur.x <= xr) {
            let cur_color = getPixelColor(buf, cur.x, cur.y);
            if (cmpColros(cur_color, color) || isBorder(cur_color)) break;

            f = true;
            ++cur.x;
          }

          if (f) {
            let cur_color = getPixelColor(buf, cur.x, cur.y);
            if (
              cur.x == xr &&
              !cmpColros(cur_color, color) &&
              !isBorder(cur_color)
            )
              stack.push(new Point(cur));
            else stack.push(new Point(cur.x - 1, cur.y));
            f = false;
          }

          wx = cur.x;
          while (cur.x < xr) {
            let cur_color = getPixelColor(buf, cur.x, cur.y);
            if (!cmpColros(cur_color, color) && !isBorder(cur_color)) break;

            ++cur.x;
          }

          if (cur.x == wx) ++cur.x;
        }
      }

      if (delay) {
        this.drawImageData();
        await sleep(delay);
      }
    }

    this.drawImageData();

    let t2 = performance.now();

    return t2 - t1;
  }

  public async drawFigures(figures: Array<Circle | Chain>) {
    this.resetImage();
    let buf = this.getBuf();

    for (let figure of figures) {
      try {
        figure.draw(buf);
      } catch (error) {
        console.log(error);
      }
    }

    this.drawImageData();
  }
}
