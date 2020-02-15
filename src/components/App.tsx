import * as React from 'react';
import cx from 'classnames';
import {useAnimationFrame} from '../hooks/animation';
import {SceneProps, UNIFORM_TYPE, UniformSetting} from '../../types';
import GLScene from './GLScene/GLScene';
import Section from './Section/Section';
import BaseCanvas from './BaseCanvas/BaseCanvas';
import ShaderText from './ShaderText/ShaderText';
import Inputs from './Inputs/Inputs';
import baseVertexShader from '../../lib/gl/shaders/base.vert';
import {BASE_UNIFORMS} from '../utils/general';
import ShapesPage from '../pages/ShapesPage/ShapesPage';
import MovementPage from '../pages/MovementPage/MovementPage';
import DepthPage from '../pages/DepthPage/DepthPage';
import styles from './app.module.scss';

//FOX SKULL
import OBJSource from '../../lib/gl/assets/fox/fox3.obj';
import MTLSource from '../../lib/gl/assets/fox/fox.mtl';
import diffuseSource0 from '../../lib/gl/assets/fox/fox_skull_0.jpg';
import diffuseSource1 from '../../lib/gl/assets/fox/fox_skull_1.jpg';

const GL_PROPS: SceneProps = {
	colors: {
		ambientLight: 'rgba(100, 100, 100, 1)',
		backgroundA: 'rgba(255, 0, 0, 1)',
		backgroundB: 'rgba(0, 0, 255, 1)',
		leftLight: 'rgba(150, 150, 150, 1)',
		rightLight: 'rgba(150, 150, 150, 1)'
	},
	OBJSource,
	MTLSource,
	diffuseSources: {
		'material_0.001': diffuseSource0,
		'material_1.001': diffuseSource1
	},
	positionOffset: {
		x: 0,
		y: 0.3,
		z: 0
	},
	rotationOffset: {
		x: 0.3,
		y: 1.9,
		z: 0
	},
	brightness: 0.8,
	shininess: 0,
	shadowStrength: 0.33,
	scale: 0.0485
};

const App = () => {
	const [activePageIndex, setActivePageIndex] = React.useState<number>(1);
	return (
		<div className={styles.app}>
			{/* <div className={styles.GLScene}>
				<div className={styles.section}>
					<GLScene {...GL_PROPS} />
				</div>
			</div> */}
			<div className={styles.navigation}>
				<div
					className={cx(styles.navItem, activePageIndex === 0 && styles.active)}
					onClick={() => {
						setActivePageIndex(0);
					}}>
					0. Form
				</div>
				<div
					className={cx(styles.navItem, activePageIndex === 1 && styles.active)}
					onClick={() => {
						setActivePageIndex(1);
					}}>
					1. Movement
				</div>
				<div
					className={cx(styles.navItem, activePageIndex === 2 && styles.active)}
					onClick={() => {
						setActivePageIndex(2);
					}}>
					2. Depth
				</div>
				<div
					className={cx(styles.navItem, activePageIndex === 3 && styles.active)}
					onClick={() => {
						setActivePageIndex(3);
					}}>
					3. Web Integration
				</div>
			</div>
			<div className={styles.PagesContainer}>
				<ShapesPage isActive={activePageIndex === 0} />
				<MovementPage isActive={activePageIndex === 1} />
				<DepthPage isActive={activePageIndex === 2} />
			</div>
		</div>
	);
};

export default App;
