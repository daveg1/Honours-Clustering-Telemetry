import './style.css';
import { initGlobals } from './modules/initGlobals';
import { loadModels } from './modules/loadModels';
import { loadRovCampaign } from './modules/loadRovCampaign';
import { updateView } from './modules/updateView';
import Stats from 'stats.js';

initGlobals();

const stats = new Stats();
stats.showPanel(0); // FPS counter

function animate() {
	requestAnimationFrame(animate);
	stats.begin();
	globalThis.three.controls.update();
	globalThis.three.renderer.render(
		globalThis.three.scene,
		globalThis.three.camera
	);
	stats.end();
}

window.onresize = () => {
	// Update renderer and camera
	updateView();
};

window.onload = async () => {
	const statusElem = document.querySelector('#status') as HTMLDivElement;

	statusElem.textContent = 'Loading...';

	// Set up viewer
	updateView();

	// Load models
	try {
		await loadModels();
		console.log('Models loaded');
	} catch (error) {
		statusElem.textContent = 'Error loading models';
		console.error(error);
		return;
	}

	// Load ROV Data and render point cloud
	try {
		await loadRovCampaign();
		console.log('Campaign data loaded');
	} catch (error) {
		statusElem.textContent = 'Error loading campaign data';
		console.error(error);
		return;
	}

	// Add viewer and FPS counter once ready
	document.body.append(globalThis.three.renderer.domElement);
	document.body.append(stats.dom);
	statusElem.textContent = 'Ready';

	// Start render loop
	animate();
};
