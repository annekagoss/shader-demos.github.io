import * as React from 'react';
import {UniformSetting, Vector2, UNIFORM_TYPE, FBO} from '../../../types';
import {useInitializeGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import styles from './FeedbackCanvas.module.scss';

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
	FBOA: FBO;
	FBOB: FBO;
	pingPong: number;
}

const render = ({gl, uniformLocations, uniforms, time, mousePos, FBOA, FBOB, pingPong}: RenderProps) => {
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

	const buffer: WebGLFramebuffer = pingPong === 0 ? FBOA.buffer : FBOB.buffer;
	const targetTexture: WebGLTexture = pingPong === 0 ? FBOA.targetTexture : FBOB.targetTexture;

	// Draw to frame buffer
	gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
	gl.viewport(0, 0, 400, 400);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	// Draw to canvas
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.uniform1i(uniformLocations.frameBufferTexture0, 0);
	gl.activeTexture(gl.TEXTURE0 + 0);
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const FeedbackCanvas = ({fragmentShader, vertexShader, uniforms, setAttributes, pageMousePosRef}: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: 0.5, y: 0.5});
	const targetWidth = Math.round(uniforms.current[0].value.x * window.devicePixelRatio);
	const targetHeight = Math.round(uniforms.current[0].value.y * window.devicePixelRatio);

	const {gl, uniformLocations, vertexBuffer, FBOA, FBOB} = useInitializeGL({
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		targetWidth,
		targetHeight,
		useFrameBuffer: true
	});

	React.useEffect(() => {
		setAttributes([{name: 'aVertexPosition', value: vertexBuffer.current.join(', ')}]);
	}, []);

	useAnimationFrame((time: number, pingPong: number) => {
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			FBOA: FBOA.current,
			FBOB: FBOB.current,
			pingPong
		});
	});

	return (
		<canvas
			ref={canvasRef}
			width={uniforms.current[0].value.x}
			height={uniforms.current[0].value.y}
			className={styles.canvas}
			onMouseMove={e => {
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
