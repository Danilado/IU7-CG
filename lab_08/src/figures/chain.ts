import { RGBColor } from "../pixels";
import drawLineWu from "./WuLine";
import Point from "./point";
import PointNode from "./pointNode";

class ChainNodeBuilder {
  static build(parent: HTMLDivElement) {
    let pt_holder_row = this.buildRow(parent);
    let points_holder = this.buildPtsHolder(pt_holder_row);
    points_holder.id = "pts_holder";
    points_holder.style.flex = "1";
    points_holder.style.height = "6em";
    points_holder.style.borderBottom = "";

    let add_pt_row = this.buildRow(parent);
    let add_pt_btn = this.buildWideBtn(add_pt_row);
    add_pt_btn.id = "add_pt";
    add_pt_btn.value = "добавить точку";

    let cont_row = this.buildRow(parent);
    let cont_btn = this.buildWideBtn(cont_row);
    cont_btn.id = "cont";
    cont_btn.value = "продолжить кликами";
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
    this.node = parentNode;
    ChainNodeBuilder.build(parentNode);

    this.coordReqCallback = coordReqCallback;

    this.points = [];
    this.pts_node = this.node.querySelector("#pts_holder")!;

    this.setupListeners();
  }

  private setupListeners() {
    this.setupAddPointListener();
    this.setupContListener();
    this.setupMainListeners();
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

  public draw(buf: ImageData, color: RGBColor) {
    let pts = this.getPoints();

    if (pts.length < 2) throw new Error("not enough points");

    for (let i = 0; i < pts.length - 1; ++i) {
      drawLineWu(
        buf,
        pts[i].x,
        pts[i].y,
        pts[i + 1].x,
        pts[i + 1].y,
        color,
        false
      );
    }

    drawLineWu(
      buf,
      pts[pts.length - 1].x,
      pts[pts.length - 1].y,
      pts[0].x,
      pts[0].y,
      color,
      false
    );
  }
}
