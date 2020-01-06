import * as React from 'react';
import {useAnimationFrame} from '../hooks/animation';

import {SceneProps, UNIFORM_TYPE, UniformSetting} from '../../types';
import GLScene from './GLScene/GLScene';
import Section from './Section/Section';
import BaseCanvas from './BaseCanvas/BaseCanvas';
import ShaderText from './ShaderText/ShaderText';
import Inputs from './Inputs/Inputs';
import baseVertexShader from '../../lib/gl/shaders/base.vert';

// 0.0 HELLO WORlD
import helloWorldFragmentShader from '../../lib/gl/shaders/hello-world.frag';

// 0.1 STEP
import stepFragmentShader from '../../lib/gl/shaders/step.frag';

// 0.2 LINE
import lineFragmentShader from '../../lib/gl/shaders/line.frag';

// 0.3 RECTANGLE
import rectangleFragmentShader from '../../lib/gl/shaders/rectangle.frag';

// 0.4 CIRCLE
import circleFragmentShader from '../../lib/gl/shaders/circle.frag';

// 0.5 TRIANGLE
import triangleFragmentShader from '../../lib/gl/shaders/triangle.frag';

// 0.6 Translation
import translationFragmentShader from '../../lib/gl/shaders/translate.frag';

import styles from './app.module.scss';

const BASE_UNIFORMS: UniformSetting[] = [
	{
		defaultValue: {x: 400, y: 400},
		name: 'uResolution',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: {x: 400, y: 400}
	}
];

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
		defaultValue: {x: 0.5, y: 0.5},
		name: 'uRectDimensions',
		readonly: false,
		type: UNIFORM_TYPE.VEC_2,
		value: {x: 0.5, y: 0.5}
	}
];

// FOX SKULL
// import OBJSource from '../../lib/gl/assets/fox/fox3.obj';
// import MTLSource from '../../lib/gl/assets/fox/fox.mtl';
// import diffuseSource0 from '../../lib/gl/assets/fox/fox_skull_0.jpg';
// import diffuseSource1 from '../../lib/gl/assets/fox/fox_skull_1.jpg';

// // const GL_PROPS: SceneProps = {
// 	colors: {
// 		ambientLight: 'rgba(100, 100, 100, 1)',
// 		backgroundA: 'rgba(255, 0, 0, 1)',
// 		backgroundB: 'rgba(0, 0, 255, 1)',
// 		leftLight: 'rgba(150, 150, 150, 1)',
// 		rightLight: 'rgba(150, 150, 150, 1)'
// 	},
// 	OBJSource,
// 	MTLSource,
// 	diffuseSources: {
// 		'material_0.001': diffuseSource0,
// 		'material_1.001': diffuseSource1
// 	},
// 	positionOffset: {
// 		x: 0,
// 		y: 0.3,
// 		z: 0
// 	},
// 	rotationOffset: {
// 		x: 0.3,
// 		y: 1.9,
// 		z: 0
// 	},
// 	brightness: 0.8,
// 	shininess: 0,
// 	shadowStrength: 0.33,
// 	scale: 0.0485
// };

const App = () => {
	const globalTime = React.useRef<number>(0);
	const baseUniforms = React.useRef<UniformSetting[]>(BASE_UNIFORMS);
	const stepUniforms = React.useRef<UniformSetting[]>(BASE_STEP_UNIFORMS);
	const lineUniforms = React.useRef<UniformSetting[]>(BASE_LINE_UNIFORMS);
	const rectUniforms = React.useRef<UniformSetting[]>(BASE_RECTANGLE_UNIFORMS);
	const circleUniforms = React.useRef<UniformSetting[]>(BASE_CIRCLE_UNIFORMS);
	const triangleUniforms = React.useRef<UniformSetting[]>(BASE_TRIANGLE_UNIFORMS);
	const translationUniforms = React.useRef<UniformSetting[]>(BASE_TRANSLATION_UNIFORMS);
	const [attributes, setAttributes] = React.useState<any[]>([]);

	useAnimationFrame((time: number) => {
		globalTime.current = time;
	});

	return (
		<div className={styles.app}>
			<div className={styles.page}>
				{/* <div className={styles.section}> */}
				{/* <GLScene {...GL_PROPS} /> */}
				{/* </div> */}
				{/* 
				<Section
					title='0.0: Hello World'
					notes={`
              The fragment shader is rendered onto a base mesh. In these first examples we will use a 1x1 plane which acts as a projection screen.
              The aVertexPosition attribute holds an array of 3-vector coordinates for each vertex of the base mesh.
            `}>
					<BaseCanvas fragmentShader={helloWorldFragmentShader} vertexShader={baseVertexShader} uniforms={stepUniforms} setAttributes={setAttributes} />
					<ShaderText fragmentShader={helloWorldFragmentShader} vertexShader={baseVertexShader} />
					<Inputs uniforms={baseUniforms} attributes={attributes} />
				</Section>

				<Section title='0.1: Step' notes={` Step is one of the hardware accelerated functions that are native to GLSL. It returns either 1.0 or 0.0 based on whether a value has passed a given threshold.`}>
					<BaseCanvas fragmentShader={stepFragmentShader} vertexShader={baseVertexShader} uniforms={stepUniforms} setAttributes={setAttributes} />
					<ShaderText fragmentShader={stepFragmentShader} vertexShader={baseVertexShader} />
					<Inputs attributes={attributes} uniforms={stepUniforms} />
				</Section>

				<Section title='0.2: Line' notes={' Smoothstep is another hardware accelerated function.  It performs a smooth interpolation between 0 and 1 for a given value (in this case, y.)  Notice the anti-aliasing benefit smoothstep adds by toggling uSmooth on and off.'}>
					<BaseCanvas fragmentShader={lineFragmentShader} vertexShader={baseVertexShader} uniforms={lineUniforms} setAttributes={setAttributes} />
					<ShaderText fragmentShader={lineFragmentShader} vertexShader={baseVertexShader} />
					<Inputs attributes={attributes} uniforms={lineUniforms} />
				</Section>

				<Section title='0.3: Rectangle' notes={`Adding, subtracting, multiplying and dividing operations work exactly like blending modes in CSS or Photoshop.  Here we're using multiply  to combine the dark edges around the rectangle.`}>
					<BaseCanvas fragmentShader={rectangleFragmentShader} vertexShader={baseVertexShader} uniforms={rectUniforms} setAttributes={setAttributes} />
					<ShaderText fragmentShader={rectangleFragmentShader} vertexShader={baseVertexShader} />
					<Inputs attributes={attributes} uniforms={rectUniforms} />
				</Section>

				<Section title='0.4: Circle' notes={`Distance is a very useful hardware accelerated function that return the distance between two points.  The points can be represented as two floats or two n-dimensional vectors.`}>
					<BaseCanvas fragmentShader={circleFragmentShader} vertexShader={baseVertexShader} uniforms={circleUniforms} setAttributes={setAttributes} />
					<ShaderText fragmentShader={circleFragmentShader} vertexShader={baseVertexShader} />
					<Inputs attributes={attributes} uniforms={circleUniforms} />
				</Section>

				<Section title='0.5: Triangle' notes={`Signed Distance Functions are tricky, but very powerful.  They define a field of values based on each point's distance from a given boundary, where the sign determined whether the point is within the boundary.  Here we have a function that determines if a pixel is inside a triangle.`}>
					<BaseCanvas fragmentShader={triangleFragmentShader} vertexShader={baseVertexShader} uniforms={triangleUniforms} setAttributes={setAttributes} />
					<ShaderText fragmentShader={triangleFragmentShader} vertexShader={baseVertexShader} />
					<Inputs attributes={attributes} uniforms={triangleUniforms} />
				</Section> */}

				<Section title='0.6: Translation' notes={``}>
					<BaseCanvas fragmentShader={translationFragmentShader} vertexShader={baseVertexShader} uniforms={translationUniforms} setAttributes={setAttributes} />
					<ShaderText fragmentShader={translationFragmentShader} vertexShader={baseVertexShader} />
					<Inputs attributes={attributes} uniforms={translationUniforms} />
				</Section>
			</div>
		</div>
	);
};

export default App;
