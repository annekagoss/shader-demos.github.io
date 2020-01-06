import * as React from 'react';
import Section from '../Section/Section';
import BaseCanvas from '../BaseCanvas/BaseCanvas';
import ShaderText from '../ShaderText/ShaderText';
import Inputs from '../Inputs/Inputs';
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

import styles from './ShapesPage.module.scss';

const ShapesPage = () => {
	const baseUniforms = React.useRef<UniformSetting[]>(BASE_UNIFORMS);
	const stepUniforms = React.useRef<UniformSetting[]>(BASE_STEP_UNIFORMS);
	const lineUniforms = React.useRef<UniformSetting[]>(BASE_LINE_UNIFORMS);
	const rectUniforms = React.useRef<UniformSetting[]>(
		BASE_RECTANGLE_UNIFORMS
	);
	const circleUniforms = React.useRef<UniformSetting[]>(BASE_CIRCLE_UNIFORMS);
	const triangleUniforms = React.useRef<UniformSetting[]>(
		BASE_TRIANGLE_UNIFORMS
	);
	const translationUniforms = React.useRef<UniformSetting[]>(
		BASE_TRANSLATION_UNIFORMS
	);
	const [attributes, setAttributes] = React.useState<any[]>([]);

	return (
		<div className={styles.page}>
			{/* <div className={styles.section}> */}
			{/* <GLScene {...GL_PROPS} /> */}
			{/* </div> */}

			<Section
				title='0.0: Hello World'
				notes={`
              The fragment shader is rendered onto a base mesh. In these first examples we will use a 1x1 plane which acts as a projection screen.
              The aVertexPosition attribute holds an array of 3-vector coordinates for each vertex of the base mesh.
            `}
			>
				<BaseCanvas
					fragmentShader={helloWorldFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={stepUniforms}
					setAttributes={setAttributes}
				/>
				<ShaderText
					fragmentShader={helloWorldFragmentShader}
					vertexShader={baseVertexShader}
				/>
				<Inputs uniforms={baseUniforms} attributes={attributes} />
			</Section>

			<Section
				title='0.1: Step'
				notes={` Step is one of the hardware accelerated functions that are native to GLSL. It returns either 1.0 or 0.0 based on whether a value has passed a given threshold.`}
			>
				<BaseCanvas
					fragmentShader={stepFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={stepUniforms}
					setAttributes={setAttributes}
				/>
				<ShaderText
					fragmentShader={stepFragmentShader}
					vertexShader={baseVertexShader}
				/>
				<Inputs attributes={attributes} uniforms={stepUniforms} />
			</Section>

			<Section
				title='0.2: Line'
				notes={
					' Smoothstep is another hardware accelerated function.  It performs a smooth interpolation between 0 and 1 for a given value (in this case, y.)  Notice the anti-aliasing benefit smoothstep adds by toggling uSmooth on and off.'
				}
			>
				<BaseCanvas
					fragmentShader={lineFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={lineUniforms}
					setAttributes={setAttributes}
				/>
				<ShaderText
					fragmentShader={lineFragmentShader}
					vertexShader={baseVertexShader}
				/>
				<Inputs attributes={attributes} uniforms={lineUniforms} />
			</Section>

			<Section
				title='0.3: Rectangle'
				notes={`Adding, subtracting, multiplying and dividing operations work exactly like blending modes in CSS or Photoshop.  Here we're using multiply  to combine the dark edges around the rectangle.`}
			>
				<BaseCanvas
					fragmentShader={rectangleFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={rectUniforms}
					setAttributes={setAttributes}
				/>
				<ShaderText
					fragmentShader={rectangleFragmentShader}
					vertexShader={baseVertexShader}
				/>
				<Inputs attributes={attributes} uniforms={rectUniforms} />
			</Section>

			<Section
				title='0.4: Circle'
				notes={`Distance is a very useful hardware accelerated function that return the distance between two points.  The points can be represented as two floats or two n-dimensional vectors.`}
			>
				<BaseCanvas
					fragmentShader={circleFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={circleUniforms}
					setAttributes={setAttributes}
				/>
				<ShaderText
					fragmentShader={circleFragmentShader}
					vertexShader={baseVertexShader}
				/>
				<Inputs attributes={attributes} uniforms={circleUniforms} />
			</Section>

			<Section
				title='0.5: Triangle'
				notes={`Signed Distance Functions are tricky, but very powerful.  They define a field of values based on each point's distance from a given boundary, where the sign determined whether the point is within the boundary.  Here we have a function that determines if a pixel is inside a triangle.`}
			>
				<BaseCanvas
					fragmentShader={triangleFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={triangleUniforms}
					setAttributes={setAttributes}
				/>
				<ShaderText
					fragmentShader={triangleFragmentShader}
					vertexShader={baseVertexShader}
				/>
				<Inputs attributes={attributes} uniforms={triangleUniforms} />
			</Section>

			<Section title='0.6: Translation' notes={``}>
				<BaseCanvas
					fragmentShader={translationFragmentShader}
					vertexShader={baseVertexShader}
					uniforms={translationUniforms}
					setAttributes={setAttributes}
				/>
				<ShaderText
					fragmentShader={translationFragmentShader}
					vertexShader={baseVertexShader}
				/>
				<Inputs
					attributes={attributes}
					uniforms={translationUniforms}
				/>
			</Section>
		</div>
	);
};
