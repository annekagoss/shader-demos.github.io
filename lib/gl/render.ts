import {createMat4, applyTransformation, invertMatrix, transposeMatrix} from './matrix';

import {AttributeLocations, DrawOptions, GLContext, RenderOptions, Transformation} from '../../types';

export const render = (options: RenderOptions): void => {
	const {frameId} = options;
	const {gl, $canvas, programInfo, shadowProgramInfo, fbo, supportsDepth} = options.glContext;
	let aspect: number;

	if (!supportsDepth) {
		gl.useProgram(programInfo.program);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		draw({...options, aspect, shadowPass: false, frameId});
		return;
	}

	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.buffer);
	gl.viewport(0, 0, fbo.textureWidth, fbo.textureHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	aspect = fbo.textureWidth / fbo.textureHeight;

	gl.useProgram(shadowProgramInfo.program);
	draw({...options, aspect, shadowPass: true, frameId});

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.viewport(0, 0, $canvas.width, $canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

	gl.useProgram(programInfo.program);
	gl.uniform1i(programInfo.uniformLocations.uDepthMap, 4);
	draw({...options, aspect, shadowPass: false, frameId});
};

const draw = (options: DrawOptions): void => {
	const {glContext, transformation, aspect, shadowPass, frameId} = options;
	const {gl, programInfo, shadowProgramInfo, buffers} = glContext;

	const {modelViewMatrix, normalMatrix} = calculateMatrices(aspect, transformation);

	if (shadowPass) {
		bindShadowBuffers(glContext);
		gl.uniformMatrix4fv(shadowProgramInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
	} else {
		bindBuffers(glContext);
		gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
		gl.uniformMatrix4fv(programInfo.uniformLocations.normalMatrix, false, normalMatrix);
		gl.uniform1f(programInfo.uniformLocations.uTime, frameId);
	}

	const vertexCount: number = buffers.indexBuffer.numItems;
	const indexType: number = gl.UNSIGNED_SHORT;
	const indexOffset: number = 0;
	gl.drawElements(gl.TRIANGLES, vertexCount, indexType, indexOffset);
};

const calculateMatrices = (aspect: number, transformation: Transformation): {modelViewMatrix: Float32Array; normalMatrix: Float32Array} => {
	const modelViewMatrix: Float32Array = applyTransformation(createMat4(), transformation);
	let normalMatrix: Float32Array = invertMatrix(modelViewMatrix);
	normalMatrix = transposeMatrix(normalMatrix);
	return {
		modelViewMatrix,
		normalMatrix
	};
};

const bindShadowBuffers = (glContext: GLContext): void => {
	const {gl, shadowProgramInfo, buffers} = glContext;
	const {vertexBuffer, indexBuffer} = buffers;

	const numPosComponents: number = vertexBuffer.itemSize;
	const posType: number = gl.FLOAT;
	const normalizePos: boolean = false;
	const posStride: number = 0;
	const posOffset: number = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.buffer);
	gl.vertexAttribPointer(shadowProgramInfo.attribLocations.vertexPosition, numPosComponents, posType, normalizePos, posStride, posOffset);
	gl.enableVertexAttribArray(shadowProgramInfo.attribLocations.vertexPosition);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
};

const bindBuffers = (glContext: GLContext): void => {
	const {gl, programInfo, buffers, mesh} = glContext;
	const {vertexBuffer, textureBuffer, normalBuffer, textureAddressBuffer, indexBuffer} = buffers;
	const attributeLocations = programInfo.attribLocations as AttributeLocations;

	const numPosComponents: number = vertexBuffer.itemSize;
	const posType: number = gl.FLOAT;
	const normalizePos: boolean = false;
	const posStride: number = 0;
	const posOffset: number = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer.buffer);
	gl.vertexAttribPointer(attributeLocations.vertexPosition, numPosComponents, posType, normalizePos, posStride, posOffset);
	gl.enableVertexAttribArray(attributeLocations.vertexPosition);

	if (mesh.materials) {
		const numTexComponents: number = textureBuffer.itemSize;
		const texType: number = gl.FLOAT;
		const normalizeTex: boolean = false;
		const texStride: number = 0;
		const texOffset: number = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer.buffer);
		gl.vertexAttribPointer(attributeLocations.textureCoord, numTexComponents, texType, normalizeTex, texStride, texOffset);
		gl.enableVertexAttribArray(attributeLocations.textureCoord);
	}

	if (normalBuffer.numItems > 0) {
		const numNormalComponents: number = normalBuffer.itemSize;
		const normalType: number = gl.FLOAT;
		const normalizeNormal: boolean = false;
		const normalStride: number = 0;
		const normalOffset: number = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer.buffer);
		gl.vertexAttribPointer(attributeLocations.normal, numNormalComponents, normalType, normalizeNormal, normalStride, normalOffset);
		gl.enableVertexAttribArray(attributeLocations.normal);
	}

	if (textureAddressBuffer.numItems > 0) {
		const numTexAddComponents: number = textureAddressBuffer.itemSize;
		const texAddType: number = gl.FLOAT;
		const normalizeTexAdd: boolean = false;
		const texAddStride: number = 0;
		const texAddOffset: number = 0;
		gl.bindBuffer(gl.ARRAY_BUFFER, textureAddressBuffer.buffer);
		gl.vertexAttribPointer(attributeLocations.textureAddress, numTexAddComponents, texAddType, normalizeTexAdd, texAddStride, texAddOffset);
		gl.enableVertexAttribArray(attributeLocations.textureAddress);
	}

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer.buffer);
};
