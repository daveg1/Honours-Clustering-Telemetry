import * as THREE from 'three';
import { loadGlbData } from './utils/loadGlbData';

async function getROV(): Promise<THREE.Group> {
	const model = await loadGlbData('/models/rov.glb');
	const rov = model.scene;

	rov.scale.set(0.1, 0.1, 0.1);
	rov.position.y = 0.1;
	rov.position.z = 0.19;

	rov.userData.status = () => {
		rov.userData.timerId = setInterval(() => {
			const statusElem = document.querySelector('#status');

			if (statusElem) {
				statusElem.innerHTML = 'Leg 1 ' + rov.userData.time;
			}
		}, 100);
	};

	return rov;
}

async function getSGS(): Promise<THREE.Group> {
	const model = await loadGlbData('/models/sgs.glb');
	const sgs = model.scene;
	const child = sgs.children[0] as THREE.Mesh;

	child.material = new THREE.MeshPhongMaterial({
		color: new THREE.Color(0xffffff),
		flatShading: true,
		// side: THREE.FrontSide,
		// opacity: 0.65,
		// transparent: true,
	});

	return sgs;
}

export async function loadModels(): Promise<void> {
	// Load ROV Model
	const rov = await getROV();
	globalThis.three.scene.add(rov);

	// Load SGS Model
	const sgs = await getSGS();
	globalThis.three.scene.add(sgs);
}
