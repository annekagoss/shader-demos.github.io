import * as React from 'react';

import {SceneProps} from '../../types';
import GLScene from './GLScene/GLScene';

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
  brightness: .8,
  shininess: 0,
  shadowStrength: .33,
  scale: .0485,
};

export default class App extends React.Component {
    render() {
        return (
            <div className={styles.app}>
                <div className={styles.page}>
                  <div className={styles.section}>
                    <GLScene {...GL_PROPS} />
                    <div
                      className={styles.background}
                      style={{ background: `linear-gradient(30deg, ${GL_PROPS.colors.backgroundA}, ${GL_PROPS.colors.backgroundB})` }}
                    ></div>
                  </div>
                </div>
            </div>
        );
    }
}
