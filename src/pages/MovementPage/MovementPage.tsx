import * as React from 'react';
import Section from '../../components/Section/Section';
import BaseCanvas from '../../components/BaseCanvas/BaseCanvas';
import ShaderText from '../../components/ShaderText/ShaderText';
import Inputs from '../../components/Inputs/Inputs';
import baseVertexShader from '../../../lib/gl/shaders/base.vert';
import {BASE_UNIFORMS} from '../../utils/general';
import {UNIFORM_TYPE, UniformSetting} from '../../../types';
import translationFragmentShader from '../../../lib/gl/shaders/translate.frag';
import styles from './MovementPage.module.scss';

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

interface Props {
	isActive: boolean;
}

const MovementPage = ({isActive}: Props) => {
	const translationUniforms = React.useRef<UniformSetting[]>(BASE_TRANSLATION_UNIFORMS);
	const [attributes, setAttributes] = React.useState<any[]>([]);

	if (!isActive) return <></>;

	return (
		<div className={styles.page}>
			<Section title='1.0: Translation' notes={``}>
				<BaseCanvas fragmentShader={translationFragmentShader} vertexShader={baseVertexShader} uniforms={translationUniforms} setAttributes={setAttributes} />
				<ShaderText fragmentShader={translationFragmentShader} vertexShader={baseVertexShader} />
				<Inputs attributes={attributes} uniforms={translationUniforms} />
			</Section>
		</div>
	);
};

export default MovementPage;
