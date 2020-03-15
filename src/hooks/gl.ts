import * as React from 'react';
import {FBO, UniformSetting, Vector3, Vector2, FaceArray, Mesh, MESH_TYPE, Buffers, Materials, Material, Matrix, Buffer} from '../../types';
import {initShaderProgram, initBaseMesh, initMeshFromFaceArray, initFrameBufferObject, initBuffers, initDepthBufferObject} from '../../lib/gl/initialize';
import {loadTextures} from '../../lib/gl/textureLoader';
import {supportsDepth, degreesToRadians} from '../../lib/gl/helpers';
import depthFragmentSource from '../../lib/gl/shaders/shadow.frag';
import depthVertexSource from '../../lib/gl/shaders/shadow.vert';
import outlineFragmentSource from '../../lib/gl/shaders/outline.frag';
import outlineVertexSource from '../../lib/gl/shaders/base.vert';
import {applyPerspective} from '../../lib/gl/matrix';
import {createMat4} from '../../lib/gl/matrix';
import {lookAt} from '../../lib/gl/matrix';

const MAX_SUPPORTED_MATERIAL_TEXTURES: number = 1;

interface InitializeProps {
	gl: React.MutableRefObject<WebGLRenderingContext>;
	programRef?: React.MutableRefObject<WebGLProgram>;
	uniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>>;
	outlineUniformLocations?: React.MutableRefObject<Record<string, WebGLUniformLocation>>;
	canvasRef: React.MutableRefObject<HTMLCanvasElement>;
	fragmentSource: string;
	vertexSource: string;
	uniforms: UniformSetting[];
	size: React.MutableRefObject<Vector2>;
	FBOA?: React.MutableRefObject<FBO>;
	FBOB?: React.MutableRefObject<FBO>;
	faceArray?: FaceArray;
	buffersRef?: React.MutableRefObject<Buffers>;
	mesh?: Mesh;
	meshType: MESH_TYPE;
	shouldUseDepth?: boolean;
	supportsDepthRef?: React.MutableRefObject<boolean>;
	outlineProgramRef?: React.MutableRefObject<WebGLProgram>;
	baseVertexBufferRef: React.MutableRefObject<Buffer>;
}

export const initializeRenderer = ({uniformLocations, canvasRef, fragmentSource, vertexSource, uniforms, size, FBOA, FBOB, outlineUniformLocations}: InitializeProps) => {
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
		uDiffuse1: gl.getUniformLocation(program, 'uDiffuse1')
	};

	if (usePingPongBuffers) {
		FBOA.current = initFrameBufferObject(gl, x, y);
		FBOB.current = initFrameBufferObject(gl, x, y);
	}
	let outlineProgram;
	if (outlineUniformLocations) {
		outlineProgram = initializeOutlineProgram(gl, outlineUniformLocations, x, y);
	}

	return {gl, program, outlineProgram};
};

const initializeOutlineProgram = (gl: WebGLRenderingContext, outlineUniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>>) => {
	const outlineProgram: WebGLProgram = initShaderProgram(gl, outlineVertexSource, outlineFragmentSource);
	outlineUniformLocations.current = {
		uSource: gl.getUniformLocation(outlineProgram, 'uSource'),
		uOutline: gl.getUniformLocation(outlineProgram, 'uOutline'),
		uResolution: gl.getUniformLocation(outlineProgram, 'uResolution')
	};
	return outlineProgram;
};

const initializeMesh = ({faceArray, buffersRef, meshType, mesh, baseVertexBufferRef}: InitializeProps, gl: WebGLRenderingContext, program: WebGLProgram, outlineProgram: WebGLProgram) => {
	switch (meshType) {
		case MESH_TYPE.BASE_TRIANGLES:
			initBaseMesh(gl, program);
			break;
		case MESH_TYPE.FACE_ARRAY:
			if (!faceArray) return;
			buffersRef.current = initMeshFromFaceArray(gl, program, faceArray, true);
			break;
		case MESH_TYPE.OBJ:
			if (outlineProgram) {
				gl.useProgram(outlineProgram);
				baseVertexBufferRef.current = initBaseMesh(gl, outlineProgram);
			}
			gl.useProgram(program);
			buffersRef.current = initBuffers(gl, program, mesh, true);
			break;
		default:
			initBaseMesh(gl, program);
	}
};

export const initializeGL = (props: InitializeProps) => {
	if (props.canvasRef.current === undefined) return;
	const {gl, program, outlineProgram} = initializeRenderer(props);

	const shouldLoadTextures: boolean = props.mesh && props.mesh.materials && props.mesh.materials !== {};

	if (!shouldLoadTextures) {
		initializeMesh(props, gl, program, outlineProgram);
		props.gl.current = gl;
		if (props.programRef) {
			props.programRef.current = program;
		}
		if (props.outlineProgramRef) {
			props.outlineProgramRef.current = outlineProgram;
		}
		return;
	}

	loadTextures(gl, props.mesh.materials).then((loadedMaterials: Materials): void => {
		props.mesh.materials = loadedMaterials;
		bindMaterials(gl, props.uniformLocations, props.mesh.materials);
		initializeMesh(props, gl, program, outlineProgram);
		props.gl.current = gl;
		if (props.programRef) {
			props.programRef.current = program;
		}
		if (props.outlineProgramRef) {
			props.outlineProgramRef.current = outlineProgram;
		}
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
