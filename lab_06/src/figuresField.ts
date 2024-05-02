import Chain from "./figures/chain";
import Circle from "./figures/circle";
import Point from "./figures/point";

export default class FigureField {
  container: HTMLDivElement;
  figures: Array<Chain | Circle>;

  addChainBtn: HTMLInputElement;
  addCircleBtn: HTMLInputElement;

  coordReqCallback: (prompt?: string) => Promise<Point>;

  constructor(
    node: HTMLDivElement,
    addChainBtn: HTMLInputElement,
    addCircleBtn: HTMLInputElement,
    coordReqCallback: (prompt?: string) => Promise<Point>
  ) {
    this.container = node;

    this.figures = [];

    this.addChainBtn = addChainBtn;
    this.addCircleBtn = addCircleBtn;

    this.coordReqCallback = coordReqCallback;

    this.setupListeners();
  }

  public addChain(): Chain {
    let ch = new Chain(this.container, this.coordReqCallback);
    this.figures.push(ch);
    this.container.scroll(0, this.container.scrollHeight);

    return ch;
  }

  public removeFigure(fig: Chain | Circle) {
    this.figures = this.figures.filter((fiter) => {
      return fiter !== fig;
    });

    this.container.removeChild(fig.node);

    this.dispatchUpdate();
  }

  public clear() {
    this.figures = [];

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
    this.setupAddCircleListener();
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

  private setupAddCircleListener() {
    this.addCircleBtn.addEventListener("click", () => {
      this.figures.push(new Circle(this.container, this.coordReqCallback));

      this.container.scroll(0, this.container.scrollHeight);
    });
  }
}
