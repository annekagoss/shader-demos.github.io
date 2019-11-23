import * as React from 'react';

import { SceneProps } from '../../types';
import GLScene from './GLScene/GLScene';
import Section from './Section/Section';
import BaseCanvas from './BaseCanvas/BaseCanvas';
import ShaderText from './ShaderText/ShaderText';
import baseVertexShader from '../../lib/gl/shaders/base.vert';

// HELLO WORlD
import helloWorldFragmentShader from '../../lib/gl/shaders/hello-world.frag';

import styles from './app.module.scss';

// FOX SKULL
import OBJSource from '../../lib/gl/assets/fox/fox3.obj';
import MTLSource from '../../lib/gl/assets/fox/fox.mtl';
import diffuseSource0 from '../../lib/gl/assets/fox/fox_skull_0.jpg';
import diffuseSource1 from '../../lib/gl/assets/fox/fox_skull_1.jpg';

const GL_PROPS: SceneProps = {
  colors: {
    ambientLight: 'rgba(100, 100, 100, 1)',
    backgroundA: 'rgba(255, 0, 0, 1)',
    backgroundB: 'rgba(0, 0, 255, 1)',
    leftLight: 'rgba(150, 150, 150, 1)',
    rightLight: 'rgba(150, 150, 150, 1)'
  },
  OBJSource,
  MTLSource,
  diffuseSources: {
    'material_0.001': diffuseSource0,
    'material_1.001': diffuseSource1
  },
  positionOffset: {
    x: 0,
    y: 0.3,
    z: 0
  },
  rotationOffset: {
    x: 0.3,
    y: 1.9,
    z: 0
  },
  brightness: 0.8,
  shininess: 0,
  shadowStrength: 0.33,
  scale: 0.0485
};

export default class App extends React.Component {
  render() {
    return (
      <div className={styles.app}>
        <div className={styles.page}>
          {/* <div className={styles.section}> */}
          {/* <GLScene {...GL_PROPS} /> */}

          <Section
            title='0.0: Hello World'
            notes={`
              The fragment shader is rendered onto a base mesh. In these first examples we will use a 1x1 plane which acts like a projection screen.
              The aVertexPosition attribute holds an array of 3-vector coordinates for each vertex of the base mesh.  It looks like this: [-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0]
            `}
          >
            <BaseCanvas
              fragmentShader={helloWorldFragmentShader}
              vertexShader={baseVertexShader}
            />
            <ShaderText
              fragmentShader={helloWorldFragmentShader}
              vertexShader={baseVertexShader}
            />
          </Section>

          {/* </div> */}
        </div>
      </div>
    );
  }
}
