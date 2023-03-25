import * as THREE from 'three';
import type { RovCampaign } from '../types/RovCampaign';
import { getTelemetryDenoised, getTelemetryRaw } from './telemetry';

function createPointCloud(data: RovCampaign): THREE.Points {
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
	const colours: number[] = [];
	const colour = new THREE.Color();

	data.kpi.forEach((k) => {
		const gradient = globalThis.heatMap[k];
		colour.setRGB(gradient[0], gradient[1], gradient[2]);
		colours.push(colour.r, colour.g, colour.b);
	});

	geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));

	const pointCloud = new THREE.Points(geometry, pointsMaterial);
	pointCloud.scale.set(0.1, 0.1, 0.1);
	pointCloud.rotation.set(0, Math.PI / 3, 0);
	pointCloud.position.set(6.6, 6.8, -7);

	return pointCloud;
}

async function handleDenoisedFormSubmit(this: HTMLFormElement, e: Event) {
	e.preventDefault();

	const start = (this.elements.namedItem('start') as HTMLInputElement)
		.valueAsNumber;
	const end = (this.elements.namedItem('end') as HTMLInputElement)
		.valueAsNumber;
	// const windowed = (
	// 	denoisedForm.elements.namedItem('windowed') as HTMLInputElement
	// ).checked;

	globalThis.pointCloud.data = await getTelemetryDenoised(start, end);

	if (globalThis.pointCloud.points) {
		globalThis.three.scene.remove(globalThis.pointCloud.points);
	}

	globalThis.pointCloud.points = createPointCloud(globalThis.pointCloud.data);
	globalThis.three.scene.add(globalThis.pointCloud.points);
}

export async function loadRovCampaign() {
	console.log('loading rov data');

	const rawData = await getTelemetryRaw();

	// Each route
	// const rovCampaigns = [];
	// const rovCampaignVectors = [];
	// let vectors = [];
	// let campaignLeg = [];

	// Raw data point cloud
	globalThis.pointCloud.data = rawData;
	globalThis.pointCloud.points = createPointCloud(globalThis.pointCloud.data);
	globalThis.three.scene.add(globalThis.pointCloud.points);

	// Denoised form
	const denoisedForm =
		document.querySelector<HTMLFormElement>('#denoised-form');

	if (denoisedForm) {
		denoisedForm.onsubmit = handleDenoisedFormSubmit.bind(denoisedForm);
	}
}
