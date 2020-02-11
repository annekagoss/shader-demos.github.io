import * as React from 'react';
import Section from '../../components/Section/Section';
import BaseCanvas from '../../components/BaseCanvas/BaseCanvas';
import ShaderText from '../../components/ShaderText/ShaderText';
import Inputs from '../../components/Inputs/Inputs';
import baseVertexShader from '../../../lib/gl/shaders/base.vert';
import {BASE_UNIFORMS} from '../../utils/general';
import {UNIFORM_TYPE, Vector2, UniformSetting} from '../../../types';

import styles from './DepthPage.module.scss';

interface Props {
	isActive: boolean;
}

const DepthPage = ({isActive}: Props) => {
	const pageMousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: 0.5, y: 0.5});
	const [attributes, setAttributes] = React.useState<any[]>([]);

	if (!isActive) return <></>;

	return (
		<div className={styles.page}>
			<Section title='2.0: Vertices' notes={``}>
				{/* <BaseCanvas fragmentShader={translationFragmentShader} vertexShader={baseVertexShader} uniforms={translationUniforms} setAttributes={setAttributes} pageMousePosRef={pageMousePosRef} />
				<ShaderText fragmentShader={translationFragmentShader} vertexShader={baseVertexShader} />
				<Inputs attributes={attributes} uniforms={translationUniforms} pageMousePosRef={pageMousePosRef} /> */}
			</Section>
		</div>
	);
};

export default DepthPage;
