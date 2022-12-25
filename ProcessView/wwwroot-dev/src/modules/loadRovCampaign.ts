import * as THREE from 'three';
import type { Globals } from '../types/Globals';
import type { RovCampaign } from '../types/RovCampaign';

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
		size: 0.001,
	});

	// Set point cloud colours
	const colours: number[] = [];
	const colour = new THREE.Color();

	data.kpi.forEach((k) => {
		const gradient = globals.heatMap[+k];
		colour.setRGB(...gradient);
		colours.push(colour.r, colour.g, colour.b);
	});

	geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));

	const pointCloud = new THREE.Points(geometry, pointsMaterial);
	pointCloud.scale.set(0.06, 0.06, 0.06);
	pointCloud.rotation.set(0, Math.PI / 3, 0);
	pointCloud.position.set(6.6, 4.1, -7);

	return pointCloud;
}

export async function loadRovCampaign(globals: Globals) {
	console.log('loading rov data');

	const data = (await fetch('/api/Viewer/RovCampaignData').then((res) =>
		res.json()
	)) as RovCampaign;

	// Each route
	// const rovCampaigns = [];
	// const rovCampaignVectors = [];
	// let vectors = [];
	// let campaignLeg = [];

	// Point cloud
	const pointCloud = createPointCloud(data, globals);
	globals.scene.add(pointCloud);
}
