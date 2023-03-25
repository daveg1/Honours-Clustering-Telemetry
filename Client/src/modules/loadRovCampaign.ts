import * as THREE from 'three';
import type { Globals } from '../types/Globals';
import type { RovCampaign } from '../types/RovCampaign';
import { getTelemetryDenoised, getTelemetryRaw } from './telemetry';

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
	const colours: number[] = [];
	const colour = new THREE.Color();

	// * Note: hardcoding the first leg of the journey
	// TODO: do this dynamically based on user input
	data.kpi.slice(0, 10619).forEach((k) => {
		const gradient = globals.heatMap[k];
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

export async function loadRovCampaign(globals: Globals) {
	console.log('loading rov data');

	const rawData = await getTelemetryRaw();

	// Each route
	// const rovCampaigns = [];
	// const rovCampaignVectors = [];
	// let vectors = [];
	// let campaignLeg = [];

	// Point cloud
	let currentView = rawData;
	let currentPointCloud = createPointCloud(currentView, globals);
	globals.scene.add(currentPointCloud);

	// Add event listener for swapping view
	const toggleViewButton =
		document.querySelector<HTMLButtonElement>('#toggle-view');

	// Switch between raw and denoised point clouds
	if (toggleViewButton) {
		toggleViewButton.onclick = async () => {
			globals.scene.remove(currentPointCloud);

			if (currentView === rawData) {
				const startInput =
					document.querySelector<HTMLInputElement>('#start-input');
				const endInput = document.querySelector<HTMLInputElement>('#end-input');

				const start = startInput?.valueAsNumber ?? 0;
				const end = endInput?.valueAsNumber ?? 10619;

				currentView = await getTelemetryDenoised(start, end);
				toggleViewButton.textContent = 'Show raw';
			} else {
				currentView = rawData;
				toggleViewButton.textContent = 'Show denoised';
			}

			currentPointCloud = createPointCloud(currentView, globals);
			globals.scene.add(currentPointCloud);
		};

		// Enable button
		toggleViewButton.disabled = false;
	}
}
