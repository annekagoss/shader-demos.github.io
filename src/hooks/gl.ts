import * as React from 'react';
import {FBO, UniformSetting, Vector3, Vector2, FaceArray, LoadedMesh, MESH_TYPE, Buffers} from '../../types';
import {initShaderProgram, initBaseMesh, initMeshFromFaceArray, initFrameBufferObject, initBuffers} from '../../lib/gl/initialize';
import {bindTexture} from '../../lib/gl/textureLoader';

interface InitializeProps {
	gl: React.MutableRefObject<WebGLRenderingContext>;
	uniformLocations: React.MutableRefObject<Record<string, WebGLUniformLocation>>;
	canvasRef: React.MutableRefObject<HTMLCanvasElement>;
	fragmentSource: string;
	vertexSource: string;
	uniforms: UniformSetting[];
	size: React.MutableRefObject<Vector2>;
	FBOA?: React.MutableRefObject<FBO>;
	FBOB?: React.MutableRefObject<FBO>;
	faceArray?: FaceArray;
	buffersRef?: React.MutableRefObject<Buffers>;
	mesh?: LoadedMesh;
	meshType: MESH_TYPE;
	textureSource?: string;
	textureRef?: React.MutableRefObject<HTMLImageElement>;
	textureSizeRef?: React.MutableRefObject<Vector2>;
}

export const initializeRenderer = ({uniformLocations, canvasRef, fragmentSource, vertexSource, uniforms, size, FBOA, FBOB, textureSource}: InitializeProps) => {
	const {width, height} = canvasRef.current.getBoundingClientRect();
	size.current = {
		x: width * window.devicePixelRatio,
		y: height * window.devicePixelRatio
	};
	canvasRef.current.width = size.current.x;
	canvasRef.current.height = size.current.y;

	const tempGl: WebGLRenderingContext = (canvasRef.current.getContext('experimental-webgl') as WebGLRenderingContext) || (canvasRef.current.getContext('webgl') as WebGLRenderingContext);

	tempGl.clearColor(0, 0, 0, 0);
	tempGl.clearDepth(1);
	tempGl.enable(tempGl.DEPTH_TEST);
	tempGl.depthFunc(tempGl.LEQUAL);
	tempGl.clear(tempGl.COLOR_BUFFER_BIT | tempGl.DEPTH_BUFFER_BIT);
	tempGl.viewport(0, 0, size.current.x, size.current.y);
	tempGl.enable(tempGl.SAMPLE_ALPHA_TO_COVERAGE);

	const tempProgram: WebGLProgram = initShaderProgram(tempGl, vertexSource, fragmentSource);
	tempGl.useProgram(tempProgram);

	const useFrameBuffer: boolean = Boolean(FBOA && FBOB);

	uniformLocations.current = {
		...mapUniformSettingsToLocations(uniforms, tempGl, tempProgram, useFrameBuffer),
		uProjectionMatrix: tempGl.getUniformLocation(tempProgram, 'uProjectionMatrix'),
		uModelViewMatrix: tempGl.getUniformLocation(tempProgram, 'uModelViewMatrix'),
		uNormalMatrix: tempGl.getUniformLocation(tempProgram, 'uNormalMatrix')
	};
	if (useFrameBuffer) {
		FBOA.current = initFrameBufferObject(tempGl, size.current.x, size.current.y);
		FBOB.current = initFrameBufferObject(tempGl, size.current.x, size.current.y);
	}

	let texture;
	let textureSize: Vector2 = {x: 0, y: 0};
	if (textureSource) {
		const image = new Image();
		image.crossOrigin = 'anonymous';
		image.onload = () => {
			const {texture: tempTexture, textureSize: tempSize} = bindTexture(tempGl, image);
			texture = tempTexture;
			console.log('LOAD', texture, tempSize);

			uniformLocations.current = {
				...uniformLocations.current,
				uBackground: tempGl.getUniformLocation(tempProgram, 'uBackground'),
				uBackgroundSize: tempGl.getUniformLocation(tempProgram, 'uBackgroundSize')
			};

			return {tempGl, tempProgram, texture, textureSize};
		};
		image.src = textureSource;
	}
	return {tempGl, tempProgram, texture, textureSize};
};

const initializeMesh = ({faceArray, buffersRef, meshType, mesh}: InitializeProps, tempGl: WebGLRenderingContext, tempProgram: WebGLProgram) => {
	switch (meshType) {
		case MESH_TYPE.BASE_TRIANGLES:
			initBaseMesh(tempGl, tempProgram);
			break;
		case MESH_TYPE.FACE_ARRAY:
			if (!faceArray) return;
			buffersRef.current = initMeshFromFaceArray(tempGl, tempProgram, faceArray, true);
			break;
		case MESH_TYPE.OBJ:
			// initializeMeshFromOBJ(tempGl, mesh, vertexPositionBuffer, vertexNormalBuffer, indexBuffer);
			buffersRef.current = initBuffers(tempGl, tempProgram, mesh, true);
			break;
		default:
			initBaseMesh(tempGl, tempProgram);
	}
};

export const initializeGL = (props: InitializeProps) => {
	if (props.canvasRef.current === undefined) return;
	const {tempGl, tempProgram, texture, textureSize} = initializeRenderer(props);
	initializeMesh(props, tempGl, tempProgram);
	props.gl.current = tempGl;
	console.log(texture);
	if (props.textureRef) {
		props.textureRef.current = texture;
	}
	if (props.textureSizeRef) {
		props.textureSizeRef.current = textureSize;
	}
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
