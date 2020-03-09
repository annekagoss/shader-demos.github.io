import {useEffect} from 'react';
import {UniformSetting, FBO, Vector2} from '../../types';
import {initFrameBufferObject} from '../../lib/gl/initialize';

export const useWindowSize = (
	canvas: React.MutableRefObject<HTMLCanvasElement>,
	gl: React.MutableRefObject<WebGLRenderingContext>,
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
	}, []);
};

const updateRendererSize = (
	canvas: React.MutableRefObject<HTMLCanvasElement>,
	gl: React.MutableRefObject<WebGLRenderingContext>,
	uniforms: UniformSetting[],
	size: React.MutableRefObject<Vector2>,
	FBOA?: React.MutableRefObject<FBO>,
	FBOB?: React.MutableRefObject<FBO>
) => {
	console.log('try to resize', {gl, canvas});
	if (!canvas.current) return;
	console.log('resize');
	const {width, height} = canvas.current.getBoundingClientRect();
	size.current = {
		x: width * window.devicePixelRatio,
		y: height * window.devicePixelRatio
	};
	canvas.current.width = size.current.x;
	canvas.current.height = size.current.y;
	uniforms[0].value = size.current;
	gl.current.viewport(0, 0, size.current.x, size.current.y);
};
