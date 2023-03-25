import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

declare global {
	var three: {
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		scene: THREE.Scene;
		controls: OrbitControls;
	};

	var heatMap: [number, number, number, number][];
}
