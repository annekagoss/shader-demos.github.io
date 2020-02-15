import {useEffect} from 'react';
import {UniformSetting, FBO, Vector2} from '../../types';
import {initFrameBufferObject} from '../../lib/gl/initialize';

export const useWindowSize = (
	canvas: HTMLCanvasElement,
	gl: WebGLRenderingContext,
	uniforms: UniformSetting[],
	size: React.MutableRefObject<Vector2>,
	FBOA?: React.MutableRefObject<FBO>,
	FBOB?: React.MutableRefObject<FBO>
) => {
	const handleResize = () => updateRendererSize(canvas, gl, uniforms, size, FBOA, FBOB);
	useEffect(() => {
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
};

const updateRendererSize = (
	canvas: HTMLCanvasElement,
	gl: WebGLRenderingContext,
	uniforms: UniformSetting[],
	size: React.MutableRefObject<Vector2>,
	FBOA?: React.MutableRefObject<FBO>,
	FBOB?: React.MutableRefObject<FBO>
) => {
	if (!canvas) return;
	const {width, height} = canvas.getBoundingClientRect();
	size.current = {
		x: width * window.devicePixelRatio,
		y: height * window.devicePixelRatio
	};
	canvas.width = size.current.x;
	canvas.height = size.current.y;
	uniforms[0].value = size.current;
	gl.viewport(0, 0, size.current.x, size.current.y);
};
