import type { Globals } from '../types/Globals';

export function updateView(globals: Globals): void {
	globals.camera.aspect = window.innerWidth / window.innerHeight;
	globals.camera.updateProjectionMatrix();

	globals.renderer.setSize(window.innerWidth, window.innerHeight);
}
