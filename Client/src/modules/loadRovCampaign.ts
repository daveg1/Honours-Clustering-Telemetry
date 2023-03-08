import * as THREE from 'three';
import type { Globals } from '../types/Globals';
import type { RovCampaign } from '../types/RovCampaign';

const endpoint = 'http://localhost:5000/rov';

function createPointCloud(data: RovCampaign, globals: Globals): THREE.Points {
	const vertices = data.positions;
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute(
		'position',
		new THREE.Float32BufferAttribute(vertices, 3)
	);

	const pointsMaterial = new THREE.PointsMaterial({
		vertexColors: true,
		side: THREE.DoubleSide,
		size: 0.01,
	});

	// Set point cloud colours
	// const colours: number[] = [];
	// const colour = new THREE.Color();

	// data.kpi.forEach((k) => {
	// 	const gradient = globals.heatMap[k];
	// 	colour.setRGB(gradient[0], gradient[1], gradient[2]);
	// 	colours.push(colour.r, colour.g, colour.b);
	// });

	// geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));

	const pointCloud = new THREE.Points(geometry, pointsMaterial);
	pointCloud.scale.set(0.1, 0.1, 0.1);
	pointCloud.rotation.set(0, Math.PI / 3, 0);
	pointCloud.position.set(6.6, 6.8, -7);

	return pointCloud;
}

export async function loadRovCampaign(globals: Globals) {
	console.log('loading rov data');

	const req = await fetch(endpoint);
	const data = (await req.json()) as RovCampaign;

	// Each route
	// const rovCampaigns = [];
	// const rovCampaignVectors = [];
	// let vectors = [];
	// let campaignLeg = [];

	// Point cloud
	const pointCloud = createPointCloud(data, globals);
	globals.scene.add(pointCloud);
}
