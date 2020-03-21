import { Vector2 } from '../../types';
import { useEffect } from 'react';
import { throttle } from './helpers';

export const useMouse = (mousePosRef: React.MutableRefObject<Vector2>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
	useEffect(() => {
		const mouseMoveHandler = throttle(20, (e: MouseEvent) => handleMouseMove(e, mousePosRef, canvasRef));
		canvasRef.current.addEventListener('mousemove', mouseMoveHandler);
		return () => {
			canvasRef.current.removeEventListener('mousemove', mouseMoveHandler);
		};
	}, []);
};

const handleMouseMove = (e: MouseEvent, mousePosRef: React.MutableRefObject<Vector2>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
	const { left, top } = canvasRef.current.getBoundingClientRect();
	mousePosRef.current = {
		x: e.clientX - left,
		y: (e.clientY - top) * -1
	};
};
