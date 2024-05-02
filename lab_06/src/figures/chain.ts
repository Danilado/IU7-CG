import { abs } from "../constants";
import { out } from "../output";
import { Pixel, RGBColor, setPixel } from "../pixels";
import Point from "./point";
import PointNode from "./pointNode";

function drawLineBresenham(
  dst: ImageData,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: RGBColor,
  profiling = false
): void {
  if (!profiling) out.log("Работает Алгоритм Брезенхема на действ. числах");
  if (x1 == x2 && y1 == y2)
    return setPixel(dst, <Pixel>{
      x: x1,
      y: y1,
      r: color.r,
      g: color.g,
      b: color.b,
      alpha: 255,
    });

  let x = x1;
  let y = y1;

  let dx = x2 - x1;
  let dy = y2 - y1;

  let sx = Math.sign(dx);
  let sy = Math.sign(dy);

  dx = abs(dx);
  dy = abs(dy);

  let steep = false;
  if (dy > dx) {
    steep = true;

    let buf = dx;
    dx = dy;
    dy = buf;
  }

  let tan_abs = dy / dx;

  let f = tan_abs - 0.5;

  for (let i = 0; i < dx; ++i) {
    if (!profiling)
      setPixel(dst, <Pixel>{
        x: x,
        y: y,
        r: color.r,
        g: color.g,
        b: color.b,
        alpha: 255,
      });

    if (f >= 0) {
      if (steep) x += sx;
      else y += sy;

      f -= 1;
    }

    if (steep) y += sy;
    else x += sx;
    f += tan_abs;
  }
}

class ChainNodeBuilder {
  static build(): HTMLDivElement {
    let res = this.buildMain();
    let verb = this.buildVerbal(res);

    let name_row = this.buildRow(verb);
    name_row.innerHTML = `<div style="margin-left: auto">Ломаная</div>`;
    name_row.id = "name";

    let del_b = this.buildBtn(name_row);
    del_b.value = "⨯";
    del_b.id = "del";

    let points_holder = this.buildPtsHolder(verb);
    points_holder.id = "pts_holder";

    let add_pt_row = this.buildRow(verb);
    let add_pt_btn = this.buildWideBtn(add_pt_row);
    add_pt_btn.id = "add_pt";
    add_pt_btn.value = "добавить точку";

    let cont_row = this.buildRow(verb);
    let cont_btn = this.buildWideBtn(cont_row);
    cont_btn.id = "cont";
    cont_btn.value = "продолжить кликами";

    let close_row = this.buildRow(verb);
    let close_btn = this.buildWideBtn(close_row);
    close_btn.id = "close";
    close_btn.value = "замкнуть";

    return res;
  }

  private static buildMain(): HTMLDivElement {
    let res = document.createElement("div");
    res.classList.add("figure");

    return res;
  }

  private static buildVerbal(parent: HTMLDivElement): HTMLDivElement {
    let res = document.createElement("div");
    res.classList.add("verbal");

    parent.appendChild(res);
    return res;
  }

  private static buildRow(parent: HTMLDivElement): HTMLDivElement {
    let res = document.createElement("div");
    res.classList.add("row");

    parent.appendChild(res);
    return res;
  }

  private static buildPtsHolder(parent: HTMLDivElement): HTMLDivElement {
    let res = document.createElement("div");
    res.classList.add("verbal");
    parent.appendChild(res);

    return res;
  }

  private static buildWideBtn(parent: HTMLDivElement): HTMLInputElement {
    let res = document.createElement("input");
    parent.appendChild(res);
    res.type = "button";
    res.classList.add("widebutton");

    return res;
  }

  private static buildBtn(parent: HTMLDivElement): HTMLInputElement {
    let res: HTMLInputElement = document.createElement("input");
    res.type = "button";
    res.classList.add("button");

    parent.appendChild(res);

    return res;
  }
}

export default class Chain {
  node: HTMLDivElement;
  points: Array<PointNode>;
  pts_node: HTMLDivElement;

  coordReqCallback: (prompt?: string) => Promise<Point>;

  constructor(
    parentNode: HTMLDivElement,
    coordReqCallback: (prompt?: string) => Promise<Point>
  ) {
    this.node = ChainNodeBuilder.build();
    parentNode.appendChild(this.node);

    this.coordReqCallback = coordReqCallback;

    this.points = [];
    this.pts_node = this.node.querySelector("#pts_holder")!;

    this.setupListeners();
  }

  private setupListeners() {
    this.setupAddPointListener();
    this.setupContListener();
    this.setupCloseListener();
    this.setupMainListeners();
    this.setupDelListener();
  }

  private setupDelListener() {
    let node = this.node.querySelector("#del")!;
    node.addEventListener("click", () => {
      this.node.dispatchEvent(
        new CustomEvent("figure_delete", {
          bubbles: true,
          detail: { fig: this, node: this.node },
        })
      );
    });
  }

  private setupAddPointListener() {
    let node = this.node.querySelector("#add_pt")!;
    node.addEventListener("click", () => {
      this.points.push(new PointNode(this.pts_node, {}));
    });
  }

  private setupContListener() {
    let node = this.node.querySelector("#cont")!;
    node.addEventListener("click", () => {
      let clicking = true;

      let getNextPt = () => {
        this.coordReqCallback(
          "Последовательно выбирайте точки\nПКМ, чтобы отменить или завершить"
        )
          .then(
            (coords) => {
              this.addPoint(coords);
              this.dispatchUpdate();
            },
            () => {
              clicking = false;
            }
          )
          .finally(() => {
            if (clicking) getNextPt();
          });
      };

      getNextPt();
    });
  }

  public addPoint(pt: Point) {
    let new_point = new PointNode(this.pts_node, {});
    new_point.pt = pt;

    this.points.push(new_point);

    this.pts_node.scroll(0, this.pts_node.scrollHeight);
  }

  private setupCloseListener() {
    let node = this.node.querySelector("#close")!;
    node.addEventListener("click", () => {
      this.addPoint(this.points[0].pt);
      this.dispatchUpdate();
    });
  }

  private setupMainListeners() {
    this.node.addEventListener("point_delete", ((e: CustomEvent) => {
      e.stopPropagation();

      this.points = this.points.filter((pn) => {
        return pn.node !== e.detail.node;
      });
      this.pts_node.removeChild(e.detail.node);

      this.dispatchUpdate();
    }) as EventListener);

    this.node.addEventListener("point_change", (e) => {
      e.stopPropagation();
      this.dispatchUpdate();
    });
  }

  private dispatchUpdate() {
    this.node.dispatchEvent(
      new CustomEvent("figure_changed", {
        bubbles: true,
        detail: {
          node: this.node,
        },
      })
    );
  }

  public getPoints(): Array<Point> {
    return this.points.map((ptn) => {
      return ptn.pt;
    });
  }

  public draw(buf: ImageData) {
    let pts = this.getPoints();

    if (pts.length < 2) throw new Error("not enough points");

    for (let i = 0; i < pts.length - 1; ++i) {
      drawLineBresenham(
        buf,
        pts[i].x,
        pts[i].y,
        pts[i + 1].x,
        pts[i + 1].y,
        { r: 0, g: 0, b: 0 },
        false
      );
    }
  }
}
