export function updateView(): void {
	globalThis.three.camera.aspect = window.innerWidth / window.innerHeight;
	globalThis.three.camera.updateProjectionMatrix();

	globalThis.three.renderer.setSize(window.innerWidth, window.innerHeight);
}
