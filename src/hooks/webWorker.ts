import loadOBJWorker from '../../lib/gl/loadOBJWorker';
import WebWorker from '../../lib/gl/WebWorker';
import {LoadedMesh, Textures, WebWorkerLoadMessage} from '../../types';

export const useOBJLoaderWebWorker = ({onLoadHandler, OBJSource, MTLSource, textures}: WebWorkerLoadMessage) => {
	const worker: Worker = new WebWorker(loadOBJWorker) as Worker;
	// debugger;
	worker.addEventListener('message', (event: {data: LoadedMesh}) => onLoadHandler(event.data));
	worker.postMessage({
		OBJSource,
		MTLSource,
		textures
	});
};
