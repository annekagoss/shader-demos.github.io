import {Interaction, Transformation, Vector3, Vector2, Matrix} from '../../types';

import {DEFAULT_ROTATION_SPEED} from './settings';

import {interpolateVectors, clamp, addVectors, degreesToRadians} from './math';
import {invertMatrix, applyMatrixToVector3} from './matrix';

interface InteractionSettings {
	betaMouseWeight: number;
	gammaMouseWeight: number;
	betaDeviceWeight: number;
	gammaDeviceWeight: number;
	betaOffsetDegrees: number;
	friction: number;
}

const INTERACTION_SETTINGS: InteractionSettings = {
	betaMouseWeight: 0.05,
	gammaMouseWeight: 0.075,
	betaDeviceWeight: 0.025,
	gammaDeviceWeight: 0.05,
	betaOffsetDegrees: -30,
	friction: 0.001
};

export const startInteraction = (animState: Interaction): Interaction => ({
	...animState,
	accelerateTimer: 0,
	enabled: true
});

export const stopInteraction = (animState: Interaction): Interaction => ({
	...animState,
	beta: null,
	gamma: null,
	decelerateTimer: 0,
	enabled: false
});

export const updateMouseInteraction = ({clientX, clientY}: React.MouseEvent, interaction: Interaction, $container: HTMLDivElement): Interaction => {
	const {width, height, left, top} = $container.getBoundingClientRect();

	const {x, y} = normalizeScreenCoordinates({
		x: clientX - left,
		y: clientY - top,
		containerWidth: width,
		containerHeight: height
	});

	return {
		...interaction,
		beta: y * -1 * INTERACTION_SETTINGS.betaMouseWeight,
		gamma: x * INTERACTION_SETTINGS.gammaMouseWeight
	};
};

export const updateDeviceInteraction = (e: DeviceOrientationEvent, interaction: Interaction): Interaction => {
	const {beta, gamma} = normalizeOrientation(e);
	return {
		...interaction,
		beta: beta * INTERACTION_SETTINGS.betaDeviceWeight,
		gamma: gamma * INTERACTION_SETTINGS.gammaDeviceWeight,
		enabled: true
	};
};

export const applyInteraction = ({transformation, interaction}: {transformation: Transformation; interaction: Interaction}): {newTransformation: Transformation; newInteraction: Interaction} => {
	const {accelerateTimer, decelerateTimer} = interaction;

	const newVelocity = calculateVelocity(interaction);

	const newAccelerateTimer = accelerateTimer < 1 ? clamp(accelerateTimer + INTERACTION_SETTINGS.friction, 0, 1) : accelerateTimer;

	const newDecelerateTimer = decelerateTimer < 1 ? clamp(decelerateTimer + INTERACTION_SETTINGS.friction, 0, 1) : decelerateTimer;

	const newRotation = addVectors(transformation.rotation, newVelocity);

	return {
		newInteraction: {
			...interaction,
			velocity: newVelocity,
			accelerateTimer: newAccelerateTimer,
			decelerateTimer: newDecelerateTimer
		},
		newTransformation: {
			...transformation,
			rotation: newRotation
		}
	};
};

const calculateVelocity = (interaction: Interaction): Vector3 => {
	const {beta, gamma, accelerateTimer, decelerateTimer, enabled, velocity} = interaction;

	const targetVelocity: Vector3 = enabled
		? {
				x: beta,
				y: DEFAULT_ROTATION_SPEED + gamma,
				z: 0
		  }
		: {
				x: 0,
				y: DEFAULT_ROTATION_SPEED,
				z: 0
		  };
	return enabled ? interpolateVectors(velocity, targetVelocity, accelerateTimer) : interpolateVectors(velocity, targetVelocity, decelerateTimer);
};

export const normalizeScreenCoordinates = (mousePos: Vector2, size: Vector2): {x: number; y: number} => {
	return {
		x: 1 - 2 * (mousePos.x / size.x),
		y: 2 * (mousePos.y / size.x)
	};
};

export const unprojectCoordinate = (screenSpaceCoordinate: Vector2, projectionMatrix: Matrix): Vector3 => {
	const inverseProjectionMatrix: Matrix = invertMatrix(projectionMatrix);
	return {
		...applyMatrixToVector3({x: screenSpaceCoordinate.x, y: screenSpaceCoordinate.y, z: -1}, inverseProjectionMatrix),
		z: 0.5 // 0.5 places the mouse just in front of the object
	};
};

const normalizeOrientation = ({beta, gamma}: {beta: number; gamma: number}): {beta: number; gamma: number} => {
	const normBeta = Math.sin(degreesToRadians(beta + INTERACTION_SETTINGS.betaOffsetDegrees));
	const normGamma = Math.sin(degreesToRadians(2 * gamma));
	return {
		beta: normBeta,
		gamma: normGamma
	};
};
