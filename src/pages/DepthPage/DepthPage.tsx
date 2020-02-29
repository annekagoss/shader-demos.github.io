import * as React from 'react';
import Section from '../../components/Section/Section';
import BaseCanvas from '../../components/BaseCanvas/BaseCanvas';
import DepthCanvas from '../../components/DepthCanvas/DepthCanvas';
import LoaderCanvas from '../../components/LoaderCanvas/LoaderCanvas';
import ShaderText from '../../components/ShaderText/ShaderText';
import Inputs from '../../components/Inputs/Inputs';
import meshFragmentShader from '../../../lib/gl/shaders/mesh.frag';
import baseVertexShader from '../../../lib/gl/shaders/base.vert';
import meshVertexShader from '../../../lib/gl/shaders/mesh.vert';
import {BASE_UNIFORMS} from '../../utils/general';
import {UNIFORM_TYPE, Vector2, UniformSetting, Vector3} from '../../../types';

import styles from './DepthPage.module.scss';

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
	},
	{
		defaultValue: {x: 0.0, y: 0.0, z: 1.0},
		name: 'uLightColorA',
		readonly: false,
		type: UNIFORM_TYPE.VEC_3,
		value: {x: 0.0, y: 0.0, z: 1.0}
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

const DepthPage = ({isActive}: Props) => {
	const meshUniforms = React.useRef<UniformSetting[]>(BASE_MESH_UNIFORMS);
	const pageMousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: 0.5,
		y: 0.5
	});
	const [attributes, setAttributes] = React.useState<any[]>([]);

	if (!isActive) return <></>;

	return (
		<div className={styles.page}>
			<Section title='2.0: Mesh' notes={``}>
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
			</Section>
			<Section title='2.1: File Loader' notes={``}>
				<LoaderCanvas
					fragmentShader={meshFragmentShader}
					vertexShader={meshVertexShader}
					uniforms={meshUniforms}
					setAttributes={setAttributes}
					faceArray={CUBE_MESH}
					rotationDelta={CUBE_ROTATION_DELTA}
				/>
				<ShaderText fragmentShader={meshFragmentShader} vertexShader={meshVertexShader} />
				<Inputs attributes={attributes} uniforms={meshUniforms} pageMousePosRef={pageMousePosRef} />
			</Section>
		</div>
	);
};

export default DepthPage;
