import * as THREE from 'three';

export function createLighting(): THREE.Group {
	// Build ambient light
	const ambientLight = new THREE.AmbientLight(0xaaaa88);
	ambientLight.name = 'Ambient';

	// Build spotlight
	const spotLight = new THREE.SpotLight(0xddddff);
	spotLight.name = 'Sun';
	spotLight.position.set(10, 50, 100);

	spotLight.castShadow = true;

	spotLight.shadow.mapSize.width = Math.pow(2, 13);
	spotLight.shadow.mapSize.height = Math.pow(2, 13);

	spotLight.shadow.camera.near = 0.5;
	spotLight.shadow.camera.far = 500;
	spotLight.shadow.focus = 0.8;

	// Add lights to group
	const lights = new THREE.Group();
	lights.add(ambientLight, spotLight);

	return lights;
}
