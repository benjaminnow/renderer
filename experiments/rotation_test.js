import * as utils from "../utils.js"

window.setup = function() {
    createCanvas(800, 800);
    stroke(255, 204, 0);
}

let theta = 0.0;

window.draw = function() {
    background(0);
    let vec = new utils.Vec3d(100, 0, 0);

    if (keyIsDown(37)) {
		theta += 0.01;
	}

	if (keyIsDown(39)) {
		theta -= 0.01;
	}

    console.log(theta);
    
    let rotmat = new utils.Mat4x4();
    utils.matrix_roty(rotmat, theta);

    vec = utils.matrix_multiply_vector(vec, rotmat);
    

    line(width / 2, height / 2, width / 2 + vec.x, height / 2 + vec.z);
}