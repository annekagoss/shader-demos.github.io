import * as React from "react";
import cx from "classnames";
import styles from "./ShaderText.module.scss";

interface Props {
  fragmentShader: string;
  vertexShader: string;
}

const ShaderText = ({ fragmentShader, vertexShader }: Props) => {
  const [fragVisible, setFragVisible] = React.useState<boolean>(true);
  const [vertVisible, setVertVisible] = React.useState<boolean>(false);

  return (
    <div className={styles.root}>
      <div className={styles.tabs}>
        <button
          className={cx(styles.tab, fragVisible && styles.active)}
          onClick={() => {
            if (!fragVisible) {
              setFragVisible(true);
              setVertVisible(false);
            }
          }}
        >
          Fragment Shader
        </button>
        <button
          className={cx(styles.tab, vertVisible && styles.active)}
          onClick={() => {
            if (!vertVisible) {
              setVertVisible(true);
              setFragVisible(false);
            }
          }}
        >
          Vertex Shader
        </button>
      </div>
      <div className={styles.textContainer}>
        <div className={cx(styles.textBlock, fragVisible && styles.active)}>
          {fragmentShader}
        </div>
        <div className={cx(styles.textBlock, vertVisible && styles.active)}>
          {vertexShader}
        </div>
      </div>
    </div>
  );
};

export default ShaderText;
