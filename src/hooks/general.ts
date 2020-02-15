import {useEffect} from 'react';
import {UniformSetting, FBO} from '../../types';
import {initFrameBufferObject} from '../../lib/gl/initialize';

export const useWindowSize = (
	canvas: HTMLCanvasElement,
	gl: WebGLRenderingContext,
	uniforms: UniformSetting[],
	targetWidthRef: React.MutableRefObject<number>,
	targetHeightRef: React.MutableRefObject<number>,
	FBOA?: React.MutableRefObject<FBO>,
	FBOB?: React.MutableRefObject<FBO>
) => {
	const handleResize = () => updateRendererSize(canvas, gl, uniforms, targetWidthRef, targetHeightRef, FBOA, FBOB);
	useEffect(() => {
		handleResize();
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
	targetWidthRef: React.MutableRefObject<number>,
	targetHeightRef: React.MutableRefObject<number>,
	FBOA?: React.MutableRefObject<FBO>,
	FBOB?: React.MutableRefObject<FBO>
) => {
	if (!canvas) return;
	const {width, height} = canvas.getBoundingClientRect();
	targetWidthRef.current = width * window.devicePixelRatio;
	targetHeightRef.current = height * window.devicePixelRatio;
	canvas.width = targetWidthRef.current;
	canvas.height = targetHeightRef.current;
	uniforms[0].value = {x: targetWidthRef.current, y: targetHeightRef.current};
	gl.viewport(0, 0, targetWidthRef.current, targetHeightRef.current);
};
