import * as React from 'react';
import { UNIFORM_TYPE, Vector2, UniformSetting } from '../../types';
import { BASE_UNIFORMS } from '../utils/general';
import Section from '../components/Section/Section';
import BaseCanvas from '../components/BaseCanvas';
import FeedbackCanvas from '../components/FeedbackCanvas';
import ShaderText from '../components/ShaderText/ShaderText';
import Inputs from '../components/Inputs/Inputs';
import baseVertexShader from '../../lib/gl/shaders/base.vert';
import translationFragmentShader from '../../lib/gl/shaders/translate.frag';
import scaleFragmentShader from '../../lib/gl/shaders/scale.frag';
import rotationFragmentShader from '../../lib/gl/shaders/rotation.frag';
import signalFragmentShader from '../../lib/gl/shaders/signal.frag';
import noiseFragmentShader from '../../lib/gl/shaders/noise.frag';
import feedbackFragmentShader from '../../lib/gl/shaders/feedback.frag';
import styles from './page.module.scss';

const BASE_TRANSLATION_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0
	},
	{
		defaultValue: { x: 0.5, y: 0.5 },
		name: 'uRectDimensions',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.5, y: 0.5 }
	},
	{
		defaultValue: { x: 0.5, y: 0.5 },
		name: 'uMouse',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.5, y: 0.5 }
	}
];

const BASE_SCALE_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0
	},
	{
		defaultValue: { x: 1.0, y: 1.0 },
		name: 'uMaxScale',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 1.0, y: 1.0 }
	}
];

const BASE_ROTATION_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0
	},
	{
		defaultValue: 1,
		name: 'uSpeed',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 1
	}
];

const BASE_SIGNAL_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0
	},
	{
		defaultValue: 1.0,
		name: 'uFrequency',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 1.0
	},
	{
		defaultValue: 1.0,
		name: 'uSpeed',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 1.0
	},
	{
		defaultValue: 0,
		isBool: false,
		isRadio: true,
		radioChoices: ['Sine', 'Square', 'Sawtooth', 'Triangle'],
		name: 'uSignalType',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0
	}
];

const BASE_NOISE_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0
	},
	{
		defaultValue: 1,
		isBool: true,
		name: 'uFractal',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 1
	},
	{
		defaultValue: 4,
		isBool: false,
		name: 'uOctaves',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 4
	}
];

const BASE_FEEDBACK_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0
	},
	{
		defaultValue: { x: 0.5, y: 0.5 },
		name: 'uMouse',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.5, y: 0.5 }
	},
	{
		defaultValue: { x: 0, y: -0.01 },
		name: 'uOffset',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0, y: -0.01 }
	},
	{
		defaultValue: 0.95,
		name: 'uAlpha',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.95
	},
	{
		defaultValue: 0,
		isBool: true,
		name: 'uSmoke',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0
	}
];

interface Props {
	isActive: boolean;
}

const MotionPage = ({ isActive }: Props) => {
	const translationUniforms = React.useRef<UniformSetting[]>(BASE_TRANSLATION_UNIFORMS);
	const scaleUniforms = React.useRef<UniformSetting[]>(BASE_SCALE_UNIFORMS);
	const rotationUniforms = React.useRef<UniformSetting[]>(BASE_ROTATION_UNIFORMS);
	const signalUniforms = React.useRef<UniformSetting[]>(BASE_SIGNAL_UNIFORMS);
	const noiseUniforms = React.useRef<UniformSetting[]>(BASE_NOISE_UNIFORMS);
	const feedbackUniforms = React.useRef<UniformSetting[]>(BASE_FEEDBACK_UNIFORMS);
	const [attributes, setAttributes] = React.useState<any[]>([]);

	if (!isActive) return <></>;

	return (
		<div>
			<Section
				title='1.0: Translation'
				notes={`To change the position of a shape in a shader, you actually change the coordinate system itself.  In this example we move the screen space around in a circle, and then draw the square inside it.  If there are multiple Form that are moving independantly would each have their own unique coordinate system.`}
				fragmentShader={translationFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={translationUniforms}>
				<BaseCanvas fragmentShader={translationFragmentShader} vertexShader={baseVertexShader} uniforms={translationUniforms} setAttributes={setAttributes} />
			</Section>
			<Section
				title='1.1: Scale'
				notes={`GLSL's native support for matrices allows us to apply complex spatial transformations efficiently. Scaling is probably the simplest of these transformations.  Notice that we need to normalize and then re-center the coordinate system before and after applying the matrix.`}
				fragmentShader={scaleFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={scaleUniforms}>
				<BaseCanvas fragmentShader={scaleFragmentShader} vertexShader={baseVertexShader} uniforms={scaleUniforms} setAttributes={setAttributes} />
			</Section>
			<Section
				title='1.2: Rotation'
				notes={`Here we use another 2x2 matrix to rotate the coordinate system around the origin x:0 y: 0.`}
				fragmentShader={rotationFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={rotationUniforms}>
				<BaseCanvas fragmentShader={rotationFragmentShader} vertexShader={baseVertexShader} uniforms={rotationUniforms} setAttributes={setAttributes} />
			</Section>
			<Section
				title='1.3: Signal'
				notes={`Like noise, signals can be a powerful tool for generating and animating graphics. If with think of the x-axis as the time domain we can draw signals by offsetting them in time instead of space.`}
				fragmentShader={signalFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={signalUniforms}>
				<BaseCanvas fragmentShader={signalFragmentShader} vertexShader={baseVertexShader} uniforms={signalUniforms} setAttributes={setAttributes} />
			</Section>
			<Section
				title='1.4: Noise'
				notes={`Noise is a powerful tool to create organic effects.  This is an example of 3D Simplex Noise, where we animate the noise by mapping the 3rd dimension to time.`}
				fragmentShader={noiseFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={noiseUniforms}>
				<BaseCanvas fragmentShader={noiseFragmentShader} vertexShader={baseVertexShader} uniforms={noiseUniforms} setAttributes={setAttributes} />
			</Section>
			<Section
				title='1.5: Feedback'
				notes={`This shader takes in itself as in input to generate this tail. On each frame it recursively applies an offset and opacity to the frame before it.  To achieve this we need two offscreen frame buffers and target textures that are alternated each frame (called PingPonging.)`}
				fragmentShader={feedbackFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={feedbackUniforms}>
				<FeedbackCanvas fragmentShader={feedbackFragmentShader} vertexShader={baseVertexShader} uniforms={feedbackUniforms} setAttributes={setAttributes} />
			</Section>
		</div>
	);
};

export default MotionPage;
