import {UNIFORM_TYPE, UniformSetting} from '../../types';

export const calcWindowDiagonalAngle = (): number => {
	const {innerWidth, innerHeight} = window;
	return Math.atan(innerHeight / innerWidth);
};

export const calcWindowHypotenuse = (): number => {
	const {innerWidth, innerHeight} = window;
	return Math.sqrt(Math.pow(innerWidth, 2) + Math.pow(innerHeight, 2));
};

export const parseUniform = (value: any, type: UNIFORM_TYPE) => {
	switch (type) {
		case UNIFORM_TYPE.FLOAT_1:
			return value;
		case UNIFORM_TYPE.VEC_2:
			return `x: ${value.x}, y: ${value.y}`;
		case UNIFORM_TYPE.VEC_3:
			return `x: ${value.x}, y: ${value.y}, z: ${value.z}`;
		default:
			return value;
	}
};

export const BASE_UNIFORMS: UniformSetting[] = [
	{
		defaultValue: {x: 400, y: 400},
		name: 'uResolution',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: {x: 400, y: 400}
	}
];
