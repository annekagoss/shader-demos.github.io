import * as React from 'react';
import Section from '../../components/Section/Section';
import BaseCanvas from '../../components/BaseCanvas/BaseCanvas';
import ShaderText from '../../components/ShaderText/ShaderText';
import Inputs from '../../components/Inputs/Inputs';
import baseVertexShader from '../../../lib/gl/shaders/base.vert';
import {BASE_UNIFORMS} from '../../utils/general';
import {UNIFORM_TYPE, UniformSetting} from '../../../types';

import helloWorldFragmentShader from '../../../lib/gl/shaders/hello-world.frag';
import stepFragmentShader from '../../../lib/gl/shaders/step.frag';
import lineFragmentShader from '../../../lib/gl/shaders/line.frag';
import rectangleFragmentShader from '../../../lib/gl/shaders/rectangle.frag';
import circleFragmentShader from '../../../lib/gl/shaders/circle.frag';
import polygonFragmentShader from '../../../lib/gl/shaders/polygon.frag';
import styles from './FormPage.module.scss';

const BASE_STEP_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 0.5,
		name: 'uThreshold',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.5
	}
];

const BASE_LINE_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 1,
		isBool: true,
		name: 'uSmooth',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 1
	},
	{
		defaultValue: 0.02,
		name: 'uThickness',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.02
	}
];

const BASE_RECTANGLE_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: {x: 0.33, y: 0.66},
		name: 'uRectDimensions',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: {x: 0.33, y: 0.66}
	}
];

const BASE_CIRCLE_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 1,
		isBool: true,
		name: 'uSmooth',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 1
	},
	{
		defaultValue: 0.25,
		name: 'uRadius',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.25
	},
	{
		defaultValue: {x: 0.5, y: 0.5},
		name: 'uCenter',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: {x: 0.5, y: 0.5}
	}
];

const BASE_TRIANGLE_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 1,
		isBool: true,
		name: 'uSmooth',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 1
	},
	{
		defaultValue: {x: 0.5, y: 0.5},
		name: 'uDimensions',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: {x: 0.5, y: 0.5}
	},
	{
		defaultValue: 0,
		isBool: true,
		name: 'uShowSDF',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0
	}
];

const BASE_POLYGON_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 3,
		isBool: false,
		name: 'uNumSides',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 3
	},
	{
		defaultValue: 0,
		isBool: true,
		name: 'uShowSDF',
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0
	}
];

interface Props {
	isActive: boolean;
}

const FormPage = ({isActive}: Props) => {
	const baseUniforms = React.useRef<UniformSetting[]>(BASE_UNIFORMS);
	const stepUniforms = React.useRef<UniformSetting[]>(BASE_STEP_UNIFORMS);
	const lineUniforms = React.useRef<UniformSetting[]>(BASE_LINE_UNIFORMS);
	const rectUniforms = React.useRef<UniformSetting[]>(BASE_RECTANGLE_UNIFORMS);
	const circleUniforms = React.useRef<UniformSetting[]>(BASE_CIRCLE_UNIFORMS);
	const polygonUniforms = React.useRef<UniformSetting[]>(BASE_POLYGON_UNIFORMS);
	const [attributes, setAttributes] = React.useState<any[]>([]);

	if (!isActive) return <></>;

	return (
		<div className={styles.page}>
			<Section
				title='0.0: Hello World'
				notes={`
              The fragment shader is rendered onto a base mesh. In these first examples we will use a 1x1 plane which acts as a projection screen.
              The aVertexPosition attribute holds an array of 3-vector coordinates for each vertex of the base mesh.
            `}>
				<BaseCanvas fragmentShader={helloWorldFragmentShader} vertexShader={baseVertexShader} uniforms={stepUniforms} setAttributes={setAttributes} />
				<ShaderText fragmentShader={helloWorldFragmentShader} vertexShader={baseVertexShader} />
				<Inputs uniforms={baseUniforms} attributes={attributes} />
			</Section>{' '}
			{/* <Section
				title='0.1: Step'
				notes={` Step is one of the hardware accelerated functions that are native to GLSL. It returns either 1.0 or 0.0 based on whether a value has passed a given threshold.`}>
				<BaseCanvas fragmentShader={stepFragmentShader} vertexShader={baseVertexShader} uniforms={stepUniforms} setAttributes={setAttributes} />
				<ShaderText fragmentShader={stepFragmentShader} vertexShader={baseVertexShader} />
				<Inputs attributes={attributes} uniforms={stepUniforms} />
			</Section>
			<Section
				title='0.2: Line'
				notes={
					' Smoothstep is another hardware accelerated function.  It performs a smooth interpolation between 0 and 1 for a given value (in this case, y.)  Notice the anti-aliasing benefit smoothstep adds by toggling uSmooth on and off.'
				}>
				<BaseCanvas fragmentShader={lineFragmentShader} vertexShader={baseVertexShader} uniforms={lineUniforms} setAttributes={setAttributes} />
				<ShaderText fragmentShader={lineFragmentShader} vertexShader={baseVertexShader} />
				<Inputs attributes={attributes} uniforms={lineUniforms} />
			</Section>
			<Section
				title='0.3: Rectangle'
				notes={`Adding, subtracting, multiplying and dividing operations work exactly like blending modes in CSS or Photoshop.  Here we're using multiply  to combine the dark edges around the rectangle.`}>
				<BaseCanvas fragmentShader={rectangleFragmentShader} vertexShader={baseVertexShader} uniforms={rectUniforms} setAttributes={setAttributes} />
				<ShaderText fragmentShader={rectangleFragmentShader} vertexShader={baseVertexShader} />
				<Inputs attributes={attributes} uniforms={rectUniforms} />
			</Section>
			<Section
				title='0.4: Circle'
				notes={`Distance is a very useful hardware accelerated function that return the distance between two points.  The points can be represented as two floats or two n-dimensional vectors.`}>
				<BaseCanvas fragmentShader={circleFragmentShader} vertexShader={baseVertexShader} uniforms={circleUniforms} setAttributes={setAttributes} />
				<ShaderText fragmentShader={circleFragmentShader} vertexShader={baseVertexShader} />
				<Inputs attributes={attributes} uniforms={circleUniforms} />
			</Section>
			<Section
				title='0.5: Polygon'
				notes={`Signed Distance Functions are tricky, but very powerful.  They define a field of values based on each point's distance from a given boundary, where the sign determined whether the point is within the boundary.  Here we have a function that determines if a pixel is inside the boundaries of an n-sided polygon.`}>
				<BaseCanvas fragmentShader={polygonFragmentShader} vertexShader={baseVertexShader} uniforms={polygonUniforms} setAttributes={setAttributes} />
				<ShaderText fragmentShader={polygonFragmentShader} vertexShader={baseVertexShader} />
				<Inputs attributes={attributes} uniforms={polygonUniforms} />
			</Section> */}
		</div>
	);
};

export default FormPage;
