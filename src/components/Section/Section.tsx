import * as React from 'react';
import cx from 'classnames';
import styles from './Section.module.scss';
import { UniformSetting } from '';
import ShaderText from '../ShaderText/ShaderText';
import Inputs from '../Inputs/Inputs';

interface Props {
	children: React.ReactNode;
	notes?: string;
	title: string;
	fullScreen?: boolean;
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSetting[]>;
	attributes: any;
}

const Section = ({ children, notes = ``, title, fullScreen, fragmentShader, vertexShader, uniforms, attributes }: Props) => (
	<div className={cx(styles.root, fullScreen && styles.fullScreen)}>
		<div className={styles.title}>{title}</div>
		<div className={styles.contentWrapper}>
			{children}
			<div className={styles.textWrapper}>
				<ShaderText fragmentShader={fragmentShader} vertexShader={vertexShader} />
				<Inputs uniforms={uniforms} attributes={attributes} />
			</div>
		</div>
		<div className={styles.notes}>{notes}</div>
	</div>
);

export default Section;
