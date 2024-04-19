import { DEBUG } from "./constants";
import { output_node } from "./interface";

export class Output {
  node: HTMLDivElement;
  constructor(node: HTMLDivElement) {
    this.node = node;
  }

  write(text: string, prefix: string) {
    this.node.innerHTML += prefix + text.replace(/\n/, "<br />") + "<br />";
    this.scrollToBottom();
  }

  clear() {
    this.node.innerHTML = ``;
  }

  warn(text: string) {
    if (DEBUG) this.write(text, "WARN: ");
  }

  log(text: string) {
    if (DEBUG) this.write(text, "LOG: ");
  }

  error(text: string) {
    this.write(text, "ERROR: ");
  }

  scrollToBottom() {
    this.node.scroll(0, this.node.scrollHeight);
  }
}

export const out: Output = new Output(output_node);
