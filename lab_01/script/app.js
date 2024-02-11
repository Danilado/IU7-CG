"use strict";
//#region interface
//#region points
const input_x = document.querySelector("#inewx");
const input_y = document.querySelector("#inewy");
const add_point = document.querySelector("#submit");
const output_node = document.querySelector(".footer");
class output {
    constructor(node) {
        this.node = node;
    }
    write(text, prefix) {
        this.node.innerHTML += prefix + text + "<br><br>";
        this.scroll_to_bottom();
    }
    warn(text) {
        this.write(text, "WARN: ");
    }
    log(text) {
        this.write(text, "LOG: ");
    }
    error(text) {
        this.write(text, "ERROR: ");
    }
    scroll_to_bottom() {
        this.node.scroll(0, this.node.scrollHeight);
    }
}
const out = new output(output_node);
class point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class pointnode {
    constructor(pt) {
        this.index = -1;
        this.pt = pt;
        this.node = document.createElement("div");
        this.indexnode = document.createElement("input");
        this.deletebutton = document.createElement("input");
        this.coords = [];
        this.index = -1;
        this._init_node();
        this._init_index();
        this._init_del();
        this._init_coords();
        this.form();
        this.update();
        this.addCoordListeners();
    }
    form() {
        this.node.appendChild(this.indexnode);
        this.coords.forEach((coord) => {
            coord.type = "text";
            coord.classList.add("coordedit");
            this.node.appendChild(coord);
        });
        this.node.appendChild(this.deletebutton);
    }
    update() {
        this.indexnode.value = `${this.index + 1}`;
        this.coords[0].value = `${this.pt.x}`;
        this.coords[1].value = `${this.pt.y}`;
    }
    addCoordListeners() {
        this.coords[0].addEventListener("input", () => {
            let tmp = Number(this.coords[0].value);
            if (Number.isNaN(tmp))
                return out.error(`Ошибка изменения координаты X точки ${this.index + 1}`);
            this.pt.x = tmp;
            out.log(`Координата X точки ${this.index + 1} изменена на ${tmp}`);
        });
        this.coords[1].addEventListener("input", () => {
            let tmp = Number(this.coords[1].value);
            if (Number.isNaN(tmp))
                return out.error(`Ошибка изменения координаты Y точки ${this.index + 1}`);
            this.pt.y = tmp;
            out.log(`Координата Y точки ${this.index + 1} изменена на ${tmp}`);
        });
    }
    addDelCallback(func) {
        this.deletebutton.addEventListener("click", () => {
            func();
        });
    }
    _init_node() {
        this.node.classList.add("row");
    }
    _init_del() {
        this.deletebutton.classList.add("button");
        this.deletebutton.value = "⨯";
        this.deletebutton.type = "button";
    }
    _init_index() {
        this.indexnode.type = "button";
        this.indexnode.classList.add("button");
    }
    _init_coords() {
        this.coords.push(document.createElement("input"));
        this.coords.push(document.createElement("input"));
    }
}
class pointtable {
    constructor(node_query) {
        this.node = document.querySelector(node_query);
        this.pointarr = [];
    }
    add(pn) {
        let i = this.pointarr.length;
        this.pointarr.push(pn);
        pn.index = i;
        pn.addDelCallback(() => {
            this.remove(pn);
        });
        pn.update();
        this.update();
    }
    remove(pn) {
        out.log(`Удаляю точку ${pn.index + 1}`);
        this.node.removeChild(pn.node);
        this.pointarr = this.pointarr.filter((element) => {
            return element !== pn;
        });
        out.log(`Меняю нумерацию точек...`);
        this.pointarr.forEach((pn, i) => {
            pn.index = i;
            pn.update();
        });
    }
    update() {
        this.pointarr.forEach((pn) => {
            pn.update();
            this.node.appendChild(pn.node);
        });
    }
}
const pts_element = new pointtable(".points");
add_point.addEventListener("click", () => {
    let x_in = input_x.value;
    let y_in = input_y.value;
    let x;
    let y;
    x = Number(x_in);
    if (Number.isNaN(x))
        return out.error("Ошибка чтения значения X новой точки");
    y = Number(y_in);
    if (Number.isNaN(y))
        return out.error("Ошибка чтения значения Y новой точки");
    pts_element.add(new pointnode(new point(x, y)));
});
//#endregion points
//#region circle
const input_center_x = document.querySelector("#ixcenter");
const input_center_y = document.querySelector("#iycenter");
const input_radius = document.querySelector("#iradius");
class Circle {
    constructor(center_x, center_y, radius) {
        this.x = center_x;
        this.y = center_y;
        this.r = radius;
    }
}
//#endregion circle
//#endregion interface
//#region graphics
const canvas = document.querySelector("canvas");
canvas.width = Math.round(canvas.getBoundingClientRect().width);
canvas.height = Math.round(canvas.getBoundingClientRect().height);
const ctx = canvas.getContext("2d");
class graphics {
    constructor(context, xmin, xmax, ymin, ymax) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.context = context;
        this.xmin = xmin;
        this.xmax = xmax;
        this.ymin = ymin;
        this.ymax = ymax;
    }
}
window.addEventListener("resize", (event) => {
    out.warn(`UNIMPLEMENTED Изменение размера холста w: ${Math.round(canvas.getBoundingClientRect().width)} h: ${Math.round(canvas.getBoundingClientRect().height)}`);
});
