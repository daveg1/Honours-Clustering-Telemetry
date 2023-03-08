import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export type Globals = {
	camera: THREE.PerspectiveCamera;
	renderer: THREE.WebGLRenderer;
	scene: THREE.Scene;
	controls: OrbitControls;
	heatMap: [number, number, number, number][];
};
