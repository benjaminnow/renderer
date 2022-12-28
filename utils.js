export class Vec3d {
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}
}

export class Triangle {
	constructor(p1, p2, p3, color = 0) {
		this.p = [p1, p2, p3];
		this.color = color;
	}
}

export class Mesh {
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

export class Mat4x4 {
	constructor() {
		this.mat = Array(4).fill().map(() => Array(4).fill(0.0));
	}
}

export function matrix_multiply_vector(i_vec, matrix) {
	let o_vec = new Vec3d(i_vec.x * matrix.mat[0][0] + i_vec.y * matrix.mat[1][0] + i_vec.z * matrix.mat[2][0] + matrix.mat[3][0],
						  i_vec.x * matrix.mat[0][1] + i_vec.y * matrix.mat[1][1] + i_vec.z * matrix.mat[2][1] + matrix.mat[3][1],
						  i_vec.x * matrix.mat[0][2] + i_vec.y * matrix.mat[1][2] + i_vec.z * matrix.mat[2][2] + matrix.mat[3][2],
						  i_vec.x * matrix.mat[0][3] + i_vec.y * matrix.mat[1][3] + i_vec.z * matrix.mat[2][3] + matrix.mat[3][3]);

	// normalizing not automatically done so have to do where necessary in code
	return o_vec
}

export function matrix_make_identity() {
	let matrix = new Mat4x4();
	matrix.mat[0][0] = 1.0;
	matrix.mat[1][1] = 1.0;
	matrix.mat[2][2] = 1.0;
	matrix.mat[3][3] = 1.0;
	return matrix;
}

export function matrix_rotx(matrix, theta) {
	matrix.mat[0][0] = 1.0;
	matrix.mat[1][1] = cos(theta);
	matrix.mat[1][2] = sin(theta);
	matrix.mat[2][1] = -sin(theta);
	matrix.mat[2][2] = cos(theta);
	matrix.mat[3][3] = 1.0;
}

export function matrix_roty(matrix, theta) {
	matrix.mat[0][0] = cos(theta);
	matrix.mat[0][2] = sin(theta);
	matrix.mat[2][0] = -sin(theta);
	matrix.mat[1][1] = 1.0;
	matrix.mat[2][2] = cos(theta);
	matrix.mat[3][3] = 1.0;
}

export function matrix_rotz(matrix, theta) {
	matrix.mat[0][0] = cos(theta);
	matrix.mat[0][1] = sin(theta);
	matrix.mat[1][0] = -sin(theta);
	matrix.mat[1][1] = cos(theta);
	matrix.mat[2][2] = 1.0;
	matrix.mat[3][3] = 1.0;
}

export function matrix_make_translation(x, y, z) {
	let matrix = matrix_make_identity();
	matrix.mat[3][0] = x;
	matrix.mat[3][1] = y;
	matrix.mat[3][2] = z;
	return matrix;
}

export function matrix_make_projection(fov, aspect_ratio, near, far) {
	let mat_proj = new Mat4x4();
	let fov_rad = 1.0 / tan(fov * 0.5 / 180.0 * PI);

	mat_proj.mat[0][0] = aspect_ratio * fov_rad;
	mat_proj.mat[1][1] = fov_rad;
	mat_proj.mat[2][2] = far / (far - near);
	mat_proj.mat[3][2] = (-far * near) / (far - near);
	// other normalizations seem to work too, so don't have to have far in
	// numerator necessarily
	// mat_proj.mat[2][2] = 1.0 / (far - near);
	// mat_proj.mat[3][2] = -near / (far - near);
	mat_proj.mat[2][3] = 1.0;
	mat_proj.mat[3][3] = 0.0;

	return mat_proj;
}

export function matrix_multiply_matrix(m1, m2) {
	let matrix = new Mat4x4();
	for (let c = 0; c < 4; c++) {
		for (let r = 0; r < 4; r++) {
			matrix.mat[r][c] = m1.mat[r][0] * m2.mat[0][c] + 
							   m1.mat[r][1] * m2.mat[1][c] + 
							   m1.mat[r][2] * m2.mat[2][c] + 
							   m1.mat[r][3] * m2.mat[3][c];
		}
	}

	return matrix;
}

export function matrix_point_at(pos, target, up) {
	// calculate new forward direction which is just line between pos and target
	// this serves as our forward axis and we need to normalize it
	let new_forward = vector_sub(target, pos);
	new_forward = vector_normalize(new_forward);

	// old up might not be orthogonal to new forward, so get projection of old
	// up onto new forward and since new forward is unit vector, projection
	// formula is dot product times new_forward, then we subtract from old up
	// to get the new_up perpendicular to new_forward
	let a = vector_mul(new_forward, vector_dot(up, new_forward));
	let new_up = vector_sub(up, a);
	new_up = vector_normalize(new_up);

	let new_right = vector_cross(new_up, new_forward);

	// creating "point at" matrix
	let mat = new Mat4x4();
	mat.mat[0][0] = new_right.x;
	mat.mat[0][1] = new_right.y;
	mat.mat[0][2] = new_right.z;
	mat.mat[0][3] = 0;
	mat.mat[1][0] = new_up.x;
	mat.mat[1][1] = new_up.y;
	mat.mat[1][2] = new_up.z;
	mat.mat[1][3] = 0;
	mat.mat[2][0] = new_forward.x;
	mat.mat[2][1] = new_forward.y;
	mat.mat[2][2] = new_forward.z;
	mat.mat[2][3] = 0;
	mat.mat[3][0] = pos.x;
	mat.mat[3][1] = pos.y;
	mat.mat[3][2] = pos.z;
	mat.mat[3][3] = 1;

	return mat;
}

export function matrix_quick_inverse(m) {
	let matrix = new Mat4x4();

	matrix.mat[0][0] = m.mat[0][0];
	matrix.mat[0][1] = m.mat[1][0];
	matrix.mat[0][2] = m.mat[2][0];
	matrix.mat[0][3] = 0;
	matrix.mat[1][0] = m.mat[0][1];
	matrix.mat[1][1] = m.mat[1][1];
	matrix.mat[1][2] = m.mat[2][1];
	matrix.mat[1][3] = 0;
	matrix.mat[2][0] = m.mat[0][2];
	matrix.mat[2][1] = m.mat[1][2];
	matrix.mat[2][2] = m.mat[2][2];
	matrix.mat[2][3] = 0;
	// last row dot products
	matrix.mat[3][0] = -(m.mat[3][0] * matrix.mat[0][0] + m.mat[3][1] * matrix.mat[1][0] + m.mat[3][2] * matrix.mat[2][0]);
	matrix.mat[3][1] = -(m.mat[3][0] * matrix.mat[0][1] + m.mat[3][1] * matrix.mat[1][1] + m.mat[3][2] * matrix.mat[2][1]);
	matrix.mat[3][2] = -(m.mat[3][0] * matrix.mat[0][2] + m.mat[3][1] * matrix.mat[1][2] + m.mat[3][2] * matrix.mat[2][2]);
	matrix.mat[3][3] = 1;

	return matrix;
}

export function vector_intersect_plane(plane_pt, plane_norm, line_start, line_end) {
	/*
	// my own implementation
	let plane_n = vector_normalize(plane_norm);
	let line_plane_vec = vector_sub(plane_pt, line_start);
	let line_vec = vector_sub(line_end, line_start);
	let d = (vector_dot(line_plane_vec, plane_n)) / (vector_dot(line_vec, plane_n));
	let line_to_intersect = vector_mul(line_vec, d);
	return vector_add(line_start, line_to_intersect);
	*/
	let plane_n = vector_normalize(plane_norm);
	let plane_d = -vector_dot(plane_n, plane_pt);
	let ad = vector_dot(line_start, plane_n);
	let bd = vector_dot(line_end, plane_n);
	// divide by 0 could happen here with bd-ad when line is parallel to plane
	// but this would be super rare and floating point innaccuracy makes it
	// very unlikely that it would be exactly 0
	let t = (-plane_d - ad) / (bd - ad);
	let line_start_to_end = vector_sub(line_end, line_start);
	let line_to_intersect = vector_mul(line_start_to_end, t);
	return vector_add(line_start, line_to_intersect);
}

// function that returns an array of clipped triangles
// can either return array of size 0, 1, or 2
export function clip_against_plane(plane_pt, plane_norm, tri) {
	let plane_n = vector_normalize(plane_norm);

	// function to return signed shortest distance from point to plane
	// if distance sign positive, point lies "inside" plane
	// this returns the distance in plane normal units but works since everything is relative
	function dist(pt) {
		return (plane_n.x * pt.x + plane_n.y * pt.y + plane_n.z * pt.z - vector_dot(plane_n, plane_pt));
	}

	let inside_pts = [];
	let outside_pts = [];

	let d0 = dist(tri.p[0]);
	let d1 = dist(tri.p[1]);
	let d2 = dist(tri.p[2]);

	if (d0 >= 0) { inside_pts.push(tri.p[0]); } else { outside_pts.push(tri.p[0]) }
	if (d1 >= 0) { inside_pts.push(tri.p[1]); } else { outside_pts.push(tri.p[1]) }
	if (d2 >= 0) { inside_pts.push(tri.p[2]); } else { outside_pts.push(tri.p[2]) }

	if (inside_pts.length == 0) {
		return [];
	}

	if (inside_pts.length == 3) {
		return [tri];
	}

	if (inside_pts.length == 1 && outside_pts.length == 2) {
		// one point on inside so new triangle is just a smaller version of older triangle
		// keep the original color and make 2 new dummy points that will be set to intersection
		// of clipping plane
		let clipped_tri = new Triangle(inside_pts[0], null, null, tri.color);

		clipped_tri.p[1] = vector_intersect_plane(plane_pt, plane_n, inside_pts[0], outside_pts[0]);
		clipped_tri.p[2] = vector_intersect_plane(plane_pt, plane_n, inside_pts[0], outside_pts[1]);

		return [clipped_tri];
	}

	if (inside_pts.length == 2 && outside_pts.length == 1) {
		// one point on outside so triangle intersects plane so 2 points on inside
		// and 2 points intersect plane so there's 4 total points and a quad formed
		// triangle created with CW orientation so normals are consistent, same with case above

		let clipped_tri1 = new Triangle(inside_pts[0], null, null, tri.color);
		clipped_tri1.p[1] = inside_pts[1];
		clipped_tri1.p[2] = vector_intersect_plane(plane_pt, plane_n, inside_pts[0], outside_pts[0]);

		let clipped_tri2 = new Triangle(inside_pts[1], null, null, tri.color);
		clipped_tri2.p[1] = clipped_tri1.p[2]; // shares point with triangle created above
		clipped_tri2.p[2] = vector_intersect_plane(plane_pt, plane_n, inside_pts[1], outside_pts[0]);

		return [clipped_tri1, clipped_tri2];
	}
}

export function vector_add(v1, v2) {
	return new Vec3d(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
}

export function vector_sub(v1, v2) {
	return new Vec3d(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
}

export function vector_mul(v, k) {
	return new Vec3d(v.x * k , v.y * k, v.z * k);
}

export function vector_div(v, k) {
	return new Vec3d(v.x / k , v.y / k, v.z / k);
}

export function vector_dot(v1, v2) {
	return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

export function vector_length(v) {
	return sqrt(vector_dot(v, v));
}

export function vector_normalize(v) {
	let l = vector_length(v);
	return new Vec3d(v.x / l, v.y / l, v.z / l);
}

export function vector_cross(v1, v2) {
	return new Vec3d(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
}

