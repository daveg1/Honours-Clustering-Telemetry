import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RovCampaign } from './RovCampaign';

declare global {
	var three: {
		camera: THREE.PerspectiveCamera;
		renderer: THREE.WebGLRenderer;
		scene: THREE.Scene;
		controls: OrbitControls;
	};

	var heatMap: [number, number, number, number][];

	var pointCloud: {
		data: RovCampaign;
		points: THREE.Points;
	};
}
