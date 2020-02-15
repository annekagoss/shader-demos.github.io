import * as React from 'react';
import {FBO, UniformSetting, Vector3} from '../../types';
import {initShaderProgram, initBaseMesh, initMesh, initFrameBufferObject} from '../../lib/gl/initialize';

interface InitializeProps {
	canvasRef: React.MutableRefObject<HTMLCanvasElement>;
	fragmentSource: string;
	vertexSource: string;
	uniforms: UniformSetting[];
	targetWidth: number;
	targetHeight: number;
	useFrameBuffer?: boolean;
}

interface InitializeDepthProps extends InitializeProps {
	mesh: Vector3[][];
}

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

export const useInitializeGL = ({canvasRef, fragmentSource, vertexSource, uniforms, targetWidth, targetHeight, useFrameBuffer = false}: InitializeProps) => {
	const gl = React.useRef<WebGLRenderingContext>();
	const program = React.useRef<WebGLProgram>();
	const attributeLocations = React.useRef<Record<string, number>>();
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();
	const vertexBuffer = React.useRef<any>();
	const FBOA = React.useRef<FBO>();
	const FBOB = React.useRef<FBO>();

	React.useEffect(() => {
		if (canvasRef.current === undefined) return;
		const tempGl: WebGLRenderingContext = (canvasRef.current.getContext('experimental-webgl') as WebGLRenderingContext) || (canvasRef.current.getContext('webgl') as WebGLRenderingContext);

		tempGl.clearColor(0, 0, 0, 0);
		tempGl.clearDepth(1);
		tempGl.enable(tempGl.DEPTH_TEST);
		tempGl.depthFunc(tempGl.LEQUAL);
		tempGl.clear(tempGl.COLOR_BUFFER_BIT | tempGl.DEPTH_BUFFER_BIT);
		tempGl.viewport(0, 0, targetWidth, targetHeight);

		const tempProgram: WebGLProgram = initShaderProgram(tempGl, vertexSource, fragmentSource);
		tempGl.useProgram(tempProgram);
		const {bufferData, vertexPosition} = initBaseMesh(tempGl, tempProgram);
		attributeLocations.current = {vertexPosition};
		uniformLocations.current = mapUniformSettingsToLocations(uniforms, tempGl, tempProgram, useFrameBuffer);

		if (useFrameBuffer) {
			FBOA.current = initFrameBufferObject(tempGl, targetWidth, targetHeight);
			FBOB.current = initFrameBufferObject(tempGl, targetWidth, targetHeight);
		}

		gl.current = tempGl;
		program.current = tempProgram;
		vertexBuffer.current = bufferData;
	}, []);

	return {
		gl,
		program,
		attributeLocations,
		uniformLocations,
		vertexBuffer,
		FBOA,
		FBOB
	};
};

export const useInitializeDepthGL = ({canvasRef, fragmentSource, vertexSource, uniforms, targetWidth, targetHeight, mesh, useFrameBuffer = false}: InitializeDepthProps) => {
	const gl = React.useRef<WebGLRenderingContext>();
	const program = React.useRef<WebGLProgram>();
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();
	const vertexPositionBuffer = React.useRef<any>();
	const vertexNormalBuffer = React.useRef<any>();
	const FBOA = React.useRef<FBO>();
	const FBOB = React.useRef<FBO>();

	React.useEffect(() => {
		if (canvasRef.current === undefined) return;
		const tempGl: WebGLRenderingContext = (canvasRef.current.getContext('experimental-webgl') as WebGLRenderingContext) || (canvasRef.current.getContext('webgl') as WebGLRenderingContext);

		tempGl.clearColor(0, 0, 0, 0);
		tempGl.clearDepth(1);
		tempGl.enable(tempGl.DEPTH_TEST);
		tempGl.depthFunc(tempGl.LEQUAL);
		tempGl.clear(tempGl.COLOR_BUFFER_BIT | tempGl.DEPTH_BUFFER_BIT);
		tempGl.viewport(0, 0, targetWidth, targetHeight);
		tempGl.enable(tempGl.SAMPLE_ALPHA_TO_COVERAGE);

		const tempProgram: WebGLProgram = initShaderProgram(tempGl, vertexSource, fragmentSource);
		tempGl.useProgram(tempProgram);
		const {positionBufferData, normalBufferData} = initMesh(tempGl, tempProgram, mesh, true);

		uniformLocations.current = {
			...mapUniformSettingsToLocations(uniforms, tempGl, tempProgram, useFrameBuffer),
			uProjectionMatrix: tempGl.getUniformLocation(tempProgram, 'uProjectionMatrix'),
			uModelViewMatrix: tempGl.getUniformLocation(tempProgram, 'uModelViewMatrix')
		};

		if (useFrameBuffer) {
			FBOA.current = initFrameBufferObject(tempGl, targetWidth, targetHeight);
			FBOB.current = initFrameBufferObject(tempGl, targetWidth, targetHeight);
		}

		gl.current = tempGl;
		program.current = tempProgram;
		vertexPositionBuffer.current = positionBufferData;
		vertexNormalBuffer.current = normalBufferData;
	}, []);

	return {
		gl,
		program,
		uniformLocations,
		vertexPositionBuffer,
		vertexNormalBuffer,
		FBOA,
		FBOB
	};
};
