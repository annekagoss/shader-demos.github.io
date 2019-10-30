import * as React from 'react';
import { UniformSetting, UNIFORM_TYPE } from '../../types';
import { initShaderProgram, initBaseMesh } from '../../lib/gl/initialize';
import { string } from 'prop-types';

interface InitializeProps {
  canvasRef: React.MutableRefObject<HTMLCanvasElement>;
  fragmentSource: string;
  vertexSource: string;
  uniforms: UniformSetting[];
}

const mapUniformSettingsToLocations = (
  settings: UniformSetting[],
  gl: WebGLRenderingContext,
  program: WebGLProgram
): Record<string, WebGLUniformLocation> => {
  return settings.reduce((result, setting) => {
    result[setting.name] = gl.getUniformLocation(program, setting.name);
    return result;
  }, {});
};

export const useInitializeGL = ({
  canvasRef,
  fragmentSource,
  vertexSource,
  uniforms
}: InitializeProps) => {
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
      vertexSource,
      fragmentSource
    );

    tempGl.useProgram(tempProgram);

    attributeLocations.current = initBaseMesh(tempGl, tempProgram);
    uniformLocations.current = mapUniformSettingsToLocations(
      uniforms,
      tempGl,
      tempProgram
    );
    // uniformLocations.current = {
    //   uTime: tempGl.getUniformLocation(tempProgram, 'uTime')
    // };
    gl.current = tempGl;
    program.current = tempProgram;
  }, [canvasRef.current]);

  return {
    gl,
    program,
    attributeLocations,
    uniformLocations
  };
};
