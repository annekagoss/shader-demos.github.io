import * as React from 'react';
import {assignProjectionMatrix} from '../../../lib/gl/initialize';
import {assignUniforms} from '../../../lib/gl/render';
import {UniformSetting, Vector2, UNIFORM_TYPE, Matrix, Vector3, FaceArray, MESH_TYPE, Buffers} from '../../../types';
import {useInitializeGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import styles from './DepthCanvas.module.scss';
import {applyRotation, createMat4} from '../../../lib/gl/matrix';
import {addVectors} from '../../../lib/gl/helpers';
import {useWindowSize} from '../../hooks/resize';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSetting[]>;
	setAttributes: (attributes: any[]) => void;
	pageMousePosRef?: React.MutableRefObject<Vector2>;
	faceArray: FaceArray;
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
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);
	gl.drawArrays(gl.TRIANGLES, 0, numVertices);
};

const DepthCanvas = ({fragmentShader, vertexShader, uniforms, setAttributes, pageMousePosRef, faceArray, rotationDelta}: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current[0].value.x * window.devicePixelRatio,
		y: uniforms.current[0].value.y * window.devicePixelRatio
	});
	const mouseDownRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: size.current.x * 0.5, y: size.current.y * -0.5});
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();
	const numVertices: number = faceArray.flat().length;
	const buffersRef: React.MutableRefObject<Buffers> = React.useRef<Buffers>({
		vertexBuffer: null,
		normalBuffer: null,
		indexBuffer: null,
		textureBuffer: null,
		textureAddressBuffer: null
	});
	const rotationRef: React.MutableRefObject<Vector3> = React.useRef<Vector3>({x: 0, y: 0, z: 0});

	useInitializeGL({
		gl,
		uniformLocations,
		canvasRef,
		buffersRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		size,
		faceArray,
		meshType: MESH_TYPE.FACE_ARRAY
	});

	React.useEffect(() => {
		setAttributes([
			{name: 'aVertexPosition', value: buffersRef.current && buffersRef.current.vertexBuffer.data.join(', ')},
			{name: 'aVertexNormal', value: buffersRef.current && buffersRef.current.normalBuffer.data.join(', ')}
		]);
	}, []);

	useWindowSize(canvasRef, gl, uniforms.current, size);

	useAnimationFrame(canvasRef, (time: number) => {
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

export default DepthCanvas;
