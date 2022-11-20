class Vec3d {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
}

class Triangle {
	constructor(p1, p2, p3, color = 0) {
		this.p = [p1, p2, p3];
		this.color = color;
	}
}

class Mesh {
	constructor() {
		this.triangles = []
	}

	loadObj(obj_data) {
		let verts = [];

		for (let i = 0; i < obj_data["verts"].length; i++) {
			verts.push(new Vec3d(obj_data["verts"][i][0], obj_data["verts"][i][1], obj_data["verts"][i][2]));
		}

		for (let i = 0; i < obj_data["faces"].length; i++) {
			let face = obj_data["faces"][i];
			this.triangles.push(new Triangle(verts[face[0] - 1], verts[face[1] - 1], verts[face[2] - 1]));
		}
	}

}

class Mat4x4 {
	constructor() {
		this.mat = Array(4).fill().map(() => Array(4).fill(0.0));
	}

	static multiply_matrix_vector(i_vec, matrix) {
		let o_vec = new Vec3d(i_vec.x * matrix.mat[0][0] + i_vec.y * matrix.mat[1][0] + i_vec.z * matrix.mat[2][0] + matrix.mat[3][0],
							  i_vec.x * matrix.mat[0][1] + i_vec.y * matrix.mat[1][1] + i_vec.z * matrix.mat[2][1] + matrix.mat[3][1],
							  i_vec.x * matrix.mat[0][2] + i_vec.y * matrix.mat[1][2] + i_vec.z * matrix.mat[2][2] + matrix.mat[3][2]);
		let w = i_vec.x * matrix.mat[0][3] + i_vec.y * matrix.mat[1][3] + i_vec.z * matrix.mat[2][3] + matrix.mat[3][3];

		if (w != 0) {
			o_vec.x /= w;
			o_vec.y /= w;
			o_vec.z /= w;
		}

		return o_vec
	}
}

let mesh = new Mesh();
let mat_proj = new Mat4x4();
let mat_rotz = new Mat4x4();
let mat_rotx = new Mat4x4();
let camera = new Vec3d(0, 0, 0);

let data;

function preload() {
	data = loadJSON("json_files/ship.json");
}

function setup() {
	createCanvas(1000, 800);

	// load 3d object file into the mesh
	mesh.loadObj(data);

	// projection matrix
	let near = 0.1;
	let far = 1000.0;
	let fov = 90.0;
	let aspect_ratio = height / width;
	let fov_rad = 1.0 / tan(fov * 0.5 / 180.0 * PI);

	mat_proj.mat[0][0] = aspect_ratio * fov_rad;
	mat_proj.mat[1][1] = fov_rad;
	mat_proj.mat[2][2] = far / (far - near);
	mat_proj.mat[3][2] = (-far * near) / (far - near);
	mat_proj.mat[2][3] = 1.0;
	mat_proj.mat[3][3] = 0.0;

}

let theta = 0.0;

function draw() {
	background(0);

	
	theta += deltaTime / 1000.0;
	mat_rotz.mat[0][0] = cos(theta);
	mat_rotz.mat[0][1] = sin(theta);
	mat_rotz.mat[1][0] = -sin(theta);
	mat_rotz.mat[1][1] = cos(theta);
	mat_rotz.mat[2][2] = 1.0;
	mat_rotz.mat[3][3] = 1.0;

	mat_rotx.mat[0][0] = 1.0;
	mat_rotx.mat[1][1] = cos(theta * 0.5);
	mat_rotx.mat[1][2] = sin(theta * 0.5);
	mat_rotx.mat[2][1] = -sin(theta * 0.5);
	mat_rotx.mat[2][2] = cos(theta * 0.5);
	mat_rotx.mat[3][3] = 1.0;

	// array holding triangles which can be seen
	// later on sort them by z coordinate so ones closest to camera drawn last
	let tris_to_render = [];
	
	for (const tri of mesh.triangles) {
		let tri_rot_z = new Triangle(Mat4x4.multiply_matrix_vector(tri.p[0], mat_rotz),
									 Mat4x4.multiply_matrix_vector(tri.p[1], mat_rotz),
									 Mat4x4.multiply_matrix_vector(tri.p[2], mat_rotz));

		let tri_rot_zx = new Triangle(Mat4x4.multiply_matrix_vector(tri_rot_z.p[0], mat_rotx),
									  Mat4x4.multiply_matrix_vector(tri_rot_z.p[1], mat_rotx),
									  Mat4x4.multiply_matrix_vector(tri_rot_z.p[2], mat_rotx));

		let tri_translated = tri_rot_zx;
		tri_translated.p[0].z = tri_rot_zx.p[0].z + 10.0;
		tri_translated.p[1].z = tri_rot_zx.p[1].z + 10.0;
		tri_translated.p[2].z = tri_rot_zx.p[2].z + 10.0;

		// beginning getting cross product so can get normal of faces
		let line1 = new Vec3d(tri_translated.p[1].x - tri_translated.p[0].x,
							  tri_translated.p[1].y - tri_translated.p[0].y,
							  tri_translated.p[1].z - tri_translated.p[0].z);
		let line2 = new Vec3d(tri_translated.p[2].x - tri_translated.p[0].x,
							  tri_translated.p[2].y - tri_translated.p[0].y,
							  tri_translated.p[2].z - tri_translated.p[0].z);
		let normal = new Vec3d(line1.y * line2.z - line1.z * line2.y,
							   line1.z * line2.x - line1.x * line2.z,
							   line1.x * line2.y - line1.y * line2.x);
		let l = sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
		normal.x /= l;
		normal.y /= l;
		normal.z /= l;
		
		// use dot product to get normals, but take into account location of camera
		if (normal.x * (tri_translated.p[0].x - camera.x) + 
		    normal.y * (tri_translated.p[0].y - camera.y) + 
			normal.z * (tri_translated.p[0].z - camera.z) < 0.0) {

			// illumination
			let light_direction = new Vec3d(0.0, 0.0, -1.0);
			let l = sqrt(light_direction.x * light_direction.x + 
						 light_direction.y * light_direction.y + 
						 light_direction.z * light_direction.z);
			light_direction.x /= l;
			light_direction.y /= l;
			light_direction.z /= l;

			let dp = normal.x * light_direction.x + normal.y * light_direction.y + normal.z * light_direction.z;

			// projection
			let tri_projected = new Triangle(Mat4x4.multiply_matrix_vector(tri_translated.p[0], mat_proj),
											Mat4x4.multiply_matrix_vector(tri_translated.p[1], mat_proj),
											Mat4x4.multiply_matrix_vector(tri_translated.p[2], mat_proj));

			// set shading of triangle
			let color_rgb = 50 + dp * 205.0
			tri_projected.color = color_rgb;
			
			// scale into view
			tri_projected.p[0].x += 1.0;
			tri_projected.p[0].y += 1.0;
			tri_projected.p[1].x += 1.0;
			tri_projected.p[1].y += 1.0;
			tri_projected.p[2].x += 1.0;
			tri_projected.p[2].y += 1.0;

			tri_projected.p[0].x *= 0.5 * width;
			tri_projected.p[0].y *= 0.5 * height;
			tri_projected.p[1].x *= 0.5 * width;
			tri_projected.p[1].y *= 0.5 * height;
			tri_projected.p[2].x *= 0.5 * width;
			tri_projected.p[2].y *= 0.5 * height;
			
			tris_to_render.push(tri_projected);
		}
	}
		
	// sort triangles in tri_project from back to front
	tris_to_render.sort(function compare(t1, t2) { 
							let z1 = (t1.p[0].z + t1.p[1].z + t1.p[2].z) / 3.0;
							let z2 =  (t2.p[0].z + t2.p[1].z + t2.p[2].z) / 3.0;
							return z2 - z1;
						});
	
	for (let tri_projected of tris_to_render) {
		stroke(tri_projected.color, tri_projected.color, tri_projected.color);
		fill(tri_projected.color);
		triangle(tri_projected.p[0].x, tri_projected.p[0].y,
					tri_projected.p[1].x, tri_projected.p[1].y,
					tri_projected.p[2].x, tri_projected.p[2].y);
	}
}

