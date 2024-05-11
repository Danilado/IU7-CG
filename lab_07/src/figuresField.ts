import LineNode from "./figures/lineNode";
import Rect from "./figures/rectangle";
import Point from "./figures/point";

export default class FigureField {
  container: HTMLDivElement;
  rectangle: Rect;
  lines: Array<LineNode>;

  addChainBtn: HTMLInputElement;

  coordReqCallback: (prompt?: string) => Promise<Point>;

  constructor(
    node: HTMLDivElement,
    addChainBtn: HTMLInputElement,
    coordReqCallback: (prompt?: string) => Promise<Point>
  ) {
    this.container = node;

    this.lines = [];

    this.addChainBtn = addChainBtn;

    this.coordReqCallback = coordReqCallback;

    this.rectangle = new Rect(
      document.querySelector("#rect-div")!,
      this.coordReqCallback
    );

    this.setupListeners();
  }

  public addChain(): LineNode {
    let ch = new LineNode(this.container, this.coordReqCallback);
    this.lines.push(ch);
    this.container.scroll(0, this.container.scrollHeight);

    return ch;
  }

  public removeFigure(fig: LineNode) {
    this.lines = this.lines.filter((fiter) => {
      return fiter !== fig;
    });

    this.container.removeChild(fig.node);

    this.dispatchUpdate();
  }

  public clear() {
    this.lines = [];

    while (this.container.lastChild)
      this.container.removeChild(this.container.lastChild);

    this.dispatchUpdate();
  }

  private dispatchUpdate() {
    this.container.dispatchEvent(
      new CustomEvent("figure_changed", {
        bubbles: true,
        detail: {
          node: this.container,
        },
      })
    );
  }

  private setupListeners() {
    this.setupAddChainListener();
    this.setupDelListener();
  }

  private setupDelListener() {
    this.container.addEventListener("figure_delete", ((e: CustomEvent) => {
      e.stopPropagation();
      this.removeFigure(e.detail.fig);
    }) as EventListener);
  }

  private setupAddChainListener() {
    this.addChainBtn.addEventListener("click", () => {
      this.addChain();
    });
  }
}
