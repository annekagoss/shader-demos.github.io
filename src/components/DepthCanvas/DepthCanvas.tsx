import * as React from 'react';
import {UniformSetting, Vector2, UNIFORM_TYPE, Matrix, Vector3} from '../../../types';
import {useInitializeDepthGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import styles from './DepthCanvas.module.scss';
import {applyPerspective, applyRotation, createMat4, lookAt} from '../../../lib/gl/matrix';
import {degreesToRadians, addVectors} from '../../../lib/gl/helpers';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSetting[]>;
	setAttributes: (attributes: any[]) => void;
	pageMousePosRef?: React.MutableRefObject<Vector2>;
	vertexPositions: Vector3[];
	rotationDelta: Vector3;
}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSetting[];
	time: number;
	mousePos: Vector2;
	canvasSize: Vector2;
	numVertices: number;
	rotation: Vector3;
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

const render = ({gl, uniformLocations, uniforms, time, mousePos, canvasSize, numVertices, rotation}: RenderProps) => {
	assignProjectionMatrix(gl, uniformLocations, canvasSize);
	gl.uniformMatrix4fv(uniformLocations.uModelViewMatrix, false, applyRotation(createMat4().slice(), rotation));

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
	gl.drawArrays(gl.TRIANGLES, 0, numVertices);
};

const DepthCanvas = ({fragmentShader, vertexShader, uniforms, setAttributes, pageMousePosRef, vertexPositions, rotationDelta}: Props) => {
	const canvasSize: Vector2 = uniforms.current[0].value;
	const targetWidth: number = Math.round(canvasSize.x * window.devicePixelRatio);
	const targetHeight: number = Math.round(canvasSize.y * window.devicePixelRatio);
	const numVertices: number = vertexPositions.length;
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const mouseDownRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: targetWidth * 0.5, y: targetHeight * -0.5});
	const rotationRef: React.MutableRefObject<Vector3> = React.useRef<Vector3>({x: 0, y: 0, z: 0});

	const {gl, uniformLocations, vertexBuffer} = useInitializeDepthGL({
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		targetWidth,
		targetHeight,
		vertexPositionData: vertexPositions
	});

	React.useEffect(() => {
		setAttributes([{name: 'aVertexPosition', value: vertexBuffer.current.join(', ')}]);
	}, []);

	useAnimationFrame((time: number) => {
		rotationRef.current = addVectors(rotationRef.current, rotationDelta);
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			canvasSize,
			numVertices,
			rotation: rotationRef.current
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
