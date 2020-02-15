import * as React from 'react';
import {FBO, UniformSetting, Vector3, Vector2} from '../../types';
import {initShaderProgram, initBaseMesh, initMesh, initFrameBufferObject} from '../../lib/gl/initialize';

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
	mesh?: Vector3[][];
	vertexPositionBuffer: React.MutableRefObject<any>;
	vertexNormalBuffer?: React.MutableRefObject<any>;
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

export const useInitializeGL = ({gl, uniformLocations, canvasRef, fragmentSource, vertexSource, uniforms, size, FBOA, FBOB, mesh, vertexPositionBuffer, vertexNormalBuffer}: InitializeProps) => {
	React.useEffect(() => {
		if (canvasRef.current === undefined) return;
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
			uModelViewMatrix: tempGl.getUniformLocation(tempProgram, 'uModelViewMatrix')
		};
		if (useFrameBuffer) {
			FBOA.current = initFrameBufferObject(tempGl, size.current.x, size.current.y);
			FBOB.current = initFrameBufferObject(tempGl, size.current.x, size.current.y);
		}

		if (Boolean(mesh)) {
			const {positionBufferData, normalBufferData} = initMesh(tempGl, tempProgram, mesh, true);
			vertexPositionBuffer.current = positionBufferData;
			vertexNormalBuffer.current = normalBufferData;
		} else {
			const {bufferData, vertexPosition} = initBaseMesh(tempGl, tempProgram);
			vertexPositionBuffer.current = bufferData;
		}

		gl.current = tempGl;
	}, []);
};
