import * as React from 'react';
import {UniformSetting, Vector2, UNIFORM_TYPE, Matrix, Vector3} from '../../../types';
import {useInitializeDepthGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import {assignProjectionMatrix} from '../../../lib/gl/initialize';
import {applyRotation, createMat4} from '../../../lib/gl/matrix';
import {addVectors} from '../../../lib/gl/helpers';
import loadMeshWorker from '../../../lib/gl/loadMeshWorker';
import WebWorker from '../../../lib/gl/WebWorker';
import styles from './LoaderCanvas.module.scss';

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
	canvasSize: Vector2;
	numVertices: number;
	rotation: Vector3;
}

const render = ({gl, uniformLocations, uniforms, time, mousePos, canvasSize, numVertices, rotation}: RenderProps) => {
	assignProjectionMatrix(gl, uniformLocations, canvasSize);
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

const LoaderCanvas = ({fragmentShader, vertexShader, uniforms, setAttributes, pageMousePosRef, mesh, rotationDelta}: Props) => {
	const canvasSize: Vector2 = uniforms.current[0].value;
	const targetWidth: number = Math.round(canvasSize.x * window.devicePixelRatio);
	const targetHeight: number = Math.round(canvasSize.y * window.devicePixelRatio);
	const numVertices: number = mesh.flat().length;
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const mouseDownRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: targetWidth * 0.5, y: targetHeight * -0.5});
	const rotationRef: React.MutableRefObject<Vector3> = React.useRef<Vector3>({x: 0, y: 0, z: 0});

	const {gl, uniformLocations, vertexPositionBuffer, vertexNormalBuffer} = useInitializeDepthGL({
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		targetWidth,
		targetHeight,
		mesh
	});

	React.useEffect(() => {
		setAttributes([
			{name: 'aVertexPosition', value: vertexPositionBuffer.current.join(', ')},
			{name: 'aVertexNormal', value: vertexNormalBuffer.current.join(', ')}
		]);
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

export default LoaderCanvas;
