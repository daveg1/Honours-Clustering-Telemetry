import type { RovCampaign } from '../types/RovCampaign';
import { getTelemetryDenoised, getTelemetryRaw } from './telemetry';
import { createPointCloud } from './utils/createPointCloud';

type Views = {
	currentView: 'raw' | 'denoised';
	raw?: RovCampaign;
	denoised?: RovCampaign;
};

const views: Views = {
	currentView: 'raw',
};

let toggleViewButton: HTMLButtonElement;
let denoisedForm: HTMLFormElement;

function showPointCloud(data: RovCampaign) {
	if (globalThis.pointCloud.points) {
		globalThis.three.scene.remove(globalThis.pointCloud.points);
	}

	const start = (denoisedForm.elements.namedItem('start') as HTMLInputElement)
		.valueAsNumber;
	const end = (denoisedForm.elements.namedItem('end') as HTMLInputElement)
		.valueAsNumber;

	globalThis.pointCloud.points = createPointCloud(data, start, end);
	globalThis.three.scene.add(globalThis.pointCloud.points);
}

async function handleDenoisedFormSubmit(this: HTMLFormElement, e: Event) {
	e.preventDefault();

	const start = (this.elements.namedItem('start') as HTMLInputElement)
		.valueAsNumber;
	const end = (this.elements.namedItem('end') as HTMLInputElement)
		.valueAsNumber;
	const windowed = (this.elements.namedItem('windowed') as HTMLInputElement)
		.checked;

	const submitButton = this.querySelector('#view') as HTMLButtonElement;
	submitButton.textContent = 'Loading...';
	submitButton.disabled = true;

	globalThis.pointCloud.data = await getTelemetryDenoised(start, end, windowed);

	views.denoised = globalThis.pointCloud.data;
	views.currentView = 'denoised';

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
	denoisedForm = document.querySelector('#denoised-form') as HTMLFormElement;

	const start = denoisedForm.elements.namedItem('start') as HTMLInputElement;
	const end = denoisedForm.elements.namedItem('end') as HTMLInputElement;

	start.valueAsNumber = 0;
	end.valueAsNumber = rawData.times.length;

	denoisedForm.onsubmit = handleDenoisedFormSubmit.bind(denoisedForm);

	Array.from(denoisedForm.elements).forEach((elem) => {
		if (elem instanceof HTMLInputElement || elem instanceof HTMLButtonElement) {
			elem.disabled = false;
		}
	});

	toggleViewButton = document.querySelector(
		'#toggle-view'
	) as HTMLButtonElement;

	// disabled until first denoised dataset is retreived
	toggleViewButton.disabled = true;

	toggleViewButton.onclick = () => {
		if (views.currentView === 'raw') {
			views.currentView = 'denoised';
			showPointCloud(views.denoised!);
		} else {
			views.currentView = 'raw';
			showPointCloud(views.raw!);
		}
	};
}
