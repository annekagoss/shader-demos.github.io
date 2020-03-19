import * as React from 'react';
import cx from 'classnames';
import styles from './Section.module.scss';

interface Props {
	children: React.ReactNode;
	notes?: string;
	title: string;
	fullScreen?: boolean;
}

const Section = ({children, notes = ``, title, fullScreen}: Props) => (
	<div className={cx(styles.root, fullScreen && styles.fullScreen)}>
		<div className={styles.title}>{title}</div>
		<div className={styles.childrenWrapper}>{children}</div>
		<div className={styles.notes}>{notes}</div>
	</div>
);

export default Section;
