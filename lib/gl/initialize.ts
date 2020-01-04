import {Buffer, Buffers, GLSLColors, FBO, GLContext, LightSettings, LoadedMesh, Material, Matrix, Transformation} from '../../types';

import {degreesToRadians} from './helpers';
import {createMat4, applyPerspective, lookAt} from './matrix';

import {MAX_SUPPORTED_MATERIAL_TEXTURES} from './defaults';

interface BufferInput {
	gl: WebGLRenderingContext;
	type: number;
	data: number[];
	itemSize: number;
}

export function initShaderProgram(gl: WebGLRenderingContext, vertSource: string, fragSource: string): WebGLProgram {
	const vertexShader: WebGLShader = loadShader(gl, gl.VERTEX_SHADER, vertSource);
	const fragmentShader: WebGLShader = loadShader(gl, gl.FRAGMENT_SHADER, fragSource);
	const program: WebGLProgram = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.warn('Unabled to initialize the shader program: ' + gl.getProgramInfoLog(program)); /* tslint:disable-line no-console */
	}

	return program;
}

export function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
	const shader: WebGLShader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.warn('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader)); /* tslint:disable-line no-console */
		gl.deleteShader(shader);
		return;
	}
	return shader;
}

export function initBuffers(gl: WebGLRenderingContext, loadedMesh: LoadedMesh): Buffers {
	const {positions, normals, textures, textureAddresses, indices}: LoadedMesh = loadedMesh;
	const vertexBuffer: Buffer = buildBuffer({
		gl,
		type: gl.ARRAY_BUFFER,
		data: positions,
		itemSize: 3
	});

	const normalBuffer: Buffer = buildBuffer({
		gl,
		type: gl.ARRAY_BUFFER,
		data: normals,
		itemSize: 3
	});

	const textureBuffer: Buffer = buildBuffer({
		gl,
		type: gl.ARRAY_BUFFER,
		data: textures,
		itemSize: 2
	});

	const textureAddressBuffer: Buffer = buildBuffer({
		gl,
		type: gl.ARRAY_BUFFER,
		data: textureAddresses,
		itemSize: 1
	});

	const indexBuffer: Buffer = buildBuffer({
		gl,
		type: gl.ELEMENT_ARRAY_BUFFER,
		data: indices,
		itemSize: 1
	});

	return {
		indexBuffer,
		normalBuffer,
		textureAddressBuffer,
		textureBuffer,
		vertexBuffer
	};
}

export function buildBuffer({gl, type, data, itemSize}: BufferInput): Buffer {
	const buffer: WebGLBuffer = gl.createBuffer();
	const ArrayView: Float32ArrayConstructor | Uint16ArrayConstructor = type === gl.ARRAY_BUFFER ? Float32Array : Uint16Array;
	gl.bindBuffer(type, buffer);
	gl.bufferData(type, new ArrayView(data), gl.STATIC_DRAW);
	const numItems: number = data.length / itemSize;
	return {
		buffer,
		itemSize,
		numItems
	};
}

export function initFrameBufferObject(gl: WebGLRenderingContext): FBO {
	const level: number = 0;
	const internalFormat: number = gl.RGBA;
	const border: number = 0;
	const format: number = gl.RGBA;
	const type: number = gl.UNSIGNED_BYTE;
	const data: ArrayBufferView | null = null;
	const textureWidth: number = 2048;
	const textureHeight: number = 2048;

	const targetTexture: WebGLTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);
	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, textureWidth, textureHeight, border, format, type, data);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	const depthBuffer: WebGLRenderbuffer = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, textureWidth, textureHeight);

	const frameBuffer: WebGLFramebuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, level);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.activeTexture(gl.TEXTURE4);
	gl.bindTexture(gl.TEXTURE_2D, targetTexture);

	return {
		buffer: frameBuffer,
		targetTexture,
		textureWidth,
		textureHeight
	};
}

export const assignProjectionMatrix = (glContext: GLContext): void => {
	const {gl, programInfo} = glContext;
	let projectionMatrix: Matrix = applyPerspective({
		sourceMatrix: createMat4(),
		fieldOfView: degreesToRadians(40),
		aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,
		near: 0.1,
		far: 100
	});
	projectionMatrix = lookAt(projectionMatrix, {
		target: {x: 0, y: 0, z: 0},
		origin: {x: 0, y: 0, z: 6},
		up: {x: 0, y: 1, z: 0}
	});
	gl.useProgram(programInfo.program);
	gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
};

export function assignStaticUniforms(glContext: GLContext, lightSettings: LightSettings, colors: GLSLColors, transformation: Transformation): void {
	const {gl, supportsDepth, fbo, programInfo, shadowProgramInfo, mesh, placeholderTexture} = glContext;

	assignProjectionMatrix(glContext);

	if (supportsDepth) {
		const lightMatrix: Matrix = applyPerspective({
			sourceMatrix: createMat4(),
			fieldOfView: degreesToRadians(70),
			aspect: fbo.textureWidth / fbo.textureHeight,
			near: 1,
			far: 200
		});
		const leftLightMatrix: Matrix = lookAt(lightMatrix, {
			target: transformation.translation,
			origin: {
				x: lightSettings.positions.left[0],
				y: lightSettings.positions.left[1],
				z: lightSettings.positions.left[2]
			},
			up: {x: 0, y: 1, z: 0}
		});
		gl.uniform1i(programInfo.uniformLocations.uDepthEnabled, 1);
		gl.uniformMatrix4fv(programInfo.uniformLocations.leftLightMatrix, false, leftLightMatrix);
		gl.useProgram(shadowProgramInfo.program);
		gl.uniformMatrix4fv(shadowProgramInfo.uniformLocations.leftLightMatrix, false, leftLightMatrix);
	} else {
		gl.uniform1i(programInfo.uniformLocations.uDepthEnabled, 0);
	}

	gl.useProgram(programInfo.program);

	if (mesh.materials) {
		Object.keys(mesh.materials).forEach((name, i) => {
			if (i <= MAX_SUPPORTED_MATERIAL_TEXTURES) {
				const mat: Material = mesh.materials[name] as Material;

				if (mat.textures && mat.textures.diffuseMap) {
					gl.activeTexture(gl[`TEXTURE${i}`] as number);

					gl.bindTexture(gl.TEXTURE_2D, mat.textures.diffuseMap);
					gl.uniform1i(programInfo.uniformLocations[`uSampler${i}`], i);
					gl.uniform1f(programInfo.uniformLocations[`uHasTexture`], 1);
				}

				gl.uniform3fv(programInfo.uniformLocations[`uDiffuseColor${i}`], mat.diffuse || [1, 1, 1]);
				gl.uniform3fv(programInfo.uniformLocations[`uEmissiveColor${i}`], mat.emissive || [0, 0, 0]);
				gl.uniform3fv(programInfo.uniformLocations[`uSpecularColor${i}`], mat.specular || [1, 1, 1]);
				gl.uniform1f(programInfo.uniformLocations[`uReflectivity${i}`], mat.reflectivity ? mat.reflectivity : 1000);
				gl.uniform1f(programInfo.uniformLocations[`uOpacity${i}`], mat.opacity || 1);
			}
		});
	} else {
		gl.uniform1f(programInfo.uniformLocations[`uHasTexture`], 0);

		for (let i: number = 0; i <= MAX_SUPPORTED_MATERIAL_TEXTURES; i++) {
			gl.activeTexture(gl[`TEXTURE${i}`] as number);
			gl.bindTexture(gl.TEXTURE_2D, placeholderTexture);
			gl.uniform1i(programInfo.uniformLocations[`uSampler${i}`], i);
		}

		gl.uniform3fv(programInfo.uniformLocations[`uDiffuseColor0`], [1, 1, 1]);
		gl.uniform3fv(programInfo.uniformLocations[`uEmissiveColor0`], [0, 0, 0]);
		gl.uniform3fv(programInfo.uniformLocations[`uSpecularColor0`], [1, 1, 1]);
		gl.uniform1f(programInfo.uniformLocations[`uReflectivity0`], 1000);
		gl.uniform1f(programInfo.uniformLocations[`uOpacity0`], 1);

		gl.uniform3fv(programInfo.uniformLocations[`uDiffuseColor1`], [1, 1, 1]);
		gl.uniform3fv(programInfo.uniformLocations[`uEmissiveColor1`], [0, 0, 0]);
		gl.uniform3fv(programInfo.uniformLocations[`uSpecularColor1`], [1, 1, 1]);
		gl.uniform1f(programInfo.uniformLocations[`uReflectivity1`], 1000);
		gl.uniform1f(programInfo.uniformLocations[`uOpacity1`], 1);

		gl.uniform3fv(programInfo.uniformLocations[`uDiffuseColor2`], [1, 1, 1]);
		gl.uniform3fv(programInfo.uniformLocations[`uEmissiveColor2`], [0, 0, 0]);
		gl.uniform3fv(programInfo.uniformLocations[`uSpecularColor2`], [1, 1, 1]);
		gl.uniform1f(programInfo.uniformLocations[`uReflectivity2`], 1000);
		gl.uniform1f(programInfo.uniformLocations[`uOpacity2`], 1);
	}

	gl.uniform1f(programInfo.uniformLocations.uCustomShininess, lightSettings.customShininess);
	gl.uniform1f(programInfo.uniformLocations.uShadowStrength, lightSettings.shadowStrength);

	gl.uniform3fv(programInfo.uniformLocations.uAmbientLightColor, colors.ambientLight);
	gl.uniform3fv(programInfo.uniformLocations.uLeftLightColor, colors.leftLight);
	gl.uniform3fv(programInfo.uniformLocations.uRightLightColor, colors.rightLight);
	gl.uniform3fv(programInfo.uniformLocations.uTopLightColor, colors.topSpot);
	gl.uniform3fv(programInfo.uniformLocations.uBottomLightColor, colors.bottomSpot);

	gl.uniform1f(programInfo.uniformLocations.uAmbientLightIntensity, lightSettings.intensities.ambient);
	gl.uniform1f(programInfo.uniformLocations.uLeftLightIntensity, lightSettings.intensities.left);
	gl.uniform1f(programInfo.uniformLocations.uRightLightIntensity, lightSettings.intensities.right);
	gl.uniform1f(programInfo.uniformLocations.uTopLightIntensity, lightSettings.intensities.top);
	gl.uniform1f(programInfo.uniformLocations.uBottomLightIntensity, lightSettings.intensities.bottom);

	gl.uniform3fv(programInfo.uniformLocations.uLeftLightPosition, lightSettings.positions.left);
	gl.uniform3fv(programInfo.uniformLocations.uRightLightPosition, lightSettings.positions.right);
	gl.uniform3fv(programInfo.uniformLocations.uTopLightPosition, lightSettings.positions.top);
	gl.uniform3fv(programInfo.uniformLocations.uBottomLightPosition, lightSettings.positions.bottom);
}

export function initPlaceholderTexture(gl: WebGLRenderingContext): WebGLTexture {
	const texture: WebGLTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
	return texture;
}

// Base mesh made of two triangles
export const initBaseMesh = (gl: WebGLRenderingContext, program: WebGLProgram) => {
	const data = [-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0];
	const {buffer} = buildBuffer({
		gl,
		type: gl.ARRAY_BUFFER,
		data,
		itemSize: 3
	});
	const vertexPosition = gl.getAttribLocation(program, 'aVertexPosition');
	gl.enableVertexAttribArray(vertexPosition);
	gl.vertexAttribPointer(vertexPosition, 3, gl.FLOAT, false, 0, 0);
	return {
		bufferData: data,
		vertexPosition
	};
};
