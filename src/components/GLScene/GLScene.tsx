import React, {Component} from 'react';
import classnames from 'classnames';
// import glslify from 'glslify';
import {calcWindowDiagonalAngle, calcWindowHypotenuse} from '../../utils/general';
import styles from './GLScene.module.scss';

import {
	Buffers,
	Colors,
	GLContext,
	GLSLColors,
	Interaction,
	LightIntensities,
	LightPositions,
	LightSettings,
	LoadedMesh,
	Materials,
	Mesh,
	ProgramInfo,
	SceneProps,
	Transformation,
	Vector3
} from '../../../types';

import {glslColors, supportsDepth, applyBrightness} from '../../../lib/gl/helpers';
import {loadTextures} from '../../../lib/gl/loader';
import {assignStaticUniforms, legacyAssignProjectionMatrix, initShaderProgram, initBuffers, legacyInitFrameBufferObject, initPlaceholderTexture} from '../../../lib/gl/initialize';
import {updateColors, updateLightSettings, updateMaterials, removeMaterials} from '../../../lib/gl/update';
import {render} from '../../../lib/gl/render';

import loadMeshWorker from '../../../lib/gl/loadMeshWorker';
import WebWorker from '../../../lib/gl/WebWorker';

import {startInteraction, stopInteraction, updateMouseInteraction, updateDeviceInteraction, applyInteraction} from '../../../lib/gl/interaction';

import vertSource from '../../../lib/gl/shaders/phong.vert';
import shadowVert from '../../../lib/gl/shaders/shadow.vert';
import shadowFrag from '../../../lib/gl/shaders/shadow.frag';

// import fragSource from '../../../lib/gl/shaders/phong.frag';
import fragSource from '../../../lib/gl/shaders/shiny-normals.frag';

import {
	DEFAULT_LIGHT_POSITIONS,
	DEFAULT_LIGHT_INTENSITIES,
	DEFAULT_COLORS,
	DEFAULT_OFFSET,
	DEFAULT_ROTATION,
	DEFAULT_SCALE,
	DEFAULT_ROTATION_SPEED,
	DEFAULT_SHININESS,
	MAX_IDLE_TIME
} from '../../../lib/gl/defaults';

interface SceneState {
	idle: boolean;
	loaded: boolean;
}

export default class GLScene extends Component<SceneProps> {
	idleTimer: number = 0; // int > 0
	frameId?: number; // int > 0
	$canvas: HTMLCanvasElement;
	$container: HTMLDivElement;

	colors: GLSLColors = {} as GLSLColors;
	glContext: GLContext = {
		$canvas: null,
		buffers: {} as Buffers,
		gl: null,
		hasMaterial: false,
		programInfo: {} as ProgramInfo,
		shadowProgramInfo: {} as ProgramInfo,
		textureCount: 0
	};
	interaction: Interaction = {
		decelerateTimer: 1,
		accelerateTimer: 0,
		enabled: false,
		beta: null,
		gamma: null,
		speed: DEFAULT_ROTATION_SPEED,
		velocity: {
			x: 0,
			y: DEFAULT_ROTATION_SPEED,
			z: 0
		}
	};
	lightSettings: LightSettings = {} as LightSettings;
	transformation: Transformation = {
		translation: {} as Vector3,
		rotation: {} as Vector3,
		scale: null
	};

	state: SceneState = {
		idle: false,
		loaded: false
	};

	componentDidMount() {
		const {
			brightness,
			colors,
			diffuseSources,
			lightPositions = {} as LightPositions,
			MTLSource,
			OBJSource,
			positionOffset = {} as Vector3,
			rotationOffset = {} as Vector3,
			scale,
			shadowStrength,
			shininess
		} = this.props;

		this.colors = {...glslColors(DEFAULT_COLORS), ...glslColors(colors)};

		const positions: LightPositions = {
			...DEFAULT_LIGHT_POSITIONS,
			...lightPositions
		};
		const intensities: LightIntensities = applyBrightness(brightness, DEFAULT_LIGHT_INTENSITIES);
		const customShininess: number = shininess !== undefined ? shininess : DEFAULT_SHININESS;

		this.lightSettings = {
			positions,
			intensities,
			customShininess,
			shadowStrength
		};
		this.transformation.translation = {
			...DEFAULT_OFFSET,
			...positionOffset
		};
		this.transformation.rotation = {
			...DEFAULT_ROTATION,
			...rotationOffset
		};
		this.transformation.scale = scale || DEFAULT_SCALE;

		this.glContext.hasMaterial = !!MTLSource;
		this.glContext.textureCount = diffuseSources ? parseFloat(diffuseSources.length) : 0;

		window.addEventListener('resize', this.updateRendererSize);

		if ('ondeviceorientation' in window) {
			window.addEventListener('deviceorientation', this.handleDeviceOrientation);
			window.addEventListener('scroll', this.handleScroll);
		}

		const worker: any = new WebWorker(loadMeshWorker);
		worker.addEventListener('message', (event: {data: LoadedMesh}) => {
			this.init(event.data);
		});

		if (MTLSource) {
			worker.postMessage({
				OBJSource,
				MTLSource,
				diffuseSources
			}); /* tslint:disable-line no-unsafe-any */
		} else {
			worker.postMessage({
				OBJSource,
				MTLSource,
				diffuseSources
			}); /* tslint:disable-line no-unsafe-any */
			worker.postMessage({
				OBJSource,
				MTLSource,
				diffuseSources
			}); /* tslint:disable-line no-unsafe-any */
		}
	}

	componentWillUnmount(): void {
		this.stop();
		window.removeEventListener('deviceorientation', this.handleDeviceOrientation);
		window.removeEventListener('scroll', this.handleScroll);
		window.removeEventListener('resize', this.updateRendererSize);
	}

	componentDidUpdate(): void {
		const {loaded} = this.state;
		if (!loaded) return;

		this.updateColors();
		this.updateLightSettings();
		this.updateTransformation();
		this.updateTextures();
		this.updateMaterials();
	}

	updateColors(): void {
		const {colors} = this.props;
		const newColors: GLSLColors = glslColors(colors);
		if (!newColors) return;

		this.colors = {...glslColors(DEFAULT_COLORS), ...newColors};
		updateColors(this.colors, this.glContext);
	}

	updateLightSettings(): void {
		const {brightness, shininess, shadowStrength} = this.props;
		this.lightSettings.shadowStrength = shadowStrength;
		this.lightSettings.intensities = applyBrightness(brightness, DEFAULT_LIGHT_INTENSITIES);
		this.lightSettings.customShininess = shininess || this.lightSettings.customShininess;
		updateLightSettings(this.lightSettings, this.glContext);
	}

	updateTransformation(): void {
		const {positionOffset, rotationOffset, scale} = this.props;
		this.transformation.translation = {
			...this.transformation.translation,
			...positionOffset
		};
		this.transformation.rotation = {
			...this.transformation.rotation,
			...rotationOffset
		};
		this.transformation.scale = scale || this.transformation.scale;
	}

	updateTextures(): void {
		const {diffuseSources} = this.props;
		const {textureCount} = this.glContext;

		const diffuseCount: number = Object.keys(diffuseSources).length;
		if (diffuseCount > 0 && textureCount !== diffuseCount) {
			this.glContext.textureCount = diffuseCount;
			this.addMaterial();
		}
	}

	updateMaterials(): void {
		const {MTLSource} = this.props;
		const {hasMaterial} = this.glContext;

		if (hasMaterial !== !!MTLSource) {
			this.glContext.hasMaterial = !hasMaterial;
			this.glContext.hasMaterial ? this.addMaterial() : removeMaterials(this.glContext);
		}
	}

	addMaterial(): void {
		const {diffuseSources, MTLSource} = this.props;

		const MTLWorker: any = new WebWorker(loadMeshWorker); /* tslint:disable-line no-any */
		MTLWorker.addEventListener('message', (event: {data: Materials}) => {
			/* tslint:disable-line no-unsafe-any */
			this.glContext.mesh.materials = event.data;
			updateMaterials(this.glContext, null);
		});

		MTLWorker.postMessage({
			MTLSource,
			diffuseSources
		}); /* tslint:disable-line no-unsafe-any */
	}

	init = (mesh: LoadedMesh): void => {
		const {width, height} = this.$container.getBoundingClientRect();
		this.$canvas.width = Math.round(width * window.devicePixelRatio);
		this.$canvas.height = Math.round(height * window.devicePixelRatio);
		this.glContext.$canvas = this.$canvas;

		/* WebGL glContext is called 'experimental-webgl' in Edge, IE, Chrome 8 - 32, Firefox 4 - 23, and Safari 5.1 - 7.1.
    Older versions than this will not support WebGL. */
		const gl: WebGLRenderingContext = this.$canvas.getContext('webgl') || this.$canvas.getContext('experimental-webgl');
		if (!gl) {
			// this.props.onError('WebGL is not supported on this device.')
			return;
		}

		this.glContext.supportsDepth = supportsDepth(gl);
		this.glContext.placeholderTexture = initPlaceholderTexture(gl);

		gl.clearColor(0, 0, 0, 0);
		gl.clearDepth(1);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, this.$canvas.width, this.$canvas.height);

		const mainProgram: WebGLProgram = initShaderProgram(gl, vertSource, fragSource);

		this.glContext.programInfo = {
			program: mainProgram,
			attribLocations: {
				vertexPosition: gl.getAttribLocation(mainProgram, 'aVertexPosition'),
				textureCoord: gl.getAttribLocation(mainProgram, 'aTextureCoord'), // vUv
				normal: gl.getAttribLocation(mainProgram, 'aVertexNormal'),
				textureAddress: gl.getAttribLocation(mainProgram, 'aTextureAddress')
			},
			uniformLocations: {
				projectionMatrix: gl.getUniformLocation(mainProgram, 'uProjectionMatrix'),
				modelViewMatrix: gl.getUniformLocation(mainProgram, 'uModelViewMatrix'),
				normalMatrix: gl.getUniformLocation(mainProgram, 'uNormalMatrix'),

				leftLightMatrix: gl.getUniformLocation(mainProgram, 'uLeftLightMatrix'),

				uHasTexture: gl.getUniformLocation(mainProgram, 'uHasTexture'),
				uSampler0: gl.getUniformLocation(mainProgram, 'uSampler0'),
				uSampler1: gl.getUniformLocation(mainProgram, 'uSampler1'),

				uDiffuseColor0: gl.getUniformLocation(mainProgram, 'uDiffuseColor0'),
				uEmissiveColor0: gl.getUniformLocation(mainProgram, 'uEmissiveColor0'),
				uSpecularColor0: gl.getUniformLocation(mainProgram, 'uSpecularColor0'),
				uReflectivity0: gl.getUniformLocation(mainProgram, 'uReflectivity0'),
				uOpacity0: gl.getUniformLocation(mainProgram, 'uOpacity0'),

				uDiffuseColor1: gl.getUniformLocation(mainProgram, 'uDiffuseColor1'),
				uEmissiveColor1: gl.getUniformLocation(mainProgram, 'uEmissiveColor1'),
				uSpecularColor1: gl.getUniformLocation(mainProgram, 'uSpecularColor1'),
				uReflectivity1: gl.getUniformLocation(mainProgram, 'uReflectivity1'),
				uOpacity1: gl.getUniformLocation(mainProgram, 'uOpacity1'),

				uDiffuseColor2: gl.getUniformLocation(mainProgram, 'uDiffuseColor2'),
				uEmissiveColor2: gl.getUniformLocation(mainProgram, 'uEmissiveColor2'),
				uSpecularColor2: gl.getUniformLocation(mainProgram, 'uSpecularColor2'),
				uReflectivity2: gl.getUniformLocation(mainProgram, 'uReflectivity2'),
				uOpacity2: gl.getUniformLocation(mainProgram, 'uOpacity2'),

				uCustomShininess: gl.getUniformLocation(mainProgram, 'uCustomShininess'),
				uShadowStrength: gl.getUniformLocation(mainProgram, 'uShadowStrength'),

				uAmbientLightColor: gl.getUniformLocation(mainProgram, 'uAmbientLightColor'),
				uLeftLightColor: gl.getUniformLocation(mainProgram, 'uLeftLightColor'),
				uRightLightColor: gl.getUniformLocation(mainProgram, 'uRightLightColor'),
				uTopLightColor: gl.getUniformLocation(mainProgram, 'uTopLightColor'),
				uBottomLightColor: gl.getUniformLocation(mainProgram, 'uBottomLightColor'),

				uAmbientLightIntensity: gl.getUniformLocation(mainProgram, 'uAmbientLightIntensity'),
				uLeftLightIntensity: gl.getUniformLocation(mainProgram, 'uLeftLightIntensity'),
				uRightLightIntensity: gl.getUniformLocation(mainProgram, 'uRightLightIntensity'),
				uTopLightIntensity: gl.getUniformLocation(mainProgram, 'uTopLightIntensity'),
				uBottomLightIntensity: gl.getUniformLocation(mainProgram, 'uBottomLightIntensity'),

				uAmbientLightPosition: gl.getUniformLocation(mainProgram, 'uAmbientLightPosition'),
				uLeftLightPosition: gl.getUniformLocation(mainProgram, 'uLeftLightPosition'),
				uRightLightPosition: gl.getUniformLocation(mainProgram, 'uRightLightPosition'),
				uTopLightPosition: gl.getUniformLocation(mainProgram, 'uTopLightPosition'),
				uBottomLightPosition: gl.getUniformLocation(mainProgram, 'uBottomLightPosition'),

				uDepthEnabled: gl.getUniformLocation(mainProgram, 'uDepthEnabled'),
				uDepthMap: gl.getUniformLocation(mainProgram, 'uDepthMap'),

				uTime: gl.getUniformLocation(mainProgram, 'uTime')
			}
		};

		if (this.glContext.supportsDepth) {
			const shadowProgram: WebGLProgram = initShaderProgram(gl, shadowVert, shadowFrag);
			this.glContext.fbo = legacyInitFrameBufferObject(gl);
			this.glContext.shadowProgramInfo = {
				program: shadowProgram,
				attribLocations: {
					vertexPosition: gl.getAttribLocation(shadowProgram, 'aVertexPosition')
				},
				uniformLocations: {
					modelViewMatrix: gl.getUniformLocation(shadowProgram, 'uModelViewMatrix'),
					leftLightMatrix: gl.getUniformLocation(shadowProgram, 'uLeftLightMatrix')
				}
			};
		}

		if (!mesh.materials || mesh.materials === {}) {
			this.initWithoutTextures(gl, mesh);
			return;
		}
		loadTextures(gl, mesh.materials)
			.then((loadedMaterials: Materials): void => {
				mesh.materials = loadedMaterials;
				this.glContext.mesh = mesh;
				this.glContext.buffers = initBuffers(gl, mesh);
				this.glContext.gl = gl;
				assignStaticUniforms(this.glContext, this.lightSettings, this.colors, this.transformation);
				this.start();
			})
			.catch((_err: string) => {
				// this.props.onError(`Could not render textures: ${err}`)
				this.initWithoutTextures(gl, mesh);
			});
	};

	initWithoutTextures(gl: WebGLRenderingContext, mesh: LoadedMesh): void {
		this.glContext.mesh = mesh;
		this.glContext.buffers = initBuffers(gl, mesh);
		this.glContext.gl = gl;
		assignStaticUniforms(this.glContext, this.lightSettings, this.colors, this.transformation);
		this.start();
	}

	start(): void {
		console.log(this.glContext);
		if (!this.frameId) {
			this.frameId = requestAnimationFrame(this.animate);
		}
	}

	stop(): void {
		cancelAnimationFrame(this.frameId);
		this.setState({
			idle: true
		});
	}

	resetIdleTimer(): void {
		if (!this.state.idle) return;
		this.idleTimer = 0;
		this.frameId = requestAnimationFrame(this.animate);
		this.setState({
			idle: false
		});
	}

	animate = (): void => {
		if (this.state.idle) return;
		if (this.idleTimer > MAX_IDLE_TIME) {
			this.stop();
			return;
		}
		this.idleTimer++;
		this.renderGL();
	};

	renderGL = (): void => {
		const {glContext, transformation, colors, lightSettings, interaction} = this;
		const {loaded} = this.state;
		const {needsFrameCapture} = this.props;
		const {newTransformation, newInteraction} = applyInteraction({
			transformation,
			interaction
		});
		this.transformation = newTransformation as Transformation;
		this.interaction = newInteraction as Interaction;

		render({
			glContext,
			transformation,
			colors,
			lightSettings,
			frameId: this.frameId
		});

		if (needsFrameCapture) {
			this.captureFrame();
		}

		if (!loaded) {
			// onLoadFinish()
			this.setState({
				loaded: true
			});
		}

		this.frameId = requestAnimationFrame(this.animate);
	};

	updateRendererSize = (): void => {
		console.log(this.$container);
		if (!this.$container) return;
		const {gl, $canvas} = this.glContext;
		const {width, height} = this.$container.getBoundingClientRect();
		const targetWidth: number = Math.round(width * window.devicePixelRatio);
		const targetHeight: number = Math.round(height * window.devicePixelRatio);
		console.log({
			targetWidth,
			canvasWidth: $canvas.width,
			devicePixeRatio: window.devicePixelRatio
		});
		if ($canvas.width !== targetWidth || $canvas.height !== targetHeight) {
			console.log({targetWidth, width});
			$canvas.width = targetWidth;
			$canvas.height = targetHeight;
			gl.viewport(0, 0, $canvas.width, $canvas.height);
			legacyAssignProjectionMatrix(this.glContext);
		}
	};

	handleMouseEnter = (): void => {
		this.interaction = startInteraction(this.interaction);
	};

	handleMouseMove = (e: React.MouseEvent): void => {
		if (!('ontouchstart' in window)) {
			this.interaction = updateMouseInteraction(e, this.interaction, this.$container);
		}
		this.resetIdleTimer();
	};

	handleMouseLeave = (): void => {
		this.interaction = stopInteraction(this.interaction);
	};

	handleDeviceOrientation = (e: DeviceOrientationEvent): void => {
		this.interaction = updateDeviceInteraction(e, this.interaction);
	};

	handleScroll = (): void => {
		const {idle} = this.state;
		const {y, height} = this.$container.getBoundingClientRect() as DOMRect;
		const inView: boolean = y > 0 || y + height > 0;

		if (!inView && !idle) {
			this.stop();
		} else if (inView && idle) {
			this.resetIdleTimer();
		}
	};

	captureFrame(): void {
		const {onFrameCapture} = this.props;
		if (!onFrameCapture) return;
		const frameExport = this.$canvas.toDataURL('image/png', 0.25);
		onFrameCapture(frameExport);
	}

	render(): React.ReactNode {
		const {placeholderImage, colors} = this.props;
		const {backgroundA, backgroundB} = colors;
		const {loaded} = this.state;
		return (
			<div
				className={classnames(styles.scene, loaded && styles.loaded)}
				ref={el => (this.$container = el)}
				onMouseEnter={this.handleMouseEnter}
				onMouseMove={this.handleMouseMove}
				onMouseLeave={this.handleMouseLeave}>
				<canvas
					ref={el => {
						this.$canvas = el;
					}}
					width='280'
					height='280'
				/>
				{placeholderImage && <img className={styles.placeholder} src={placeholderImage} />}
				<div
					className={styles.background}
					style={{
						// background: `linear-gradient(30deg, ${backgroundA}, ${backgroundB})`,
						transform: `rotate(${calcWindowDiagonalAngle()}rad)`,
						width: `${-1 * calcWindowHypotenuse()}px`,
						height: `${window.innerHeight}px`
					}}
				/>
			</div>
		);
	}
}
