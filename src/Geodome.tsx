import * as _ from "lodash"
import * as React from "react"
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

const edge = 2
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

function trianglesToPoly(triangles: Triangle[]) {
	const points: Point[] = _.uniqWith(_.flatten(triangles), _.isEqual)
	const vertices = _.flatten(points)
	const faces = _.flatten(
		_.flatten(
			triangles.map(triangle => {
				return triangle.map(point => {
					return points.findIndex(p => _.isEqual(p, point))
				})
			})
		)
	)
	const geometry = new THREE.PolyhedronGeometry(vertices, faces, 10, 0)
	return geometry
}

class Geodome extends React.Component {
	private div: React.RefObject<HTMLDivElement>
	constructor() {
		super({})
		this.div = React.createRef()
	}

	public componentDidMount() {
		const scene = new THREE.Scene()
		const width = window.innerWidth * 0.8
		const height = window.innerHeight * 0.8

		const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

		const renderer = new THREE.WebGLRenderer()
		renderer.setSize(width, height)
		const root = this.div.current as HTMLElement
		renderer.domElement.style.height = `${height}px`
		renderer.domElement.style.width = `${width}px`
		root.appendChild(renderer.domElement)

		const geometry = trianglesToPoly(geoN(3))

		var material = new THREE.MeshPhongMaterial({
			color: 0x000000,
			polygonOffset: true,
			polygonOffsetFactor: 1, // positive value pushes polygon further away
			polygonOffsetUnits: 1,
		})

		// const material = new THREE.MeshBasicMaterial({
		// 	color: 0x00ff00,
		// 	opacity: 0.6,
		// 	reflectivity: 0.1,
		// })

		const mesh = new THREE.Mesh(geometry, material)
		scene.add(mesh)

		// https://stackoverflow.com/questions/31539130/display-wireframe-and-solid-color
		var geo = new THREE.EdgesGeometry(mesh.geometry) // or WireframeGeometry
		var mat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 4 })
		var wireframe = new THREE.LineSegments(geo, mat)
		mesh.add(wireframe)

		camera.position.z = 50

		const animate = () => {
			requestAnimationFrame(animate)

			mesh.rotation.x += 0.01
			mesh.rotation.y += 0.01

			renderer.render(scene, camera)
		}

		animate()
	}

	public render() {
		return <div ref={this.div} />
	}
}

export default Geodome
