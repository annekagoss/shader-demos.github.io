import * as React from 'react';
import {UniformSetting, Vector2, UNIFORM_TYPE, FBO} from '../../../types';
import {useInitializeGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import styles from './FeedbackCanvas.module.scss';
import {useWindowSize} from '../../hooks/general';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSetting[]>;
	setAttributes: (attributes: any[]) => void;
	pageMousePosRef?: React.MutableRefObject<Vector2>;
}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSetting[];
	time: number;
	mousePos: Vector2;
	FBOA: React.MutableRefObject<FBO>;
	FBOB: React.MutableRefObject<FBO>;
	pingPong: number;
	width: number;
	height: number;
}

const render = ({gl, uniformLocations, uniforms, time, mousePos, FBOA, FBOB, pingPong, width, height}: RenderProps) => {
	uniforms.forEach((uniform: UniformSetting) => {
		switch (uniform.type) {
			case UNIFORM_TYPE.FLOAT_1:
				if (uniform.name === 'uTime') {
					uniform.value = time;
				}
				gl.uniform1f(uniformLocations[uniform.name], uniform.value);
				break;
			case UNIFORM_TYPE.INT_1:
				gl.uniform1i(uniformLocations[uniform.name], uniform.value);
				break;
			case UNIFORM_TYPE.VEC_2:
				if (uniform.name === 'uMouse') {
					uniform.value = Object.values(mousePos);
				}
				gl.uniform2fv(uniformLocations[uniform.name], Object.values(uniform.value));
				break;
			case UNIFORM_TYPE.VEC_3:
				gl.uniform3fv(uniformLocations[uniform.name], Object.values(uniform.value));
				break;
			default:
				break;
		}
	});

	const buffer: WebGLFramebuffer = pingPong === 0 ? FBOA.current.buffer : FBOB.current.buffer;
	const targetTexture: WebGLTexture = pingPong === 0 ? FBOA.current.targetTexture : FBOB.current.targetTexture;

	// console.log(FBOA.current.buffer, FBOB.current.buffer);

	// gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	// gl.bindTexture(gl.TEXTURE_2D, null);

	// Draw to frame buffer
	gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	// Draw to canvas
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);

	gl.uniform1i(uniformLocations.frameBufferTexture0, 0);
	gl.activeTexture(gl.TEXTURE0 + 0);

	gl.bindTexture(gl.TEXTURE_2D, targetTexture);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const FeedbackCanvas = ({fragmentShader, vertexShader, uniforms, setAttributes, pageMousePosRef}: Props) => {
	const targetWidthRef: React.MutableRefObject<number> = React.useRef<number>(uniforms.current[0].value.x * window.devicePixelRatio);
	const targetHeightRef: React.MutableRefObject<number> = React.useRef<number>(uniforms.current[0].value.y * window.devicePixelRatio);
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const mouseDownRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: targetWidthRef.current * 0.5, y: targetHeightRef.current * -0.5});

	const {gl, program, uniformLocations, vertexBuffer, FBOA, FBOB} = useInitializeGL({
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		targetWidth: targetWidthRef.current,
		targetHeight: targetHeightRef.current,
		useFrameBuffer: true
	});
	console.log('render');

	React.useEffect(() => {
		setAttributes([{name: 'aVertexPosition', value: vertexBuffer.current.join(', ')}]);
	}, []);

	useWindowSize(canvasRef.current, gl.current, uniforms.current, targetWidthRef, targetHeightRef, FBOA, FBOB);

	useAnimationFrame((time: number, pingPong: number) => {
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			FBOA,
			FBOB,
			pingPong,
			width: targetWidthRef.current,
			height: targetHeightRef.current
		});
	});

	return (
		<canvas
			ref={canvasRef}
			width={targetWidthRef.current}
			height={targetHeightRef.current}
			className={styles.canvas}
			onMouseDown={() => {
				mouseDownRef.current = true;
			}}
			onMouseUp={() => {
				mouseDownRef.current = false;
			}}
			onMouseMove={e => {
				if (!mouseDownRef.current) return;
				const {left, top} = canvasRef.current.getBoundingClientRect();
				mousePosRef.current = {
					x: e.clientX - left,
					y: (e.clientY - top) * -1
				};
				if (pageMousePosRef) {
					pageMousePosRef.current = mousePosRef.current;
				}
			}}
		/>
	);
};

export default FeedbackCanvas;
