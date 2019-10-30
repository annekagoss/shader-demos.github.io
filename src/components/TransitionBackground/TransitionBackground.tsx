import * as React from 'react';
import { initBaseMesh, initShaderProgram } from '../../../lib/gl/initialize';
import { UniformSetting, UNIFORM_TYPE } from '../../../types';
import { useInitializeGL } from '../../hooks/gl';
import { useAnimationFrame } from '../../hooks/animation';
import baseVert from '../../../lib/gl/shaders/base.vert';
import diagonalBackgroundFrag from '../../../lib/gl/shaders/diagonal-background.frag';
import styles from './TransitionBackground.module.scss';

const render = (
  gl: WebGLRenderingContext,
  uniformLocations: Record<string, WebGLUniformLocation>,
  time: number
) => {
  gl.uniform1f(uniformLocations.uTime, time);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const UNIFORMS: UniformSetting[] = [
  { name: 'uTime', type: UNIFORM_TYPE.FLOAT_1 }
];

const TransitionBackground = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>();

  const { gl, program, attributeLocations, uniformLocations } = useInitializeGL(
    {
      canvasRef,
      fragmentSource: diagonalBackgroundFrag,
      vertexSource: baseVert,
      uniforms: UNIFORMS
    }
  );

  useAnimationFrame((time: number) =>
    render(gl.current, uniformLocations.current, time)
  );

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default TransitionBackground;
