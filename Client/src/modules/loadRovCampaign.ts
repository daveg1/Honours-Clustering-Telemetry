import * as THREE from 'three';
import type { RovCampaign } from '../types/RovCampaign';
import { getTelemetryDenoised, getTelemetryRaw } from './telemetry';

type Views = {
	currentView: 'raw' | 'denoised';
	raw?: RovCampaign;
	denoised?: RovCampaign;
};

const views: Views = {
	currentView: 'raw',
};

let toggleViewButton: HTMLButtonElement;

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

	const clusters: number[] = [];

	if (data.labels.length) {
		console.log('run labels');
		// Set point cloud colours
		const colours: THREE.Color[] = [];

		for (let i = 0; i < 64; i++) {
			colours.push(
				new THREE.Color(Math.random(), Math.random(), Math.random())
			);
		}

		data.labels.forEach((l) => {
			clusters.push(colours[l].r, colours[l].g, colours[l].b);
		});
	} else {
		const colour = new THREE.Color();
		data.kpi.forEach((k) => {
			const gradient = globalThis.heatMap[k];
			colour.setRGB(gradient[0], gradient[1], gradient[2]);
			clusters.push(colour.r, colour.g, colour.b);
		});
	}

	geometry.setAttribute('color', new THREE.Float32BufferAttribute(clusters, 3));

	const pointCloud = new THREE.Points(geometry, pointsMaterial);
	pointCloud.scale.set(0.1, 0.1, 0.1);
	pointCloud.rotation.set(0, Math.PI / 3, 0);
	pointCloud.position.set(1, 6.8, 1.25);

	return pointCloud;
}

function showPointCloud(data: RovCampaign) {
	if (globalThis.pointCloud.points) {
		globalThis.three.scene.remove(globalThis.pointCloud.points);
	}

	globalThis.pointCloud.points = createPointCloud(data);
	globalThis.three.scene.add(globalThis.pointCloud.points);
}

async function handleDenoisedFormSubmit(this: HTMLFormElement, e: Event) {
	e.preventDefault();

	const eps = (this.elements.namedItem('eps') as HTMLInputElement)
		.valueAsNumber;
	const min_samples = (
		this.elements.namedItem('min_samples') as HTMLInputElement
	).valueAsNumber;
	const start = (this.elements.namedItem('start') as HTMLInputElement)
		.valueAsNumber;
	const end = (this.elements.namedItem('end') as HTMLInputElement)
		.valueAsNumber;
	const windowed = (this.elements.namedItem('windowed') as HTMLInputElement)
		.checked;

	const submitButton = this.querySelector('#view') as HTMLButtonElement;
	submitButton.textContent = 'Loading...';
	submitButton.disabled = true;

	globalThis.pointCloud.data = await getTelemetryDenoised(
		eps,
		min_samples,
		start,
		end,
		windowed
	);

	views.denoised = globalThis.pointCloud.data;

	showPointCloud(globalThis.pointCloud.data);

	submitButton.textContent = 'View denoised';
	submitButton.disabled = false;
	toggleViewButton.disabled = false;
}

export async function loadRovCampaign() {
	console.log('loading rov data');

	const rawData = await getTelemetryRaw();

	views.raw = rawData;

	// Raw data point cloud
	globalThis.pointCloud.data = rawData;
	globalThis.pointCloud.points = createPointCloud(globalThis.pointCloud.data);
	globalThis.three.scene.add(globalThis.pointCloud.points);

	// Denoised form
	const denoisedForm = document.querySelector(
		'#denoised-form'
	) as HTMLFormElement;

	denoisedForm.onsubmit = handleDenoisedFormSubmit.bind(denoisedForm);

	toggleViewButton = document.querySelector(
		'#toggle-view'
	) as HTMLButtonElement;

	// disabled until first denoised dataset is retreived
	toggleViewButton.disabled = true;

	toggleViewButton.onclick = () => {
		console.log(views.currentView, views);

		if (views.currentView === 'raw') {
			views.currentView = 'denoised';
			showPointCloud(views.denoised!);
		} else {
			views.currentView = 'raw';
			showPointCloud(views.raw!);
		}
	};
}
