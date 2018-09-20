import * as THREE from "three"

// http://www.geometer.org/mathcircles/geodesic.pdf
// Golden Ratio
const g = (1 + Math.sqrt(5)) / 2

type Point = [number, number, number]
type Triangle = [Point, Point, Point]

// Points
const A: Point = [0, 1, g]
const B: Point = [0, -1, g]
const C: Point = [0, -1, -g]
const D: Point = [0, 1, g]
const E: Point = [g, 0, 1]
const F: Point = [-g, 0, 1]
const G: Point = [-g, 0, -1]
const H: Point = [g, 0, -1]
const I: Point = [1, g, 0]
const J: Point = [-1, g, 0]
const K: Point = [-1, -g, 0]
const L: Point = [1, -g, 0]

// Triangles
const icosahedron: Triangle[] = [
	[A, I, J],
	[A, J, F],
	[A, F, B],
	[A, B, E],
	[A, E, I],
	[B, F, K],
	[B, K, L],
	[B, L, E],
	[C, D, H],
	[C, H, L],
	[C, L, K],
	[C, K, G],
	[C, G, D],
	[D, G, J],
	[D, J, I],
	[D, I, H],
	[E, L, H],
	[E, H, I],
	[F, J, G],
	[F, G, K],
]

const edge = 2
const radius = Math.sqrt(1 + g * g)

function sub(p1: Point, p2: Point): Point {
	return [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]]
}

function mult(n: number, p1: Point): Point {
	return [p1[0] * 2, p1[1] * n, p1[2] * n]
}

function add(p1: Point, p2: Point): Point {
	return [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]]
}

function distance(p1: Point, p2: Point): number {
	const x = sub(p1, p2)
	return Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2])
}

function split(tri: Triangle) {
	const midpoint01 = add(mult(0.5, tri[0]), mult(0.5, tri[1]))
	const midpoint02 = add(mult(0.5, tri[0]), mult(0.5, tri[2]))
	const midpoint12 = add(mult(0.5, tri[1]), mult(0.5, tri[2]))
	const scale = radius / distance(midpoint01, [0, 0, 0])
	const m01 = mult(scale, midpoint01)
	const m02 = mult(scale, midpoint02)
	const m12 = mult(scale, midpoint12)
	return [
		[m01, m02, m12],
		[tri[0], m01, m02],
		[tri[1], m01, m12],
		[tri[2], m02, m12],
	]
}

// class Polyhedron {
// 	constructor(public vertices: Array<number>, public faces: Array<number>) {}
// 	triangles() {
// 		const triangles: Array<Triangle> = []
// 		for (let i = 0; i < this.faces.length; i += 3) {
// 			const p0i = this.faces[i]
// 			const p1i = this.faces[i + 1]
// 			const p2i = this.faces[i + 2]
// 			const p0 = this.vertices.slice(p0i, p0i + 3) as Point
// 			const p1 = this.vertices.slice(p1i, p1i + 3) as Point
// 			const p2 = this.vertices.slice(p2i, p2i + 3) as Point
// 			triangles.push([p0, p1, p2])
// 		}
// 	}

// 	split() {}
// }
