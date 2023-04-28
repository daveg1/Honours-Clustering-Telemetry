import * as THREE from 'three';
import type { RovCampaign } from '../../types/RovCampaign';
import seedrandom from 'seedrandom';

const clusters: THREE.Color[] = [];
const random = seedrandom('seed2');

// Generate 100 colours
for (let i = 0; i < 200; i++) {
	clusters.push(new THREE.Color(random(), random(), random()));
}

export function createPointCloud(
	data: RovCampaign,
	start?: number,
	end?: number
): THREE.Points {
	const pointsMaterial = new THREE.PointsMaterial({
		size: 0.05,
		vertexColors: true,
	});

	const colours: number[] = [];

	// If labels are set, use colours from cluster set
	if (data.labels.length) {
		data.labels.forEach((l) => {
			colours.push(clusters[l].r, clusters[l].g, clusters[l].b);
		});
	}

	// Otherwise use heatmap colours
	else {
		data.kpi.forEach((k, index) => {
			if (start !== undefined && end !== undefined) {
				if (index <= start || index >= end) {
					colours.push(0.27, 0.27, 0.27);
					return;
				}
			}

			const gradient = globalThis.heatMap[k];
			const colour = new THREE.Color(gradient[0], gradient[1], gradient[2]);
			colours.push(colour.r, colour.g, colour.b);
		});
	}

	const geometry = new THREE.BufferGeometry();

	geometry.setAttribute(
		'position',
		new THREE.Float32BufferAttribute(data.positions, 3)
	);

	geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));

	const pointCloud = new THREE.Points(geometry, pointsMaterial);
	pointCloud.scale.set(0.1, 0.1, 0.1);
	pointCloud.rotation.set(0, Math.PI / 3, 0);
	pointCloud.position.set(1, 6.8, 1.25);

	return pointCloud;
}
