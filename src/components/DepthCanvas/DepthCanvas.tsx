import * as React from 'react';
import {UniformSetting, Vector2, UNIFORM_TYPE, Matrix, Vector3} from '../../../types';
import {useInitializeDepthGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import styles from './DepthCanvas.module.scss';
import {applyPerspective, createMat4, lookAt} from '../../../lib/gl/matrix';
import {degreesToRadians} from '../../../lib/gl/helpers';

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
	canvasSize: Vector2;
}

const assignProjectionMatrix = (gl: WebGLRenderingContext, uniformLocations: Record<string, WebGLUniformLocation>, canvasSize: Vector2) => {
	let projectionMatrix: Matrix = applyPerspective({
		sourceMatrix: createMat4(),
		fieldOfView: degreesToRadians(40),
		aspect: canvasSize.x / canvasSize.y,
		near: 0.01,
		far: 100
	});
	projectionMatrix = lookAt(projectionMatrix, {
		target: {x: 0, y: 0, z: 0},
		origin: {x: 0, y: 0, z: 6},
		up: {x: 0, y: 1, z: 0}
	});

	gl.uniformMatrix4fv(uniformLocations.uProjectionMatrix, false, projectionMatrix);
};

const render = ({gl, uniformLocations, uniforms, time, mousePos, canvasSize}: RenderProps) => {
	assignProjectionMatrix(gl, uniformLocations, canvasSize);
	gl.uniformMatrix4fv(uniformLocations.uModelViewMatrix, false, createMat4());

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
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, VERTEX_POSITIONS.length);
};

const VERTEX_POSITIONS: Vector3[] = [
	{x: -1, y: -1, z: 0},
	{x: 1, y: -1, z: 0},
	{x: -1, y: 1, z: 0},
	{x: 1, y: 1, z: 0},
	{x: -1, y: -1, z: -1},
	{x: 1, y: -1, z: -1},
	{x: -1, y: 1, z: -1},
	{x: 1, y: 1, z: -1}
];

const DepthCanvas = ({fragmentShader, vertexShader, uniforms, setAttributes, pageMousePosRef}: Props) => {
	const canvasSize: Vector2 = uniforms.current[0].value;
	const targetWidth = Math.round(canvasSize.x * window.devicePixelRatio);
	const targetHeight = Math.round(canvasSize.y * window.devicePixelRatio);
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const mouseDownRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: targetWidth * 0.5, y: targetHeight * -0.5});

	const {gl, uniformLocations, vertexBuffer} = useInitializeDepthGL({
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		targetWidth,
		targetHeight,
		vertexPositionData: VERTEX_POSITIONS
	});

	React.useEffect(() => {
		setAttributes([{name: 'aVertexPosition', value: vertexBuffer.current.join(', ')}]);
	}, []);

	useAnimationFrame((time: number) => {
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			canvasSize
		});
	});

	return (
		<canvas
			ref={canvasRef}
			width={canvasSize.x}
			height={canvasSize.y}
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

export default DepthCanvas;
