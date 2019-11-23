import * as React from 'react';
import { UniformSetting, UNIFORM_TYPE } from '../../../types';
import { useInitializeGL } from '../../hooks/gl';
import { useAnimationFrame } from '../../hooks/animation';
import styles from './BaseCanvas.module.scss';

interface Props {
  fragmentShader: string;
  vertexShader: string;
}

const UNIFORMS: UniformSetting[] = [
  { name: 'uTime', type: UNIFORM_TYPE.FLOAT_1 }
];

const render = (
  gl: WebGLRenderingContext,
  uniformLocations: Record<string, WebGLUniformLocation>,
  time: number
) => {
  gl.uniform1f(uniformLocations.uTime, time);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const BaseExample = ({ fragmentShader, vertexShader }: Props) => {
  const canvasRef = React.useRef<HTMLCanvasElement>();

  const { gl, uniformLocations } = useInitializeGL({
    canvasRef,
    fragmentSource: fragmentShader,
    vertexSource: vertexShader,
    uniforms: UNIFORMS
  });

  useAnimationFrame((time: number) =>
    render(gl.current, uniformLocations.current, time)
  );

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default BaseExample;
