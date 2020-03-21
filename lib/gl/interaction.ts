import { Interaction, Transformation, Vector3, Vector2, Matrix } from '../../types';

import { interpolateVectors, clamp, addVectors, degreesToRadians } from './math';
import { invertMatrix, applyMatrixToVector3, lookAt } from './matrix';

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

// export const updateMouseInteraction = ({ clientX, clientY }: React.MouseEvent, interaction: Interaction, $container: HTMLDivElement): Interaction => {
// 	const { width, height, left, top } = $container.getBoundingClientRect();

// 	const { x, y } = normalizeScreenCoordinates({
// 		x: clientX - left,
// 		y: clientY - top,
// 		containerWidth: width,
// 		containerHeight: height
// 	});

// 	return {
// 		...interaction,
// 		beta: y * -1 * INTERACTION_SETTINGS.betaMouseWeight,
// 		gamma: x * INTERACTION_SETTINGS.gammaMouseWeight
// 	};
// };

// export const updateDeviceInteraction = (e: DeviceOrientationEvent, interaction: Interaction): Interaction => {
// 	const { beta, gamma } = normalizeOrientation(e);
// 	return {
// 		...interaction,
// 		beta: beta * INTERACTION_SETTINGS.betaDeviceWeight,
// 		gamma: gamma * INTERACTION_SETTINGS.gammaDeviceWeight,
// 		enabled: true
// 	};
// };

// export const applyInteraction = ({ transformation, interaction }: { transformation: Transformation; interaction: Interaction }): { newTransformation: Transformation; newInteraction: Interaction } => {
// 	const { accelerateTimer, decelerateTimer } = interaction;

// 	const newVelocity = calculateVelocity(interaction);

// 	const newAccelerateTimer = accelerateTimer < 1 ? clamp(accelerateTimer + INTERACTION_SETTINGS.friction, 0, 1) : accelerateTimer;

// 	const newDecelerateTimer = decelerateTimer < 1 ? clamp(decelerateTimer + INTERACTION_SETTINGS.friction, 0, 1) : decelerateTimer;

// 	const newRotation = addVectors(transformation.rotation, newVelocity);

// 	return {
// 		newInteraction: {
// 			...interaction,
// 			velocity: newVelocity,
// 			accelerateTimer: newAccelerateTimer,
// 			decelerateTimer: newDecelerateTimer
// 		},
// 		newTransformation: {
// 			...transformation,
// 			rotation: newRotation
// 		}
// 	};
// };

export const updateInteraction = (interaction: Interaction): Interaction => {
	const { accelerateTimer, decelerateTimer, rotation } = interaction;
	const newVelocity = updateVelocity(interaction);
	return {
		...interaction,
		velocity: newVelocity,
		accelerateTimer: updateTimer(accelerateTimer),
		decelerateTimer: updateTimer(decelerateTimer),
		rotation: addVectors(rotation, newVelocity)
	};
};

const updateTimer = (timer: number): number => (timer < 1 ? clamp(timer + INTERACTION_SETTINGS.friction, 0, 1) : timer);

const updateVelocity = (interaction: Interaction): Vector3 => {
	const { gyroscope, accelerateTimer, decelerateTimer, velocity } = interaction;

	const targetVelocity: Vector3 = gyroscope.enabled
		? {
				x: gyroscope.beta,
				y: gyroscope.gamma,
				z: 0
		  }
		: { x: 0, y: 0, z: 0 };

	return gyroscope.enabled ? interpolateVectors(velocity, targetVelocity, accelerateTimer) : interpolateVectors(velocity, targetVelocity, decelerateTimer);
};

// Map mouse position from pixel coordinate to a range of -1 to 1
export const mapMouseToScreenSpace = (mousePos: Vector2, size: Vector2): { x: number; y: number } => {
	return {
		x: 1 - 2 * (mousePos.x / size.x),
		y: (mousePos.y / size.y) * 2 + 1
	};
};

export const unprojectCoordinate = (screenSpaceCoordinate: Vector2, projectionMatrix: Matrix): Vector3 => {
	const inverseProjectionMatrix: Matrix = invertMatrix(projectionMatrix);
	return {
		...applyMatrixToVector3({ x: screenSpaceCoordinate.x, y: screenSpaceCoordinate.y, z: -1 }, inverseProjectionMatrix),
		z: 0.5 // 0.5 places the mouse just in front of the object
	};
};

export const normalizeOrientation = (e: DeviceOrientationEvent): { beta: number; gamma: number } => {
	const normBeta = Math.sin(degreesToRadians(e.beta + INTERACTION_SETTINGS.betaOffsetDegrees));
	const normGamma = Math.sin(degreesToRadians(2 * e.gamma));
	return {
		beta: normBeta * INTERACTION_SETTINGS.betaDeviceWeight,
		gamma: normGamma * INTERACTION_SETTINGS.gammaMouseWeight
	};
};

export const lookAtMouse = (mousePos: Vector2, size: Vector2, projectionMatrix: Matrix, modelViewMatrix: Matrix): Matrix => {
	const screenSpaceTarget = mapMouseToScreenSpace(mousePos, size);
	const targetCoord: Vector3 = unprojectCoordinate(screenSpaceTarget, projectionMatrix);
	return lookAt(modelViewMatrix, {
		target: targetCoord,
		origin: { x: 0, y: 0, z: 0 },
		up: { x: 0, y: 1, z: 0 }
	});
};
