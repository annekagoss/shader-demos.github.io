import * as React from 'react';
import {UniformSetting, Vector2, UNIFORM_TYPE, FBO, MESH_TYPE, Buffers} from '../../types';
import {useInitializeGL} from '../hooks/gl';
import {useAnimationFrame} from '../hooks/animation';
import {useWindowSize} from '../hooks/resize';
import {assignUniforms} from '../../lib/gl/initialize';
import {BASE_TRIANGLE_MESH} from '../../lib/gl/settings';

interface Props {
	fragmentShader: string;
	vertexShader: string;
	uniforms: React.MutableRefObject<UniformSetting[]>;
	setAttributes: (attributes: any[]) => void;
	textureSource?: string;
}

interface RenderProps {
	gl: WebGLRenderingContext;
	uniformLocations: Record<string, WebGLUniformLocation>;
	uniforms: UniformSetting[];
	time: number;
	mousePos: Vector2;
	texture?: HTMLImageElement;
}

const render = ({gl, uniformLocations, uniforms, time, mousePos, texture}: RenderProps) => {
	assignUniforms(uniforms, uniformLocations, gl, time, mousePos);

	gl.activeTexture(gl.TEXTURE0);

	if (texture) {
		// Bind the texture to texture unit 0
		gl.bindTexture(gl.TEXTURE_2D, texture);

		// Tell the shader we bound the texture to texture unit 0
		gl.uniform1i(uniformLocations.uBackground, 0);
	}

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const BaseCanvas = ({fragmentShader, vertexShader, uniforms, setAttributes, textureSource}: Props) => {
	const canvasRef: React.RefObject<HTMLCanvasElement> = React.useRef<HTMLCanvasElement>();
	const size: React.MutableRefObject<Vector2> = React.useRef<Vector2>({
		x: uniforms.current[0].value.x * window.devicePixelRatio,
		y: uniforms.current[0].value.y * window.devicePixelRatio
	});
	const mouseDownRef: React.MutableRefObject<boolean> = React.useRef<boolean>(false);
	const initialMouse = uniforms.current.find(uniform => uniform.name === 'uMouse');
	const initialMousePosition = initialMouse ? initialMouse.defaultValue : {x: 0.5, y: 0.5};
	const mousePosRef: React.MutableRefObject<Vector2> = React.useRef<Vector2>({x: size.current.x * initialMousePosition.x, y: size.current.y * -initialMousePosition.y});
	const gl = React.useRef<WebGLRenderingContext>();
	const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();

	useInitializeGL({
		gl,
		uniformLocations,
		canvasRef,
		fragmentSource: fragmentShader,
		vertexSource: vertexShader,
		uniforms: uniforms.current,
		size,
		meshType: MESH_TYPE.BASE_TRIANGLES
	});

	React.useEffect(() => {
		setAttributes([{name: 'aVertexPosition', value: BASE_TRIANGLE_MESH.join(', ')}]);
		uniforms.current[0].value = size.current;
		gl.current.viewport(0, 0, size.current.x, size.current.y);
	}, []);

	useWindowSize(canvasRef, gl, uniforms.current, size);

	useAnimationFrame(canvasRef, (time: number) => {
		render({
			gl: gl.current,
			uniformLocations: uniformLocations.current,
			uniforms: uniforms.current,
			time,
			mousePos: mousePosRef.current
		});
	});

	return (
		<canvas
			ref={canvasRef}
			width={size.current.x}
			height={size.current.y}
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
			}}
		/>
	);
};

export default BaseCanvas;
