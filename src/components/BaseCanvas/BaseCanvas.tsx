import * as React from 'react';
import {UniformSetting, Vector2, UNIFORM_TYPE} from '../../../types';
import {useInitializeGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import styles from './BaseCanvas.module.scss';

interface Props {
	fragmentShader: string;
	// globalTime?: React.RefObject<number>;
	globalTime?: number;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSetting[]>;
	setAttributes: (attributes: any[]) => void;
}

const THRESHOLD: number = 0.5;

const render = (gl: WebGLRenderingContext, uniformLocations: Record<string, WebGLUniformLocation>, uniforms: UniformSetting[], time: number) => {
	// gl.uniform2fv(uniformLocations.uResolution, Object.values(uResolution));
	// gl.uniform1f(uniformLocations.uThreshold, THRESHOLD);

	// debugger;
	// console.log(uniforms[2] && uniforms[2].value);
	// console.log('render');
	uniforms.forEach((uniform: UniformSetting) => {
		switch (uniform.type) {
			case UNIFORM_TYPE.FLOAT_1:
				// console.log(uniform.name);
				if (uniform.name === 'uTime') {
					// console.log({time});
					uniform.value = time;
				}
				gl.uniform1f(uniformLocations[uniform.name], uniform.value);
				break;
			case UNIFORM_TYPE.INT_1:
				gl.uniform1i(uniformLocations[uniform.name], uniform.value);
				break;
			case UNIFORM_TYPE.VEC_2:
				gl.uniform2fv(uniformLocations[uniform.name], Object.values(uniform.value));
				break;
			case UNIFORM_TYPE.VEC_3:
				gl.uniform3fv(uniformLocations[uniform.name], Object.values(uniform.value));
				break;
			default:
				break;
		}
	});
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const BaseExample = ({fragmentShader, globalTime, vertexShader, uniforms, setAttributes}: Props) => {
	console.log('render');
	const canvasRef = React.useRef<HTMLCanvasElement>();
	const targetWidth = Math.round(uniforms.current[0].value.x * window.devicePixelRatio);
	const targetHeight = Math.round(uniforms.current[0].value.y * window.devicePixelRatio);

	const {gl, uniformLocations, vertexBuffer} = useInitializeGL({
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		targetWidth,
		targetHeight
	});

	React.useEffect(() => {
		setAttributes([{name: 'aVertexPosition', value: vertexBuffer.current.join(', ')}]);
	}, []);

	React.useCallback(() => {
		console.log('base canvas', globalTime);
	}, [globalTime]);

	// useAnimationFrame((time: number) => {
	// 	render(gl.current, uniformLocations.current, uniforms.current, time);
	// });

	return <canvas ref={canvasRef} width={targetWidth} height={targetHeight} className={styles.canvas} />;
};

export default BaseExample;
