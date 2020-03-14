import * as React from 'react';
import {FBO, UniformSetting, Vector3, Vector2, FaceArray, Mesh, MESH_TYPE, Buffers, Materials, Material, Matrix} from '../../types';
import {initShaderProgram, initBaseMesh, initMeshFromFaceArray, initFrameBufferObject, initBuffers, initDepthBufferObject} from '../../lib/gl/initialize';
import {loadTextures} from '../../lib/gl/textureLoader';
import {supportsDepth, degreesToRadians} from '../../lib/gl/helpers';
import depthFragmentSource from '../../lib/gl/shaders/shadow.frag';
import depthVertexSource from '../../lib/gl/shaders/shadow.vert';
import {applyPerspective} from '../../lib/gl/matrix';
import {createMat4} from '../../lib/gl/matrix';
import {lookAt} from '../../lib/gl/matrix';

const MAX_SUPPORTED_MATERIAL_TEXTURES: number = 1;

interface InitializeProps {
	gl: React.MutableRefObject<WebGLRenderingContext>;
	programRef?: React.MutableRefObject<WebGLProgram>;
	uniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>>;
	depthUniformLocations?: React.MutableRefObject<Record<string, WebGLUniformLocation>>;
	canvasRef: React.MutableRefObject<HTMLCanvasElement>;
	fragmentSource: string;
	vertexSource: string;
	uniforms: UniformSetting[];
	size: React.MutableRefObject<Vector2>;
	FBOA?: React.MutableRefObject<FBO>;
	FBOB?: React.MutableRefObject<FBO>;
	depthFBO?: React.MutableRefObject<FBO>;
	faceArray?: FaceArray;
	buffersRef?: React.MutableRefObject<Buffers>;
	mesh?: Mesh;
	meshType: MESH_TYPE;
	shouldUseDepth?: boolean;
	supportsDepthRef?: React.MutableRefObject<boolean>;
	depthProgramRef?: React.MutableRefObject<WebGLProgram>;
}

export const initializeRenderer = ({
	uniformLocations,
	depthUniformLocations,
	canvasRef,
	fragmentSource,
	vertexSource,
	uniforms,
	size,
	FBOA,
	FBOB,
	depthFBO,
	shouldUseDepth = false,
	supportsDepthRef
}: InitializeProps) => {
	const {width, height} = canvasRef.current.getBoundingClientRect();
	const x: number = width * window.devicePixelRatio;
	const y: number = height * window.devicePixelRatio;
	size.current = {x, y};
	canvasRef.current.width = x;
	canvasRef.current.height = y;

	const gl: WebGLRenderingContext = (canvasRef.current.getContext('experimental-webgl') as WebGLRenderingContext) || (canvasRef.current.getContext('webgl') as WebGLRenderingContext);

	gl.clearColor(0, 0, 0, 0);
	gl.clearDepth(1);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.viewport(0, 0, x, y);
	gl.enable(gl.SAMPLE_ALPHA_TO_COVERAGE); // Prevents culling for wireframes

	const program: WebGLProgram = initShaderProgram(gl, vertexSource, fragmentSource);
	gl.useProgram(program);

	const usePingPongBuffers: boolean = Boolean(FBOA && FBOB);

	uniformLocations.current = {
		...mapUniformSettingsToLocations(uniforms, gl, program, usePingPongBuffers),
		uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
		uModelViewMatrix: gl.getUniformLocation(program, 'uModelViewMatrix'),
		uNormalMatrix: gl.getUniformLocation(program, 'uNormalMatrix'),
		uDiffuse0: gl.getUniformLocation(program, 'uDiffuse0'),
		uDiffuse1: gl.getUniformLocation(program, 'uDiffuse1'),
		uDepthEnabled: gl.getUniformLocation(program, 'uDepthEnabled'),
		uDepthMap: gl.getUniformLocation(program, 'uDepthMap'),
		uLeftLightMatrix: gl.getUniformLocation(program, 'uLeftLightMatrix'),
		uPositionFromShadowLight: gl.getUniformLocation(program, 'uPositionFromShadowLight')
	};

	if (usePingPongBuffers) {
		FBOA.current = initFrameBufferObject(gl, x, y);
		FBOB.current = initFrameBufferObject(gl, x, y);
	}

	const shouldInitializeDepthMap: boolean = shouldUseDepth && supportsDepth(gl);
	let depthProgram;
	if (shouldInitializeDepthMap) {
		supportsDepthRef.current = true;
		depthProgram = initializeDepthMap(gl, depthFBO, uniformLocations, depthUniformLocations, x, y, program);
		gl.useProgram(program);
	}
	return {gl, program, depthProgram};
};

const initializeDepthMap = (
	gl: WebGLRenderingContext,
	FBO: React.MutableRefObject<FBO>,
	uniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>>,
	depthUniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>>,
	x: number,
	y: number,
	program: WebGLProgram
) => {
	const depthProgram: WebGLProgram = initShaderProgram(gl, depthVertexSource, depthFragmentSource);

	FBO.current = initDepthBufferObject(gl, x, y);
	depthUniformLocations.current = {
		uModelViewMatrix: gl.getUniformLocation(depthProgram, 'uModelViewMatrix'),
		uLeftLightMatrix: gl.getUniformLocation(depthProgram, 'uLeftLightMatrix')
	};
	const lightMatrix: Matrix = applyPerspective({
		sourceMatrix: createMat4(),
		fieldOfView: degreesToRadians(70),
		aspect: FBO.current.textureWidth / FBO.current.textureHeight,
		near: 0.01,
		far: 2000
	});
	const leftLightMatrix: Matrix = lookAt(lightMatrix, {
		target: {x: 0, y: 0.3, z: 0},
		origin: {x: 1, y: 1, z: 1},
		up: {x: 0, y: 1, z: 0}
	});
	gl.useProgram(program);
	gl.uniformMatrix4fv(uniformLocations.current.uLeftLightMatrix, false, leftLightMatrix);
	gl.useProgram(depthProgram);
	gl.uniformMatrix4fv(depthUniformLocations.current.uLeftLightMatrix, false, leftLightMatrix);
	return depthProgram;
};

const initializeMesh = ({faceArray, buffersRef, meshType, mesh}: InitializeProps, gl: WebGLRenderingContext, program: WebGLProgram, depthProgram: WebGLProgram) => {
	switch (meshType) {
		case MESH_TYPE.BASE_TRIANGLES:
			initBaseMesh(gl, program);
			break;
		case MESH_TYPE.FACE_ARRAY:
			if (!faceArray) return;
			buffersRef.current = initMeshFromFaceArray(gl, program, faceArray, true);
			break;
		case MESH_TYPE.OBJ:
			buffersRef.current = initBuffers(gl, program, mesh, true, depthProgram);
			break;
		default:
			initBaseMesh(gl, program);
	}
};

export const initializeGL = (props: InitializeProps) => {
	if (props.canvasRef.current === undefined) return;
	const {gl, program, depthProgram} = initializeRenderer(props);

	const shouldLoadTextures: boolean = props.mesh && props.mesh.materials && props.mesh.materials !== {};

	if (!shouldLoadTextures) {
		initializeMesh(props, gl, program, depthProgram);
		props.gl.current = gl;
		if (props.programRef) props.programRef.current = program;
		if (props.depthProgramRef) props.depthProgramRef.current = depthProgram;
		return;
	}

	loadTextures(gl, props.mesh.materials).then((loadedMaterials: Materials): void => {
		props.mesh.materials = loadedMaterials;
		bindMaterials(gl, props.uniformLocations, props.mesh.materials);
		initializeMesh(props, gl, program, depthProgram);
		props.gl.current = gl;
		if (props.programRef) props.programRef.current = program;
		if (props.depthProgramRef) props.depthProgramRef.current = depthProgram;
	});
};

const bindMaterials = (gl, uniformLocations, materials: Materials) => {
	Object.keys(materials).forEach((name, i) => {
		if (i <= MAX_SUPPORTED_MATERIAL_TEXTURES) {
			const mat: Material = materials[name];
			if (mat.textures && mat.textures.diffuseMap) {
				gl.activeTexture(gl[`TEXTURE${i}`] as number);
				gl.bindTexture(gl.TEXTURE_2D, mat.textures.diffuseMap.texture);
				gl.uniform1i(uniformLocations.current[`uDiffuse${i}`], i);
			}
		}
	});
};

export const useInitializeGL = (props: InitializeProps) => {
	React.useEffect(() => {
		initializeGL(props);
	}, []);
};

const mapUniformSettingsToLocations = (settings: UniformSetting[], gl: WebGLRenderingContext, program: WebGLProgram, useFrameBuffer: boolean): Record<string, WebGLUniformLocation> => {
	if (!settings.length) return null;
	const locations: Record<string, WebGLUniformLocation> = useFrameBuffer
		? {
				frameBufferTexture0: gl.getUniformLocation(program, 'frameBufferTexture0')
		  }
		: {};
	return settings.reduce((result, setting) => {
		result[setting.name] = gl.getUniformLocation(program, setting.name);
		return result;
	}, locations);
};
