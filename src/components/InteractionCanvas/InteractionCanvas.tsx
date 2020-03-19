import * as React from 'react';
import {UniformSetting, Vector2, Matrix, Vector3, Mesh, Buffers, MESH_TYPE, Buffer, OBJData, FBO, GyroscopeData} from '../../../types';
import {initializeGL} from '../../hooks/gl';
import {useAnimationFrame} from '../../hooks/animation';
import {useWindowSize} from '../../hooks/resize';
import {assignProjectionMatrix, assignUniforms} from '../../../lib/gl/initialize';
import {createMat4, applyTransformation, invertMatrix, transposeMatrix, lookAt, applyTranslation} from '../../../lib/gl/matrix';
import {degreesToRadians} from '../../../lib/gl/math';
import {useOBJLoaderWebWorker} from '../../hooks/webWorker';
import {formatAttributes} from '../../utils/general';
import styles from './InteractionCanvas.module.scss';
import {unprojectCoordinate, mapMouseToScreenSpace} from '../../../lib/gl/interaction';
import {useGyroscope} from '../../hooks/gyroscope';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSetting[]>;
	setAttributes: (attributes: any[]) => void;
	pageMousePosRef?: React.MutableRefObject<Vector2>;
	OBJData: OBJData;
}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSetting[];
	time: number;
	mousePos: Vector2;
	size: Vector2;
	buffers: Buffers;
	outlineProgram: WebGLProgram;
	program: WebGLProgram;
	outlineUniformLocations: Record<string, WebGLUniformLocation>;
	baseVertexBuffer: Buffer;
	FBOA: FBO;
	FBOB: FBO;
	pingPong: number;
	gyroscope: GyroscopeData;
}

const render = (props: RenderProps) => {
	if (!props.gl) return;
	const {gl, size, uniformLocations, outlineUniformLocations, program, outlineProgram, FBOA, FBOB} = props;

	gl.activeTexture(gl.TEXTURE4);
	gl.bindFramebuffer(gl.FRAMEBUFFER, FBOA.buffer);
	gl.viewport(0, 0, FBOA.textureWidth, FBOA.textureHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(program);
	gl.uniform1i(uniformLocations.uOutlinePass, 1);
	draw(props);

	gl.activeTexture(gl.TEXTURE5);
	gl.bindFramebuffer(gl.FRAMEBUFFER, FBOB.buffer);
	gl.uniform1i(uniformLocations.uOutlinePass, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	draw(props);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, size.x, size.y);
	gl.useProgram(outlineProgram);

	gl.activeTexture(gl.TEXTURE4);
	gl.bindTexture(gl.TEXTURE_2D, FBOA.targetTexture);
	gl.uniform1i(outlineUniformLocations.uOutline, 4);

	gl.activeTexture(gl.TEXTURE5);
	gl.bindTexture(gl.TEXTURE_2D, FBOB.targetTexture);
	gl.uniform1i(outlineUniformLocations.uSource, 5);

	gl.uniform2fv(outlineUniformLocations.uResolution, [size.x, size.y]);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	drawOutlines(props);
};

const drawOutlines = ({gl, outlineProgram, uniforms, outlineUniformLocations, baseVertexBuffer}: RenderProps) => {
	const vertexPosition = gl.getAttribLocation(outlineProgram, 'aBaseVertexPosition');
	gl.uniform2fv(outlineUniformLocations.uResolution, Object.values(uniforms[0].value));
	gl.enableVertexAttribArray(vertexPosition);
	gl.bindBuffer(gl.ARRAY_BUFFER, baseVertexBuffer.buffer);
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	gl.disableVertexAttribArray(vertexPosition);
};

const draw = ({gl, uniformLocations, uniforms, buffers, time, mousePos, size, program, gyroscope}: RenderProps): void => {
	const projectionMatrix: Matrix = assignProjectionMatrix(gl, uniformLocations, size);
	const screenSpaceTarget = mapMouseToScreenSpace(mousePos, size);
	const targetCoord: Vector3 = unprojectCoordinate(screenSpaceTarget, projectionMatrix);
	let modelViewMatrix: Matrix = lookAt(createMat4(), {
		target: targetCoord,
		origin: {x: 0, y: 0, z: 0},
		up: {x: 0, y: 1, z: 0}
	});
	const rotation = uniforms.find(uniform => uniform.name === 'uRotation').value;
	modelViewMatrix = applyTransformation(modelViewMatrix, {
		translation: uniforms.find(uniform => uniform.name === 'uTranslation').value,
		rotation: {x: degreesToRadians(rotation.x), y: degreesToRadians(rotation.y), z: degreesToRadians(rotation.z)},
		scale: uniforms.find(uniform => uniform.name === 'uScale').value
	});

	gl.uniformMatrix4fv(uniformLocations.uModelViewMatrix, false, modelViewMatrix);
	let normalMatrix: Float32Array = invertMatrix(modelViewMatrix);
	normalMatrix = transposeMatrix(normalMatrix);
	gl.uniformMatrix4fv(uniformLocations.uNormalMatrix, false, normalMatrix);
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);

	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.barycentricBuffer.buffer);
	const barycentricLocation = gl.getAttribLocation(program, 'aBarycentric');
	gl.vertexAttribPointer(barycentricLocation, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(barycentricLocation);

	const vertexCount: number = buffers.indexBuffer.numItems;
	const indexType: number = gl.UNSIGNED_SHORT;
	const indexOffset: number = 0;
	gl.drawElements(gl.TRIANGLES, vertexCount, indexType, indexOffset);
};

const InteractionCanvas = ({fragmentShader, vertexShader, uniforms, setAttributes, OBJData}: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: window.innerWidth * window.devicePixelRatio,
		y: window.innerHeight * window.devicePixelRatio
	});
	uniforms.current[0].value = size.current;
	const mouseDownRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: size.current.x * 0.5, y: size.current.y * -0.5});
	const gyroscopeRef: React.MutableRefObject<GyroscopeData> = React.useRef<GyroscopeData>({
		beta: 0,
		gamma: 0,
		enabled: false
	});
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>> = React.useRef<Record<string, WebGLUniformLocation>>();
	const meshRef: React.MutableRefObject<Mesh> = React.useRef<Mesh>();
	const buffersRef: React.MutableRefObject<Buffers> = React.useRef<Buffers>({
		vertexBuffer: null,
		normalBuffer: null,
		indexBuffer: null,
		textureBuffer: null,
		textureAddressBuffer: null,
		barycentricBuffer: null
	});
	// Toon outline pass
	const programRef: React.MutableRefObject<WebGLProgram> = React.useRef<WebGLProgram>();
	const outlineProgramRef: React.MutableRefObject<WebGLProgram> = React.useRef<WebGLProgram>();
	const outlineUniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>> = React.useRef<Record<string, WebGLUniformLocation>>();
	const baseVertexBufferRef: React.MutableRefObject<Buffer> = React.useRef<Buffer>();
	const FBOA: React.MutableRefObject<FBO> = React.useRef();
	const FBOB: React.MutableRefObject<FBO> = React.useRef();

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
				mesh: meshRef.current,
				meshType: MESH_TYPE.OBJ,
				outlineProgramRef,
				programRef,
				outlineUniformLocations,
				baseVertexBufferRef,
				FBOA,
				FBOB
			});
			setAttributes(formatAttributes(buffersRef));
		},
		OBJData
	});

	useWindowSize(canvasRef, gl, uniforms.current, size);
	useGyroscope(gyroscopeRef);

	useAnimationFrame(canvasRef, (time: number, pingPong: number) => {
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current,
			gyroscope: gyroscopeRef.current,
			size: size.current,
			buffers: buffersRef.current,
			outlineProgram: outlineProgramRef.current,
			program: programRef.current,
			outlineUniformLocations: outlineUniformLocations.current,
			baseVertexBuffer: baseVertexBufferRef.current,
			FBOA: FBOA.current,
			FBOB: FBOB.current,
			pingPong
		});
	});

	return (
		<canvas
			ref={canvasRef}
			width={size.current.x}
			height={size.current.y}
			className={styles.fullScreenCanvas}
			onMouseDown={() => {
				mouseDownRef.current = true;
			}}
			onMouseUp={() => {
				mouseDownRef.current = false;
			}}
			onMouseMove={e => {
				// if (!mouseDownRef.current) return;
				const {left, top} = canvasRef.current.getBoundingClientRect();
				mousePosRef.current = {
					x: e.clientX - left,
					y: (e.clientY - top) * -1
				};
			}}
		/>
	);
};

export default InteractionCanvas;
