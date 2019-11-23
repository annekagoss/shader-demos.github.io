import * as React from 'react';
import styles from './Section.module.scss';

interface Props {
  children: React.ReactNode;
  notes?: string;
  title: string;
}

const Section = ({ children, notes, title }: Props) => (
  <div className={styles.root}>
    <div className={styles.title}>{title}</div>
    <div className={styles.childrenWrapper}>{children}</div>
    <div className={styles.notes}>{notes}</div>
  </div>
);

export default Section;
