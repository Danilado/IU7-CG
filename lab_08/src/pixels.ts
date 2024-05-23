export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export function cmpColros(c1?: RGBColor, c2?: RGBColor): boolean {
  if ((c1 === undefined) != (c2 === undefined)) return false;
  return c1!.r === c2!.r && c1!.g === c2!.g && c1!.b === c2!.b;
}

export function reverseString(str: string) {
  var splitString = str.split("");
  var reverseArray = splitString.reverse();
  var joinArray = reverseArray.join("");
  return joinArray;
}

export function HEXtoInt(s: string): number {
  return parseInt(s, 16);
}

export function HEXtoRGB(s: string): RGBColor {
  s = s.replace(/#/, "");
  return <RGBColor>{
    r: HEXtoInt(s[0] + s[1]),
    g: HEXtoInt(s[2] + s[3]),
    b: HEXtoInt(s[4] + s[5]),
  };
}

export interface Pixel {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
  alpha: number;
}

export function setPixel(buf: ImageData, pix: Pixel): void {
  if (pix.x < 0 || pix.x >= buf.width) return;
  if (pix.y < 0 || pix.y >= buf.height) return;

  let tmp = (pix.x + pix.y * buf.width) * 4;
  buf.data[tmp] = pix.r;
  buf.data[tmp + 1] = pix.g;
  buf.data[tmp + 2] = pix.b;
  buf.data[tmp + 3] = pix.alpha;
}

export function blendPixel(buf: ImageData, pix: Pixel): void {
  if (pix.x < 0 || pix.x >= buf.width) return;
  if (pix.y < 0 || pix.y >= buf.height) return;

  let tmp = (pix.x + pix.y * buf.width) * 4;

  let oldr = buf.data[tmp];
  let oldg = buf.data[tmp + 1];
  let oldb = buf.data[tmp + 2];
  let olda = buf.data[tmp + 3];

  buf.data[tmp] =
    (pix.r * pix.alpha) / 255 + (oldr * olda * (255 - pix.alpha)) / (255 * 255);
  buf.data[tmp + 1] =
    (pix.g * pix.alpha) / 255 + (oldg * olda * (255 - pix.alpha)) / (255 * 255);
  buf.data[tmp + 2] =
    (pix.b * pix.alpha) / 255 + (oldb * olda * (255 - pix.alpha)) / (255 * 255);
  buf.data[tmp + 3] = pix.alpha + (olda * (255 - pix.alpha)) / 255;
}

export function getPixelColor(
  buf: ImageData,
  x: number,
  y: number
): RGBColor | undefined {
  if (x < 0 || x >= buf.width) return undefined;
  if (y < 0 || y >= buf.height) return undefined;

  let tmp = (x + y * buf.width) * 4;

  return <RGBColor>{
    r: buf.data[tmp],
    g: buf.data[tmp + 1],
    b: buf.data[tmp + 2],
  };
}

export function xorPixel(buf: ImageData, pix: Pixel): void {
  if (pix.x < 0 || pix.x >= buf.width) return;
  if (pix.y < 0 || pix.y >= buf.height) return;

  let tmp = (pix.x + pix.y * buf.width) * 4;
  buf.data[tmp] ^= pix.r;
  buf.data[tmp + 1] ^= pix.g;
  buf.data[tmp + 2] ^= pix.b;
  buf.data[tmp + 3] ^= pix.alpha;
}

export interface Axis {
  x: number;
  y: number;
}

export function mirrorPixVertical(pix: Pixel, origin: number) {
  return <Pixel>{
    x: 2 * origin - pix.x,
    y: pix.y,
    r: pix.r,
    g: pix.g,
    b: pix.b,
    alpha: pix.alpha,
  };
}

export function mirrorPixHorizontal(pix: Pixel, origin: number) {
  return <Pixel>{
    x: pix.x,
    y: 2 * origin - pix.y,
    r: pix.r,
    g: pix.g,
    b: pix.b,
    alpha: pix.alpha,
  };
}

export function setSymPixels(buf: ImageData, pix: Pixel, origin: Axis) {
  setPixel(buf, pix);
  setPixel(buf, mirrorPixHorizontal(pix, origin.y));
  setPixel(buf, mirrorPixVertical(pix, origin.x));
  setPixel(
    buf,
    mirrorPixHorizontal(mirrorPixVertical(pix, origin.x), origin.y)
  );
}
