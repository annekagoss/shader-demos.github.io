import {useEffect} from 'react';
import loadOBJWorker from '../../lib/gl/loadOBJWorker';
import WebWorker from '../../lib/gl/WebWorker';
import {Mesh, Textures, WebWorkerLoadMessage} from '../../types';

export const useOBJLoaderWebWorker = ({onLoadHandler, OBJSource, MTLSource, textures}: WebWorkerLoadMessage) => {
	useEffect(() => {
		const worker: Worker = new WebWorker(loadOBJWorker) as Worker;
		worker.addEventListener('message', (event: {data: Mesh}) => onLoadHandler(event.data));
		worker.postMessage({
			OBJSource,
			MTLSource,
			diffuseSources: textures.diffuse
		});
	}, []);
};
