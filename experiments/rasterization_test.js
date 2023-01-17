// have resizable triangle by mouse over verts
// fill in triangle with solid color pixel-by-pixel
import * as utils from "../utils.js"

let tri;
let pd;

window.setup = function() {
    createCanvas(1000, 700);
    tri = [new utils.Vec2d(500, 300), new utils.Vec2d(300, 500), new utils.Vec2d(700, 600)];
    pd = pixelDensity();
}

function draw_verts() {
    noFill();
    stroke(255);
    for (let v of tri) {
        circle(v.u, v.v, 20);
    }
}

function rasterize() {
    // sort points of triangle based on Y-value
    let p1 = tri[0];
    let p2 = tri[1];
    let p3 = tri[2];

    let temp;
    if (p2.v < p1.v) {
        temp = structuredClone(p1);
        p1 = p2;
        p2 = temp;
    }
    if (p3.v < p1.v) {
        temp = structuredClone(p1);
        p1 = p3;
        p3 = temp;
    }
    if (p3.v < p2.v) {
        temp = structuredClone(p2);
        p2 = p3;
        p3 = temp;
    }

    loadPixels();
    // 2 parts, drawing the upper triangle (if it exists) then drawing the 
    // lower triangle (if it exists)
    // upper triangle exists if p2.v - p1.v > 0
    // lower triangle exists if p3.v - p2.v > 0

    // upper triangle
    if (p2.v - p1.v > 0) {
        // start step is the step for the left side
        // end step is step for right side
        
        // if we have an upper triangle, we want to expand out so start must
        // be slower growing than stop
        let start_step = (p2.u - p1.u) / (p2.v - p1.v);
        let end_step = (p3.u - p1.u) / (p3.v - p1.v);
        if (start_step > end_step) {
            let temp = start_step;
            start_step = end_step;
            end_step = temp;
        }
        

        let start = p1.u;
        let end = p1.u;

        for (let y = p1.v; y <= p2.v; y++) {
            // draw scanline between start and end
            for (let x = Math.floor(start); x <= Math.floor(end); x++) {
                for (let i = 0; i < pd; i++) {
                    for (let j = 0; j < pd; j++) {
                        let index = 4 * ((y * pd + j) * width * pd + (x * pd + i));
                        pixels[index] = 255;
                        pixels[index+1] = 0;
                        pixels[index+2] = 0;
                        pixels[index+3] = 255;
                    }
                }
            }
            start += start_step;
            end += end_step;
        }
    }
    // lower triangle
    if (p3.v - p2.v > 0) {
        let start_step = (p3.u - p2.u) / (p3.v - p2.v);
        let end_step = (p3.u - p1.u) / (p3.v - p1.v);

        // if we're doing a lower triangle we want start to be growing quicker
        // than stop so that it ends in a point
        if (start_step < end_step) {
            let temp = start_step;
            start_step = end_step;
            end_step = temp;
        }

        let endpt1 = p2.u;
        // draw horizontal line from p2 to other edge to get initial end point
        // rearranged the point slope form of a line, substituted y2, solved for x
        let endpt2 = (p2.v - p1.v) * ((p3.u - p1.u) / (p3.v - p1.v)) + p1.u;
        let start;
        let end;
        if (endpt1 < endpt2) {
            start = endpt1;
            end = endpt2;
        } else {
            start = endpt2;
            end = endpt1;
        }

        for (let y = p2.v; y <= p3.v; y++) {
            // draw scanline between start and end
            for (let x = Math.floor(start); x <= Math.floor(end); x++) {
                for (let i = 0; i < pd; i++) {
                    for (let j = 0; j < pd; j++) {
                        let index = 4 * ((y * pd + j) * width * pd + (x * pd + i));
                        pixels[index] = 0;
                        pixels[index+1] = 255;
                        pixels[index+2] = 0;
                        pixels[index+3] = 255;
                    }
                }
            }
            start += start_step;
            end += end_step;
        }
    }


    updatePixels();
    
}

// variable keep track of vert mouse is inside so distance check doesn't need
// to keep happening, sometimes mouse moves too quickly and drawing can't be
// updated quickly enough
let inside = -1;

function update_verts() {
    if (mouseIsPressed) {
        // check if mouse is inside one of the verts
        for (let i = 0; i < 3; i++) {
            let dist = (tri[i].u - mouseX)*(tri[i].u - mouseX) + (tri[i].v - mouseY)*(tri[i].v - mouseY);
            if (dist < 400 || inside == i) {
                tri[i].u = mouseX;
                tri[i].v = mouseY;
                inside = i;
                break;
            }
        }
    } else {
        inside = -1;
    }
}

function in_aabb(x, y) {
    // checks if (x, y) point is within the axis-aligned bounding box of the
    // triangle as a first step towards checking if a point is within the triangle
    let x_min = Math.min(tri[0].u, tri[1].u, tri[2].u);
    let x_max = Math.max(tri[0].u, tri[1].u, tri[2].u);
    let y_min = Math.min(tri[0].v, tri[1].v, tri[2].v);
    let y_max = Math.max(tri[0].v, tri[1].v, tri[2].v);

    if (x < x_min || x > x_max || y < y_min || y > y_max) {
        return false;
    } else {
        return true;
    }
}

function vector_intersect(v1_start, v1_end, v2_start, v2_end) {
    // determining if vectors v1 and v2 intersect
    // one of them representes the vector from outside the triangle to the point potentially in triangle
    // other vector represents side of triangle
    // this is used to determine the number of intersections to determine if the
    // point is inside the triangle or not

    // convect vector 1 to line of inf length using standard form lin eq
    let a1 = v1_end.v - v1_start.v;
    let b1 = v1_start.u - v1_end.u;
    let c1 = (v1_end.u * v1_start.v) - (v1_start.u * v1_end.v);

    // now take vector 2's endpoints and substitute into eq above
    // the answer will have a positive/negative sign depending on which side that
    // specific endpoint of vector 2 is on relative to vector 1's line
    // for vector 2 to intersect vector 1 line, the endpoints have to be on different
    // sides of vector 1, so signs must be different
    let d1 = (a1 * v2_start.u) + (b1 * v2_start.v) + c1;
    let d2 = (a1 * v2_end.u) + (b1 * v2_end.v) + c1;

    // check if on same side
    if (d1 * d2 > 0) {
        return false;
    }

    // if here, vector 2 intersects infinite line of vector 1 but both vectors
    // only intersect if vector 1 also intersects the infinite line of vector 2
    // so check the other way
    let a2 = v2_end.v - v2_start.v;
    let b2 = v2_start.u - v2_end.u;
    let c2 = (v2_end.u * v2_start.v) - (v2_start.u * v2_end.v);

    d1 = (a2 * v1_start.u) + (b2 * v1_start.v) + c2;
    d2 = (a2 * v1_end.u) + (b2 * v1_end.v) + c2;

    if (d1 * d2 > 0) {
        return false;
    }

    // here, lines either intersect once or infinite many times (collinear), so
    
    return true
}

function inside_tri(x, y) {
    // function which tests if a point is inside the triangle
    // idea: if ray from outside triangle to point crosses even number of sides
    // then point outside triangle
    // if ray passes through odd number of sides, then point inside triangle
    // since: pass thru side - inside, pass thru side - outside, ... alternates

    // first check if in aabb at least
    if (!in_aabb(x, y)) {
        return false;
    }

    let intersections = 0;

    // vector of outside triangle to point
    let x_min = Math.min(tri[0].u, tri[1].u, tri[2].u);
    let pv_start = new utils.Vec2d(x_min - 1, 0);
    let pv_end = new utils.Vec2d(x, y);

    for (let i = 0; i < 3; i++) {
        let start = tri[i];
        let end = tri[(i + 1) % 3];

        if (vector_intersect(pv_start, pv_end, start, end)) {
            intersections++;
        }
    }

    if (intersections % 2 == 1) {
        return true;
    } else {
        return false;
    }
}

function drag_tri() {
    if (mouseIsPressed && inside == -1 && inside_tri(mouseX, mouseY)) {
        for (let i = 0; i < 3; i++) {
            tri[i].u += movedX;
            tri[i].v += movedY;
        }
    }
}


window.draw = function() {
    background(0);
    update_verts();
    drag_tri();
    rasterize();
    draw_verts();
}