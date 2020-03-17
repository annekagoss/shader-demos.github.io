import * as React from 'react';
import {InitializeProps, initializeRenderer, initializeMesh, bindMaterials} from '../../lib/gl/initialize';
import {loadTextures} from '../../lib/gl/textureLoader';
import {Materials} from '../../types';

export const useInitializeGL = (props: InitializeProps) => {
	React.useEffect(() => {
		initializeGL(props);
	}, []);
};

export const initializeGL = (props: InitializeProps) => {
	if (props.canvasRef.current === undefined) return;
	const {gl, program, outlineProgram} = initializeRenderer(props);

	const shouldLoadTextures: boolean = props.mesh && props.mesh.materials && props.mesh.materials !== {};

	if (!shouldLoadTextures) {
		initializeMesh(props, gl, program, outlineProgram);
		props.gl.current = gl;
		if (props.programRef) {
			props.programRef.current = program;
		}
		if (props.outlineProgramRef) {
			props.outlineProgramRef.current = outlineProgram;
		}
		return;
	}

	loadTextures(gl, props.mesh.materials).then((loadedMaterials: Materials): void => {
		props.mesh.materials = loadedMaterials;
		bindMaterials(gl, props.uniformLocations, props.mesh.materials);
		initializeMesh(props, gl, program, outlineProgram);
		props.gl.current = gl;
		if (props.programRef) {
			props.programRef.current = program;
		}
		if (props.outlineProgramRef) {
			props.outlineProgramRef.current = outlineProgram;
		}
	});
};
