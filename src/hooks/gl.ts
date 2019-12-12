import * as React from 'react';
import { UniformSetting, UNIFORM_TYPE } from '../../types';
import { initShaderProgram, initBaseMesh } from '../../lib/gl/initialize';
import { string } from 'prop-types';

interface InitializeProps {
	canvasRef: React.MutableRefObject<HTMLCanvasElement>;
	fragmentSource: string;
	vertexSource: string;
	uniforms: UniformSetting[];
}

const mapUniformSettingsToLocations = (
	settings: UniformSetting[],
	gl: WebGLRenderingContext,
	program: WebGLProgram
): Record<string, WebGLUniformLocation> => {
	if (!settings.length) return null;
	return settings.reduce((result, setting) => {
		result[setting.name] = gl.getUniformLocation(program, setting.name);
		return result;
	}, {});
};

export const useInitializeGL = ({
	canvasRef,
	fragmentSource,
	vertexSource,
	uniforms
}: InitializeProps) => {
	const gl = React.useRef<WebGLRenderingContext>();
	const program = React.useRef<WebGLProgram>();
	const attributeLocations = React.useRef<Record<string, number>>();
	const uniformLocations = React.useRef<
		Record<string, WebGLUniformLocation>
	>();
	const vertexBuffer = React.useRef<any>();

	React.useLayoutEffect(() => {
		if (canvasRef.current === undefined) return;
		const tempGl: WebGLRenderingContext =
			(canvasRef.current.getContext(
				'experimental-webgl'
			) as WebGLRenderingContext) ||
			(canvasRef.current.getContext('webgl') as WebGLRenderingContext);

		tempGl.clearColor(0, 0, 0, 0);
		tempGl.clearDepth(1);
		tempGl.enable(tempGl.DEPTH_TEST);
		tempGl.depthFunc(tempGl.LEQUAL);
		tempGl.clear(tempGl.COLOR_BUFFER_BIT | tempGl.DEPTH_BUFFER_BIT);
		tempGl.viewport(
			0,
			0,
			canvasRef.current.width,
			canvasRef.current.height
		);

		const tempProgram: WebGLProgram = initShaderProgram(
			tempGl,
			vertexSource,
			fragmentSource
		);

		tempGl.useProgram(tempProgram);
		const { bufferData, vertexPosition } = initBaseMesh(
			tempGl,
			tempProgram
		);
		attributeLocations.current = { vertexPosition };
		uniformLocations.current = mapUniformSettingsToLocations(
			uniforms,
			tempGl,
			tempProgram
		);
		gl.current = tempGl;
		program.current = tempProgram;
		vertexBuffer.current = bufferData;
	}, [canvasRef.current]);

	return {
		gl,
		program,
		attributeLocations,
		uniformLocations,
		vertexBuffer
	};
};
