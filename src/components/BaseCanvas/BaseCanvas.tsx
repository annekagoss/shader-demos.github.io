import * as React from 'react';
import {UniformSetting, Vector2, UNIFORM_TYPE} from '../../../types';
import {useInitializeGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import styles from './BaseCanvas.module.scss';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	setUniforms: (uniforms: any[]) => void;
	setAttributes: (attributes: any[]) => void;
}

const RESOLUTION: Vector2 = {x: 400, y: 400};

const UNIFORMS: UniformSetting[] = [
	{
		name: 'uResolution',
		type: UNIFORM_TYPE.VEC_2,
		value: RESOLUTION
	}
];

const render = (gl: WebGLRenderingContext, uniformLocations: Record<string, WebGLUniformLocation>, uResolution: Vector2) => {
	gl.uniform2fv(uniformLocations.uResolution, Object.values(uResolution));
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const BaseExample = ({fragmentShader, vertexShader, setUniforms, setAttributes}: Props) => {
	const canvasRef = React.useRef<HTMLCanvasElement>();
	const targetWidth = Math.round(400 * window.devicePixelRatio);
	const targetHeight = Math.round(400 * window.devicePixelRatio);

	const UNIFORMS: UniformSetting[] = [
		{
			name: 'uResolution',
			type: UNIFORM_TYPE.VEC_2,
			value: {x: targetWidth, y: targetHeight}
		}
	];

	const {gl, uniformLocations, vertexBuffer} = useInitializeGL({
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: UNIFORMS,
		targetWidth,
		targetHeight
	});

	console.log({targetWidth, targetHeight});

	React.useEffect(() => {
		setUniforms(UNIFORMS);
		setAttributes([{name: 'aVertexPosition', value: vertexBuffer.current.join(', ')}]);
	}, []);

	useAnimationFrame((time: number) => {
		// const {width height} = canvasRef.current.getBoundingClientRect();
		// const targetWidth: number = Math.round(width * window.devicePixelRatio);
		// const targetHeight: number = Math.round(
		// 	height * window.devicePixelRatio
		// );
		render(gl.current, uniformLocations.current, {x: targetWidth, y: targetHeight});
	});

	return <canvas ref={canvasRef} width={targetWidth} height={targetHeight} className={styles.canvas} />;
};

export default BaseExample;
