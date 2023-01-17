import * as utils from "./utils.js"

let mesh = new utils.Mesh();
let mat_proj = new utils.Mat4x4();
let mat_rotz = new utils.Mat4x4();
let mat_rotx = new utils.Mat4x4();
let mat_trans = new utils.Mat4x4();
let camera = new utils.Vec3d(0, 0, 0);
let PI = 3.141592;
let theta = 0.0;
let yaw =  PI / 2;
let pitch = 0.0;
let walking_speed = 10.0;
let mouse_sens = 0.01;

let data;

let mouse_locked = false;

window.mouseClicked = function() {
	// for some reason adding this console log makes it work
	console.log();
	if (!mouse_locked) {
	  mouse_locked = true;
	  requestPointerLock();
	} else {
	  exitPointerLock();
	  mouse_locked = false;
	}
}

window.preload = function() {
	data = loadJSON("json_files/mountains.json");
}

window.setup = function() {
	createCanvas(1000, 800);

	// load 3d object file into the mesh
	// mesh.loadObj(data);

	// south
	let south_t_1 = new utils.Triangle(new utils.Vec3d(0.0, 0.0, 0.0, 1.0), new utils.Vec3d(0.0, 1.0, 0.0, 1.0), new utils.Vec3d(1.0, 1.0, 0.0, 1.0),
									   new utils.Vec2d(0.0, 1.0), new utils.Vec2d(0.0, 0.0), new utils.Vec2d(1.0, 0.0));
	let south_t_2 = new utils.Triangle(new utils.Vec3d(0.0, 0.0, 0.0, 1.0), new utils.Vec3d(1.0, 1.0, 0.0, 1.0), new utils.Vec3d(1.0, 0.0, 0.0, 1.0),
									   new utils.Vec2d(0.0, 1.0), new utils.Vec2d(1.0, 0.0), new utils.Vec2d(1.0, 1.0));
	// east
	let east_t_1 = new utils.Triangle(new utils.Vec3d(1.0, 0.0, 0.0, 1.0), new utils.Vec3d(1.0, 1.0, 0.0, 1.0), new utils.Vec3d(1.0, 1.0, 1.0, 1.0),
									  new utils.Vec2d(0.0, 1.0), new utils.Vec2d(0.0, 0.0), new utils.Vec2d(1.0, 0.0));
	let east_t_2 = new utils.Triangle(new utils.Vec3d(1.0, 0.0, 0.0, 1.0), new utils.Vec3d(1.0, 1.0, 1.0, 1.0), new utils.Vec3d(1.0, 0.0, 1.0, 1.0),
									  new utils.Vec2d(0.0, 1.0), new utils.Vec2d(1.0, 0.0), new utils.Vec2d(1.0, 1.0));
	// north
	let north_t_1 = new utils.Triangle(new utils.Vec3d(1.0, 0.0, 1.0, 1.0), new utils.Vec3d(1.0, 1.0, 1.0, 1.0), new utils.Vec3d(0.0, 1.0, 1.0, 1.0),
									   new utils.Vec2d(0.0, 1.0), new utils.Vec2d(0.0, 0.0), new utils.Vec2d(1.0, 0.0));
	let north_t_2 = new utils.Triangle(new utils.Vec3d(1.0, 0.0, 1.0, 1.0), new utils.Vec3d(0.0, 1.0, 1.0, 1.0), new utils.Vec3d(0.0, 0.0, 1.0, 1.0),
									   new utils.Vec2d(0.0, 1.0), new utils.Vec2d(1.0, 0.0), new utils.Vec2d(1.0, 1.0));
	// west
	let west_t_1 = new utils.Triangle(new utils.Vec3d(0.0, 0.0, 1.0, 1.0), new utils.Vec3d(0.0, 1.0, 1.0, 1.0), new utils.Vec3d(0.0, 1.0, 0.0, 1.0),
									  new utils.Vec2d(0.0, 1.0), new utils.Vec2d(0.0, 0.0), new utils.Vec2d(1.0, 0.0));
	let west_t_2 = new utils.Triangle(new utils.Vec3d(0.0, 0.0, 1.0, 1.0), new utils.Vec3d(0.0, 1.0, 0.0, 1.0), new utils.Vec3d(0.0, 0.0, 0.0, 1.0),
									  new utils.Vec2d(0.0, 1.0), new utils.Vec2d(1.0, 0.0), new utils.Vec2d(1.0, 1.0));
	// top
	let top_t_1 = new utils.Triangle(new utils.Vec3d(0.0, 1.0, 0.0, 1.0), new utils.Vec3d(0.0, 1.0, 1.0, 1.0), new utils.Vec3d(1.0, 1.0, 1.0, 1.0),
									 new utils.Vec2d(0.0, 1.0), new utils.Vec2d(0.0, 0.0), new utils.Vec2d(1.0, 0.0));
	let top_t_2 = new utils.Triangle(new utils.Vec3d(0.0, 1.0, 0.0, 1.0), new utils.Vec3d(1.0, 1.0, 1.0, 1.0), new utils.Vec3d(1.0, 1.0, 0.0, 1.0),
									 new utils.Vec2d(0.0, 1.0), new utils.Vec2d(1.0, 0.0), new utils.Vec2d(1.0, 1.0));
	// bottom
	let bottom_t_1 = new utils.Triangle(new utils.Vec3d(1.0, 0.0, 1.0, 1.0), new utils.Vec3d(0.0, 0.0, 1.0, 1.0), new utils.Vec3d(0.0, 0.0, 0.0, 1.0),
										new utils.Vec2d(0.0, 1.0), new utils.Vec2d(0.0, 0.0), new utils.Vec2d(1.0, 0.0));
	let bottom_t_2 = new utils.Triangle(new utils.Vec3d(1.0, 0.0, 1.0, 1.0), new utils.Vec3d(0.0, 0.0, 0.0, 1.0), new utils.Vec3d(1.0, 0.0, 0.0, 1.0),
										new utils.Vec2d(0.0, 1.0), new utils.Vec2d(1.0, 0.0), new utils.Vec2d(1.0, 1.0));

	mesh.triangles = [south_t_1, south_t_2, 
					  east_t_1, east_t_2, 
					  north_t_1, north_t_2, 
					  west_t_1, west_t_2,
					  top_t_1, top_t_2,
					  bottom_t_1, bottom_t_2];

	// projection matrix
	mat_proj = utils.matrix_make_projection(90.0, height / width, 0.1, 1000.0);

	// translation matrix
	mat_trans = utils.matrix_make_translation(0.0, 0.0, 10.0);
}

window.draw = function() {
	background(0);

	// movedX and movedY hold the delta of how much the mouse position changed
	// between draw calls so can get total offset from center of screen
	// yaw -> rotation around the Y-Axis so looking left and right
	// pitch -> rotation around the X-Axis so looking up and down
	yaw += movedX * mouse_sens;
	pitch -= movedY * mouse_sens;

	if (pitch > PI / 2) {
		pitch = PI / 2;
	}
	if (pitch < - PI / 2) {
		pitch = - PI / 2;
	}

	// setting up rotation matrices
	// theta += deltaTime / 1000.0;
	utils.matrix_rotz(mat_rotz, theta);
	utils.matrix_rotx(mat_rotx, theta * 0.5);

	// creating world matrix which combines rotation, translation, projection
	let mat_world = utils.matrix_multiply_matrix(mat_rotz, mat_rotx);
	mat_world = utils.matrix_multiply_matrix(mat_world, mat_trans);

	// not sure why up is -1 but it works, idk!
	let up = new utils.Vec3d(0, -1, 0);
	let target = new utils.Vec3d(0, 0, 1);
	// look dir based on yaw and pitch values gotten from mouse movement
	let look_dir = new utils.Vec3d(cos(yaw) * cos(pitch), sin(pitch), sin(yaw) * cos(pitch));
	look_dir = utils.vector_normalize(look_dir);
	target = utils.vector_add(camera, look_dir);

	let mat_camera = utils.matrix_point_at(camera, target, up);
	let mat_view = utils.matrix_quick_inverse(mat_camera);

	// processing user input for moving camera
	let look_no_y = utils.vector_normalize(new utils.Vec3d(look_dir.x, 0.0, look_dir.z));
	if (keyIsDown(87)) { // W = forward
		camera.z += utils.vector_dot(new utils.Vec3d(0, 0, 1), look_no_y) * walking_speed * deltaTime / 1000;
		camera.x += utils.vector_dot(new utils.Vec3d(1, 0, 0), look_no_y) * walking_speed * deltaTime / 1000;
	}
	if (keyIsDown(83)) { // S = backwards
		camera.z -= utils.vector_dot(new utils.Vec3d(0, 0, 1), look_no_y) * walking_speed * deltaTime / 1000;
		camera.x -= utils.vector_dot(new utils.Vec3d(1, 0, 0), look_no_y) * walking_speed * deltaTime / 1000;
	}
	if (keyIsDown(65)) { // A = left
		let perp = utils.vector_cross(look_no_y, up);
		camera.z += perp.z * walking_speed * deltaTime / 1000;
		camera.x += perp.x * walking_speed * deltaTime / 1000;
	}
	if (keyIsDown(68)) { // D = right
		let perp = utils.vector_cross(look_no_y, up);
		camera.z -= perp.z * walking_speed * deltaTime / 1000;
		camera.x -= perp.x * walking_speed * deltaTime / 1000;
	}
	if (keyIsDown(32)) { // space = up
		camera.y -= up.y * walking_speed * deltaTime / 1000;
	}
	if (keyIsDown(16)) { // shift = down
		camera.y += up.y * walking_speed * deltaTime / 1000;
	}

	// array holding triangles which can be seen
	// later on sort them by z coordinate so ones closest to camera drawn last
	let tris_to_render = [];
	
	for (const tri of mesh.triangles) {
		let tri_transformed = new utils.Triangle(utils.matrix_multiply_vector(tri.p[0], mat_world),
												 utils.matrix_multiply_vector(tri.p[1], mat_world),
												 utils.matrix_multiply_vector(tri.p[2], mat_world),
												 tri.t[0], tri.t[1], tri.t[2]);

		// beginning getting cross product so can get normal of faces
		let line1 = utils.vector_sub(tri_transformed.p[1], tri_transformed.p[0]);
		let line2 = utils.vector_sub(tri_transformed.p[2], tri_transformed.p[0]);
		let normal = utils.vector_normalize(utils.vector_cross(line1, line2));
		
		// get ray from triangle to camera
		let camera_ray = utils.vector_sub(tri_transformed.p[0], camera);

		// use dot product to get normals, but take into account location of camera
		if (utils.vector_dot(normal, camera_ray) < 0.0) {
			// illumination
			let light_direction = utils.vector_normalize(new utils.Vec3d(0.0, 0.0, -1.0));

			let dp = utils.vector_dot(light_direction, normal);

			// convert world space to view space (though camera)
			let tri_viewed = new utils.Triangle(utils.matrix_multiply_vector(tri_transformed.p[0], mat_view),
												utils.matrix_multiply_vector(tri_transformed.p[1], mat_view),
												utils.matrix_multiply_vector(tri_transformed.p[2], mat_view),
												tri_transformed.t[0], tri_transformed.t[1], tri_transformed.t[2]);

			// clip the viewed triangle against the near plane (plane right in front of camera)
			// have to do this before projection happens because then there is no depth information,
			// at least here we have depth information relative to the camera from the mat_view transformation								
			let clipped_triangles = utils.clip_against_plane(new utils.Vec3d(0.0, 0.0, 0.1), new utils.Vec3d(0.0, 0.0, 1.0), tri_viewed);
			// 0, 1, or 2 triangles could be created so loop through and create this variable amount of tris
			for (let n = 0; n < clipped_triangles.length; n++) {
				// projection
				let tri_projected = new utils.Triangle(utils.matrix_multiply_vector(clipped_triangles[n].p[0], mat_proj),
												   	   utils.matrix_multiply_vector(clipped_triangles[n].p[1], mat_proj),
												   	   utils.matrix_multiply_vector(clipped_triangles[n].p[2], mat_proj),
													   clipped_triangles[n].t[0], clipped_triangles[n].t[1], clipped_triangles[n].t[2]);
			
				// scale into view by normalizing coordinates of tri_projected
				tri_projected.p[0] = utils.vector_div(tri_projected.p[0], tri_projected.p[0].w);
				tri_projected.p[1] = utils.vector_div(tri_projected.p[1], tri_projected.p[1].w);
				tri_projected.p[2] = utils.vector_div(tri_projected.p[2], tri_projected.p[2].w);									

				// set shading of triangle
				let color_rgb = 50 + dp * 205.0
				tri_projected.color = color_rgb;
				
				// scale into view because by defaullt drawn at (0, 0) - upper left
				// corner of screen
				let offset_view = new utils.Vec3d(1.0, 1.0, 0.0);
				tri_projected.p[0] = utils.vector_add(tri_projected.p[0], offset_view);
				tri_projected.p[1] = utils.vector_add(tri_projected.p[1], offset_view);
				tri_projected.p[2] = utils.vector_add(tri_projected.p[2], offset_view);
				
				tri_projected.p[0].x *= 0.5 * width;
				tri_projected.p[0].y *= 0.5 * height;
				tri_projected.p[1].x *= 0.5 * width;
				tri_projected.p[1].y *= 0.5 * height;
				tri_projected.p[2].x *= 0.5 * width;
				tri_projected.p[2].y *= 0.5 * height;
				
				tris_to_render.push(tri_projected);
			}
		}
	}
		
	// sort triangles in tri_project from back to front
	tris_to_render.sort(function compare(t1, t2) { 
							let z1 = (t1.p[0].z + t1.p[1].z + t1.p[2].z) / 3.0;
							let z2 =  (t2.p[0].z + t2.p[1].z + t2.p[2].z) / 3.0;
							return z2 - z1;
						});
	
	for (let tri_to_render of tris_to_render) {
		let tri_q = [tri_to_render];
		let new_tris = 1;
		let clipped_tris = [];

		// clip the triangle(s) against the 4 screen planes
		for (let p = 0; p < 4; p++) {
			while (new_tris > 0) {
				let test_tri = tri_q.shift();
				new_tris -= 1;
				
				// clipping the triangles against the 4 screen bounds in order
				// while loop will run until all the triangles originally in queue have clipped against this plane
				// triangles generated by clip_against_plane not tested again for this plane and only for next plane
				switch (p) {
					case 0: clipped_tris = utils.clip_against_plane(new utils.Vec3d(0.0, 0.0, 0.0), new utils.Vec3d(0.0, 1.0, 0.0), test_tri); break;
					case 1: clipped_tris = utils.clip_against_plane(new utils.Vec3d(0.0, height - 1, 0.0), new utils.Vec3d(0.0, -1.0, 0.0), test_tri); break;
					case 2: clipped_tris = utils.clip_against_plane(new utils.Vec3d(0.0, 0.0, 0.0), new utils.Vec3d(1.0, 0.0, 0.0), test_tri); break;
					case 3: clipped_tris = utils.clip_against_plane(new utils.Vec3d(width - 1, 0.0, 0.0), new utils.Vec3d(-1.0, 0.0, 0.0), test_tri); break;
				}
				// add triangles generated by clipping to the queue
				for (let w = 0; w < clipped_tris.length; w++) {
					tri_q.push(clipped_tris[w]);
				}
			}
			// now the triangles generated by the clipping can be tested on the next plane
			new_tris = tri_q.length;
		}

		for (let tri of tri_q) {
			// stroke(tri.color, tri.color, tri.color);
			// fill(tri.color);
			fill(0);
			stroke(255, 255, 255);
			triangle(tri.p[0].x, tri.p[0].y,
					 tri.p[1].x, tri.p[1].y,
					 tri.p[2].x, tri.p[2].y);
		}
	}
}

