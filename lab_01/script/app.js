"use strict";
const EPS = 1e-6;
//#region geometry
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `(${this.x}, ${this.y})`;
    }
}
function pointsAreEqual(p1, p2) {
    return Math.abs(p1.x - p2.x) < EPS && Math.abs(p1.y - p2.y) < EPS;
}
class Triangle {
    constructor(p1, p2, p3) {
        this.vertex1 = p1;
        this.vertex2 = p2;
        this.vertex3 = p3;
    }
}
class Circle {
    constructor(center, radius) {
        this.center = center;
        this.r = radius;
    }
}
class Line {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
    pointOnLine(p) {
        return pointsInLine(this.p1, this.p2, p);
    }
}
function pointsInLine(a, b, c) {
    // (Cy - Ay) * (Bx - Ax) = (By - Ay) * (Cx - Ax)
    return Math.abs((c.y - a.y) * (b.x - a.x) - (b.y - a.y) * (c.x - a.x)) < EPS;
}
function isTrianle(p1, p2, p3) {
    return !pointsInLine(p1, p2, p3);
}
function angleBetween(p1, p2) {
    // то же самое, что arctan(dy/dx) между 2-мя точками
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}
function minAngleBetween(p1, p2) {
    let angle = angleBetween(p1, p2);
    if (angle < 0)
        return Math.abs(angle) < Math.abs(angle + Math.PI)
            ? angle
            : angle + Math.PI;
    return Math.abs(angle) < Math.abs(angle - Math.PI) ? angle : angle - Math.PI;
}
function PointsAngleWithX(p1, p2) {
    let angle = angleBetween(p1, p2);
    if (Math.abs(angle) < EPS)
        return 0;
    if (angle < 0)
        angle += Math.PI;
    return angle;
}
function LineAngleWithX(l) {
    return PointsAngleWithX(l.p1, l.p2);
}
function toDeg(angle_rad) {
    return (angle_rad * 180) / Math.PI;
}
function toRad(angle_deg) {
    return (angle_deg / 180) * Math.PI;
}
function toPrecision(num, precision) {
    return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
}
//#endregion geometry
//#region interface
const input_center_x = document.querySelector("#ixcenter");
const input_center_y = document.querySelector("#iycenter");
const input_radius = document.querySelector("#iradius");
const run_button = document.querySelector("#submit");
//#region points
const input_x = document.querySelector("#inewx");
const input_y = document.querySelector("#inewy");
const add_point = document.querySelector("#padd");
const output_node = document.querySelector(".footer");
class Output {
    constructor(node) {
        this.node = node;
    }
    write(text, prefix) {
        this.node.innerHTML += prefix + text + "<br><br>";
        this.scrollToBottom();
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
    scrollToBottom() {
        this.node.scroll(0, this.node.scrollHeight);
    }
}
const out = new Output(output_node);
class PointNode {
    constructor(pt) {
        this.index = -1;
        this.pt = pt;
        this.node = document.createElement("div");
        this.indexnode = document.createElement("input");
        this.deletebutton = document.createElement("input");
        this.coords = [];
        this.index = -1;
        this._initNode();
        this._initIndex();
        this._initDel();
        this._initCoords();
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
            if (Number.isNaN(tmp) || !this.coords[0].value)
                return out.error(`Ошибка изменения координаты X точки ${this.index + 1}`);
            this.pt.x = tmp;
            out.log(`Координата X точки ${this.index + 1} изменена на ${tmp}`);
        });
        this.coords[1].addEventListener("input", () => {
            let tmp = Number(this.coords[1].value);
            if (Number.isNaN(tmp) || !this.coords[1].value)
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
    _initNode() {
        this.node.classList.add("row");
    }
    _initDel() {
        this.deletebutton.classList.add("button");
        this.deletebutton.value = "⨯";
        this.deletebutton.type = "button";
    }
    _initIndex() {
        this.indexnode.type = "button";
        this.indexnode.classList.add("button");
    }
    _initCoords() {
        this.coords.push(document.createElement("input"));
        this.coords.push(document.createElement("input"));
    }
    toString() {
        return `${this.index + 1}: ${this.pt.toString()}`;
    }
}
class PointTable {
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
const pts_element = new PointTable(".points");
add_point.addEventListener("click", () => {
    let x_in = input_x.value;
    let y_in = input_y.value;
    let x;
    let y;
    x = Number(x_in);
    if (Number.isNaN(x) || !x_in)
        return out.error("Ошибка чтения значения X новой точки");
    y = Number(y_in);
    if (Number.isNaN(y) || !y_in)
        return out.error("Ошибка чтения значения Y новой точки");
    pts_element.add(new PointNode(new Point(x, y)));
});
//#endregion points
//#endregion interface
//#region logic
class Logic {
    constructor() { }
    findTrianglesIntersectingCircle(points, circ) {
        if (points.length < 3) {
            return out.error(`Недостаточно точек для построения даже одного треугольника`);
        }
        const triangles = [];
        for (let i = 0; i < points.length - 2; i++)
            for (let j = i + 1; j < points.length - 1; j++)
                for (let k = j + 1; k < points.length; k++) {
                    if (i == j || i == k || j == k)
                        continue;
                    if (isTrianle(points[i].pt, points[j].pt, points[k].pt))
                        triangles.push([points[i], points[j], points[k]]);
                }
        if (!triangles.length) {
            return out.error(`На этих точках не удалось построить ни одного треугольника`);
        }
        const good_triangles = triangles.filter((tri) => {
            return this.triangleSideIntersectsPoint(tri, circ.center);
        });
        if (!good_triangles.length) {
            return out.error(`Нe нашлось ни одного треугольника, прямая проходящая через вершину которого пересекала бы центр окружности`);
        }
        let min_angle = this.triangleAngleWithXThroughPoint(good_triangles[0], circ.center);
        let min_index = 0;
        good_triangles.forEach((tri, i) => {
            let angle = this.triangleAngleWithXThroughPoint(tri, circ.center);
            if (angle < min_angle) {
                min_angle = angle;
                min_index = i;
            }
            out.write(`Найден подходящий треугольник на точках ${tri[0].index + 1} ${tri[0].pt.toString()}; ${tri[1].index + 1} ${tri[1].pt.toString()}; ${tri[2].index + 1} ${tri[2].pt.toString()}, угол с осью Абсцисс: ${toPrecision(toDeg(angle), 6)}град.`, "");
        });
        let best = good_triangles[min_index];
        out.write(`Треугольник с наименьшим углом к оси абсцисс: ${best[0].index + 1} ${best[0].pt.toString()}; ${best[1].index + 1} ${best[1].pt.toString()}; ${best[2].index + 1} ${best[2].pt.toString()}, угол с осью Абсцисс: ${toPrecision(toDeg(min_angle), 6)}град.`, "");
    }
    triangleSideIntersectsPoint(tri, pt) {
        return (pointsInLine(tri[0].pt, tri[1].pt, pt) ||
            pointsInLine(tri[0].pt, tri[2].pt, pt) ||
            pointsInLine(tri[1].pt, tri[2].pt, pt));
    }
    triangleAngleWithXThroughPoint(tri, pt) {
        for (let i = 0; i < 3; ++i)
            if (pointsAreEqual(tri[i].pt, pt))
                return this.triInterFindMinimal(tri, tri[i]);
        if (pointsInLine(tri[0].pt, tri[1].pt, pt))
            return PointsAngleWithX(tri[0].pt, tri[1].pt);
        if (pointsInLine(tri[0].pt, tri[2].pt, pt))
            return PointsAngleWithX(tri[0].pt, tri[2].pt);
        return PointsAngleWithX(tri[1].pt, tri[2].pt);
    }
    triInterFindMinimal(tri, intersecting) {
        let tmppoints = tri.filter((pnode) => {
            return pnode !== intersecting;
        });
        return Math.min(PointsAngleWithX(intersecting.pt, tmppoints[0].pt), PointsAngleWithX(intersecting.pt, tmppoints[1].pt));
    }
}
const logic = new Logic();
//#endregion
//#region graphics
const canvas = document.querySelector("canvas");
canvas.width = Math.round(canvas.getBoundingClientRect().width);
canvas.height = Math.round(canvas.getBoundingClientRect().height);
const ctx = canvas.getContext("2d");
class Graphics {
    constructor(context) {
        this.width = canvas.width;
        this.height = canvas.height;
        this.context = context;
        this.minx = 0;
        this.miny = 0;
        this.maxx = this.width;
        this.maxy = this.height;
        this.base = { x: 0, y: -this.maxy };
        this.aspect_ratio = this.width / this.height;
        this.scale = 1;
        this.context.textAlign = "center";
        // this.context.textBaseline = "middle";
        this.context.font = "16px serif";
        this.context.beginPath();
        this.context.lineWidth = 1;
        this.context.fillStyle = "black";
        this.context.strokeStyle = "black";
    }
    getCanvasCoords(pt) {
        return new Point(this.base.x + (this.minx + pt.x) * this.scale, -(this.base.y + (this.miny + pt.y) * this.scale));
    }
    drawPoint(pt, text) {
        let cpt = this.getCanvasCoords(pt);
        // this.context.moveTo(cpt.x, cpt.y);
        this.context.beginPath();
        this.context.arc(cpt.x, cpt.y, 3, 0, Math.PI * 2);
        this.context.fill();
        this.context.closePath();
        // this.context.moveTo(cpt.x - 4, cpt.y - 8);
        this.context.beginPath();
        this.context.fillText(text, cpt.x, cpt.y - 10);
        this.context.closePath();
    }
    drawCircle(circ) {
        let cpt = this.getCanvasCoords(circ.center);
        this.context.beginPath();
        this.context.arc(cpt.x, cpt.y, circ.r * this.scale, 0, Math.PI * 2);
        this.context.stroke();
        this.context.closePath();
        this.drawPoint(circ.center, `C: ${circ.center.toString()}`);
    }
    endFrame() {
        this.context.beginPath();
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.fillStyle = "black";
        this.context.closePath();
    }
}
window.addEventListener("resize", () => {
    out.warn(`UNIMPLEMENTED Изменение размера холста w: ${Math.round(canvas.getBoundingClientRect().width)} h: ${Math.round(canvas.getBoundingClientRect().height)}`);
});
const graphics = new Graphics(ctx);
// graphics.drawPoint(new Point(100, 550), "pepega");
//#endregion graphics
run_button.addEventListener("click", () => {
    let x = Number(input_center_x.value);
    if (Number.isNaN(x) || !input_center_x.value)
        return out.error("Ошибка чтения значения координаты x центра окружности");
    let y = Number(input_center_y.value);
    if (Number.isNaN(y) || !input_center_y.value)
        return out.error("Ошибка чтения значения координаты y центра окружности");
    let r = Number(input_radius.value);
    if (Number.isNaN(r) || !input_radius.value)
        return out.error("Ошибка чтения значения радиуса окружности");
    let circ = new Circle(new Point(x, y), r);
    logic.findTrianglesIntersectingCircle(pts_element.pointarr, circ);
    graphics.endFrame();
    graphics.drawCircle(circ);
    pts_element.pointarr.forEach((pn) => {
        graphics.drawPoint(pn.pt, pn.toString());
    });
});
