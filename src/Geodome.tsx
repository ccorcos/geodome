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

	console.log(vertices, faces)
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
		const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)

		const renderer = new THREE.WebGLRenderer()
		renderer.setSize(window.innerWidth, window.innerHeight)
		const root = this.div.current as HTMLElement
		renderer.domElement.style.height = "500px"
		renderer.domElement.style.width = "500px"
		root.appendChild(renderer.domElement)

		const geometry = trianglesToPoly(icosahedron)
		const material = new THREE.MeshBasicMaterial({
			color: 0x00ff00,
			opacity: 0.6,
			reflectivity: 0.1,
		})
		const polyhedron = new THREE.Mesh(geometry, material)
		scene.add(polyhedron)

		camera.position.z = 50

		const animate = () => {
			requestAnimationFrame(animate)

			polyhedron.rotation.x += 0.01
			polyhedron.rotation.y += 0.01

			renderer.render(scene, camera)
		}

		animate()
	}

	public render() {
		return <div ref={this.div} />
	}
}

export default Geodome
