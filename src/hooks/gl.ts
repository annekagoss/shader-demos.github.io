import * as React from 'react';
import {Buffer, Buffers, FBO, UniformSetting, UNIFORM_TYPE, Vector3} from '../../types';
import {initShaderProgram, initBaseMesh, initMesh} from '../../lib/gl/initialize';
import {string} from 'prop-types';

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

	React.useLayoutEffect(() => {
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
			FBOA.current = initSimpleFrameBufferObject(tempGl, targetWidth, targetHeight);
			FBOB.current = initSimpleFrameBufferObject(tempGl, targetWidth, targetHeight);
		}

		gl.current = tempGl;
		program.current = tempProgram;
		vertexBuffer.current = bufferData;
	}, [canvasRef.current]);

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
	const attributeLocations = React.useRef<Record<string, number>>();
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();
	const vertexPositionBuffer = React.useRef<any>();
	const vertexNormalBuffer = React.useRef<any>();
	const FBOA = React.useRef<FBO>();
	const FBOB = React.useRef<FBO>();

	React.useLayoutEffect(() => {
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
		const {positionBufferData, normalBufferData, vertexPosition} = initMesh(tempGl, tempProgram, mesh);
		attributeLocations.current = {vertexPosition};

		uniformLocations.current = {
			...mapUniformSettingsToLocations(uniforms, tempGl, tempProgram, useFrameBuffer),
			uProjectionMatrix: tempGl.getUniformLocation(tempProgram, 'uProjectionMatrix'),
			uModelViewMatrix: tempGl.getUniformLocation(tempProgram, 'uModelViewMatrix')
		};

		if (useFrameBuffer) {
			FBOA.current = initSimpleFrameBufferObject(tempGl, targetWidth, targetHeight);
			FBOB.current = initSimpleFrameBufferObject(tempGl, targetWidth, targetHeight);
		}

		gl.current = tempGl;
		program.current = tempProgram;
		vertexPositionBuffer.current = positionBufferData;
		vertexNormalBuffer.current = normalBufferData;
	}, [canvasRef.current]);

	return {
		gl,
		program,
		attributeLocations,
		uniformLocations,
		vertexPositionBuffer,
		vertexNormalBuffer,
		FBOA,
		FBOB
	};
};

const initSimpleFrameBufferObject = (gl: WebGLRenderingContext, textureWidth: number, textureHeight: number): FBO => {
	const level: number = 0;
	const internalFormat: number = gl.RGBA;
	const border: number = 0;
	const format: number = gl.RGBA;
	const type: number = gl.UNSIGNED_BYTE;
	const data: ArrayBufferView | null = null;

	const targetTexture: WebGLTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, textureWidth, textureHeight, border, format, type, data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	const frameBuffer: WebGLFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, level);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);

	if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
		console.error(new Error('Could not attach frame buffer'));
	}

	return {
		buffer: frameBuffer,
		targetTexture,
		textureWidth,
		textureHeight
	};
};
