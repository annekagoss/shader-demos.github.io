import {useRef, useEffect} from 'react';

export const useAnimationFrame = callback => {
	const requestRef = useRef(0);
	const previousTimeRef = useRef(0);
	const pingPong = useRef(0);

	const animate = time => {
		if (previousTimeRef.current !== undefined) callback(time, pingPong.current);
		previousTimeRef.current = time;
		pingPong.current = pingPong.current === 0 ? 1 : 0;
		requestRef.current = requestAnimationFrame(animate);
	};

	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(requestRef.current);
	}, []);
};
