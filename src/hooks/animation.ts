import {useRef, useEffect} from 'react';

export const useAnimationFrame = callback => {
	const requestRef = useRef(0);
	const previousTimeRef = useRef(0);

	const animate = time => {
		if (previousTimeRef.current !== undefined) callback(time);
		previousTimeRef.current = time;
		requestRef.current = requestAnimationFrame(animate);
	};

	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(requestRef.current);
	}, []);
};
