import * as React from 'react';
import styles from './Section.module.scss';

interface Props {
  children: React.ReactNode;
  title: string;
}

const Section = ({ children, title }: Props) => (
  <div className={styles.root}>
    <div className={styles.title}>{title}</div>
    <div className={styles.childrenWrapper}>{children}</div>
  </div>
);

export default Section;
