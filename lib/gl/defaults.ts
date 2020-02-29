import {Colors, LightIntensities, LightPositions, Vector3} from '../../types';

export const DEFAULT_LIGHT_POSITIONS: LightPositions = {
	left: [-8, 4, 2],
	right: [8, 4, 2],
	top: [2, 8, 2],
	bottom: [-8, -8, 2]
};

export const DEFAULT_COLORS: Colors = {
	ambientLight: '#78c7ff',
	backgroundA: '#78c7ff',
	backgroundB: '#e4f6ae',
	leftLight: '#f79d64',
	rightLight: '#0090f7',
	topSpot: '#ffffff',
	bottomSpot: '#ffffff'
};

export const DEFAULT_LIGHT_INTENSITIES: LightIntensities = {
	ambient: 0.5,
	left: 0.1,
	right: 0.01,
	top: 0.01,
	bottom: 0.01
};

export const DEFAULT_OFFSET: Vector3 = {
	x: 0,
	y: 0,
	z: 0
};

export const DEFAULT_ROTATION: Vector3 = {
	x: 0,
	y: 0,
	z: 0
};

export const DEFAULT_SCALE: number = 1;

export const DEFAULT_ROTATION_SPEED: number = 0.003;

export const MAX_IDLE_TIME: number = 1000;

export const DEFAULT_SHININESS: number = 1;

export const DEFAULT_BRIGHTNESS: number = 0.4;

export const DEFAULT_SHADOW_STRENGTH: number = 0.25;

export const MAX_SUPPORTED_MATERIAL_TEXTURES: number = 2;
