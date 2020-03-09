import * as React from 'react';
import {UniformSetting, Vector2, UNIFORM_TYPE, FBO, MESH_TYPE} from '../../../types';
import {useInitializeGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import {assignUniforms} from '../../../lib/gl/render';
import styles from './FeedbackCanvas.module.scss';
import {useWindowSize} from '../../hooks/resize';
import {BASE_TRIANGLE_MESH} from '../../../lib/gl/initialize';

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
	size: Vector2;
}

const render = ({gl, uniformLocations, uniforms, time, mousePos, FBOA, FBOB, pingPong}: RenderProps) => {
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);

	const buffer: WebGLFramebuffer = pingPong === 0 ? FBOA.current.buffer : FBOB.current.buffer;
	const targetTexture: WebGLTexture = pingPong === 0 ? FBOA.current.targetTexture : FBOB.current.targetTexture;

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
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current[0].value.x * window.devicePixelRatio,
		y: uniforms.current[0].value.y * window.devicePixelRatio
	});
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();
	const mouseDownRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: size.current.x * 0.5, y: size.current.y * -0.5});
	const FBOA: React.MutableRefObject<FBO> = React.useRef();
	const FBOB: React.MutableRefObject<FBO> = React.useRef();

	useInitializeGL({
		gl,
		uniformLocations,
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		size,
		FBOA,
		FBOB,
		meshType: MESH_TYPE.BASE_TRIANGLES
	});

	React.useEffect(() => {
		setAttributes([{name: 'aVertexPosition', value: BASE_TRIANGLE_MESH.join(', ')}]);
	}, []);

	useWindowSize(canvasRef.current, gl.current, uniforms.current, size);

	useAnimationFrame(canvasRef, (time: number, pingPong: number) => {
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			FBOA,
			FBOB,
			pingPong,
			size: size.current
		});
	});

	return (
		<canvas
			ref={canvasRef}
			width={size.current.x}
			height={size.current.y}
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
