
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import styles from './componentsCss/content.module.css';

import contentData from '../utils/contentData';

const Content = () => (
  <div className={styles['next-steps']} data-testid="content">
    <h2 className={[styles['my-5'], styles['text-center']].join(' ')} data-testid="content-title">
      More information:
    </h2>
    <div className={[styles['d-flex'], styles['justify-content-between']].join(' ')} data-testid="content-items">
      {contentData.map(({ title, link, description }, i) => (
        <div key={title || i} className={styles['content-item']}>
          <h6 className={styles['mb-3']}>
            <a href={link}>
              <FontAwesomeIcon icon={faLink} className={styles['mr-2']} aria-hidden="true" />
              {title}
            </a>
          </h6>
          <p>{description}</p>
        </div>
      ))}
    </div>
  </div>
);

export default Content;
