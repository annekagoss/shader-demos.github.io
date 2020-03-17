import * as React from 'react';
import Section from '../../components/Section/Section';
import BaseCanvas from '../../components/BaseCanvas/BaseCanvas';
import DepthCanvas from '../../components/DepthCanvas/DepthCanvas';
import LoaderCanvas from '../../components/LoaderCanvas/LoaderCanvas';
import ShaderText from '../../components/ShaderText/ShaderText';
import Inputs from '../../components/Inputs/Inputs';
import meshFragmentShader from '../../../lib/gl/shaders/mesh.frag';
import meshVertexShader from '../../../lib/gl/shaders/mesh.vert';
import phongFragmentShader from '../../../lib/gl/shaders/phong.frag';
import phongVertexShader from '../../../lib/gl/shaders/phong.vert';
import mandelbulbFragmentShader from '../../../lib/gl/shaders/mandelbulb.frag';
import baseVertexShader from '../../../lib/gl/shaders/base.vert';
import {BASE_UNIFORMS} from '../../utils/general';
import {UNIFORM_TYPE, Vector2, UniformSetting, Vector3} from '../../../types';
import desertBg from '../../assets/desert.jpg';

import styles from './DepthPage.module.scss';

//FOX SKULL
import foxOBJ from '../../../lib/gl/assets/fox/fox3.obj';
import foxMTL from '../../../lib/gl/assets/fox/fox.mtl';
import foxDiffuseSource0 from '../../../lib/gl/assets/fox/fox_skull_0.jpg';
import foxDiffuseSource1 from '../../../lib/gl/assets/fox/fox_skull_1.jpg';

interface Props {
	isActive: boolean;
}

const BASE_MESH_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0
	},
	{
		defaultValue: 0,
		name: 'uMaterialType',
		isBool: false,
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0
	},
	{
		defaultValue: {x: 1.0, y: 1.0, z: 1.0},
		name: 'uLightPositionA',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: {x: 1.0, y: 1.0, z: 1.0}
	},
	{
		defaultValue: {x: 0.0, y: 0.0, z: 1.0},
		name: 'uLightColorA',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: {x: 0.0, y: 0.0, z: 1.0}
	},
	{
		defaultValue: {x: 0.3, y: 0.0, z: 0.6},
		name: 'uLightColorB',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: {x: 0.3, y: 0.0, z: 0.6}
	},
	{
		defaultValue: {x: -1.0, y: -1.0, z: 1.0},
		name: 'uLightPositionB',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: {x: -1.0, y: -1.0, z: 1.0}
	}
];

const BASE_PHONG_UNIFORMS: UniformSetting[] = [
	...BASE_UNIFORMS,
	{
		defaultValue: 0,
		name: 'uMaterialType',
		isBool: false,
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0
	},
	{
		defaultValue: 0,
		name: 'uDisplacement',
		isBool: true,
		readonly: false,
		type: UNIFORM_TYPE.INT_1,
		value: 0
	},
	{
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0
	},
	{
		defaultValue: {x: 0, y: 0.3, z: 0},
		name: 'uTranslation',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: {x: 0, y: 0.3, z: 0}
	},
	{
		defaultValue: 0.0485,
		name: 'uScale',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.0485
	},
	{
		defaultValue: 0.6,
		name: 'uSpecular',
		readonly: false,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0.6
	},
	{
		defaultValue: {x: 0.75, y: 0.75, z: 0.75},
		name: 'uLightColorA',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: {x: 0.75, y: 0.75, z: 0.75}
	},
	{
		defaultValue: {x: 1.0, y: 1.0, z: 1.0},
		name: 'uLightPositionA',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: {x: 1.0, y: 1.0, z: 1.0}
	},
	{
		defaultValue: {x: 0.3, y: 0.3, z: 0.3},
		name: 'uLightColorB',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: {x: 0.3, y: 0.3, z: 0.3}
	},
	{
		defaultValue: {x: -1.0, y: -1.0, z: 1.0},
		name: 'uLightPositionB',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: {x: -1.0, y: -1.0, z: 1.0}
	}
];

const BASE_FRACTAL_UNIFORMS = [
	...BASE_UNIFORMS,
	{
		defaultValue: 0,
		name: 'uTime',
		readonly: true,
		type: UNIFORM_TYPE.FLOAT_1,
		value: 0
	},
	{
		defaultValue: {x: 0.6, y: 0.7},
		name: 'uMouse',
		readonly: true,
		type: UNIFORM_TYPE.VEC_2,
		value: {x: 0.6, y: 0.7}
	}
];

const CUBE_MESH: Vector3[][] = [
	// Side 1
	[
		{x: -1, y: -1, z: -1},
		{x: -1, y: -1, z: 1},
		{x: -1, y: 1, z: 1}
	],
	[
		{x: -1, y: -1, z: -1},
		{x: -1, y: 1, z: 1},
		{x: -1, y: 1, z: -1}
	],
	// Side 2
	[
		{x: 1, y: 1, z: -1},
		{x: -1, y: -1, z: -1},
		{x: -1, y: 1, z: -1}
	],
	[
		{x: 1, y: 1, z: -1},
		{x: 1, y: -1, z: -1},
		{x: -1, y: -1, z: -1}
	],
	// Side 3
	[
		{x: 1, y: -1, z: 1},
		{x: -1, y: -1, z: -1},
		{x: 1, y: -1, z: -1}
	],
	[
		{x: 1, y: -1, z: 1},
		{x: -1, y: -1, z: 1},
		{x: -1, y: -1, z: -1}
	],
	// Side 4
	[
		{x: 1, y: 1, z: 1},
		{x: 1, y: -1, z: -1},
		{x: 1, y: 1, z: -1}
	],
	[
		{x: 1, y: -1, z: -1},
		{x: 1, y: 1, z: 1},
		{x: 1, y: -1, z: 1}
	],
	// Side 5
	[
		{x: 1, y: 1, z: 1},
		{x: 1, y: 1, z: -1},
		{x: -1, y: 1, z: -1}
	],
	[
		{x: 1, y: 1, z: 1},
		{x: -1, y: 1, z: -1},
		{x: -1, y: 1, z: 1}
	],
	// Side 6
	[
		{x: -1, y: 1, z: 1},
		{x: -1, y: -1, z: 1},
		{x: 1, y: -1, z: 1}
	],
	[
		{x: 1, y: 1, z: 1},
		{x: -1, y: 1, z: 1},
		{x: 1, y: -1, z: 1}
	]
];

const CUBE_ROTATION_DELTA: Vector3 = {x: 0.0025, y: 0.01, z: 0};
const OBJ_ROTATION_DELTA: Vector3 = {x: 0, y: 0.01, z: 0};

const DepthPage = ({isActive}: Props) => {
	const meshUniforms = React.useRef<UniformSetting[]>(BASE_MESH_UNIFORMS);
	const phongUniforms = React.useRef<UniformSetting[]>(BASE_PHONG_UNIFORMS);
	const fractalUniforms = React.useRef<UniformSetting[]>(BASE_FRACTAL_UNIFORMS);
	const pageMousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: 0.5,
		y: 0.5
	});
	const [attributes, setAttributes] = React.useState<any[]>([]);

	if (!isActive) return <></>;

	const foxOBJData = {
		OBJSource: foxOBJ,
		MTLSource: foxMTL,
		textures: {
			diffuse: {
				'material_0.001': foxDiffuseSource0,
				'material_1.001': foxDiffuseSource1
			}
		}
	};

	return (
		<div className={styles.page}>
			{/* <Section title='2.0: Mesh' notes={``}>
				<DepthCanvas
					fragmentShader={meshFragmentShader}
					vertexShader={meshVertexShader}
					uniforms={meshUniforms}
					setAttributes={setAttributes}
					faceArray={CUBE_MESH}
					rotationDelta={CUBE_ROTATION_DELTA}
				/>
				<ShaderText fragmentShader={meshFragmentShader} vertexShader={meshVertexShader} />
				<Inputs attributes={attributes} uniforms={meshUniforms} pageMousePosRef={pageMousePosRef} />
			</Section> */}
			{/* <Section title='2.1: File Loader' notes={``}>
				<LoaderCanvas
					fragmentShader={phongFragmentShader}
					vertexShader={phongVertexShader}
					uniforms={phongUniforms}
					setAttributes={setAttributes}
					OBJData={foxOBJData}
					rotationDelta={OBJ_ROTATION_DELTA}
				/>
				<ShaderText fragmentShader={phongFragmentShader} vertexShader={phongVertexShader} />
				<Inputs attributes={attributes} uniforms={phongUniforms} pageMousePosRef={pageMousePosRef} />
			</Section> */}
			<Section title='2.2: Fractal' notes={``}>
				<BaseCanvas fragmentShader={mandelbulbFragmentShader} vertexShader={baseVertexShader} uniforms={fractalUniforms} setAttributes={setAttributes} textureSource={desertBg} />
				<ShaderText fragmentShader={mandelbulbFragmentShader} vertexShader={baseVertexShader} />
				<Inputs attributes={attributes} uniforms={fractalUniforms} pageMousePosRef={pageMousePosRef} />
			</Section>
		</div>
	);
};

export default DepthPage;
