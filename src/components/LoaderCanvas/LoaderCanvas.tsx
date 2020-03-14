import * as React from 'react';
import {UniformSetting, Vector2, UNIFORM_TYPE, Matrix, Vector3, Mesh, FaceArray, MESH_TYPE, Buffers, Materials, Textures, OBJData, FBO} from '../../../types';
import {initializeGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import {useWindowSize} from '../../hooks/resize';
import {assignProjectionMatrix} from '../../../lib/gl/initialize';
import {createMat4, applyTransformation, invertMatrix, transposeMatrix} from '../../../lib/gl/matrix';
import {addVectors, formatAttributes} from '../../../lib/gl/helpers';
import {useOBJLoaderWebWorker} from '../../hooks/webWorker';
// import {legacyLoadTextures} from '../../../lib/gl/loader';

import styles from './LoaderCanvas.module.scss';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSetting[]>;
	setAttributes: (attributes: any[]) => void;
	pageMousePosRef?: React.MutableRefObject<Vector2>;
	OBJData: OBJData;
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
	supportsDepth: boolean;
	depthFBO: FBO;
	program: WebGLProgram;
	depthProgram: WebGLProgram;
	depthUniformLocations: Record<string, WebGLUniformLocation>;
}

const render = (props: RenderProps) => {
	if (!props.gl) return;
	const {gl, program, depthFBO, depthProgram, size, uniforms, rotation, time, uniformLocations} = props;

	const modelViewMatrix: Matrix = applyTransformation(createMat4(), {
		translation: uniforms.find(uniform => uniform.name === 'uTranslation').value,
		rotation: {
			x: Math.sin(time * 0.0005) * 0.25,
			y: rotation.y,
			z: rotation.z
		},
		// rotation: {x: 0, y: 0, z: 0},
		scale: uniforms.find(uniform => uniform.name === 'uScale').value
	});

	// const modelViewMatrix: Matrix = applyTransformation(createMat4(), {
	// 	translation: {x: 0, y: 0, z: 0},
	// 	rotation: {x: 0, y: 0, z: 0},
	// 	scale: uniforms.find(uniform => uniform.name === 'uScale').value
	// });

	// if (!props.supportsDepth) {
	gl.useProgram(program);
	draw(props, modelViewMatrix);
	return;
	// }

	// gl.activeTexture(gl.TEXTURE4);
	// gl.bindFramebuffer(gl.FRAMEBUFFER, depthFBO.buffer);
	// gl.viewport(0, 0, depthFBO.textureWidth, depthFBO.textureHeight);
	// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// gl.useProgram(depthProgram);
	// drawShadowMap(props, modelViewMatrix);

	// gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	// gl.viewport(0, 0, size.x, size.y);
	// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	// gl.useProgram(program);
	// gl.uniform1i(uniformLocations.uDepthMap, 4);
	// draw(props, modelViewMatrix);
};

const drawShadowMap = ({gl, depthProgram, depthUniformLocations, buffers}: RenderProps, modelViewMatrix: Matrix): void => {
	const numPosComponents: number = buffers.vertexBuffer.itemSize;
	const posType: number = gl.FLOAT;
	const normalizePos: boolean = false;
	const posStride: number = 0;
	const posOffset: number = 0;
	const depthVertexPosition = gl.getAttribLocation(depthProgram, 'aVertexPosition');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer.buffer);
	gl.vertexAttribPointer(depthVertexPosition, numPosComponents, posType, normalizePos, posStride, posOffset);
	gl.enableVertexAttribArray(depthVertexPosition);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer.buffer);

	gl.uniformMatrix4fv(depthUniformLocations.uModelViewMatrix, false, modelViewMatrix);
	const vertexCount: number = buffers.indexBuffer.numItems;
	const indexType: number = gl.UNSIGNED_SHORT;
	const indexOffset: number = 0;
	gl.drawElements(gl.TRIANGLES, vertexCount, indexType, indexOffset);
};

const draw = ({gl, uniformLocations, uniforms, buffers, time, mousePos, size, rotation, supportsDepth, depthFBO, depthProgram, program}: RenderProps, modelViewMatrix: Matrix): void => {
	const numPosComponents: number = buffers.vertexBuffer.itemSize;
	const posType: number = gl.FLOAT;
	const normalizePos: boolean = false;
	const posStride: number = 0;
	const posOffset: number = 0;
	const depthVertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer.buffer);
	gl.vertexAttribPointer(depthVertexPosition, numPosComponents, posType, normalizePos, posStride, posOffset);
	gl.enableVertexAttribArray(depthVertexPosition);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer.buffer);

	assignProjectionMatrix(gl, uniformLocations, size);

	gl.uniformMatrix4fv(uniformLocations.uModelViewMatrix, false, modelViewMatrix);
	let normalMatrix: Float32Array = invertMatrix(modelViewMatrix);
	normalMatrix = transposeMatrix(normalMatrix);
	gl.uniformMatrix4fv(uniformLocations.uNormalMatrix, false, normalMatrix);

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
};

const LoaderCanvas = ({fragmentShader, vertexShader, uniforms, setAttributes, pageMousePosRef, OBJData, rotationDelta}: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current[0].value.x * window.devicePixelRatio,
		y: uniforms.current[0].value.y * window.devicePixelRatio
	});
	const mouseDownRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: size.current.x * 0.5, y: size.current.y * -0.5});
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>> = React.useRef<Record<string, WebGLUniformLocation>>();
	const buffersRef: React.MutableRefObject<Buffers> = React.useRef<Buffers>({
		vertexBuffer: null,
		normalBuffer: null,
		indexBuffer: null,
		textureBuffer: null,
		textureAddressBuffer: null
	});
	const rotationRef: React.MutableRefObject<Vector3> = React.useRef<Vector3>({x: 0, y: 0, z: 0});
	const meshRef: React.MutableRefObject<Mesh> = React.useRef<Mesh>();
	// Depth shadow mapping
	const programRef: React.MutableRefObject<WebGLProgram> = React.useRef<WebGLProgram>();
	const depthProgramRef: React.MutableRefObject<WebGLProgram> = React.useRef<WebGLProgram>();
	const supportsDepthRef: React.MutableRefObject<boolean> = React.useRef<boolean>();
	const depthFBO: React.MutableRefObject<FBO> = React.useRef<FBO>();
	const depthUniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>> = React.useRef<Record<string, WebGLUniformLocation>>();

	useOBJLoaderWebWorker({
		onLoadHandler: message => {
			meshRef.current = message;
			initializeGL({
				gl,
				programRef,
				uniformLocations,
				depthUniformLocations,
				canvasRef,
				buffersRef: buffersRef,
				fragmentSource: fragmentShader,
				vertexSource: vertexShader,
				uniforms: uniforms.current,
				size,
				mesh: meshRef.current,
				meshType: MESH_TYPE.OBJ,
				shouldUseDepth: true,
				supportsDepthRef,
				depthProgramRef,
				depthFBO
			});
			setAttributes(formatAttributes(buffersRef));
		},
		OBJData
	});

	useWindowSize(canvasRef, gl, uniforms.current, size);

	useAnimationFrame(canvasRef, (time: number) => {
		rotationRef.current = addVectors(rotationRef.current, rotationDelta);
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			depthUniformLocations: depthUniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			size: size.current,
			rotation: rotationRef.current,
			buffers: buffersRef.current,
			supportsDepth: supportsDepthRef.current,
			depthFBO: depthFBO.current,
			program: programRef.current,
			depthProgram: depthProgramRef.current
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
