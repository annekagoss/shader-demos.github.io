import { useEffect } from 'react';
import { Interaction, Vector2 } from '../../types';

export const useDrag = (interactionRef: React.MutableRefObject<Interaction>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
	useEffect(() => {
		console.log(Boolean('ontouchstart' in window), Boolean(canvasRef.current));
		if (!Boolean('ontouchstart' in window) || !Boolean(canvasRef.current)) return;
		const touchStartHandler = (e: TouchEvent) => handleTouchStart(e, interactionRef, canvasRef);
		const touchMoveHandler = throttle(100, (e: TouchEvent) => handleTouchMove(e, interactionRef, canvasRef));
		const touchEndHandler = (e: TouchEvent) => handleTouchEnd(e, interactionRef, canvasRef);
		window.addEventListener('touchstart', touchStartHandler);
		window.addEventListener('touchmove', touchMoveHandler);
		window.addEventListener('touchend', touchEndHandler);
		return () => {
			window.removeEventListener('touchstart', touchStartHandler);
			window.removeEventListener('touchmove', touchMoveHandler);
			window.removeEventListener('touchend', touchEndHandler);
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

const handleTouchStart = (e: TouchEvent, interactionRef: React.MutableRefObject<Interaction>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
	const { clientX: x, clientY: y } = e.touches[0];
	interactionRef.current.drag.position = normalizePosition(x, y, canvasRef);
};

const handleTouchMove = (e: TouchEvent, interactionRef: React.MutableRefObject<Interaction>, canvasRef: React.RefObject<HTMLCanvasElement>) => {
	const { clientX: x, clientY: y } = e.touches[0];
	interactionRef.current.drag.position = normalizePosition(x, y, canvasRef);
	console.log(interactionRef.current.drag.position);
};

const handleTouchEnd = (e: TouchEvent, interactionRef: React.MutableRefObject<Interaction>, canvasRef: React.RefObject<HTMLCanvasElement>) => {};

const normalizePosition = (x, y, canvasRef): Vector2 => {
	const { left, top, width, height } = canvasRef.current.getBoundingClientRect();
	return {
		x: (x - left) / width,
		y: (y - top) / height
	};
};
