import * as React from "react"
import * as THREE from "three"

class Geodome extends React.Component {
	private div: React.RefObject<HTMLDivElement>
	constructor() {
		super({})
		this.div = React.createRef()
	}

	public componentDidMount() {
		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		)

		const renderer = new THREE.WebGLRenderer()
		renderer.setSize(window.innerWidth, window.innerHeight)
		const root = this.div.current as HTMLElement
		renderer.domElement.style.height = "500px"
		renderer.domElement.style.width = "500px"
		root.appendChild(renderer.domElement)

		const geometry = new THREE.BoxGeometry(1, 1, 1)
		const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
		const cube = new THREE.Mesh(geometry, material)
		scene.add(cube)

		camera.position.z = 5

		const animate = () => {
			requestAnimationFrame(animate)

			cube.rotation.x += 0.01
			cube.rotation.y += 0.01

			renderer.render(scene, camera)
		}

		animate()
	}

	public render() {
		return <div ref={this.div} />
	}
}

export default Geodome
