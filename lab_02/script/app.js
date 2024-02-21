"use strict";
const EPS = 1e-10;
const DEBUG = false;
const RENDER_SCALE = 1;
let dark = false;
let STROKE_COLOR = "#222222";
let STROKE_COLOR_DARK = "#aaaaaa";
//#region geometry
function distance(pt1, pt2) {
    return Math.sqrt((pt2.x - pt1.x) * (pt2.x - pt1.x) + (pt2.y - pt1.y) * (pt2.y - pt1.y));
}
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
class Polygon {
    constructor(verts) {
        this.vertexes = verts;
    }
}
class Circle {
    constructor(center, radius) {
        this.center = center;
        this.r = radius;
        this.rx = this.r;
        this.ry = this.r;
        this.x1 = new Point(this.center.x - this.r, this.center.y);
        this.x2 = new Point(this.center.x + this.r, this.center.y);
        this.y1 = new Point(this.center.x, this.center.y - this.r);
        this.y2 = new Point(this.center.x, this.center.y + this.r);
        this.angle = 0;
    }
    update() {
        this.rx = distance(this.x1, this.x2) / 2.0;
        this.ry = distance(this.y1, this.y2) / 2.0;
        this.angle = Math.atan2(this.x2.y - this.x1.y, this.x2.x - this.x1.x);
    }
}
class Line {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.k = (p2.y - p1.y) / (p2.x - p1.x);
        this.c = p1.y - this.k * p1.x;
    }
    getYbyX(x) {
        if (!Number.isFinite(this.k))
            return null;
        return x * this.k + this.c;
    }
    getXbyY(y) {
        if (!this.k)
            return null;
        return (y - this.c) / this.k;
    }
    isHorizontal() {
        return !this.k;
    }
    isVertical() {
        return !Number.isFinite(this.k);
    }
}
class Ellipse {
    constructor(center, width, height, rotation = 0, startAngle = 0, endAngle = Math.PI * 2, cc = false) {
        this.center = center;
        this.width = width;
        this.height = height;
        this.rotation = rotation;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
        this.cc = cc;
    }
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
// const input_center_x: HTMLInputElement = document.querySelector("#ixcenter")!;
// const input_center_y: HTMLInputElement = document.querySelector("#iycenter")!;
// const input_radius: HTMLInputElement = document.querySelector("#iradius")!;
const run_button = document.querySelector("#submit");
// const input_x: HTMLInputElement = document.querySelector("#inewx")!;
// const input_y: HTMLInputElement = document.querySelector("#inewy")!;
// const add_point: HTMLInputElement = document.querySelector("#padd")!;
// const clear_points: HTMLInputElement = document.querySelector("#clearall")!;
const clear_output = document.querySelector("#clearout");
const output_node = document.querySelector(".footertext");
const change_theme = document.querySelector("#themechange");
//#region output
class Output {
    constructor(node) {
        this.node = node;
    }
    write(text, prefix) {
        this.node.innerHTML += prefix + text.replace(/\n/, "<br />") + "<br />";
        this.scrollToBottom();
    }
    clear() {
        this.node.innerHTML = ``;
    }
    warn(text) {
        if (DEBUG)
            this.write(text, "WARN: ");
    }
    log(text) {
        if (DEBUG)
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
clear_output.addEventListener("click", () => {
    out.clear();
    graphics.endFrame();
});
//#endregion
change_theme.addEventListener("click", () => {
    dark = !dark;
    let everything = document.querySelectorAll("*");
    if (dark)
        for (let node of everything) {
            node.classList.add("dark");
        }
    else
        for (let node of everything) {
            node.classList.remove("dark");
        }
    graphics.context.strokeStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
    graphics.context.fillStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
});
class Logic {
    constructor(fg_graphics, buf_graphics, bg_graphics) {
        this.transformations = [];
        this.fg_graphics = fg_graphics;
        this.buf_graphics = buf_graphics;
        this.bg_graphics = bg_graphics;
    }
    draw_bg() {
        this.draw_figure(this.bg_graphics);
        let points = [center_circle.center];
        for (let transf of this.transformations) {
            let tmp = transf.getPoint();
            if (tmp) {
                points.filter((el) => {
                    return !pointsAreEqual(el, tmp);
                });
                points.push(tmp);
            }
        }
        for (let point of points) {
            this.bg_graphics.drawPoint(point, `(${point.x}, ${point.y})`, this.bg_graphics.context, "red");
        }
    }
    draw_figure(graph) {
        graph.drawPolygon(square_left);
        graph.drawPolygon(square_right);
        graph.drawCircleManually(center_circle, 0, Math.PI * 2);
        graph.drawEllipseManually(fig_ellipse.center.x, fig_ellipse.center.y, fig_ellipse.width, fig_ellipse.height, fig_ellipse.startAngle, fig_ellipse.endAngle);
        graph.drawEllipse(fig_ellipse);
    }
    draw_fg() {
        this.fg_graphics.transformations = this.transformations;
        this.draw_figure(this.fg_graphics);
    }
    addTransformation(transf) {
        this.transformations.push(transf);
    }
}
//#endregion
//#region graphics
const bg_canvas = document.querySelector("#staticPlane");
const fg_canvas = document.querySelector("#dynamicPlane");
const buf_canvas = document.querySelector("#tmp");
fg_canvas.width = Math.round(fg_canvas.getBoundingClientRect().width * RENDER_SCALE);
fg_canvas.height = Math.round(fg_canvas.getBoundingClientRect().height * RENDER_SCALE);
bg_canvas.width = Math.round(fg_canvas.getBoundingClientRect().width * RENDER_SCALE);
bg_canvas.height = Math.round(fg_canvas.getBoundingClientRect().height * RENDER_SCALE);
buf_canvas.width = Math.round(fg_canvas.getBoundingClientRect().width * 4 * RENDER_SCALE);
buf_canvas.height = Math.round(fg_canvas.getBoundingClientRect().height * 4 * RENDER_SCALE);
const fg_ctx = fg_canvas.getContext("2d");
const bg_ctx = bg_canvas.getContext("2d");
const buf_ctx = buf_canvas.getContext("2d");
class Transformation {
    constructor() { }
    apply(graph) { }
    getPoint() {
        return null;
    }
    transformPoint(pt) {
        return pt;
    }
    transformAngle(angle) {
        return angle;
    }
    transformCircle(circ) {
        return circ;
    }
}
class RotateTransformation extends Transformation {
    constructor(pivot, angle) {
        super();
        this.pivot = pivot;
        this.angle = angle;
    }
    apply(graph) {
        let tmp_pivot = graph.getCanvasCoords(this.pivot);
        graph.context.translate(tmp_pivot.x, tmp_pivot.y);
        graph.context.rotate(this.angle);
        graph.context.translate(-tmp_pivot.x, -tmp_pivot.y);
    }
    getPoint() {
        return this.pivot;
    }
    transformPoint(pt) {
        //prettier-ignore
        return new Point((pt.x - this.pivot.x) * Math.cos(this.angle) - (pt.y - this.pivot.y) * Math.sin(this.angle) + this.pivot.x, (pt.x - this.pivot.x) * Math.sin(this.angle) + (pt.y - this.pivot.y) * Math.cos(this.angle) + this.pivot.y);
    }
    transformAngle(angle) {
        return angle + this.angle;
    }
    transformCircle(circ) {
        let res = new Circle(circ.center, circ.r);
        res.center = this.transformPoint(circ.center);
        res.x1 = this.transformPoint(circ.x1);
        res.x2 = this.transformPoint(circ.x2);
        res.y1 = this.transformPoint(circ.y1);
        res.y2 = this.transformPoint(circ.y2);
        res.update();
        console.log(circ, res);
        return res;
    }
}
class ScaleTransformation extends Transformation {
    constructor(origin, scale) {
        super();
        this.origin = origin;
        this.scale = scale;
    }
    apply(graph) {
        let tmp_origin = graph.getCanvasCoords(this.origin);
        graph.context.transform(this.scale.x, 0, 0, this.scale.y, tmp_origin.x * (1 - this.scale.x), tmp_origin.y * (1 - this.scale.y));
    }
    getPoint() {
        return this.origin;
    }
    transformPoint(pt) {
        //prettier-ignore
        return new Point(pt.x * this.scale.x + this.origin.x * (1 - this.scale.x), pt.y * this.scale.y + this.origin.y * (1 - this.scale.y));
    }
    transformRadiuses(rads, angle) {
        return { x: rads.x * this.scale.x, y: rads.y * this.scale.y };
    }
    transformCircle(circ) {
        let res = new Circle(circ.center, circ.r);
        res.center = this.transformPoint(circ.center);
        res.x1 = this.transformPoint(circ.x1);
        res.x2 = this.transformPoint(circ.x2);
        res.y1 = this.transformPoint(circ.y1);
        res.y2 = this.transformPoint(circ.y2);
        res.update();
        return res;
    }
}
class TranslateTransformation extends Transformation {
    constructor(translation) {
        super();
        this.translation = translation;
    }
    apply(graph) {
        graph.context.transform(1, 0, 0, 1, this.translation.x * graph.scale, this.translation.y * graph.scale);
    }
    transformPoint(pt) {
        //prettier-ignore
        return new Point(pt.x + this.translation.x, pt.y + this.translation.y);
    }
}
//#region figure
const tri_s_len = 200;
const tri_h = Math.sqrt((tri_s_len * tri_s_len * 3) / 4);
const center_triangle = new Triangle(new Point(-tri_s_len / 2, -tri_h / 3), new Point(0, (tri_h * 2) / 3), new Point(tri_s_len / 2, -tri_h / 3));
const center_circle = new Circle(new Point(0, 0), tri_s_len / 2 / Math.sqrt(3));
const square_left = new Polygon([
    center_triangle.vertex2,
    center_triangle.vertex1,
    new Point(center_triangle.vertex1.x - tri_s_len * Math.cos(toRad(30)), center_triangle.vertex1.y + tri_s_len * Math.sin(toRad(30))),
    new Point(-tri_s_len * Math.cos(toRad(30)), center_triangle.vertex2.y + tri_s_len * Math.sin(toRad(30))),
]);
const square_right = new Polygon([
    center_triangle.vertex2,
    center_triangle.vertex3,
    new Point(center_triangle.vertex3.x + tri_s_len * Math.cos(toRad(30)), center_triangle.vertex3.y + tri_s_len * Math.sin(toRad(30))),
    new Point(+tri_s_len * Math.cos(toRad(30)), center_triangle.vertex2.y + tri_s_len * Math.sin(toRad(30))),
]);
const fig_ellipse = new Ellipse(new Point(0, center_triangle.vertex1.y), tri_s_len / 2, center_circle.r, 0, Math.PI, Math.PI * 2, true);
//#endregion
function multiplyMatrices(matrix1, matrix2) {
    return [
        matrix1[0] * matrix2[0] + matrix1[2] * matrix2[1],
        matrix1[1] * matrix2[0] + matrix1[3] * matrix2[1],
        matrix1[0] * matrix2[2] + matrix1[2] * matrix2[3],
        matrix1[1] * matrix2[2] + matrix1[3] * matrix2[3],
        matrix1[0] * matrix2[4] + matrix1[2] * matrix2[5] + matrix1[4],
        matrix1[1] * matrix2[4] + matrix1[3] * matrix2[5] + matrix1[5],
    ];
}
function inverseTransformPoint(matrix, pt) {
    const det = matrix[0] * matrix[3] - matrix[1] * matrix[2];
    if (det === 0) {
        throw new Error("Матрица необратима");
    }
    const inverseMatrix = [
        matrix[3] / det,
        -matrix[1] / det,
        -matrix[2] / det,
        matrix[0] / det,
    ];
    const x = pt.x - matrix[4];
    const y = pt.y - matrix[5];
    const newX = inverseMatrix[0] * x + inverseMatrix[1] * y;
    const newY = inverseMatrix[2] * x + inverseMatrix[3] * y;
    return new Point(newX, newY);
}
class Graphics {
    constructor(context, context_node, color) {
        this.transformations = [];
        this.canvas_width = fg_canvas.width;
        this.canvas_height = fg_canvas.height;
        this.context = context;
        this.context_node = context_node;
        this.width = this.canvas_width;
        this.height = this.canvas_height;
        this.minx = 0;
        this.miny = 0;
        this.maxx = this.width;
        this.maxy = this.height;
        this.base = { x: 0, y: -this.maxy };
        this.aspect_ratio = this.canvas_width / this.canvas_height;
        this.scale = 1;
        this.context.textAlign = "center";
        this.context.font = `${RENDER_SCALE * 16}px serif`;
        this.context.lineWidth = 3 * RENDER_SCALE;
        if (color) {
            this.context.fillStyle = color;
            this.context.strokeStyle = color;
        }
        else {
            this.context.fillStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
            this.context.strokeStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
        }
    }
    getCanvasCoords(pt) {
        return new Point(this.base.x + (pt.x - this.minx) * this.scale, -(this.base.y + (pt.y - this.miny) * this.scale));
    }
    drawPoint(pt, text, context = this.context, color) {
        if (this.minx > pt.x ||
            this.maxx < pt.x ||
            this.miny > pt.y ||
            this.maxy < pt.y)
            return null;
        let cpt = this.getCanvasCoords(pt);
        if (!cpt)
            return;
        context.beginPath();
        this.context.save();
        if (color)
            context.strokeStyle = color;
        if (color)
            context.fillStyle = color;
        context.arc(cpt.x, cpt.y, 3, 0, Math.PI * 2);
        context.fill();
        context.closePath();
        context.beginPath();
        context.fillText(text, cpt.x, cpt.y - 10 * RENDER_SCALE);
        context.closePath();
        this.context.restore();
    }
    drawCircle(circ, addText = false, context = this.context, color) {
        let circle = circ;
        let cpt = circ.center;
        for (let tr of this.transformations)
            circle = tr.transformCircle(circle);
        cpt = this.getCanvasCoords(circle.center);
        circle.rx *= this.scale;
        circle.ry *= this.scale;
        context.beginPath();
        let prevColor = context.strokeStyle;
        if (color)
            context.strokeStyle = color;
        // context.arc(cpt.x, cpt.y, circ.r * this.scale, 0, Math.PI * 2);
        context.ellipse(cpt.x, cpt.y, circle.rx, circle.ry, circle.angle, 0, Math.PI * 2, false);
        context.stroke();
        context.strokeStyle = prevColor;
        context.closePath();
        if (addText) {
            this.drawPoint(circ.center, `C: ${circ.center.toString()}`, context, color);
            this.drawPoint(circle.x1, `x1: ${circle.x1.toString()}`, context, color);
            this.drawPoint(circle.x2, `x1: ${circle.x2.toString()}`, context, color);
            this.drawPoint(circle.y1, `x1: ${circle.y1.toString()}`, context, color);
            this.drawPoint(circle.y2, `x1: ${circle.y2.toString()}`, context, color);
        }
    }
    drawCircleManually(circ, minAngle, maxAngle) {
        let r = circ.r;
        let cx = circ.center.x;
        let cy = circ.center.y;
        let start;
        this.context.beginPath();
        for (let angle = minAngle; angle < maxAngle; angle += 1 / r) {
            let pt = new Point(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
            for (let tr of this.transformations)
                pt = tr.transformPoint(pt);
            pt = this.getCanvasCoords(pt);
            if (start === undefined) {
                start = pt;
                this.context.moveTo(start.x, start.y);
            }
            else
                this.context.lineTo(pt.x, pt.y);
        }
        this.context.lineTo(start.x, start.y);
        this.context.stroke();
        this.context.closePath();
    }
    drawTriangle(tri, context = this.context, color) {
        let p1 = new Point(tri.vertex1.x, tri.vertex1.y);
        let p2 = new Point(tri.vertex2.x, tri.vertex2.y);
        let p3 = new Point(tri.vertex3.x, tri.vertex3.y);
        for (let tr of this.transformations) {
            p1 = tr.transformPoint(p1);
            p2 = tr.transformPoint(p2);
            p3 = tr.transformPoint(p3);
        }
        p1 = this.getCanvasCoords(p1);
        p2 = this.getCanvasCoords(p2);
        p3 = this.getCanvasCoords(p3);
        context.beginPath();
        let prevColor = context.strokeStyle;
        if (color)
            context.strokeStyle = color;
        context.moveTo(p1.x, p1.y);
        context.lineTo(p2.x, p2.y);
        context.lineTo(p3.x, p3.y);
        context.lineTo(p1.x, p1.y);
        context.stroke();
        context.strokeStyle = prevColor;
        context.closePath();
    }
    drawPolygon(poly, context = this.context, color) {
        context.beginPath();
        let prevColor = context.strokeStyle;
        if (color)
            context.strokeStyle = color;
        let start;
        for (let i = 0; i < poly.vertexes.length; ++i) {
            let pt = new Point(poly.vertexes[i].x, poly.vertexes[i].y);
            for (let tr of this.transformations)
                pt = tr.transformPoint(pt);
            pt = this.getCanvasCoords(pt);
            if (i == 0) {
                start = pt;
                this.context.moveTo(pt.x, pt.y);
            }
            else
                this.context.lineTo(pt.x, pt.y);
        }
        context.lineTo(start.x, start.y);
        context.stroke();
        context.strokeStyle = prevColor;
        context.closePath();
    }
    drawSegment(p1, p2, context = this.context, color) {
        let pt1 = new Point(p1.x, p1.y);
        let pt2 = new Point(p2.x, p2.y);
        for (let tr of this.transformations) {
            pt1 = tr.transformPoint(pt1);
            pt2 = tr.transformPoint(pt2);
        }
        pt1 = this.getCanvasCoords(pt1);
        pt2 = this.getCanvasCoords(pt2);
        context.beginPath();
        let prevColor = context.strokeStyle;
        if (color)
            context.strokeStyle = color;
        context.moveTo(pt1.x, pt1.y);
        context.lineTo(pt2.x, pt2.y);
        context.stroke();
        context.strokeStyle = prevColor;
        context.closePath();
    }
    drawEllipse(el, context = this.context, color) {
        let cpt = this.getCanvasCoords(el.center);
        context.beginPath();
        let prevColor = context.strokeStyle;
        if (color)
            context.strokeStyle = color;
        context.ellipse(cpt.x, cpt.y, el.width * this.scale, el.height * this.scale, el.rotation, el.startAngle, el.endAngle, el.cc);
        context.stroke();
        context.strokeStyle = prevColor;
        context.closePath();
    }
    drawEllipseManually(xc, yc, rx, ry, minAngle, maxAngle) {
        this.context.beginPath();
        let maxr = Math.max(rx, ry);
        let start;
        for (let angle = minAngle; angle < maxAngle; angle += 1 / maxr) {
            let pt = new Point(xc + rx * Math.cos(angle), yc + ry * Math.sin(angle));
            for (let tr of this.transformations)
                pt = tr.transformPoint(pt);
            pt = this.getCanvasCoords(pt);
            if (start === undefined) {
                start = pt;
                this.context.moveTo(start.x, start.y);
            }
            else
                this.context.lineTo(pt.x, pt.y);
        }
        this.context.lineTo(start.x, start.y);
        this.context.stroke();
        this.context.closePath();
    }
    drawCanvas(canvas, dx = 0, dy = 0) {
        this.context.drawImage(canvas, dx, dy);
    }
    endFrame() {
        this.context.clearRect(0, 0, this.canvas_width, this.canvas_height);
    }
    setBoundaries(bounds) {
        let xmin = bounds.x_min;
        let xmax = bounds.x_max;
        let ymin = bounds.y_min;
        let ymax = bounds.y_max;
        let new_w = xmax - xmin;
        let new_h = ymax - ymin;
        let tmp_ar = new_w / new_h;
        if (tmp_ar < this.aspect_ratio) {
            let x_scale = (new_h / new_w) * this.aspect_ratio;
            let diff = new_w * x_scale - new_w;
            xmax += diff / 2;
            xmin -= diff / 2;
            new_w = new_w * x_scale;
        }
        else {
            let y_scale = new_w / new_h / this.aspect_ratio;
            let diff = new_h * y_scale - new_h;
            ymax += diff / 2;
            ymin -= diff / 2;
            new_h = new_h * y_scale;
        }
        let newscale = this.canvas_width / new_w;
        this.minx = xmin;
        this.maxx = xmax;
        this.miny = ymin;
        this.maxy = ymax;
        this.scale = newscale;
        this.width = new_w;
        this.height = new_h;
        out.log("Меняю масштаб и пределы. Текущий масштаб: " +
            `${toPrecision(this.scale, 2)} пикс. к 1 ед координат`);
        out.log(`x: [${toPrecision(xmin, 2)}; ${toPrecision(xmax, 2)}]   ` +
            `y: [${toPrecision(ymin, 2)}; ${toPrecision(ymax, 2)}]`);
    }
    updateStrokeColor() {
        this.context.fillStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
        this.context.strokeStyle = dark ? STROKE_COLOR_DARK : STROKE_COLOR;
    }
}
window.addEventListener("resize", () => {
    out.warn(`UNIMPLEMENTED Изменение размера холста w: ${Math.round(fg_canvas.getBoundingClientRect().width)} h: ${Math.round(fg_canvas.getBoundingClientRect().height)}`);
});
const graphics = new Graphics(fg_ctx, fg_canvas);
const buf_graphics = new Graphics(buf_ctx, buf_canvas);
const bg_graphics = new Graphics(bg_ctx, bg_canvas, "#cccccc");
const graphics_arr = [graphics, buf_graphics, bg_graphics];
//#endregion graphics
const logic = new Logic(graphics, buf_graphics, bg_graphics);
// let test = new RotateTransformation(new Point(0, 0), toRad(90));
// let test2 = new ScaleTransformation(new Point(0, 0), { x: 1, y: 2 });
// let test3 = new RotateTransformation(new Point(-100, 100), toRad(35));
// let test4 = new ScaleTransformation(new Point(0, 0), { x: 0.7, y: 2 });
// let test5 = new RotateTransformation(new Point(-120, -100), toRad(180));
let test6 = new ScaleTransformation(new Point(0, 0), { x: 0.1, y: 0.1 });
// logic.addTransformation(test2);
// logic.addTransformation(test);
// logic.addTransformation(test3);
// logic.addTransformation(test4);
// logic.addTransformation(test5);
logic.addTransformation(test6);
// logic.addTransformation(test);
run_button.addEventListener("click", () => {
    graphics_arr.forEach((graphics) => {
        graphics.endFrame();
        graphics.setBoundaries({
            x_min: -800,
            x_max: 800,
            y_min: -400,
            y_max: 400,
        });
    });
    logic.draw_bg();
    logic.draw_fg();
});
