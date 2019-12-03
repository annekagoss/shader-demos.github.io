import * as React from "react";
import { UniformSetting, UNIFORM_TYPE } from "../../../types";
import { useInitializeGL } from "../../hooks/gl";
import { useAnimationFrame } from "../../hooks/animation";
import styles from "./BaseCanvas.module.scss";

interface Props {
  fragmentShader: string;
  vertexShader: string;
  setUniforms: (uniforms: any[]) => void;
  setAttributes: (attributes: any[]) => void;
}

const UNIFORMS: UniformSetting[] = [
  // { name: "uTime", type: UNIFORM_TYPE.FLOAT_1 }
];

const render = (
  gl: WebGLRenderingContext,
  uniformLocations: Record<string, WebGLUniformLocation>,
  time: number
) => {
  gl.uniform1f(uniformLocations.uTime, time);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
};

const BaseExample = ({
  fragmentShader,
  vertexShader,
  setUniforms,
  setAttributes
}: Props) => {
  const canvasRef = React.useRef<HTMLCanvasElement>();

  const { gl, uniformLocations, vertexBuffer } = useInitializeGL({
    canvasRef,
    fragmentSource: fragmentShader,
    vertexSource: vertexShader,
    uniforms: UNIFORMS
  });

  React.useEffect(() => {
    // setUniforms([{ name: "uTime", value: 0 }]);
    setAttributes([
      { name: "aVertexPosition", value: vertexBuffer.current.join(", ") }
    ]);
    console.log(vertexBuffer);
  }, []);

  useAnimationFrame((time: number) => {
    render(gl.current, uniformLocations.current, time);
    // setUniforms([{ name: "uTime", value: time }]);
  });

  return <canvas ref={canvasRef} className={styles.canvas} />;
};

export default BaseExample;
