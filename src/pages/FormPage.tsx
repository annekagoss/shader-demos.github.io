import * as React from 'react';
import { BASE_UNIFORMS } from '../utils/general';
import Section from '../components/Section/Section';
import BaseCanvas from '../components/BaseCanvas';
import baseVertexShader from '../../lib/gl/shaders/base.vert';
import helloWorldFragmentShader from '../../lib/gl/shaders/hello-world.frag';
import stepFragmentShader from '../../lib/gl/shaders/step.frag';
import lineFragmentShader from '../../lib/gl/shaders/line.frag';
import rectangleFragmentShader from '../../lib/gl/shaders/rectangle.frag';
import circleFragmentShader from '../../lib/gl/shaders/circle.frag';
import polygonFragmentShader from '../../lib/gl/shaders/polygon.frag';
import { UNIFORM_TYPE, UniformSetting } from '../../types';

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
		defaultValue: { x: 0.33, y: 0.66 },
		name: 'uRectDimensions',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.33, y: 0.66 }
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
		defaultValue: { x: 0.5, y: 0.5 },
		name: 'uCenter',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.5, y: 0.5 }
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
		defaultValue: { x: 0.5, y: 0.5 },
		name: 'uDimensions',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: { x: 0.5, y: 0.5 }
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

const FormPage = ({ isActive }: Props) => {
	const baseUniforms = React.useRef<UniformSetting[]>(BASE_UNIFORMS);
	const stepUniforms = React.useRef<UniformSetting[]>(BASE_STEP_UNIFORMS);
	const lineUniforms = React.useRef<UniformSetting[]>(BASE_LINE_UNIFORMS);
	const rectUniforms = React.useRef<UniformSetting[]>(BASE_RECTANGLE_UNIFORMS);
	const circleUniforms = React.useRef<UniformSetting[]>(BASE_CIRCLE_UNIFORMS);
	const polygonUniforms = React.useRef<UniformSetting[]>(BASE_POLYGON_UNIFORMS);
	const [attributes, setAttributes] = React.useState<any[]>([]);

	if (!isActive) return <></>;

	return (
		<div>
			<Section
				title='0.0: Hello World'
				notes={`
              The fragment shader is rendered onto a base mesh. In these first examples we will use a 1x1 plane which acts as a projection screen.
              The aVertexPosition attribute holds an array of 3-vector coordinates for each vertex of the base mesh.
            `}
				fragmentShader={helloWorldFragmentShader}
				vertexShader={baseVertexShader}
				uniforms={stepUniforms}
				attributes={attributes}>
				<BaseCanvas fragmentShader={helloWorldFragmentShader} vertexShader={baseVertexShader} uniforms={stepUniforms} setAttributes={setAttributes} />
			</Section>

			<Section
				title='0.1: Step'
				notes={` Step is one of the hardware accelerated functions that are native to GLSL. It returns either 1.0 or 0.0 based on whether a value has passed a given threshold.`}
				fragmentShader={stepFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={stepUniforms}>
				<BaseCanvas fragmentShader={stepFragmentShader} vertexShader={baseVertexShader} uniforms={stepUniforms} setAttributes={setAttributes} />
			</Section>
			<Section
				title='0.2: Line'
				notes={
					' Smoothstep is another hardware accelerated function.  It performs a smooth interpolation between 0 and 1 for a given value (in this case, y.)  Notice the anti-aliasing benefit smoothstep adds by toggling uSmooth on and off.'
				}
				fragmentShader={lineFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={lineUniforms}>
				<BaseCanvas fragmentShader={lineFragmentShader} vertexShader={baseVertexShader} uniforms={lineUniforms} setAttributes={setAttributes} />
			</Section>
			<Section
				title='0.3: Rectangle'
				notes={`Adding, subtracting, multiplying and dividing operations work exactly like blending modes in CSS or Photoshop.  Here we're using multiply  to combine the dark edges around the rectangle.`}
				fragmentShader={rectangleFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={rectUniforms}>
				<BaseCanvas fragmentShader={rectangleFragmentShader} vertexShader={baseVertexShader} uniforms={rectUniforms} setAttributes={setAttributes} />
			</Section>
			<Section
				title='0.4: Circle'
				notes={`Distance is a very useful hardware accelerated function that return the distance between two points.  The points can be represented as two floats or two n-dimensional vectors.`}
				fragmentShader={circleFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={circleUniforms}>
				<BaseCanvas fragmentShader={circleFragmentShader} vertexShader={baseVertexShader} uniforms={circleUniforms} setAttributes={setAttributes} />
			</Section>
			<Section
				title='0.5: Polygon'
				notes={`Signed Distance Functions are tricky, but very powerful.  They define a field of values based on each point's distance from a given boundary, where the sign determined whether the point is within the boundary.  Here we have a function that determines if a pixel is inside the boundaries of an n-sided polygon.`}
				fragmentShader={polygonFragmentShader}
				vertexShader={baseVertexShader}
				attributes={attributes}
				uniforms={polygonUniforms}>
				<BaseCanvas fragmentShader={polygonFragmentShader} vertexShader={baseVertexShader} uniforms={polygonUniforms} setAttributes={setAttributes} />
			</Section>
		</div>
	);
};

export default FormPage;
