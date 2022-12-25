import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import type { Globals } from '../types/Globals';
import { createHeatMap } from './utils/createHeatMap';
import { createLighting } from './utils/createLighting';

export function initialiseGlobals(): Globals {
	const renderer = new THREE.WebGLRenderer({
		// antialias: true, // crap performance
		// logarithmicDepthBuffer: true, // doesn't help
		powerPreference: 'high-performance',
	});
	// Build renderer
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	// renderer.shadowMapSoft = true;
	// renderer.shadowCameraNear = 3;

	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 0.85;

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	// Build scene
	const scene = new THREE.Scene();
	scene.background = new THREE.Color(0x333333);
	scene.add(createLighting());

	// Build camera
	const camera = new THREE.PerspectiveCamera(
		60,
		window.innerWidth / window.innerHeight,
		1,
		100
	);
	camera.position.set(10, 10, 10);
	// renderer.shadowCameraFar = camera.far;

	// Build controls
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.rotateSpeed = 1.3;
	controls.maxPolarAngle = Math.PI / 2;

	// Create heat map gradient
	const heatMap = createHeatMap();

	return { renderer, scene, camera, controls, heatMap };
}
