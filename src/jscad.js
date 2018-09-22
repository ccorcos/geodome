// http://www.geometer.org/mathcircles/geodesic.pdf
// Golden Ratio
const g = (1 + Math.sqrt(5)) / 2

// Points
const A = [0, 1, g]
const B = [0, -1, g]
const C = [0, -1, -g]
const D = [0, 1, -g]
const E = [g, 0, 1]
const F = [-g, 0, 1]
const G = [-g, 0, -1]
const H = [g, 0, -1]
const I = [1, g, 0]
const J = [-1, g, 0]
const K = [-1, -g, 0]
const L = [1, -g, 0]

// Triangles
const icosahedron = [
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

function sub(p1, p2) {
	return [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]]
}

function mult(n, p1) {
	return [p1[0] * n, p1[1] * n, p1[2] * n]
}

function add(p1, p2) {
	return [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]]
}

function distance(p1, p2) {
	const x = sub(p1, p2)
	return Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2])
}

function split(tri) {
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

function flatten(arrays) {
	return [].concat.apply([], arrays)
}

function uniq(array) {
	return [...new Set(array)]
}

function trianglesToSegments(triangles) {
	const lines = flatten(
		triangles.map(tri => {
			const line1 = tri[0] > tri[1] ? [tri[0], tri[1]] : [tri[1], tri[0]]
			const line2 = tri[1] > tri[2] ? [tri[1], tri[2]] : [tri[2], tri[1]]
			const line3 = tri[2] > tri[0] ? [tri[2], tri[0]] : [tri[0], tri[2]]
			return [line1, line2, line3]
		})
	)
	const uniqLines = uniq(lines.map(line => JSON.stringify(line))).map(str =>
		JSON.parse(str)
	)
	return uniqLines
}

function main() {
	const segs = trianglesToSegments(icosahedron)
		.map(line => {
			return cylinder({ start: line[0], end: line[1], r1: 0, r2: 1, fn: 2 })
		})

		.reduce((acc, x) => union(acc, x))

	return segs

	// return [
	// 	trianglesToSegments(icosahedron).map(line => {
	// 		return cylinder({ start: line[0], end: line[1], r1: 0, r2: 1, fn: 2 })
	// 	}),
	// ]
	// return union(
	//   difference(
	//     cube({size: 3, center: true}),
	//     sphere({r: 2, center: true})
	//   ),
	//   intersection(
	//     sphere({r: 1.3, center: true}),
	//     cube({size: 2.1, center: true})
	//   )
	// ).translate([0, 0, 1.5]).scale(10);
}
