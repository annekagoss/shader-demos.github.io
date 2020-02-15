import * as React from 'react';
import {assignProjectionMatrix} from '../../../lib/gl/initialize';
import {UniformSetting, Vector2, UNIFORM_TYPE, Matrix, Vector3} from '../../../types';
import {useInitializeGL, useInitializeDepthGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import styles from './DepthCanvas.module.scss';
import {applyPerspective, applyRotation, createMat4, lookAt, invertMatrix, transposeMatrix} from '../../../lib/gl/matrix';
import {degreesToRadians, addVectors} from '../../../lib/gl/helpers';
import {useWindowSize} from '../../hooks/general';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSetting[]>;
	setAttributes: (attributes: any[]) => void;
	pageMousePosRef?: React.MutableRefObject<Vector2>;
	mesh: Vector3[][];
	rotationDelta: Vector3;
}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSetting[];
	time: number;
	mousePos: Vector2;
	size: Vector2;
	numVertices: number;
	rotation: Vector3;
}

const render = ({gl, uniformLocations, uniforms, time, mousePos, size, numVertices, rotation}: RenderProps) => {
	assignProjectionMatrix(gl, uniformLocations, size);
	const modelViewMatrix: Matrix = applyRotation(createMat4().slice(), rotation);
	gl.uniformMatrix4fv(uniformLocations.uModelViewMatrix, false, modelViewMatrix);

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

const DepthCanvas = ({fragmentShader, vertexShader, uniforms, setAttributes, pageMousePosRef, mesh, rotationDelta}: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current[0].value.x * window.devicePixelRatio,
		y: uniforms.current[0].value.y * window.devicePixelRatio
	});
	const mouseDownRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: size.current.x * 0.5, y: size.current.y * -0.5});
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();
	const numVertices: number = mesh.flat().length;
	const vertexPositionBuffer = React.useRef<any>([]);
	const vertexNormalBuffer = React.useRef<any>([]);
	const rotationRef: React.MutableRefObject<Vector3> = React.useRef<Vector3>({x: 0, y: 0, z: 0});

	useInitializeGL({
		gl,
		uniformLocations,
		canvasRef,
		vertexPositionBuffer,
		vertexNormalBuffer,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		size,
		mesh
	});

	React.useEffect(() => {
		setAttributes([
			{name: 'aVertexPosition', value: vertexPositionBuffer.current.join(', ')},
			{name: 'aVertexNormal', value: vertexNormalBuffer.current.join(', ')}
		]);
	}, []);

	useWindowSize(canvasRef.current, gl.current, uniforms.current, size);

	useAnimationFrame((time: number) => {
		rotationRef.current = addVectors(rotationRef.current, rotationDelta);
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			size: size.current,
			numVertices,
			rotation: rotationRef.current
		});
	});

	return (
		<canvas
			ref={canvasRef}
			width={size.x}
			height={size.y}
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
