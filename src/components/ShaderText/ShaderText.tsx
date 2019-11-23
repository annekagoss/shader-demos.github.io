import * as React from 'react';
import styles from './ShaderText.module.scss';

interface Props {
  fragmentShader: string;
  vertexShader: string;
}

const ShaderText = ({ fragmentShader, vertexShader }: Props) => (
  <div className={styles.root}>
    <div className={styles.textContainer}>
      <div className={styles.title}>Fragment Shader</div>
      <div className={styles.textBlock}>{fragmentShader}</div>
    </div>
    <div className={styles.textContainer}>
      <div className={styles.title}>Vertex Shader</div>
      <div className={styles.textBlock}>{vertexShader}</div>
    </div>
  </div>
);

export default ShaderText;
