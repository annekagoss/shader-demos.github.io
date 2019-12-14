import * as React from 'react';

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
	const baseUniforms = React.useRef<UniformSetting[]>(BASE_UNIFORMS);
	const stepUniforms = React.useRef<UniformSetting[]>(BASE_STEP_UNIFORMS);
	const [attributes, setAttributes] = React.useState<any[]>([]);

	return (
		<div className={styles.app}>
			<div className={styles.page}>
				{/* <div className={styles.section}> */}
				{/* <GLScene {...GL_PROPS} /> */}
				{/* </div> */}

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
			</div>
		</div>
	);
};

export default App;
