import * as React from 'react';
import {UniformSetting, Vector2, UNIFORM_TYPE, Matrix, Vector3, LoadedMesh, FaceArray, MESH_TYPE, Buffers} from '../../../types';
import {useInitializeGL, initializeGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import {useWindowSize} from '../../hooks/resize';
import {assignProjectionMatrix} from '../../../lib/gl/initialize';
import {applyRotation, createMat4, applyTransformation, invertMatrix} from '../../../lib/gl/matrix';
import {addVectors} from '../../../lib/gl/helpers';
import loadMeshWorker from '../../../lib/gl/loadMeshWorker';
import WebWorker from '../../../lib/gl/WebWorker';
import {useOBJLoaderWebWorker} from '../../hooks/webWorker';
import styles from './LoaderCanvas.module.scss';

//FOX SKULL
import OBJSource from '../../../lib/gl/assets/fox/fox3.obj';
import MTLSource from '../../../lib/gl/assets/fox/fox.mtl';
import diffuseSource0 from '../../../lib/gl/assets/fox/fox_skull_0.jpg';
import diffuseSource1 from '../../../lib/gl/assets/fox/fox_skull_1.jpg';

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
	rotation: Vector3;
	buffers: Buffers;
}

const render = ({gl, uniformLocations, uniforms, buffers, time, mousePos, size, rotation}: RenderProps) => {
	if (!gl) return;
	assignProjectionMatrix(gl, uniformLocations, size);

	// const modelViewMatrix: Matrix = applyRotation(createMat4().slice(), rotation);
	const modelViewMatrix: Matrix = applyTransformation(createMat4(), {
		translation: {x: 0, y: 0.3, z: 0},
		rotation: {x: 0, y: 0, z: 0},
		scale: 0.0485
	});
	gl.uniformMatrix4fv(uniformLocations.uModelViewMatrix, false, modelViewMatrix);
	gl.uniformMatrix4fv(uniformLocations.uNormalMatrix, false, invertMatrix(modelViewMatrix));

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
	if (!buffers.indexBuffer) return;

	const vertexCount: number = buffers.indexBuffer.numItems;
	const indexType: number = gl.UNSIGNED_SHORT;
	const indexOffset: number = 0;
	gl.drawElements(gl.TRIANGLES, vertexCount, indexType, indexOffset);
	// gl.drawArrays(gl.TRIANGLES, 0, numVertices);
};

const LoaderCanvas = ({fragmentShader, vertexShader, uniforms, setAttributes, pageMousePosRef, faceArray, rotationDelta}: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current[0].value.x * window.devicePixelRatio,
		y: uniforms.current[0].value.y * window.devicePixelRatio
	});
	const mouseDownRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: size.current.x * 0.5, y: size.current.y * -0.5});
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>> = React.useRef<Record<string, WebGLUniformLocation>>();
	const attributeLocationsRef: React.MutableRefObject<Record<string, number>> = React.useRef<Record<string, number>>({});
	const buffersRef: React.MutableRefObject<Buffers> = React.useRef<Buffers>({
		vertexBuffer: null,
		normalBuffer: null,
		indexBuffer: null,
		textureBuffer: null,
		textureAddressBuffer: null
	});
	const rotationRef: React.MutableRefObject<Vector3> = React.useRef<Vector3>({x: 0, y: 0, z: 0});
	const meshRef: React.MutableRefObject<LoadedMesh> = React.useRef<LoadedMesh>();

	useOBJLoaderWebWorker({
		onLoadHandler: message => {
			meshRef.current = message;
			initializeGL({
				gl,
				uniformLocations,
				canvasRef,
				buffersRef: buffersRef,
				fragmentSource: fragmentShader,
				vertexSource: vertexShader,
				uniforms: uniforms.current,
				size,
				faceArray,
				mesh: meshRef.current,
				meshType: MESH_TYPE.OBJ
			});
			setAttributes([
				// TODO: handle giant attribute arrays
				// {name: 'aVertexPosition', value: buffersRef.current.vertexBuffer && buffersRef.current.vertexBuffer.data && buffersRef.current.vertexBuffer.data.join(', ')},
				// {name: 'aVertexNormal', value: buffersRef.current.normalBuffer && buffersRef.current.normalBuffer.data && buffersRef.current.vertexBuffer.data.join(', ')}
			]);
		},
		OBJSource,
		MTLSource,
		textures: {
			diffuse: {
				'material_0.001': diffuseSource0,
				'material_1.001': diffuseSource1
			}
		}
	});

	// useInitializeGL({
	// 	gl,
	// 	uniformLocations,
	// 	canvasRef,
	// 	vertexPositionBuffer,
	// 	vertexNormalBuffer,
	// 	fragmentSource: fragmentShader,
	// 	vertexSource: vertexShader,
	// 	uniforms: uniforms.current,
	// 	size,
	// 	mesh: meshRef.current,
	// });

	// React.useEffect(() => {
	// 	setAttributes([
	// 		{name: 'aVertexPosition', value: buffersRef.current && buffersRef.current.vertexBuffer.data.join(', ')},
	// 		{name: 'aVertexNormal', value: buffersRef.current && buffersRef.current.normalBuffer.data.join(', ')}
	// 	]);
	// }, []);

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
			rotation: rotationRef.current,
			buffers: buffersRef.current
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

export default LoaderCanvas;
