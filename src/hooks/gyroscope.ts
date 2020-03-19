import {useEffect} from 'react';
import {GyroscopeData} from '../../types';

export const useGyroscope = (gyroscopeRef: React.MutableRefObject<GyroscopeData>) => {
	if (!Boolean('ondeviceorientation' in window)) return;
	gyroscopeRef.current.enabled = true;
	const handleOrientationChange = (e: DeviceOrientationEvent) => {
		gyroscopeRef.current.beta = e.beta;
		gyroscopeRef.current.gamma = e.gamma;
	};
	useEffect(() => {
		window.addEventListener('deviceorientation', handleOrientationChange);
		return () => {
			window.removeEventListener('deviceorientation', handleOrientationChange);
		};
	});
};
