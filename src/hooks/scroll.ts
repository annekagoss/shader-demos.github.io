import {useEffect} from 'react';

const usePauseWhileOffScreen = (canvasRef: React.MutableRefObject<HTMLCanvasElement>, idleRef: React.MutableRefObject<boolean>) => {
	useEffect(() => {
		window.addEventListener('scroll', () => handleScroll(canvasRef, idleRef));
		return () => {
			window.removeEventListener('scroll', () => handleScroll(canvasRef, idleRef));
		};
	});
};

const handleScroll = (canvasRef: React.MutableRefObject<HTMLCanvasElement>, idleRef: React.MutableRefObject<boolean>) => {
	if (!canvasRef.current) return;
	const {y, height} = canvasRef.current.getBoundingClientRect() as DOMRect;
	const inView: boolean = y > 0 || y + height > 0;
	if (!inView && !idleRef.current) {
		this.stop();
	} else if (inView && idleRef.current) {
		this.resetIdleTimer();
	}
};
