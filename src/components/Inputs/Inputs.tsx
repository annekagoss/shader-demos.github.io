import * as React from 'react';
import cx from 'classnames';
import { parseUniform } from '../../utils/general';
import styles from './Inputs.module.scss';

interface Props {
	attributes: any[];
	uniforms: any[];
}

const Inputs = ({ uniforms, attributes }: Props) => {
	const [uniformsVisible, setUniformsVisible] = React.useState<boolean>(true);
	const [attributesVisible, setAttributesVisible] = React.useState<boolean>(
		false
	);
	console.log(attributes);

	return (
		<div className={styles.root}>
			<div className={styles.tabs}>
				<button
					className={cx(styles.tab, uniformsVisible && styles.active)}
					onClick={() => {
						if (!uniformsVisible) {
							setUniformsVisible(true);
							setAttributesVisible(false);
						}
					}}
				>
					Uniforms
				</button>
				<button
					className={cx(
						styles.tab,
						attributesVisible && styles.active
					)}
					onClick={() => {
						if (!attributesVisible) {
							setAttributesVisible(true);
							setUniformsVisible(false);
						}
					}}
				>
					Attributes
				</button>
			</div>
			<div className={styles.textContainer}>
				<div
					className={cx(
						styles.textBlock,
						uniformsVisible && styles.active
					)}
				>
					{uniforms.map(uniform => (
						<div className={styles.textItem} key={uniform.name}>
							{uniform.type}
							<br />
							{uniform.name}:
							{parseUniform(uniform.value, uniform.type)}
						</div>
					))}
				</div>
				<div
					className={cx(
						styles.textBlock,
						attributesVisible && styles.active
					)}
				>
					{attributes.map(attribute => (
						<div className={styles.textItem} key={attribute.name}>
							{attribute.name}: [{attribute.value}]
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Inputs;
