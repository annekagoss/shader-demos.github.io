import * as React from 'react';
import { initBaseMesh, initShaderProgram } from '../../../lib/gl/initialize';
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

const TransitionBackground = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>();
  const gl = React.useRef<WebGLRenderingContext>();
  const program = React.useRef<WebGLProgram>();
  const attributeLocations = React.useRef<Record<string, number>>();
  const uniformLocations = React.useRef<Record<string, WebGLUniformLocation>>();

  React.useLayoutEffect(() => {
    if (canvasRef.current === undefined) return;
    const tempGl: WebGLRenderingContext =
      (canvasRef.current.getContext(
        'experimental-webgl'
      ) as WebGLRenderingContext) ||
      (canvasRef.current.getContext('webgl') as WebGLRenderingContext);

    const tempProgram: WebGLProgram = initShaderProgram(
      tempGl,
      baseVert,
      diagonalBackgroundFrag
    );

    tempGl.useProgram(tempProgram);

    attributeLocations.current = initBaseMesh(tempGl, tempProgram);
    uniformLocations.current = {
      uTime: tempGl.getUniformLocation(tempProgram, 'uTime')
    };
    gl.current = tempGl;
    program.current = tempProgram;
  }, [canvasRef.current]);

  useAnimationFrame((time: number) =>
    render(gl.current, uniformLocations.current, time)
  );

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default TransitionBackground;
