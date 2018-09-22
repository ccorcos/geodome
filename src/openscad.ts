import * as _ from "lodash"

// http://www.geometer.org/mathcircles/geodesic.pdf
// Golden Ratio
const g = (1 + Math.sqrt(5)) / 2

type Point = [number, number, number]
type Triangle = [Point, Point, Point]

// Points
const A: Point = [0, 1, g]
const B: Point = [0, -1, g]
const C: Point = [0, -1, -g]
const D: Point = [0, 1, -g]
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

const edge = 2 // of the icosahedron
const radius = Math.sqrt(1 + g * g)

function sub(p1: Point, p2: Point): Point {
	return [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]]
}

function mult(n: number, p1: Point): Point {
	return [p1[0] * n, p1[1] * n, p1[2] * n]
}

function add(p1: Point, p2: Point): Point {
	return [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]]
}

function distance(p1: Point, p2: Point): number {
	const x = sub(p1, p2)
	return Math.sqrt(x[0] * x[0] + x[1] * x[1] + x[2] * x[2])
}

function split(tri: Triangle): Array<Triangle> {
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

function geoN(n: number): Triangle[] {
	if (n === 0) {
		return icosahedron
	} else {
		return _.flatten(geoN(n - 1).map(split))
	}
}

function trianglesToSegments(triangles: Triangle[]) {
	const lines = _.flatten(
		triangles.map(tri => {
			const line1 = tri[0] > tri[1] ? [tri[0], tri[1]] : [tri[1], tri[0]]
			const line2 = tri[1] > tri[2] ? [tri[1], tri[2]] : [tri[2], tri[1]]
			const line3 = tri[2] > tri[0] ? [tri[2], tri[0]] : [tri[0], tri[2]]
			return [line1, line2, line3]
		})
	)
	const uniqLines = _.uniqWith(lines, _.isEqual)
	return uniqLines
}

// https://en.wikibooks.org/wiki/OpenSCAD_User_Manual/The_OpenSCAD_Language#cylinder
function cylinder(line: [Point, Point], i: number) {
	const point = sub(line[1], line[0])
	return [
		`x${i} = ${point[0]};`,
		`y${i} = ${point[1]};`,
		`z${i} = ${point[2]};`,
		`length${i} = norm([x${i},y${i},z${i}]);`,
		`b${i} = acos(z${i}/length${i});`,
		`c${i} = atan2(y${i},x${i});\n`,
		`color("blue")`,
		`translate([${line[0][0]}*scale,${line[0][1]}*scale, ${line[0][2]}*scale])`,
		`rotate([0, b${i}, c${i}])`,
		`cylinder(h = length${i}*scale, r1 = 1*thickness, r2 = 1*thickness, center = false);`,
	].join("\n")
}

function segmenentsToPoint(segments: [Point, Point][]) {
	const points = _.uniqWith(_.flatten(segments), _.isEqual)
	return points as Array<Point>
}

// https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
function hslToRgb(h: number, s: number, l: number) {
	var r, g, b
	if (s == 0) {
		r = g = b = l // achromatic
	} else {
		var hue2rgb = function hue2rgb(p, q, t) {
			if (t < 0) t += 1
			if (t > 1) t -= 1
			if (t < 1 / 6) return p + (q - p) * 6 * t
			if (t < 1 / 2) return q
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
			return p
		}

		var q = l < 0.5 ? l * (1 + s) : l + s - l * s
		var p = 2 * l - q
		r = hue2rgb(p, q, h + 1 / 3)
		g = hue2rgb(p, q, h)
		b = hue2rgb(p, q, h - 1 / 3)
	}

	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

const scale = 200 / radius

function segLength(seg: [Point, Point]) {
	const len = distance(seg[0], seg[1])
	return Math.round(len * scale * 100) / 100
}

function main() {
	const shape = geoN(1)
	const segments = trianglesToSegments(shape)
	const points = segmenentsToPoint(segments)

	const groups = _.groupBy(segments.map(segLength), x => x)
	const sizes = _.mapValues(groups, group => group.length)
	console.log(
		[
			"/*",
			Object.keys(sizes)
				.map(size => {
					return `${sizes[size]} segments at ${parseFloat(size)} ft`
				})
				.join("\n"),
			"*/",
		].join("\n") + "\n"
	)

	console.log(
		[
			`scale = ${scale};`,
			"thickness = 2;",
			`pi = ${Math.PI};`,
			"rad2deg = 180 / pi;",
			"circleSize = scale / 100;",
		].join("\n") + "\n"
	)

	// console.log(
	// 	points
	// 		.map(point => {
	// 			return [
	// 				`color("red")`,
	// 				`translate([${point[0]}*scale,${point[1]}*scale, ${point[2]}*scale])`,
	// 				`sphere(circleSize);`,
	// 			].join("\n")
	// 		})
	// 		.join("\n")
	// )

	console.log(segments.map(cylinder).join("\n\n"))
}

export default main

main()
