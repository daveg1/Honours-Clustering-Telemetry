import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();

// Compress model for better performance
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/examples/jsm/libs/draco/');
loader.setDRACOLoader(dracoLoader);

export async function loadGlbData(url: string) {
	try {
		const data = await loader.loadAsync(url);
		return data;
	} catch (e) {
		throw new Error(`Could not load model ${url}`);
	}
}
