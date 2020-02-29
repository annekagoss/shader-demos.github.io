import {useEffect} from 'react';
import loadOBJWorker from '../../lib/gl/loadOBJWorker';
import WebWorker from '../../lib/gl/WebWorker';
import {LoadedMesh, Textures, WebWorkerLoadMessage} from '../../types';

export const useOBJLoaderWebWorker = ({onLoadHandler, OBJSource, MTLSource, textures}: WebWorkerLoadMessage) => {
	useEffect(() => {
		const worker: Worker = new WebWorker(loadOBJWorker) as Worker;
		worker.addEventListener('message', (event: {data: LoadedMesh}) => onLoadHandler(event.data));
		worker.postMessage({
			OBJSource,
			MTLSource,
			textures
		});
	}, []);
};
