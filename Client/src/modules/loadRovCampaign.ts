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

// Set point cloud colours
const clusters: THREE.Color[] = [
	// new THREE.Color('#1E90FF'),
	// new THREE.Color('#DC143C'),
	// new THREE.Color('#F5F5F5'),
	// new THREE.Color('#DEB887'),
	// new THREE.Color('#7FFF00'),
	// new THREE.Color('#3CB371'),
	// new THREE.Color('#00FFFF'),
	// new THREE.Color('#FF4500'),
	// new THREE.Color('#9932CC'),
	// new THREE.Color('#FFE4B5'),
	// new THREE.Color('#F0FFFF'),
	// new THREE.Color('#5F9EA0'),
	// new THREE.Color('#FFC0CB'),
	// new THREE.Color('#00CED1'),
	// new THREE.Color('#008B8B'),
	// new THREE.Color('#9966CC'),
	// new THREE.Color('#A9A9A9'),
	// new THREE.Color('#FF00FF'),
	// new THREE.Color('#483D8B'),
	// new THREE.Color('#BC8F8F'),
	// new THREE.Color('#FF00FF'),
	// new THREE.Color('#ADFF2F'),
	// new THREE.Color('#2E8B57'),
	// new THREE.Color('#FFA500'),
	// new THREE.Color('#DB7093'),
	// new THREE.Color('#5F9EA0'),
	// new THREE.Color('#CD853F'),
	// new THREE.Color('#008080'),
	// new THREE.Color('#8B0000'),
	// new THREE.Color('#808080'),
	// new THREE.Color('#9932CC'),
	// new THREE.Color('#800080'),
	// new THREE.Color('#FFC0CB'),
	// new THREE.Color('#C71585'),
	// new THREE.Color('#DC143C'),
	// new THREE.Color('#DB7093'),
	// new THREE.Color('#FFEFD5'),
	// new THREE.Color('#F0FFF0'),
	// new THREE.Color('#FDF5E6'),
	// new THREE.Color('#FA8072'),
	// new THREE.Color('#FFE4C4'),
	// new THREE.Color('#F5FFFA'),
	// new THREE.Color('#FF7F50'),
	// new THREE.Color('#800000'),
	// new THREE.Color('#FFE4E1'),
	// new THREE.Color('#7FFF00'),
	// new THREE.Color('#FFFFFF'),
	// new THREE.Color('#808000'),
	// new THREE.Color('#483D8B'),
	// new THREE.Color('#DCDCDC'),
];

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

	const colours: number[] = [];

	for (let i = 0; i < 40; i++) {
		clusters.push(new THREE.Color(Math.random(), Math.random(), Math.random()));
	}

	// If labels are set, use colours from cluster set
	if (data.labels.length) {
		console.log('using labels');
		data.labels.forEach((l) => {
			colours.push(clusters[l].r, clusters[l].g, clusters[l].b);
		});
	} else {
		data.kpi.forEach((k) => {
			const gradient = globalThis.heatMap[k];
			const colour = new THREE.Color(gradient[0], gradient[1], gradient[2]);
			colours.push(colour.r, colour.g, colour.b);
		});
	}

	geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));

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
