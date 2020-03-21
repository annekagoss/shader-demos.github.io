import { Vector2 } from '../../types';
import { useEffect } from 'react';

export const useMouse = (mousePosRef: React.MutableRefObject<Vector2>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
	useEffect(() => {
		const mouseMoveHandler = throttle(20, (e: MouseEvent) => handleMouseMove(e, mousePosRef, canvasRef));
		canvasRef.current.addEventListener('mousemove', mouseMoveHandler);
		return () => {
			canvasRef.current.removeEventListener('mousemove', mouseMoveHandler);
		};
	}, []);
};

const throttle = (delay, fn) => {
	let lastCall = 0;
	return (...args) => {
		const now = new Date().getTime();
		if (now - lastCall < delay) {
			return;
		}
		lastCall = now;
		return fn(...args);
	};
};

const handleMouseMove = (e: MouseEvent, mousePosRef: React.MutableRefObject<Vector2>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
	const { left, top } = canvasRef.current.getBoundingClientRect();
	mousePosRef.current = {
		x: e.clientX - left,
		y: (e.clientY - top) * -1
	};
};
