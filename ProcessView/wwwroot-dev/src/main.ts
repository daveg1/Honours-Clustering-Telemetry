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
	const statusElem = document.querySelector('#status');

	if (statusElem) {
		statusElem.textContent = 'Loading...';
	}

	// Set up viewer
	updateView(globals);

	// Load models and add viewer to page
	await loadModels(globals.scene);
	document.body.append(globals.renderer.domElement);
	document.body.append(stats.dom);

	// Load ROV Data
	await loadRovCampaign(globals);

	if (statusElem) {
		statusElem.textContent = 'Ready';
	}

	// Initial render
	animate();
};
