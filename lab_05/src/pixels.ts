export interface RGBColor {
  r: number;
  g: number;
  b: number;
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
