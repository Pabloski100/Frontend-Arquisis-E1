import React from 'react';
import { Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons'; // Import the icon object
import styles from './componentsCss/content.module.css'; // Import the styles object from your CSS Module

import contentData from '../utils/contentData';

const Content = () => (
  <div className={styles['next-steps']} className={styles['my-5']} data-testid="content">
    <h2 className={`${styles['my-5']} ${styles['text-center']}`} data-testid="content-title">
      More information:
    </h2>
    <Row className={`${styles['d-flex']} ${styles['justify-content-between']}`} data-testid="content-items">
      {contentData.map((col, i) => (
        <Col key={i} md={5} className={styles['mb-4']}>
          <h6 className={styles['mb-3']}>
            <a href={col.link}>
              <FontAwesomeIcon icon={faLink} className={styles['mr-2']} />
              {col.title}
            </a>
          </h6>
          <p>{col.description}</p>
        </Col>
      ))}
    </Row>
  </div>
);

export default Content;
