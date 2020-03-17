import {Buffer, Buffers, FBO, Mesh, Material, Matrix, Vector2, FaceArray, UniformSetting, MESH_TYPE, Materials, UNIFORM_TYPE} from '../../types';
import {degreesToRadians} from './math';
import {createMat4, applyPerspective, lookAt} from './matrix';
import {MAX_SUPPORTED_MATERIAL_TEXTURES, NEAR_CLIPPING, FAR_CLIPPING, FIELD_OF_VIEW} from './settings';
import outlineFragmentSource from '../../lib/gl/shaders/outline.frag';
import outlineVertexSource from '../../lib/gl/shaders/base.vert';
import {initBaseMeshBuffers, initMeshBuffersFromFaceArray, initBuffers} from './buffers';
import {initFrameBufferObject} from './frameBuffer';

export interface InitializeProps {
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
	baseVertexBufferRef?: React.MutableRefObject<Buffer>;
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
		uDisplacement: gl.getUniformLocation(program, 'uDisplacement'),
		uOutlinePass: gl.getUniformLocation(program, 'uOutlinePass'),
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

const initShaderProgram = (gl: WebGLRenderingContext, vertSource: string, fragSource: string): WebGLProgram => {
	const vertexShader: WebGLShader = loadShader(gl, gl.VERTEX_SHADER, vertSource);
	const fragmentShader: WebGLShader = loadShader(gl, gl.FRAGMENT_SHADER, fragSource);
	const program: WebGLProgram = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.warn('Unabled to initialize the shader program: ' + gl.getProgramInfoLog(program)); /* tslint:disable-line no-console */
	}
	return program;
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

export const initializeMesh = ({faceArray, buffersRef, meshType, mesh, baseVertexBufferRef}: InitializeProps, gl: WebGLRenderingContext, program: WebGLProgram, outlineProgram: WebGLProgram) => {
	switch (meshType) {
		case MESH_TYPE.BASE_TRIANGLES:
			initBaseMeshBuffers(gl, program);
			break;
		case MESH_TYPE.FACE_ARRAY:
			if (!faceArray) return;
			buffersRef.current = initMeshBuffersFromFaceArray(gl, program, faceArray, true);
			break;
		case MESH_TYPE.OBJ:
			if (outlineProgram) {
				gl.useProgram(outlineProgram);
				baseVertexBufferRef.current = initBaseMeshBuffers(gl, outlineProgram);
			}
			gl.useProgram(program);
			buffersRef.current = initBuffers(gl, program, mesh, true);
			break;
		default:
			initBaseMeshBuffers(gl, program);
	}
};

export const bindMaterials = (gl, uniformLocations, materials: Materials) => {
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

export const loadShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader => {
	const shader: WebGLShader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.warn('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader)); /* tslint:disable-line no-console */
		gl.deleteShader(shader);
		return;
	}
	return shader;
};

export const assignProjectionMatrix = (gl: WebGLRenderingContext, uniformLocations: Record<string, WebGLUniformLocation>, size: Vector2) => {
	if (!size) return;
	let projectionMatrix: Matrix = applyPerspective({
		sourceMatrix: createMat4(),
		fieldOfView: degreesToRadians(FIELD_OF_VIEW),
		aspect: size.x / size.y,
		near: NEAR_CLIPPING,
		far: FAR_CLIPPING
	});
	projectionMatrix = lookAt(projectionMatrix, {
		target: {x: 0, y: 0, z: 0},
		origin: {x: 0, y: 0, z: 6},
		up: {x: 0, y: 1, z: 0}
	});

	gl.uniformMatrix4fv(uniformLocations.uProjectionMatrix, false, projectionMatrix);
};

// Initialize texture to be displayed while webworker loads OBJ
export function initPlaceholderTexture(gl: WebGLRenderingContext): WebGLTexture {
	const texture: WebGLTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
	return texture;
}

export const assignUniforms = (uniforms: UniformSetting[], uniformLocations: Record<string, WebGLUniformLocation>, gl: WebGLRenderingContext, time: number, mousePos?: Vector2) => {
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
};
