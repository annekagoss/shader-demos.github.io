import React, {useState, useEffect} from 'react';
import classnames from 'classnames';
// import glslify from 'glslify';
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
  SceneSettings,
  Transformation,
  Vector3
} from '../../../types';

import { glslColors, supportsDepth, applyBrightness } from '../../../lib/gl/helpers';
import { loadTextures } from '../../../lib/gl/loader';
import {
  assignStaticUniforms,
  assignProjectionMatrix,
  initShaderProgram,
  initBuffers,
  initFrameBufferObject,
  initPlaceholderTexture
} from '../../../lib/gl/initialize';
import { updateColors, updateLightSettings, updateMaterials, removeMaterials } from '../../../lib/gl/update';
import { render } from '../../../lib/gl/render';

import loadMeshWorker from '../../../lib/gl/loadMeshWorker';
import WebWorker from '../../../lib/gl/WebWorker';

import {
  startInteraction,
  stopInteraction,
  updateMouseInteraction,
  updateDeviceInteraction,
  applyInteraction
} from '../../../lib/gl/interaction';

import {
  useWindowSize
} from '../../hooks/general';

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

const INITIAL_COLORS: GLSLColors = {} as GLSLColors;

const INITIAL_GL_CONTEXT: GLContext = {
  $canvas: null,
  buffers: {} as Buffers,
  gl: null,
  hasMaterial: false,
  programInfo: {} as ProgramInfo,
  shadowProgramInfo: {} as ProgramInfo,
  textureCount: 0
};

const INITIAL_INTERACTION: Interaction = {
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

const INITIAL_LIGHT_SETTINGS: LightSettings = {} as LightSettings;

const INITIAL_TRANSFORMATION: Transformation = {
  translation: {} as Vector3,
  rotation: {} as Vector3,
  scale: null
};

const INITIAL_SETTINGS: SceneSettings = {
  colors: INITIAL_COLORS,
  glContext: INITIAL_GL_CONTEXT,
  interaction: INITIAL_INTERACTION,
  lightSettings: INITIAL_LIGHT_SETTINGS,
  transformation: INITIAL_TRANSFORMATION
};

const updateRendererSize = () => {
  console.log('window size update');
}

const GLScene: React.FunctionComponent<SceneProps> = (props) => {
  const [idle, setIdle] = useState<boolean>(false);
  const [loaded, setLoaded] = useState<boolean>(false);
  const settings = INITIAL_SETTINGS;

  useWindowSize(updateRendererSize);

  return (<>hullo</>);
}

export default GLScene;
