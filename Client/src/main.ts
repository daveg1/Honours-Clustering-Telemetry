import './style.css';
import { loadModels } from './modules/loadModels';
import { initialiseGlobals } from './modules/initialiseGlobals';
import { updateView } from './modules/updateView';
import { loadRovCampaign } from './modules/loadRovCampaign';
import Stats from 'stats.js';

const globals = initialiseGlobals();
const stats = new Stats();
stats.showPanel(0); // FPS counter

function animate() {
	requestAnimationFrame(animate);
	stats.begin();
	globals.controls.update();
	globals.renderer.render(globals.scene, globals.camera);
	stats.end();
}

window.onresize = () => {
	// Update renderer and camera
	updateView(globals);
};

window.onload = async () => {
	const statusElem = document.querySelector('#status') as HTMLDivElement;

	statusElem.textContent = 'Loading...';

	// Set up viewer
	updateView(globals);

	// Load models
	try {
		await loadModels(globals.scene);
		console.log('Models loaded');
	} catch (error) {
		statusElem.textContent = 'Error loading models';
		console.error(error);
		return;
	}

	// Load ROV Data and render point cloud
	try {
		await loadRovCampaign(globals);
		console.log('Campaign data loaded');
	} catch (error) {
		statusElem.textContent = 'Error loading campaign data';
		console.error(error);
		return;
	}

	// Add viewer and FPS counter once ready
	document.body.append(globals.renderer.domElement);
	document.body.append(stats.dom);
	statusElem.textContent = 'Ready';

	// Start render loop
	animate();
};
